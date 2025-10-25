"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { DashboardNavigation } from "@/components/dashboard/dashboard-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  eventType: string;
  location: string;
  isVirtual: boolean;
  virtualLink?: string;
  startDate: string;
  endDate: string;
  maxAttendees?: number;
  currentAttendees: number;
  organizerName: string;
  organizerContact?: string;
  tags: string[];
  isFree: boolean;
  isRecurring: boolean;
  recurringPattern?: string;
  image?: string;
  status: string;
  impactCategory?: string;
}

const eventTypes = ["all", "volunteer", "community", "educational", "environmental", "fundraiser", "workshop"];
const timeFilters = [
  { label: "All", value: "all" },
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
];

export default function EventsPage() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedTime, setSelectedTime] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/");
    }
  }, [status]);

  useEffect(() => {
    if (session) {
      fetchEvents(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, searchTerm, selectedType, selectedTime]);

  const fetchEvents = async (reset = false) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: reset ? "1" : page.toString(),
        limit: "12",
      });

      if (searchTerm) params.append("search", searchTerm);
      if (selectedType !== "all") params.append("eventType", selectedType);
      if (selectedTime !== "all") params.append("timeFilter", selectedTime);

      const response = await fetch(`/api/v1/events?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (reset) {
          setEvents(data.data.events || []);
          setPage(1);
        } else {
          setEvents(prev => [...prev, ...(data.data.events || [])]);
        }
        setHasMore(data.data.pagination?.hasMore || false);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
    fetchEvents(false);
  };

  const joinEvent = async (eventId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await fetch(`/api/v1/events/${eventId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.ok) {
        // Update the event in the list to reflect the new attendee count
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { ...event, currentAttendees: event.currentAttendees + 1 }
            : event
        ));
        console.log("Successfully joined event");
      }
    } catch (error) {
      console.error("Failed to join event:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", { 
        weekday: "short", 
        month: "short", 
        day: "numeric" 
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "volunteer": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "community": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "educational": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "environmental": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300";
      case "fundraiser": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "workshop": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      default: return "bg-accent text-accent-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming": return "🗓️";
      case "ongoing": return "🟢";
      case "completed": return "✅";
      case "cancelled": return "❌";
      default: return "📅";
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading events...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavigation />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Community Events 🎉</h1>
          <p className="text-muted-foreground">
            Join meaningful events and make a positive impact in your community.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <Tabs defaultValue="type" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="type">Event Type</TabsTrigger>
              <TabsTrigger value="time">Time Frame</TabsTrigger>
            </TabsList>
            
            <TabsContent value="type" className="mt-4">
              <div className="flex flex-wrap gap-2">
                {eventTypes.map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="time" className="mt-4">
              <div className="flex flex-wrap gap-2">
                {timeFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={selectedTime === filter.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Events Grid */}
        {isLoading && events.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-8 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search terms.
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setSelectedType("all");
              setSelectedTime("all");
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-200 h-full">
                    {event.image && (
                      <div className="relative overflow-hidden rounded-t-lg">
                        <Image
                          src={event.image}
                          alt={event.title}
                          width={400}
                          height={200}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getEventTypeColor(event.eventType)}`}>
                            {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                          {getStatusIcon(event.status)} {event.status}
                        </div>
                      </div>
                    )}
                    
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {event.title}
                      </CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground space-x-4">
                        <div className="flex items-center space-x-1">
                          <span>📅</span>
                          <span>{formatDate(event.startDate)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>🕒</span>
                          <span>{formatTime(event.startDate)}</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0 space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center text-sm text-muted-foreground space-x-4">
                        <div className="flex items-center space-x-1">
                          <span>{event.isVirtual ? "💻" : "📍"}</span>
                          <span className="line-clamp-1">
                            {event.isVirtual ? "Virtual Event" : event.location}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <span>👥</span>
                          <span>
                            {event.currentAttendees}
                            {event.maxAttendees && ` / ${event.maxAttendees}`} attending
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>{event.isFree ? "🆓" : "💰"}</span>
                          <span className="text-primary font-medium">
                            {event.isFree ? "Free" : "Paid"}
                          </span>
                        </div>
                      </div>
                      
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {event.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {event.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{event.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-muted-foreground">
                          by {event.organizerName}
                        </span>
                        <Button
                          size="sm"
                          onClick={(e) => joinEvent(event.id, e)}
                          disabled={event.status !== "upcoming" || 
                                   !!(event.maxAttendees && event.currentAttendees >= event.maxAttendees)}
                        >
                          {event.status !== "upcoming" ? "Event Started" : 
                           (event.maxAttendees && event.currentAttendees >= event.maxAttendees) ? "Full" : "Join Event"}
                        </Button>
                      </div>
                      
                      {event.isRecurring && event.recurringPattern && (
                        <div className="text-xs text-muted-foreground border-t pt-2">
                          🔄 Recurring: {event.recurringPattern}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-8">
                <Button 
                  onClick={loadMore} 
                  disabled={isLoading}
                  variant="outline"
                >
                  {isLoading ? "Loading..." : "Load More Events"}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
