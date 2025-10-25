"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { DashboardNavigation } from "@/components/dashboard/dashboard-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface ImpactSummary {
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  currentStreak: number;
  longestStreak: number;
  co2Saved: number;
  waterSaved: number;
  wasteReduced: number;
  treesPlanted: number;
  animalsHelped: number;
  totalActivities: number;
  rank: number;
  level: string;
  nextLevelPoints: number;
}

interface Activity {
  id: number;
  type: string;
  description: string;
  points: number;
  category: string;
  date: string;
  verified: boolean;
  impact?: {
    co2Saved?: number;
    waterSaved?: number;
    wasteReduced?: number;
  };
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

export default function ImpactPage() {
  const { data: session, status } = useSession();
  const [impactSummary, setImpactSummary] = useState<ImpactSummary | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/");
    }
  }, [status]);

  useEffect(() => {
    if (session) {
      fetchImpactData();
    }
  }, [session]);

  const fetchImpactData = async () => {
    try {
      setIsLoading(true);
      const [summaryRes, activitiesRes, achievementsRes] = await Promise.all([
        fetch("/api/v1/user/impact/summary"),
        fetch("/api/v1/user/impact/activities?limit=20"),
        fetch("/api/v1/user/impact/achievements")
      ]);

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setImpactSummary(summaryData.data);
      }

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData.data.activities || []);
      }

      if (achievementsRes.ok) {
        const achievementsData = await achievementsRes.json();
        setAchievements(achievementsData.data.achievements || []);
      }
    } catch (error) {
      console.error("Failed to fetch impact data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "recipe_made": return "🍽️";
      case "product_purchased": return "🛍️";
      case "event_attended": return "🎉";
      case "donation_made": return "💝";
      case "tree_planted": return "🌱";
      case "waste_recycled": return "♻️";
      case "energy_saved": return "⚡";
      case "water_saved": return "💧";
      case "transport_eco": return "🚲";
      default: return "✨";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "environment": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "community": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "wellness": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "education": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "mindfulness": return "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300";
      default: return "bg-accent text-accent-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getProgressToNextLevel = () => {
    if (!impactSummary) return 0;
    const currentLevelPoints = impactSummary.totalPoints % 1000; // Assuming 1000 points per level
    return (currentLevelPoints / 1000) * 100;
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading your impact...</p>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Impact Journey 🌍</h1>
          <p className="text-muted-foreground">
            Track your positive contributions and see how your actions create change.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : impactSummary ? (
          <>
            {/* Impact Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Impact Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{impactSummary.totalPoints.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{impactSummary.weeklyPoints} this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{impactSummary.currentStreak}</div>
                  <p className="text-xs text-muted-foreground">
                    Best: {impactSummary.longestStreak} days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Level & Rank</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{impactSummary.level}</div>
                  <p className="text-xs text-muted-foreground">
                    Rank #{impactSummary.rank} globally
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{impactSummary.totalActivities}</div>
                  <p className="text-xs text-muted-foreground">
                    Actions completed
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Level Progress */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Level Progress</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {impactSummary.totalPoints % 1000} / 1000 XP
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={getProgressToNextLevel()} className="mb-4" />
                <p className="text-sm text-muted-foreground">
                  {1000 - (impactSummary.totalPoints % 1000)} points to next level
                </p>
              </CardContent>
            </Card>

            {/* Environmental Impact */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    🌱 CO₂ Saved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-green-600">{impactSummary.co2Saved}kg</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    💧 Water Saved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-blue-600">{impactSummary.waterSaved}L</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    ♻️ Waste Reduced
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-yellow-600">{impactSummary.wasteReduced}kg</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    🌳 Trees Planted
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-green-600">{impactSummary.treesPlanted}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    🐾 Animals Helped
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-purple-600">{impactSummary.animalsHelped}</div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}

        {/* Tabs for Activities and Achievements */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="activities">Recent Activities</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activities" className="mt-6">
            {activities.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">✨</div>
                  <h3 className="text-xl font-semibold mb-2">No activities yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your impact journey by making a recipe or attending an event!
                  </p>
                  <Button>Get Started</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <Card key={activity.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{activity.description}</h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(activity.category)}`}>
                                {activity.category}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(activity.date)}
                              </span>
                              {activity.verified && (
                                <span className="text-xs text-green-600">✓ Verified</span>
                              )}
                            </div>
                            {activity.impact && (
                              <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                {activity.impact.co2Saved && (
                                  <span>🌱 {activity.impact.co2Saved}kg CO₂</span>
                                )}
                                {activity.impact.waterSaved && (
                                  <span>💧 {activity.impact.waterSaved}L water</span>
                                )}
                                {activity.impact.wasteReduced && (
                                  <span>♻️ {activity.impact.wasteReduced}kg waste</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">+{activity.points}</div>
                          <div className="text-xs text-muted-foreground">points</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-6">
            {achievements.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-xl font-semibold mb-2">No achievements yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete activities to unlock achievements and earn badges!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className={achievement.unlocked ? "border-primary" : "opacity-60"}>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-4xl mb-2">{achievement.icon}</div>
                        <h4 className="font-semibold text-foreground mb-1">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                        
                        {achievement.unlocked ? (
                          <div className="text-xs text-green-600">
                            ✓ Unlocked {achievement.unlockedAt && formatDate(achievement.unlockedAt)}
                          </div>
                        ) : achievement.progress && achievement.target ? (
                          <div className="space-y-2">
                            <Progress value={(achievement.progress / achievement.target) * 100} />
                            <div className="text-xs text-muted-foreground">
                              {achievement.progress} / {achievement.target}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">🔒 Locked</div>
                        )}
                        
                        <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${getCategoryColor(achievement.category)}`}>
                          {achievement.category}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
