import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { recipes, users } from "@/db/schema";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Fetch the recipe by slug with author information
    const recipe = await db
      .select({
        recipe: recipes,
        author: {
          name: users.name,
          avatar: users.avatar,
        },
      })
      .from(recipes)
      .leftJoin(users, eq(recipes.authorId, users.id))
      .where(eq(recipes.slug, slug))
      .limit(1);

    if (!recipe.length) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    const recipeData = {
      ...recipe[0].recipe,
      author: recipe[0].author,
    };

    return NextResponse.json({
      success: true,
      data: {
        recipe: recipeData,
      },
    });
  } catch (error) {
    console.error("Failed to fetch recipe:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
