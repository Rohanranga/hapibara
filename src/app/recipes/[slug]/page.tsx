"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { DashboardNavigation } from "@/components/dashboard/dashboard-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface Recipe {
  id: number;
  title: string;
  slug: string;
  description: string;
  story: string;
  hapiAdvice: string;
  image: string;
  videoUrl?: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  category: string;
  moodCategory?: string;
  tags: string[];
  ingredients: {
    item: string;
    amount: string;
    unit: string;
    productId?: number;
  }[];
  steps: {
    number: number;
    title: string;
    instruction: string;
    image?: string;
  }[];
  nutrition?: {
    calories?: number;
    protein?: string;
    carbs?: string;
    fiber?: string;
    fat?: string;
    vitamins?: string[];
  };
  environmentalImpact?: {
    waterSaved: number;
    co2Reduced: number;
    animalsSpared: number;
  };
  saves: number;
  likes: number;
  ratingAverage: string;
  ratingCount: number;
  authorId: number;
  author?: {
    name: string;
    avatar?: string;
  };
}

interface RecipePageProps {
  params: {
    slug: string;
  };
}

export default function RecipePage({ params }: RecipePageProps) {
  const { data: session, status } = useSession();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [isSaved, setIsSaved] = useState(false);
  const [currentServings, setCurrentServings] = useState(2);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/");
    }
  }, [status]);

  const fetchRecipe = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/recipes/${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        setRecipe(data.data.recipe);
        setCurrentServings(data.data.recipe.servings);
      } else if (response.status === 404) {
        notFound();
      }
    } catch (error) {
      console.error("Failed to fetch recipe:", error);
    } finally {
      setIsLoading(false);
    }
  }, [params.slug]);

  useEffect(() => {
    if (session && params.slug) {
      fetchRecipe();
    }
  }, [session, params.slug, fetchRecipe]);

  const saveRecipe = async () => {
    try {
      const response = await fetch(`/api/v1/recipes/${recipe?.id}/save`, {
        method: "POST",
      });
      if (response.ok) {
        setIsSaved(!isSaved);
        setRecipe(prev => prev ? { ...prev, saves: prev.saves + (isSaved ? -1 : 1) } : null);
      }
    } catch (error) {
      console.error("Failed to save recipe:", error);
    }
  };

  const adjustServings = (newServings: number) => {
    setCurrentServings(newServings);
  };

  const getServingMultiplier = () => {
    return recipe ? currentServings / recipe.servings : 1;
  };

  const adjustIngredientAmount = (amount: string) => {
    const multiplier = getServingMultiplier();
    const numericAmount = parseFloat(amount);
    if (!isNaN(numericAmount)) {
      return (numericAmount * multiplier).toFixed(1);
    }
    return amount;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Super Easy": return "text-green-600";
      case "Easy": return "text-green-500";
      case "Medium": return "text-yellow-500";
      case "Advanced": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const getMoodColor = (mood?: string) => {
    switch (mood) {
      case "cozy": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "energy": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "calm": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "fresh": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "comfort": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      default: return "bg-accent text-accent-foreground";
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!session || !recipe) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavigation />
      
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/recipes" className="hover:text-foreground">Recipes</Link>
            <span>/</span>
            <span className="text-foreground">{recipe.title}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <Card>
              <div className="relative h-64 md:h-80 overflow-hidden rounded-t-lg">
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {recipe.title}
                  </h1>
                  <p className="text-white/90 text-sm md:text-base">
                    {recipe.description}
                  </p>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>⏱️ {recipe.prepTime + recipe.cookTime} min</span>
                    <span>👥 {currentServings} serving{currentServings !== 1 ? 's' : ''}</span>
                    <span className={getDifficultyColor(recipe.difficulty)}>
                      🔥 {recipe.difficulty}
                    </span>
                    <span>⭐ {parseFloat(recipe.ratingAverage).toFixed(1)} ({recipe.ratingCount})</span>
                  </div>
                  <Button onClick={saveRecipe} variant={isSaved ? "default" : "outline"}>
                    {isSaved ? "❤️ Saved" : "🤍 Save Recipe"}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {recipe.moodCategory && (
                    <span className={`text-xs px-2 py-1 rounded-full ${getMoodColor(recipe.moodCategory)}`}>
                      {recipe.moodCategory}
                    </span>
                  )}
                  {recipe.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Story & Hapi Advice */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-foreground">📖 The Story</h3>
                    <p className="text-sm text-muted-foreground">{recipe.story}</p>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <h3 className="font-semibold mb-2 text-primary">🦫 Hapi&apos;s Advice</h3>
                    <p className="text-sm text-muted-foreground">{recipe.hapiAdvice}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recipe Content Tabs */}
            <Tabs defaultValue="ingredients" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
                <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              </TabsList>
              
              <TabsContent value="ingredients" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Ingredients</CardTitle>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Servings:</span>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => adjustServings(Math.max(1, currentServings - 1))}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center text-sm">{currentServings}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => adjustServings(currentServings + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recipe.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <span className="font-medium">{ingredient.item}</span>
                          <span className="text-muted-foreground">
                            {adjustIngredientAmount(ingredient.amount)} {ingredient.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="instructions" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Instructions</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Step {activeStep} of {recipe.steps.length}
                    </div>
                    <Progress value={(activeStep / recipe.steps.length) * 100} className="w-full" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {recipe.steps.map((step) => (
                        <div
                          key={step.number}
                          className={`p-4 rounded-lg border transition-all ${
                            activeStep === step.number
                              ? "bg-primary/5 border-primary/30"
                              : "bg-muted/30 border-transparent"
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              activeStep === step.number
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {step.number}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-2">{step.title}</h4>
                              <p className="text-muted-foreground">{step.instruction}</p>
                              {activeStep === step.number && (
                                <div className="flex items-center space-x-2 mt-4">
                                  {step.number > 1 && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setActiveStep(step.number - 1)}
                                    >
                                      Previous
                                    </Button>
                                  )}
                                  {step.number < recipe.steps.length && (
                                    <Button
                                      size="sm"
                                      onClick={() => setActiveStep(step.number + 1)}
                                    >
                                      Next Step
                                    </Button>
                                  )}
                                  {step.number === recipe.steps.length && (
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                      🎉 Recipe Complete!
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="nutrition" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recipe.nutrition && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Nutritional Information</CardTitle>
                        <p className="text-sm text-muted-foreground">Per serving</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {recipe.nutrition.calories && (
                          <div className="flex justify-between">
                            <span>Calories</span>
                            <span className="font-medium">{Math.round(recipe.nutrition.calories * getServingMultiplier())}</span>
                          </div>
                        )}
                        {recipe.nutrition.protein && (
                          <div className="flex justify-between">
                            <span>Protein</span>
                            <span className="font-medium">{recipe.nutrition.protein}</span>
                          </div>
                        )}
                        {recipe.nutrition.carbs && (
                          <div className="flex justify-between">
                            <span>Carbohydrates</span>
                            <span className="font-medium">{recipe.nutrition.carbs}</span>
                          </div>
                        )}
                        {recipe.nutrition.fiber && (
                          <div className="flex justify-between">
                            <span>Fiber</span>
                            <span className="font-medium">{recipe.nutrition.fiber}</span>
                          </div>
                        )}
                        {recipe.nutrition.fat && (
                          <div className="flex justify-between">
                            <span>Fat</span>
                            <span className="font-medium">{recipe.nutrition.fat}</span>
                          </div>
                        )}
                        {recipe.nutrition.vitamins && recipe.nutrition.vitamins.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Key Vitamins & Minerals</span>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {recipe.nutrition.vitamins.map((vitamin) => (
                                <span
                                  key={vitamin}
                                  className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded-full"
                                >
                                  {vitamin}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {recipe.environmentalImpact && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <span>🌍</span>
                          <span>Environmental Impact</span>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          By choosing this recipe, you&apos;re making a difference!
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span>💧</span>
                            <span>Water Saved</span>
                          </div>
                          <span className="font-medium text-blue-600">
                            {Math.round(recipe.environmentalImpact.waterSaved * getServingMultiplier())}L
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span>🌱</span>
                            <span>CO₂ Reduced</span>
                          </div>
                          <span className="font-medium text-green-600">
                            {(recipe.environmentalImpact.co2Reduced * getServingMultiplier()).toFixed(1)}kg
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span>🐄</span>
                            <span>Animals Spared</span>
                          </div>
                          <span className="font-medium text-purple-600">
                            {(recipe.environmentalImpact.animalsSpared * getServingMultiplier()).toFixed(1)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span>⏱️</span>
                    <span>Prep Time</span>
                  </span>
                  <span className="font-medium">{recipe.prepTime} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span>🍳</span>
                    <span>Cook Time</span>
                  </span>
                  <span className="font-medium">{recipe.cookTime} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span>🕐</span>
                    <span>Total Time</span>
                  </span>
                  <span className="font-medium">{recipe.prepTime + recipe.cookTime} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span>👥</span>
                    <span>Servings</span>
                  </span>
                  <span className="font-medium">{recipe.servings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span>💾</span>
                    <span>Saves</span>
                  </span>
                  <span className="font-medium">{recipe.saves}</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                🛒 Add Ingredients to Cart
              </Button>
              <Button variant="outline" className="w-full">
                📱 Share Recipe
              </Button>
              <Button variant="outline" className="w-full">
                📝 Leave a Review
              </Button>
            </div>

            {/* Related Recipes */}
            <Card>
              <CardHeader>
                <CardTitle>You might also like</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">More recipes coming soon!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
