import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { kindnessActivities, users } from "@/db/schema";
import { eq, desc, sum, count, gte, and, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Define valid activity types
type ActivityType = "recipe_cooked" | "product_bought" | "event_attended" | "friend_referred";

// GET /api/v1/impact - Get user's impact tracking data
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
    const timeframe = searchParams.get("timeframe") || "all"; // all, month, week
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Calculate date filter
    let dateFilter;
    const now = new Date();
    if (timeframe === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = gte(kindnessActivities.createdAt, weekAgo);
    } else if (timeframe === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = gte(kindnessActivities.createdAt, monthAgo);
    }

    // Build where conditions
    let whereConditions = eq(kindnessActivities.userId, userId);
    if (dateFilter) {
      whereConditions = and(whereConditions, dateFilter)!;
    }

    // Get recent activities
    const activities = await db
      .select({
        id: kindnessActivities.id,
        activityType: kindnessActivities.activityType,
        points: kindnessActivities.points,
        waterSaved: kindnessActivities.waterSaved,
        co2Reduced: kindnessActivities.co2Reduced,
        animalsSpared: kindnessActivities.animalsSpared,
        relatedId: kindnessActivities.relatedId,
        description: kindnessActivities.description,
        createdAt: kindnessActivities.createdAt,
      })
      .from(kindnessActivities)
      .where(whereConditions)
      .orderBy(desc(kindnessActivities.createdAt))
      .limit(limit)
      .offset(offset);

    // Get overall stats
    const [totalStats] = await db
      .select({
        totalActivities: count(kindnessActivities.id),
        totalPoints: sum(kindnessActivities.points),
        totalWaterSaved: sum(kindnessActivities.waterSaved),
        totalCo2Reduced: sum(kindnessActivities.co2Reduced),
        totalAnimalsSpared: sum(kindnessActivities.animalsSpared),
      })
      .from(kindnessActivities)
      .where(eq(kindnessActivities.userId, userId));

    // Get current user's kindness score
    const [currentUser] = await db
      .select({
        kindnessScore: users.kindnessScore,
      })
      .from(users)
      .where(eq(users.id, userId));

    // Get activity breakdown by type
    const activityBreakdown = await db
      .select({
        activityType: kindnessActivities.activityType,
        count: count(kindnessActivities.id),
        totalPoints: sum(kindnessActivities.points),
        totalWaterSaved: sum(kindnessActivities.waterSaved),
        totalCo2Reduced: sum(kindnessActivities.co2Reduced),
        totalAnimalsSpared: sum(kindnessActivities.animalsSpared),
      })
      .from(kindnessActivities)
      .where(eq(kindnessActivities.userId, userId))
      .groupBy(kindnessActivities.activityType);

    return NextResponse.json({
      success: true,
      data: {
        activities,
        stats: {
          totalActivities: totalStats?.totalActivities || 0,
          totalPoints: totalStats?.totalPoints || 0,
          kindnessScore: currentUser?.kindnessScore || 0,
          impact: {
            waterSaved: parseFloat((totalStats?.totalWaterSaved || 0).toString()),
            co2Reduced: parseFloat((totalStats?.totalCo2Reduced || 0).toString()),
            animalsSpared: parseFloat((totalStats?.totalAnimalsSpared || 0).toString()),
          },
        },
        breakdown: activityBreakdown,
        pagination: {
          page,
          limit,
          hasMore: activities.length === limit,
        },
      },
    });
  } catch (error) {
    console.error("Impact GET API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch impact data" },
      { status: 500 }
    );
  }
}

// POST /api/v1/impact - Log a new kindness activity
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
      activityType,
      relatedId,
      description,
      waterSaved = 0,
      co2Reduced = 0,
      animalsSpared = 0,
    } = body;

    if (!activityType) {
      return NextResponse.json(
        { success: false, error: "Activity type is required" },
        { status: 400 }
      );
    }

    // Validate activity type
    const validTypes: ActivityType[] = ["recipe_cooked", "product_bought", "event_attended", "friend_referred"];
    if (!validTypes.includes(activityType)) {
      return NextResponse.json(
        { success: false, error: "Invalid activity type" },
        { status: 400 }
      );
    }

    // Calculate points based on activity type
    const pointsMap: Record<ActivityType, number> = {
      "recipe_cooked": 10,
      "product_bought": 5,
      "event_attended": 15,
      "friend_referred": 25,
    };

    const points = pointsMap[activityType as ActivityType] || 5;

    // Create activity
    const [newActivity] = await db
      .insert(kindnessActivities)
      .values({
        userId,
        activityType,
        points,
        waterSaved,
        co2Reduced,
        animalsSpared,
        relatedId,
        description,
      })
      .returning();

    // Update user's kindness score
    await db
      .update(users)
      .set({
        kindnessScore: sql`${users.kindnessScore} + ${points}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: "Activity logged successfully! 🌟",
      data: newActivity,
    });
  } catch (error) {
    console.error("Impact POST API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to log activity" },
      { status: 500 }
    );
  }
}
