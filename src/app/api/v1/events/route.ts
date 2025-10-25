import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { communityEvents, eventAttendees, users } from "@/db/schema";
import { eq, desc, and, like, gte, lte, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Define valid event types
type EventType = "meetup" | "workshop" | "potluck" | "cleanup" | "cooking" | "other";

// GET /api/v1/events - Get community events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const eventType = searchParams.get("eventType");
    const city = searchParams.get("city");
    const isOnline = searchParams.get("isOnline");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    // Build where conditions
    let whereConditions = sql`1=1`;

    if (search) {
      whereConditions = and(
        whereConditions,
        like(communityEvents.title, `%${search}%`)
      )!;
    }

    if (eventType) {
      const validTypes: EventType[] = ["meetup", "workshop", "potluck", "cleanup", "cooking", "other"];
      if (validTypes.includes(eventType as EventType)) {
        whereConditions = and(
          whereConditions, 
          eq(communityEvents.eventType, eventType as EventType)
        )!;
      }
    }

    if (city) {
      whereConditions = and(
        whereConditions,
        like(communityEvents.city, `%${city}%`)
      )!;
    }

    if (isOnline === "true") {
      whereConditions = and(
        whereConditions,
        eq(communityEvents.isOnline, true)
      )!;
    }

    if (startDate) {
      whereConditions = and(
        whereConditions,
        gte(communityEvents.startDate, new Date(startDate))
      )!;
    }

    if (endDate) {
      whereConditions = and(
        whereConditions,
        lte(communityEvents.startDate, new Date(endDate))
      )!;
    }

    // Get events with attendee counts
    const eventsWithCounts = await db
      .select({
        id: communityEvents.id,
        title: communityEvents.title,
        description: communityEvents.description,
        eventType: communityEvents.eventType,
        startDate: communityEvents.startDate,
        endDate: communityEvents.endDate,
        location: communityEvents.location,
        city: communityEvents.city,
        isOnline: communityEvents.isOnline,
        meetingUrl: communityEvents.meetingUrl,
        maxAttendees: communityEvents.maxAttendees,
        price: communityEvents.price,
        image: communityEvents.image,
        isApproved: communityEvents.isApproved,
        isFeatured: communityEvents.isFeatured,
        attendeeCount: communityEvents.attendeeCount,
        createdAt: communityEvents.createdAt,
        organizer: {
          id: users.id,
          name: users.name,
          avatar: users.avatar,
        },
      })
      .from(communityEvents)
      .leftJoin(users, eq(communityEvents.organizerId, users.id))
      .where(whereConditions)
      .orderBy(desc(communityEvents.startDate))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: {
        events: eventsWithCounts,
        pagination: {
          page,
          limit,
          hasMore: eventsWithCounts.length === limit,
        },
      },
    });
  } catch (error) {
    console.error("Events GET API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST /api/v1/events - Create new event
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
      title,
      description,
      eventType,
      startDate,
      endDate,
      location,
      city,
      isOnline = false,
      meetingUrl,
      maxAttendees,
      price = "0",
      image,
    } = body;

    if (!title || !description || !startDate || !endDate || !eventType || !city) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate dates
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    
    if (startDateTime < new Date()) {
      return NextResponse.json(
        { success: false, error: "Event start date cannot be in the past" },
        { status: 400 }
      );
    }

    if (endDateTime < startDateTime) {
      return NextResponse.json(
        { success: false, error: "End date cannot be before start date" },
        { status: 400 }
      );
    }

    // Validate event type
    const validTypes: EventType[] = ["meetup", "workshop", "potluck", "cleanup", "cooking", "other"];
    if (!validTypes.includes(eventType)) {
      return NextResponse.json(
        { success: false, error: "Invalid event type" },
        { status: 400 }
      );
    }

    // Create event
    const [newEvent] = await db
      .insert(communityEvents)
      .values({
        organizerId: userId,
        title,
        description,
        eventType,
        startDate: startDateTime,
        endDate: endDateTime,
        location,
        city,
        isOnline,
        meetingUrl,
        maxAttendees: maxAttendees || null,
        price,
        image,
        isApproved: false, // Require approval by default
        isFeatured: false,
        attendeeCount: 1, // Start with organizer
      })
      .returning();

    // Automatically add organizer as attendee
    await db.insert(eventAttendees).values({
      eventId: newEvent.id,
      userId,
      status: "attending",
    });

    return NextResponse.json({
      success: true,
      message: "Event created successfully! 🎉",
      data: newEvent,
    });
  } catch (error) {
    console.error("Events POST API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}
