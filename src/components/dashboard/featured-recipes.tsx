"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Recipe {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  prepTime: number;
  cookTime: number;
  difficulty: string;
  category: string;
  moodCategory?: string;
  ratingAverage: string;
  environmentalImpact?: {
    waterSaved: number;
    co2Reduced: number;
    animalsSpared: number;
  };
}

export function FeaturedRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedRecipes();
  }, []);

  const fetchFeaturedRecipes = async () => {
    try {
      const response = await fetch("/api/v1/recipes?limit=4&featured=true");
      if (response.ok) {
        const data = await response.json();
        setRecipes(data.data.recipes || []);
      }
    } catch (error) {
      console.error("Failed to fetch featured recipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Super Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "Easy":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "Advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-accent text-accent-foreground";
    }
  };

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case "cozy": return "🥰";
      case "energy": return "⚡";
      case "calm": return "😌";
      case "fresh": return "🌿";
      case "comfort": return "🤗";
      default: return "😋";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Featured Recipes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-48 rounded-lg mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
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
        <CardTitle className="text-xl">Featured Recipes</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/recipes">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {recipes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No featured recipes available at the moment.</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/recipes">Explore All Recipes</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.map((recipe) => (
              <Link key={recipe.id} href={`/recipes/${recipe.slug}`}>
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg mb-3">
                    <Image
                      src={recipe.image || "/placeholder-recipe.jpg"}
                      alt={recipe.title}
                      width={400}
                      height={192}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-recipe.jpg";
                      }}
                    />
                    <div className="absolute top-2 left-2 flex gap-2">
                      {recipe.moodCategory && (
                        <span className="bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                          {getMoodEmoji(recipe.moodCategory)} {recipe.moodCategory}
                        </span>
                      )}
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(recipe.difficulty)}`}>
                        {recipe.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {recipe.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {recipe.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <span>⏱️ {recipe.prepTime + recipe.cookTime}min</span>
                        <span>⭐ {parseFloat(recipe.ratingAverage).toFixed(1)}</span>
                      </div>
                      {recipe.environmentalImpact && (
                        <div className="flex items-center space-x-1">
                          <span>💧 {recipe.environmentalImpact.waterSaved}L</span>
                        </div>
                      )}
                    </div>
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
