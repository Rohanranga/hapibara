"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { DashboardNavigation } from "@/components/dashboard/dashboard-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  GlobeIcon,
  ArrowLeftIcon,
  ShareIcon,
} from "lucide-react";

interface EventAttendee {
  id: number;
  name: string;
  avatar?: string;
  status: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  eventType: string;
  location?: string;
  city: string;
  isOnline: boolean;
  meetingUrl?: string;
  startDate: string;
  endDate: string;
  maxAttendees?: number;
  price: string;
  image?: string;
  attendeeCount: number;
  isFeatured: boolean;
  isApproved: boolean;
  createdAt: string;
  organizerName: string;
  organizerEmail: string;
  organizerAvatar?: string;
  attendees: EventAttendee[];
}

export default function EventDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAttending, setIsAttending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/events/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Event not found");
        } else {
          setError("Failed to load event");
        }
        return;
      }
      
      const eventData = await response.json();
      setEvent(eventData);
      
      // Check if current user is attending
      if (session?.user?.email) {
        const userAttending = eventData.attendees.some(
          (attendee: EventAttendee) => attendee.status === "attending"
        );
        setIsAttending(userAttending);
      }
    } catch (err) {
      console.error("Error fetching event:", err);
      setError("Failed to load event");
    } finally {
      setIsLoading(false);
    }
  }, [params.id, session?.user?.email]);

  useEffect(() => {
    if (!params.id) return;
    
    fetchEvent();
  }, [params.id, fetchEvent]);

  const handleAttendanceToggle = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    try {
      const response = await fetch(`/api/v1/events/${params.id}/attend`, {
        method: isAttending ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setIsAttending(!isAttending);
        // Refresh event data to update attendee count
        fetchEvent();
      }
    } catch (err) {
      console.error("Error updating attendance:", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <DashboardNavigation />
        <div className="container mx-auto px-4 pt-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in to view events</h1>
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <DashboardNavigation />
        <div className="container mx-auto px-4 pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading event...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <DashboardNavigation />
        <div className="container mx-auto px-4 pt-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{error || "Event not found"}</h1>
            <Link href="/events">
              <Button variant="outline">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <DashboardNavigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/events">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Image */}
            {event.image && (
              <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Event Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full capitalize">
                        {event.eventType}
                      </span>
                      {event.isFeatured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-2xl md:text-3xl mb-2">
                      {event.title}
                    </CardTitle>
                  </div>
                  <Button variant="outline" size="sm">
                    <ShareIcon className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">{formatDate(event.startDate)}</p>
                    <p className="text-sm text-gray-600">
                      {formatTime(event.startDate)} - {formatTime(event.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {event.isOnline ? (
                    <GlobeIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <MapPinIcon className="w-5 h-5 text-green-600" />
                  )}
                  <div>
                    <p className="font-medium">
                      {event.isOnline ? "Online Event" : event.location}
                    </p>
                    <p className="text-sm text-gray-600">{event.city}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <UsersIcon className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">
                      {event.attendeeCount} attending
                      {event.maxAttendees && ` of ${event.maxAttendees} spots`}
                    </p>
                  </div>
                </div>

                {parseFloat(event.price) > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <span className="text-green-600 font-bold">$</span>
                    </div>
                    <p className="font-medium">${event.price}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Organizer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Organized by</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={event.organizerAvatar} />
                    <AvatarFallback>
                      {event.organizerName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{event.organizerName}</p>
                    <p className="text-sm text-gray-600">Event Organizer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* RSVP Card */}
            <Card>
              <CardHeader>
                <CardTitle>RSVP</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleAttendanceToggle}
                  className="w-full"
                  variant={isAttending ? "outline" : "default"}
                >
                  {isAttending ? "Cancel Attendance" : "Attend Event"}
                </Button>
                
                {event.isOnline && event.meetingUrl && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={event.meetingUrl} target="_blank" rel="noopener noreferrer">
                      <GlobeIcon className="w-4 h-4 mr-2" />
                      Join Online
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Attendees */}
            {event.attendees.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Attendees ({event.attendees.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {event.attendees.slice(0, 9).map((attendee) => (
                      <div key={attendee.id} className="text-center">
                        <Avatar className="mx-auto mb-1">
                          <AvatarImage src={attendee.avatar} />
                          <AvatarFallback className="text-xs">
                            {attendee.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xs truncate">{attendee.name}</p>
                      </div>
                    ))}
                  </div>
                  {event.attendees.length > 9 && (
                    <p className="text-sm text-gray-600 text-center mt-2">
                      +{event.attendees.length - 9} more
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
