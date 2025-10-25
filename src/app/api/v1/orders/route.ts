import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { orders, orderItems, cartItems, products } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Define valid status type
type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

// GET /api/v1/orders - Get user's order history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Build where conditions
    let whereConditions = eq(orders.userId, userId);
    if (status) {
      const validStatuses: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
      if (validStatuses.includes(status as OrderStatus)) {
        whereConditions = and(whereConditions, eq(orders.status, status as OrderStatus))!;
      }
    }

    // Get orders with pagination
    const userOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        subtotal: orders.subtotal,
        shipping: orders.shipping,
        tax: orders.tax,
        total: orders.total,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        shippingAddress: orders.shippingAddress,
        trackingNumber: orders.trackingNumber,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .where(whereConditions)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db
          .select({
            id: orderItems.id,
            quantity: orderItems.quantity,
            price: orderItems.price,
            product: {
              id: products.id,
              name: products.name,
              image: products.image,
              slug: products.slug,
            },
          })
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          items,
          itemCount: items.length,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        orders: ordersWithItems,
        pagination: {
          page,
          limit,
          hasMore: userOrders.length === limit,
        },
      },
    });
  } catch (error) {
    console.error("Orders GET API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/v1/orders - Create order from cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);
    const body = await request.json();
    const { 
      shippingAddress, 
      paymentMethod = "stripe",
      notes 
    } = body;

    if (!shippingAddress) {
      return NextResponse.json(
        { success: false, error: "Shipping address is required" },
        { status: 400 }
      );
    }

    // Get cart items
    const cartData = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        price: cartItems.price,
        product: {
          id: products.id,
          name: products.name,
          inventory: products.inventory,
        },
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));

    if (cartData.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Validate inventory
    for (const item of cartData) {
      if (item.product?.inventory && item.product.inventory < (item.quantity || 0)) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Insufficient inventory for ${item.product.name}` 
          },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    const subtotal = cartData.reduce((sum, item) => {
      const itemPrice = parseFloat(item.price?.toString() || "0");
      return sum + (itemPrice * (item.quantity || 0));
    }, 0);
    
    const shipping = 9.99; // Fixed shipping for now
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    // Generate order number
    const orderNumber = `HB${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create order
    const [newOrder] = await db
      .insert(orders)
      .values({
        userId,
        orderNumber,
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        status: "pending",
        paymentStatus: "pending",
        paymentMethod,
        shippingAddress,
        notes,
      })
      .returning();

    // Create order items
    const orderItemsData = cartData.map((item) => ({
      orderId: newOrder.id,
      productId: item.productId!,
      quantity: item.quantity!,
      price: item.price!,
    }));

    await db.insert(orderItems).values(orderItemsData);

    // Update product inventory
    for (const item of cartData) {
      if (item.product?.inventory) {
        await db
          .update(products)
          .set({
            inventory: item.product.inventory - (item.quantity || 0),
            updatedAt: new Date(),
          })
          .where(eq(products.id, item.productId!));
      }
    }

    // Clear cart
    await db.delete(cartItems).where(eq(cartItems.userId, userId));

    return NextResponse.json({
      success: true,
      message: "Order placed successfully! 🎉",
      data: {
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        subtotal: newOrder.subtotal,
        total: newOrder.total,
        status: newOrder.status,
      },
    });
  } catch (error) {
    console.error("Orders POST API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
