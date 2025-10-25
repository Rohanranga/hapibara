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

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  originalPrice?: string;
  category: string;
  brand?: string;
  label?: string;
  image: string;
  ethicalScore?: number;
  ratingAverage: string;
  ratingCount: number;
  certifications?: string[];
}

const categories = ["all", "skincare", "snacks", "fashion", "household", "wellness", "food"];
const priceRanges = [
  { label: "All", min: 0, max: 1000 },
  { label: "Under $25", min: 0, max: 25 },
  { label: "$25 - $50", min: 25, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "Over $100", min: 100, max: 1000 },
];

export default function StorePage() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/");
    }
  }, [status]);

  useEffect(() => {
    if (session) {
      fetchProducts(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, searchTerm, selectedCategory, selectedPriceRange]);

  const fetchProducts = async (reset = false) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: reset ? "1" : page.toString(),
        limit: "12",
      });

      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      
      const priceRange = priceRanges[selectedPriceRange];
      if (priceRange.min > 0) params.append("minPrice", priceRange.min.toString());
      if (priceRange.max < 1000) params.append("maxPrice", priceRange.max.toString());

      const response = await fetch(`/api/v1/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (reset) {
          setProducts(data.data.products || []);
          setPage(1);
        } else {
          setProducts(prev => [...prev, ...(data.data.products || [])]);
        }
        setHasMore(data.data.pagination?.hasMore || false);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
    fetchProducts(false);
  };

  const getLabelColor = (label?: string) => {
    switch (label) {
      case "NEW": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "BESTSELLER": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "ECO": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300";
      case "CRUELTY-FREE": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "VEGAN": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "HAPI'S PICK": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      default: return "bg-accent text-accent-foreground";
    }
  };

  const addToCart = async (productId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await fetch("/api/v1/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      
      if (response.ok) {
        // You could show a toast notification here
        console.log("Added to cart successfully");
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading store...</p>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Conscious Store 🛍️</h1>
          <p className="text-muted-foreground">
            Discover sustainable, ethical products that align with your values.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <Tabs defaultValue="category" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="category">Category</TabsTrigger>
              <TabsTrigger value="price">Price Range</TabsTrigger>
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
            
            <TabsContent value="price" className="mt-4">
              <div className="flex flex-wrap gap-2">
                {priceRanges.map((range, index) => (
                  <Button
                    key={range.label}
                    variant={selectedPriceRange === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPriceRange(index)}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Products Grid */}
        {isLoading && products.length === 0 ? (
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
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search terms.
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
              setSelectedPriceRange(0);
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/store/${product.slug}`}>
                  <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-200">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <Image
                        src={product.image || "/placeholder-product.jpg"}
                        alt={product.name}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      
                      {product.label && (
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getLabelColor(product.label)}`}>
                            {product.label}
                          </span>
                        </div>
                      )}
                      
                      {product.ethicalScore && (
                        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                          ♥️ {product.ethicalScore}/100
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 flex-1">
                          {product.name}
                        </h3>
                      </div>
                      
                      {product.brand && (
                        <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                      )}
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-primary">${product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span>⭐ {parseFloat(product.ratingAverage).toFixed(1)}</span>
                          <span className="ml-1">({product.ratingCount})</span>
                        </div>
                      </div>
                      
                      {product.certifications && product.certifications.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.certifications.slice(0, 2).map((cert) => (
                            <span
                              key={cert}
                              className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full"
                            >
                              {cert}
                            </span>
                          ))}
                          {product.certifications.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{product.certifications.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={(e) => addToCart(product.id, e)}
                      >
                        Add to Cart
                      </Button>
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
                  {isLoading ? "Loading..." : "Load More Products"}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
