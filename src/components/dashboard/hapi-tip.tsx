"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const defaultTips = [
  {
    id: 1,
    title: "Hydration Hero",
    content: "Drinking water before meals can help you feel fuller and support healthy digestion. Try adding lemon or cucumber for extra flavor! 🍋",
    category: "wellness",
    icon: "💧",
  },
  {
    id: 2,
    title: "Plant Power",
    content: "Did you know that one plant-based meal can save up to 1,100 gallons of water? Every choice makes a difference! 🌱",
    category: "environment",
    icon: "🌍",
  },
  {
    id: 3,
    title: "Mindful Eating",
    content: "Take time to chew your food slowly. This helps with digestion and allows you to truly enjoy your meal's flavors and textures. 🧘‍♀️",
    category: "wellness",
    icon: "🍽️",
  },
  {
    id: 4,
    title: "Kitchen Hack",
    content: "Freeze fresh herbs in ice cube trays with olive oil. This preserves their flavor and makes cooking more convenient! ❄️",
    category: "cooking",
    icon: "🧊",
  },
  {
    id: 5,
    title: "Sustainable Shopping",
    content: "Bring your own containers to bulk stores. It reduces packaging waste and keeps your pantry organized! 🛍️",
    category: "shopping",
    icon: "♻️",
  },
];

export function HapiTip() {
  const [currentTip, setCurrentTip] = useState(defaultTips[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDailyTip();
  }, []);

  const fetchDailyTip = async () => {
    try {
      // In a real app, this would fetch from the API
      // For now, we'll use a random tip from our defaults
      const today = new Date().getDate();
      const tipIndex = today % defaultTips.length;
      setCurrentTip(defaultTips[tipIndex]);
    } catch (error) {
      console.error("Failed to fetch daily tip:", error);
      // Fallback to random tip
      const randomIndex = Math.floor(Math.random() * defaultTips.length);
      setCurrentTip(defaultTips[randomIndex]);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "wellness":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "environment":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "cooking":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "shopping":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      default:
        return "bg-accent text-accent-foreground";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <span>💡</span>
            <span>Hapi Tip of the Day</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <span>{currentTip.icon}</span>
          <span>Hapi Tip of the Day</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{currentTip.title}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(currentTip.category)}`}>
            {currentTip.category}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {currentTip.content}
        </p>
        
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            💚 Every small step towards a plant-based lifestyle makes a big difference!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
