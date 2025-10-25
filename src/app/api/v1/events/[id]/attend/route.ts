import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/db/drizzle';
import { eventAttendees, communityEvents } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id) : session.user.id;
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const { id } = await params;
    const eventId = parseInt(id);
    
    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // Check if event exists
    const event = await db
      .select()
      .from(communityEvents)
      .where(eq(communityEvents.id, eventId))
      .limit(1);

    if (event.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user is already attending
    const existingAttendance = await db
      .select()
      .from(eventAttendees)
      .where(
        and(
          eq(eventAttendees.eventId, eventId),
          eq(eventAttendees.userId, userId)
        )
      )
      .limit(1);

    if (existingAttendance.length > 0) {
      return NextResponse.json(
        { error: 'Already attending this event' },
        { status: 400 }
      );
    }

    // Add attendance
    await db.insert(eventAttendees).values({
      eventId,
      userId,
      status: 'attending',
    });

    // Update attendee count
    await db
      .update(communityEvents)
      .set({
        attendeeCount: (event[0].attendeeCount ?? 0) + 1,
      })
      .where(eq(communityEvents.id, eventId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error attending event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id) : session.user.id;
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const { id } = await params;
    const eventId = parseInt(id);
    
    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // Remove attendance
    await db
      .delete(eventAttendees)
      .where(
        and(
          eq(eventAttendees.eventId, eventId),
          eq(eventAttendees.userId, userId)
        )
      );

    // Update attendee count
    const event = await db
      .select()
      .from(communityEvents)
      .where(eq(communityEvents.id, eventId))
      .limit(1);

    if (event.length > 0) {
      await db
        .update(communityEvents)
        .set({
          attendeeCount: Math.max(0, (event[0].attendeeCount ?? 0) - 1),
        })
        .where(eq(communityEvents.id, eventId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error canceling attendance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
