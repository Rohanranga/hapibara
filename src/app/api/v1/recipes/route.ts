import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { recipes, users } from "@/db/schema";
import { eq, desc, or, and, sql, ilike } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// GET /api/v1/recipes - Get all recipes with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get("category");
    const moodCategory = searchParams.get("mood");
    const difficulty = searchParams.get("difficulty");
    const maxTime = searchParams.get("maxTime");
    const search = searchParams.get("search");
    const tags = searchParams.get("tags");
    const featured = searchParams.get("featured");
    const viral = searchParams.get("viral");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Build query conditions
    const conditions = [];
    conditions.push(eq(recipes.isPublished, true));

    if (category && ["breakfast", "lunch", "dinner", "snacks", "desserts", "drinks"].includes(category)) {
      conditions.push(eq(recipes.category, category as "breakfast" | "lunch" | "dinner" | "snacks" | "desserts" | "drinks"));
    }
    if (moodCategory && ["cozy", "energy", "calm", "fresh", "comfort"].includes(moodCategory)) {
      conditions.push(eq(recipes.moodCategory, moodCategory as "cozy" | "energy" | "calm" | "fresh" | "comfort"));
    }
    if (difficulty && ["Super Easy", "Easy", "Medium", "Advanced"].includes(difficulty)) {
      conditions.push(eq(recipes.difficulty, difficulty as "Super Easy" | "Easy" | "Medium" | "Advanced"));
    }
    if (maxTime) conditions.push(sql`${recipes.prepTime} + ${recipes.cookTime} <= ${parseInt(maxTime)}`);
    if (featured === "true") conditions.push(eq(recipes.isFeatured, true));
    if (viral === "true") conditions.push(eq(recipes.isViral, true));
    
    if (tags) {
      const tagArray = tags.split(",");
      conditions.push(sql`${recipes.tags} && ${JSON.stringify(tagArray)}`);
    }

    if (search) {
      conditions.push(
        or(
          ilike(recipes.title, `%${search}%`),
          ilike(recipes.description, `%${search}%`),
          sql`${recipes.tags} && ${JSON.stringify([search])}`
        )
      );
    }

    // Execute query with pagination
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const recipesData = await db
      .select({
        id: recipes.id,
        title: recipes.title,
        slug: recipes.slug,
        description: recipes.description,
        image: recipes.image,
        videoUrl: recipes.videoUrl,
        prepTime: recipes.prepTime,
        cookTime: recipes.cookTime,
        servings: recipes.servings,
        difficulty: recipes.difficulty,
        category: recipes.category,
        moodCategory: recipes.moodCategory,
        tags: recipes.tags,
        saves: recipes.saves,
        likes: recipes.likes,
        ratingAverage: recipes.ratingAverage,
        ratingCount: recipes.ratingCount,
        isFeatured: recipes.isFeatured,
        isViral: recipes.isViral,
        createdAt: recipes.createdAt,
        author: {
          id: users.id,
          name: users.name,
          username: users.username,
          avatar: users.avatar,
        },
        environmentalImpact: recipes.environmentalImpact,
      })
      .from(recipes)
      .leftJoin(users, eq(recipes.authorId, users.id))
      .where(whereClause)
      .orderBy(desc(recipes.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    // Get total count for pagination
    const totalQuery = await db
      .select({ count: sql`count(*)` })
      .from(recipes)
      .where(whereClause);
    
    const total = Number(totalQuery[0].count);

    return NextResponse.json({
      success: true,
      data: {
        recipes: recipesData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Recipes API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}

// POST /api/v1/recipes - Create new recipe (protected)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      story,
      hapiAdvice,
      image,
      videoUrl,
      prepTime,
      cookTime,
      servings,
      difficulty,
      category,
      moodCategory,
      tags,
      ingredients,
      steps,
      nutrition,
      environmentalImpact,
    } = body;

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const newRecipe = await db
      .insert(recipes)
      .values({
        title,
        slug,
        description,
        story,
        hapiAdvice,
        image,
        videoUrl,
        prepTime,
        cookTime,
        servings,
        difficulty,
        category,
        moodCategory,
        tags,
        ingredients,
        steps,
        nutrition,
        environmentalImpact,
        authorId: Number(session.user.id),
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Recipe created successfully! 🌿",
      data: newRecipe[0],
    });
  } catch (error) {
    console.error("Create Recipe Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create recipe" },
      { status: 500 }
    );
  }
}
