import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { communityEvents, users, eventAttendees } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);
    
    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const event = await db
      .select({
        id: communityEvents.id,
        title: communityEvents.title,
        description: communityEvents.description,
        eventType: communityEvents.eventType,
        location: communityEvents.location,
        city: communityEvents.city,
        isOnline: communityEvents.isOnline,
        meetingUrl: communityEvents.meetingUrl,
        startDate: communityEvents.startDate,
        endDate: communityEvents.endDate,
        maxAttendees: communityEvents.maxAttendees,
        price: communityEvents.price,
        image: communityEvents.image,
        attendeeCount: communityEvents.attendeeCount,
        isFeatured: communityEvents.isFeatured,
        isApproved: communityEvents.isApproved,
        createdAt: communityEvents.createdAt,
        organizerName: users.name,
        organizerEmail: users.email,
        organizerAvatar: users.avatar,
      })
      .from(communityEvents)
      .leftJoin(users, eq(communityEvents.organizerId, users.id))
      .where(eq(communityEvents.id, eventId))
      .limit(1);

    if (event.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Get attendees for this event
    const attendees = await db
      .select({
        id: users.id,
        name: users.name,
        avatar: users.avatar,
        status: eventAttendees.status,
      })
      .from(eventAttendees)
      .leftJoin(users, eq(eventAttendees.userId, users.id))
      .where(eq(eventAttendees.eventId, eventId));

    const eventData = {
      ...event[0],
      attendees,
    };

    return NextResponse.json(eventData);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
