"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { DashboardNavigation } from "@/components/dashboard/dashboard-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Recipe {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  category: string;
  moodCategory?: string;
  ratingAverage: string;
  environmentalImpact?: {
    waterSaved: number;
    co2Reduced: number;
    animalsSpared: number;
  };
  author: {
    name: string;
  };
}

const categories = ["all", "breakfast", "lunch", "dinner", "snacks", "desserts", "drinks"];
const moods = ["all", "cozy", "energy", "calm", "fresh", "comfort"];
const difficulties = ["all", "Super Easy", "Easy", "Medium", "Advanced"];

export default function RecipesPage() {
  const { data: session, status } = useSession();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMood, setSelectedMood] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/");
    }
  }, [status]);

  useEffect(() => {
    if (session) {
      fetchRecipes(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, searchTerm, selectedCategory, selectedMood, selectedDifficulty]);

  const fetchRecipes = async (reset = false) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: reset ? "1" : page.toString(),
        limit: "12",
      });

      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedMood !== "all") params.append("mood", selectedMood);
      if (selectedDifficulty !== "all") params.append("difficulty", selectedDifficulty);

      const response = await fetch(`/api/v1/recipes?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (reset) {
          setRecipes(data.data.recipes || []);
          setPage(1);
        } else {
          setRecipes(prev => [...prev, ...(data.data.recipes || [])]);
        }
        setHasMore(data.data.pagination?.hasMore || false);
      }
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
    fetchRecipes(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Super Easy": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "Easy": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "Medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "Advanced": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default: return "bg-accent text-accent-foreground";
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

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading recipes...</p>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Plant-Based Recipes 🍽️</h1>
          <p className="text-muted-foreground">
            Discover delicious recipes that nourish your body and protect the planet.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <Input
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <Tabs defaultValue="category" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="category">Category</TabsTrigger>
              <TabsTrigger value="mood">Mood</TabsTrigger>
              <TabsTrigger value="difficulty">Difficulty</TabsTrigger>
            </TabsList>
            
            <TabsContent value="category" className="mt-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="mood" className="mt-4">
              <div className="flex flex-wrap gap-2">
                {moods.map((mood) => (
                  <Button
                    key={mood}
                    variant={selectedMood === mood ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedMood(mood)}
                  >
                    {mood === "all" ? "All" : `${getMoodEmoji(mood)} ${mood.charAt(0).toUpperCase() + mood.slice(1)}`}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="difficulty" className="mt-4">
              <div className="flex flex-wrap gap-2">
                {difficulties.map((difficulty) => (
                  <Button
                    key={difficulty}
                    variant={selectedDifficulty === difficulty ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDifficulty(difficulty)}
                  >
                    {difficulty}
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Recipes Grid */}
        {isLoading && recipes.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="bg-muted h-48 rounded-t-lg"></div>
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold mb-2">No recipes found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search terms.
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
              setSelectedMood("all");
              setSelectedDifficulty("all");
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <Link key={recipe.id} href={`/recipes/${recipe.slug}`}>
                  <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-200">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <Image
                        src={recipe.image || "/placeholder-recipe.jpg"}
                        alt={recipe.title}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
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
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1 line-clamp-1">
                        {recipe.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {recipe.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <div className="flex items-center space-x-2">
                          <span>⏱️ {recipe.prepTime + recipe.cookTime}min</span>
                          <span>👥 {recipe.servings}</span>
                        </div>
                        <span>⭐ {parseFloat(recipe.ratingAverage).toFixed(1)}</span>
                      </div>
                      
                      {recipe.environmentalImpact && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>💧 {recipe.environmentalImpact.waterSaved}L saved</span>
                          <span>🌍 {recipe.environmentalImpact.co2Reduced}kg CO₂</span>
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
                  {isLoading ? "Loading..." : "Load More Recipes"}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
