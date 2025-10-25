"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Activity {
  id: number;
  activityType: "recipe_cooked" | "product_bought" | "event_attended" | "friend_referred";
  points: number;
  waterSaved?: number;
  co2Reduced?: number;
  animalsSpared?: number;
  relatedId?: number;
  description?: string;
  createdAt: string;
}

interface RecentActivitiesProps {
  activities: Activity[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "recipe_cooked": return "🍽️";
      case "product_bought": return "🛍️";
      case "event_attended": return "🤝";
      case "friend_referred": return "👥";
      default: return "✨";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "recipe_cooked":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "product_bought":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "event_attended":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "friend_referred":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      default:
        return "bg-accent text-accent-foreground";
    }
  };

  const getActivityTitle = (activity: Activity) => {
    switch (activity.activityType) {
      case "recipe_cooked":
        return "Cooked a delicious plant-based recipe";
      case "product_bought":
        return "Purchased a sustainable product";
      case "event_attended":
        return "Attended a community event";
      case "friend_referred":
        return "Referred a friend to HapiBara";
      default:
        return "Completed an activity";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Recent Activities</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/impact">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🌱</div>
            <p className="text-muted-foreground mb-4">No activities yet!</p>
            <p className="text-sm text-muted-foreground mb-4">
              Start your journey by cooking a recipe or joining an event.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" asChild>
                <Link href="/recipes">Browse Recipes</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/events">Find Events</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 border border-border rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm">{getActivityIcon(activity.activityType)}</span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-foreground">
                      {getActivityTitle(activity)}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.createdAt)}
                    </span>
                  </div>
                  
                  {activity.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                      {activity.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getActivityColor(activity.activityType)}`}>
                        +{activity.points} points
                      </span>
                    </div>
                    
                    {(activity.waterSaved || activity.co2Reduced || activity.animalsSpared) && (
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        {activity.waterSaved && activity.waterSaved > 0 && (
                          <span>💧 {activity.waterSaved.toFixed(0)}L</span>
                        )}
                        {activity.co2Reduced && activity.co2Reduced > 0 && (
                          <span>🌍 {activity.co2Reduced.toFixed(1)}kg</span>
                        )}
                        {activity.animalsSpared && activity.animalsSpared > 0 && (
                          <span>🐾 {activity.animalsSpared.toFixed(0)}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {activities.length > 5 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/impact">View {activities.length - 5} more activities</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
