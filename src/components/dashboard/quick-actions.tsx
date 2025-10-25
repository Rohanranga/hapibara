"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const quickActions = [
  {
    title: "Discover Recipes",
    description: "Find your next plant-based favorite",
    icon: "🍽️",
    href: "/recipes",
    color: "bg-accent hover:bg-accent/80",
  },
  {
    title: "Shop Conscious",
    description: "Explore sustainable products",
    icon: "🛍️",
    href: "/store",
    color: "bg-secondary hover:bg-secondary/80",
  },
  {
    title: "Join Events",
    description: "Connect with your community",
    icon: "🤝",
    href: "/events",
    color: "bg-accent hover:bg-accent/80",
  },
  {
    title: "Track Impact",
    description: "See your positive influence",
    icon: "🌱",
    href: "/impact",
    color: "bg-secondary hover:bg-secondary/80",
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Button
                variant="ghost"
                className={`h-auto p-4 w-full flex flex-col items-center space-y-2 ${action.color} transition-colors`}
              >
                <span className="text-2xl">{action.icon}</span>
                <div className="text-center">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
