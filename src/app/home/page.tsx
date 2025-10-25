"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardNavigation } from "@/components/dashboard/dashboard-navigation";
import { FeaturedRecipes } from "@/components/dashboard/featured-recipes";
import { HapiTip } from "@/components/dashboard/hapi-tip";
import { KindnessMeter } from "@/components/dashboard/kindness-meter";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState<{
    name?: string;
    kindnessScore?: number;
    [key: string]: unknown;
  } | null>(null);
  const [impactData, setImpactData] = useState<{
    activities?: Array<{
      id: number;
      activityType: string;
      points: number;
      waterSaved?: number;
      co2Reduced?: number;
      animalsSpared?: number;
      relatedId?: number;
      description?: string;
      createdAt: string;
    }>;
    stats?: {
      totalActivities?: number;
      kindnessScore?: number;
      impact?: {
        waterSaved?: number;
        co2Reduced?: number;
        animalsSpared?: number;
      };
    };
  } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/");
    }
  }, [status]);

  useEffect(() => {
    if (session) {
      fetchUserProfile();
      fetchImpactData();
    }
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/v1/users/profile");
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const fetchImpactData = async () => {
    try {
      const response = await fetch("/api/v1/impact?timeframe=month");
      if (response.ok) {
        const data = await response.json();
        setImpactData(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch impact data:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading your HapiBara experience...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavigation />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {userProfile?.name || session.user?.name} 🌱
          </h1>
          <p className="text-muted-foreground">
            Continue your plant-based journey with purpose and kindness.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Quick Actions */}
            <QuickActions />
            
            {/* Featured Recipes */}
            <FeaturedRecipes />
            
            {/* Upcoming Events */}
            <UpcomingEvents />
            
            {/* Recent Activities */}
            <RecentActivities
              activities={
                (impactData?.activities || []).map(activity => ({
                  ...activity,
                  activityType: activity.activityType as
                    | "recipe_cooked"
                    | "product_bought"
                    | "event_attended"
                    | "friend_referred"
                }))
              }
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Hapi Tip of the Day */}
            <HapiTip />
            
            {/* Kindness Meter */}
            <KindnessMeter impactData={impactData} />
            
            {/* Profile Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {impactData?.stats?.totalActivities || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Activities</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {impactData?.stats?.kindnessScore || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Kindness Score</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Water Saved</span>
                    <span className="font-medium">
                      {impactData?.stats?.impact?.waterSaved?.toFixed(1) || 0}L
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>CO2 Reduced</span>
                    <span className="font-medium">
                      {impactData?.stats?.impact?.co2Reduced?.toFixed(1) || 0}kg
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Animals Spared</span>
                    <span className="font-medium">
                      {impactData?.stats?.impact?.animalsSpared?.toFixed(0) || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
