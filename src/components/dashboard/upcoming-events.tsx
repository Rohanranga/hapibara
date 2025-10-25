"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Event {
  id: number;
  title: string;
  description: string;
  eventType: string;
  startDate: string;
  endDate: string;
  location?: string;
  city: string;
  isOnline: boolean;
  attendeeCount: number;
  maxAttendees?: number;
  organizer: {
    id: number;
    name: string;
    avatar?: string;
  };
}

export function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const response = await fetch("/api/v1/events?limit=3");
      if (response.ok) {
        const data = await response.json();
        setEvents(data.data.events || []);
      }
    } catch (error) {
      console.error("Failed to fetch upcoming events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventTypeEmoji = (type: string) => {
    switch (type) {
      case "meetup": return "🤝";
      case "workshop": return "🛠️";
      case "potluck": return "🥘";
      case "cleanup": return "🌍";
      case "cooking": return "👨‍🍳";
      default: return "📅";
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meetup":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "workshop":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "potluck":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "cleanup":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "cooking":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-accent text-accent-foreground";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse border border-border rounded-lg p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Upcoming Events</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/events">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No upcoming events in your area.</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/events">Explore Events</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div className="group cursor-pointer border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getEventTypeEmoji(event.eventType)}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getEventTypeColor(event.eventType)}`}>
                        {event.eventType}
                      </span>
                      {event.isOnline && (
                        <span className="bg-accent text-accent-foreground px-2 py-1 text-xs rounded-full">
                          Online
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatEventDate(event.startDate)}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                    {event.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-3">
                      <span>📍 {event.location || event.city}</span>
                      <span>👥 {event.attendeeCount} attending</span>
                    </div>
                    <span>by {event.organizer.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
