import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { products } from "@/db/schema";
import { eq, desc, and, sql, ilike, or, gte, lte } from "drizzle-orm";

// GET /api/v1/products - Get all products with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get("category");
    const subCategory = searchParams.get("subCategory");
    const brand = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");
    const tags = searchParams.get("tags");
    const certifications = searchParams.get("certifications");
    const isNew = searchParams.get("isNew");
    const isBestseller = searchParams.get("isBestseller");
    const isFeatured = searchParams.get("isFeatured");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sortBy = searchParams.get("sortBy") || "newest"; // newest, price_low, price_high, rating

    // Build query conditions
    const conditions = [];

    if (category && ["skincare", "snacks", "fashion", "household", "wellness", "food"].includes(category)) {
      conditions.push(eq(products.category, category as "skincare" | "snacks" | "fashion" | "household" | "wellness" | "food"));
    }
    if (subCategory) conditions.push(eq(products.subCategory, subCategory));
    if (brand) conditions.push(eq(products.brand, brand));
    if (minPrice) conditions.push(gte(products.price, minPrice));
    if (maxPrice) conditions.push(lte(products.price, maxPrice));
    if (isNew === "true") conditions.push(eq(products.isNew, true));
    if (isBestseller === "true") conditions.push(eq(products.isBestseller, true));
    if (isFeatured === "true") conditions.push(eq(products.isFeatured, true));
    
    if (tags) {
      const tagArray = tags.split(",");
      conditions.push(sql`${products.tags} && ${JSON.stringify(tagArray)}`);
    }

    if (certifications) {
      const certArray = certifications.split(",");
      conditions.push(sql`${products.certifications} && ${JSON.stringify(certArray)}`);
    }

    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.description, `%${search}%`),
          ilike(products.brand, `%${search}%`),
          sql`${products.tags} && ${JSON.stringify([search])}`
        )
      );
    }

    // Build sort order
    let orderBy;
    switch (sortBy) {
      case "price_low":
        orderBy = products.price;
        break;
      case "price_high":
        orderBy = desc(products.price);
        break;
      case "rating":
        orderBy = desc(products.ratingAverage);
        break;
      default:
        orderBy = desc(products.createdAt);
    }

    // Execute query with pagination
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const productsData = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        originalPrice: products.originalPrice,
        category: products.category,
        subCategory: products.subCategory,
        brand: products.brand,
        label: products.label,
        labelColor: products.labelColor,
        image: products.image,
        images: products.images,
        tags: products.tags,
        certifications: products.certifications,
        ethicalScore: products.ethicalScore,
        inventory: products.inventory,
        ratingAverage: products.ratingAverage,
        ratingCount: products.ratingCount,
        isNew: products.isNew,
        isBestseller: products.isBestseller,
        isFeatured: products.isFeatured,
        createdAt: products.createdAt,
      })
      .from(products)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset((page - 1) * limit);

    // Get total count for pagination
    const totalQuery = await db
      .select({ count: sql`count(*)` })
      .from(products)
      .where(whereClause);
    
    const total = Number(totalQuery[0].count);

    // Get categories for filters
    const categoriesData = await db
      .select({ 
        category: products.category,
        count: sql`count(*)` 
      })
      .from(products)
      .groupBy(products.category);

    const brandsData = await db
      .select({ 
        brand: products.brand,
        count: sql`count(*)` 
      })
      .from(products)
      .where(sql`${products.brand} IS NOT NULL`)
      .groupBy(products.brand);

    return NextResponse.json({
      success: true,
      data: {
        products: productsData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        filters: {
          categories: categoriesData,
          brands: brandsData,
        },
      },
    });
  } catch (error) {
    console.error("Products API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
