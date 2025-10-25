import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { cartItems, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// GET /api/v1/cart - Get user's cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);

    const cartData = await db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        price: cartItems.price,
        createdAt: cartItems.createdAt,
        product: {
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          image: products.image,
          category: products.category,
          brand: products.brand,
          inventory: products.inventory,
          originalPrice: products.originalPrice,
        },
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));

    // Calculate totals
    const subtotal = cartData.reduce((sum, item) => {
      const itemPrice = parseFloat(item.price?.toString() || "0");
      return sum + (itemPrice * (item.quantity || 0));
    }, 0);

    const totalItems = cartData.reduce((sum, item) => sum + (item.quantity || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        items: cartData,
        summary: {
          subtotal: subtotal.toFixed(2),
          totalItems,
          itemCount: cartData.length,
        },
      },
    });
  } catch (error) {
    console.error("Cart GET API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// POST /api/v1/cart - Add item to cart
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
    const { productId, quantity = 1 } = body;

    if (!productId || quantity < 1) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID or quantity" },
        { status: 400 }
      );
    }

    // Get product details
    const [product] = await db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        inventory: products.inventory,
      })
      .from(products)
      .where(eq(products.id, productId));

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Check inventory
    if (product.inventory && product.inventory < quantity) {
      return NextResponse.json(
        { success: false, error: "Insufficient inventory" },
        { status: 400 }
      );
    }

    // Check if item already in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));

    if (existingItem) {
      // Update quantity
      const newQuantity = (existingItem.quantity || 0) + quantity;
      
      if (product.inventory && product.inventory < newQuantity) {
        return NextResponse.json(
          { success: false, error: "Cannot add more items - insufficient inventory" },
          { status: 400 }
        );
      }

      await db
        .update(cartItems)
        .set({ 
          quantity: newQuantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingItem.id));

      return NextResponse.json({
        success: true,
        message: "Cart updated! 🛒",
        data: { quantity: newQuantity },
      });
    } else {
      // Add new item
      const [newItem] = await db
        .insert(cartItems)
        .values({
          userId,
          productId,
          quantity,
          price: product.price,
        })
        .returning();

      return NextResponse.json({
        success: true,
        message: "Added to cart! 🛒",
        data: newItem,
      });
    }
  } catch (error) {
    console.error("Cart POST API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

// PUT /api/v1/cart - Update cart item quantity
export async function PUT(request: NextRequest) {
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
    const { cartItemId, quantity } = body;

    if (!cartItemId || quantity < 0) {
      return NextResponse.json(
        { success: false, error: "Invalid cart item ID or quantity" },
        { status: 400 }
      );
    }

    // Get cart item
    const [cartItem] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, userId)));

    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: "Cart item not found" },
        { status: 404 }
      );
    }

    if (quantity === 0) {
      // Remove item
      await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
      
      return NextResponse.json({
        success: true,
        message: "Item removed from cart",
      });
    } else {
      // Update quantity
      await db
        .update(cartItems)
        .set({ 
          quantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, cartItemId));

      return NextResponse.json({
        success: true,
        message: "Cart updated! ✨",
        data: { quantity },
      });
    }
  } catch (error) {
    console.error("Cart PUT API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/cart - Clear entire cart
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);

    await db.delete(cartItems).where(eq(cartItems.userId, userId));

    return NextResponse.json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Cart DELETE API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}
