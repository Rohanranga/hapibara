import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { users, plantMatches, kindnessActivities } from "@/db/schema";
import { eq, and, or, ne, count } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import bcrypt from "bcryptjs";

// GET /api/v1/users/profile - Get current user's profile
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

    // Get user profile with stats
    const [userProfile] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        username: users.username,
        avatar: users.avatar,
        bio: users.bio,
        location: users.location,
        isEmailVerified: users.isEmailVerified,
        dietaryPreferences: users.dietaryPreferences,
        plantBasedSince: users.plantBasedSince,
        kindnessScore: users.kindnessScore,
        favoriteRecipes: users.favoriteRecipes,
        savedRecipes: users.savedRecipes,
        interests: users.interests,
        lookingFor: users.lookingFor,
        isProfilePublic: users.isProfilePublic,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Get kindness activities count
    const [kindnessStats] = await db
      .select({
        totalActivities: count(kindnessActivities.id),
      })
      .from(kindnessActivities)
      .where(eq(kindnessActivities.userId, userId));

    // Get matching stats
    const [matchStats] = await db
      .select({
        totalMatches: count(plantMatches.id),
      })
      .from(plantMatches)
      .where(
        or(
          eq(plantMatches.userId1, userId),
          eq(plantMatches.userId2, userId)
        )
      );

    return NextResponse.json({
      success: true,
      data: {
        ...userProfile,
        stats: {
          kindnessActivities: kindnessStats?.totalActivities || 0,
          totalMatches: matchStats?.totalMatches || 0,
          memberSince: userProfile.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("User Profile GET API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT /api/v1/users/profile - Update current user's profile
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
    const {
      name,
      username,
      bio,
      location,
      avatar,
      dietaryPreferences,
      plantBasedSince,
      interests,
      lookingFor,
      isProfilePublic,
      currentPassword,
      newPassword,
    } = body;

    // Check if username is taken (if provided and different from current)
    if (username) {
      const [existingUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.username, username), ne(users.id, userId)));

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "Username already taken" },
          { status: 400 }
        );
      }
    }

    // Prepare update object
    const updateData: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (dietaryPreferences !== undefined) updateData.dietaryPreferences = dietaryPreferences;
    if (plantBasedSince !== undefined) updateData.plantBasedSince = plantBasedSince;
    if (interests !== undefined) updateData.interests = interests;
    if (lookingFor !== undefined) updateData.lookingFor = lookingFor;
    if (isProfilePublic !== undefined) updateData.isProfilePublic = isProfilePublic;

    // Handle password change
    if (currentPassword && newPassword) {
      // Get current user with password
      const [currentUser] = await db
        .select({ password: users.password })
        .from(users)
        .where(eq(users.id, userId));

      if (!currentUser?.password) {
        return NextResponse.json(
          { success: false, error: "Current password not found" },
          { status: 400 }
        );
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        currentUser.password
      );

      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { success: false, error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      updateData.password = hashedNewPassword;
    }

    // Update user profile
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        username: users.username,
        avatar: users.avatar,
        bio: users.bio,
        location: users.location,
        dietaryPreferences: users.dietaryPreferences,
        plantBasedSince: users.plantBasedSince,
        kindnessScore: users.kindnessScore,
        interests: users.interests,
        lookingFor: users.lookingFor,
        isProfilePublic: users.isProfilePublic,
        updatedAt: users.updatedAt,
      });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully! ✨",
      data: updatedUser,
    });
  } catch (error) {
    console.error("User Profile PUT API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
