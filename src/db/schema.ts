import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  jsonb,
  date,
  real,
} from "drizzle-orm/pg-core";

// USERS (Enhanced for HapiBara features)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  username: varchar("username", { length: 100 }).unique(),
  password: varchar("password", { length: 255 }),
  provider: varchar("provider", { enum: ["google", "creds"] }).notNull(),
  avatar: varchar("avatar", { length: 500 }),
  bio: text("bio"),
  location: varchar("location", { length: 255 }),
  isAdmin: boolean("is_admin").default(false),
  isEmailVerified: boolean("is_email_verified").default(false).notNull(),
  emailVerificationToken: varchar("email_verification_token", { length: 255 }),
  emailVerificationExpires: timestamp("email_verification_expires"),
  resetPasswordToken: varchar("reset_password_token", { length: 255 }),
  resetPasswordExpires: timestamp("reset_password_expires"),
  
  // HapiBara specific fields
  dietaryPreferences: jsonb("dietary_preferences").$type<string[]>(),
  plantBasedSince: date("plant_based_since"),
  kindnessScore: integer("kindness_score").default(0),
  favoriteRecipes: jsonb("favorite_recipes").$type<number[]>().default([]),
  savedRecipes: jsonb("saved_recipes").$type<number[]>().default([]),
  interests: jsonb("interests").$type<string[]>(),
  lookingFor: varchar("looking_for", { 
    enum: ["friends", "dating", "both", "community"] 
  }).default("friends"),
  isProfilePublic: boolean("is_profile_public").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// RECIPES (Enhanced for HapiBara)
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  story: text("story").notNull(),
  hapiAdvice: text("hapi_advice").notNull(),
  image: varchar("image", { length: 500 }).notNull(),
  videoUrl: varchar("video_url", { length: 500 }), // 15-sec videos
  prepTime: integer("prep_time").notNull(),
  cookTime: integer("cook_time").notNull(),
  servings: integer("servings").notNull(),
  difficulty: varchar("difficulty", {
    enum: ["Super Easy", "Easy", "Medium", "Advanced"],
  }).default("Easy"),
  category: varchar("category", {
    enum: ["breakfast", "lunch", "dinner", "snacks", "desserts", "drinks"],
  }).notNull(),
  moodCategory: varchar("mood_category", {
    enum: ["cozy", "energy", "calm", "fresh", "comfort"],
  }),
  tags: jsonb("tags").$type<string[]>(),
  ingredients: jsonb("ingredients").$type<
    { 
      item: string; 
      amount: string; 
      unit: string;
      productId?: number; // Link to store products
    }[]
  >(),
  steps: jsonb("steps").$type<
    { number: number; title: string; instruction: string; image?: string }[]
  >(),
  nutrition: jsonb("nutrition").$type<{
    calories?: number;
    protein?: string;
    carbs?: string;
    fiber?: string;
    fat?: string;
    vitamins?: string[];
  }>(),
  
  // Impact tracking
  environmentalImpact: jsonb("environmental_impact").$type<{
    waterSaved: number; // liters
    co2Reduced: number; // kg
    animalsSpared: number;
  }>(),
  
  saves: integer("saves").default(0),
  likes: integer("likes").default(0),
  ratingAverage: numeric("rating_average", { precision: 4, scale: 2 }).default("0"),
  ratingCount: integer("rating_count").default(0),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  isPublished: boolean("is_published").default(true),
  isFeatured: boolean("is_featured").default(false),
  isViral: boolean("is_viral").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// PRODUCTS (Enhanced Conscious Store)
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
  category: varchar("category", {
    enum: ["skincare", "snacks", "fashion", "household", "wellness", "food"],
  }).notNull(),
  subCategory: varchar("sub_category", { length: 100 }),
  brand: varchar("brand", { length: 255 }),
  label: varchar("label", {
    enum: ["NEW", "BESTSELLER", "ECO", "CRUELTY-FREE", "VEGAN", "HAPI'S PICK"],
  }),
  labelColor: varchar("label_color", { length: 100 }),
  image: varchar("image", { length: 500 }).notNull(),
  images: jsonb("images").$type<string[]>(),
  tags: jsonb("tags").$type<string[]>(),
  ingredients: jsonb("ingredients").$type<string[]>(),
  howToUse: text("how_to_use"),
  hapiNote: text("hapi_note"),
  inventory: integer("inventory").default(0),
  
  // Ethical info
  certifications: jsonb("certifications").$type<string[]>(), // ["Vegan", "Cruelty-Free", "Organic"]
  ethicalScore: integer("ethical_score").default(0), // 1-100
  
  ratingAverage: numeric("rating_average", { precision: 4, scale: 2 }).default("0"),
  ratingCount: integer("rating_count").default(0),
  isNew: boolean("is_new").default(false),
  isBestseller: boolean("is_bestseller").default(false),
  isFeatured: boolean("is_featured").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// COMMUNITY EVENTS (HapiHive)
export const communityEvents = pgTable("community_events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  eventType: varchar("event_type", {
    enum: ["meetup", "workshop", "potluck", "cleanup", "cooking", "other"]
  }).notNull(),
  location: varchar("location", { length: 255 }),
  city: varchar("city", { length: 100 }).notNull(),
  isOnline: boolean("is_online").default(false),
  meetingUrl: varchar("meeting_url", { length: 500 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  maxAttendees: integer("max_attendees"),
  price: numeric("price", { precision: 8, scale: 2 }).default("0"),
  image: varchar("image", { length: 500 }),
  
  organizerId: integer("organizer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  isApproved: boolean("is_approved").default(false),
  isFeatured: boolean("is_featured").default(false),
  attendeeCount: integer("attendee_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// EVENT ATTENDEES
export const eventAttendees = pgTable("event_attendees", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => communityEvents.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", {
    enum: ["attending", "maybe", "not_attending"]
  }).default("attending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// PLANT MATCH (Dating/Friend System)
export const plantMatches = pgTable("plant_matches", {
  id: serial("id").primaryKey(),
  userId1: integer("user_id_1")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  userId2: integer("user_id_2")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  matchType: varchar("match_type", {
    enum: ["like", "superlike", "pass"]
  }).notNull(),
  isMatched: boolean("is_matched").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// USER CONNECTIONS (Friends/Following)
export const userConnections = pgTable("user_connections", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  followingId: integer("following_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  connectionType: varchar("connection_type", {
    enum: ["friend", "following"]
  }).default("following"),
  createdAt: timestamp("created_at").defaultNow(),
});

// KINDNESS TRACKING (Impact Metrics)
export const kindnessActivities = pgTable("kindness_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  activityType: varchar("activity_type", {
    enum: ["recipe_cooked", "product_bought", "event_attended", "friend_referred"]
  }).notNull(),
  points: integer("points").notNull(),
  
  // Impact metrics
  waterSaved: real("water_saved").default(0), // liters
  co2Reduced: real("co2_reduced").default(0), // kg
  animalsSpared: real("animals_spared").default(0),
  
  relatedId: integer("related_id"), // recipe/product/event id
  description: text("description"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// COMMUNITY STORIES (Enhanced)
export const communityStories = pgTable("community_stories", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  story: text("story").notNull(),
  image: varchar("image", { length: 500 }),
  authorId: integer("author_id").references(() => users.id, {
    onDelete: "set null",
  }),
  tag: varchar("tag", {
    enum: [
      "Wellness Journey",
      "Relationships", 
      "Mental Health",
      "Lifestyle",
      "Family",
      "Recipe Success",
      "Community Impact"
    ],
  }).notNull(),
  preview: text("preview").notNull(),
  likes: integer("likes").default(0),
  isApproved: boolean("is_approved").default(false),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// PRODUCT REVIEWS
export const productReviews = pgTable("product_reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// RECIPE REVIEWS
export const recipeReviews = pgTable("recipe_reviews", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  didMake: boolean("did_make").default(false),
  modifications: text("modifications"),
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// SHOPPING CART
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ORDERS
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  orderNumber: varchar("order_number", { length: 100 }).notNull().unique(),
  status: varchar("status", {
    enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
  }).default("pending"),
  
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  shipping: numeric("shipping", { precision: 10, scale: 2 }).default("0"),
  tax: numeric("tax", { precision: 10, scale: 2 }).default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  
  shippingAddress: jsonb("shipping_address").$type<{
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>(),
  
  paymentMethod: varchar("payment_method", { length: 100 }),
  paymentStatus: varchar("payment_status", {
    enum: ["pending", "paid", "failed", "refunded"]
  }).default("pending"),
  
  notes: text("notes"),
  trackingNumber: varchar("tracking_number", { length: 255 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ORDER ITEMS
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  productSnapshot: jsonb("product_snapshot"), // Store product data at time of purchase
});

// NEWSLETTERS
export const newsletters = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").default(true),
  preferences: jsonb("preferences").$type<{
    recipes: boolean;
    products: boolean;
    events: boolean;
    stories: boolean;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// HAPI TIPS (Daily tips and facts)
export const hapiTips = pgTable("hapi_tips", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", {
    enum: ["nutrition", "environment", "wellness", "cooking", "shopping", "fun_fact"]
  }).notNull(),
  icon: varchar("icon", { length: 100 }),
  isActive: boolean("is_active").default(true),
  displayDate: date("display_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// CHALLENGES/MISSIONS
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  challengeType: varchar("challenge_type", {
    enum: ["daily", "weekly", "monthly", "one_time"]
  }).notNull(),
  category: varchar("category", {
    enum: ["cooking", "shopping", "community", "wellness", "learning"]
  }).notNull(),
  points: integer("points").default(10),
  difficulty: varchar("difficulty", {
    enum: ["easy", "medium", "hard"]
  }).default("easy"),
  
  requirements: jsonb("requirements").$type<{
    type: string;
    target: number;
    description: string;
  }[]>(),
  
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  maxParticipants: integer("max_participants"),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// USER CHALLENGE PROGRESS
export const userChallenges = pgTable("user_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  challengeId: integer("challenge_id")
    .notNull()
    .references(() => challenges.id, { onDelete: "cascade" }),
  status: varchar("status", {
    enum: ["active", "completed", "failed", "abandoned"]
  }).default("active"),
  progress: jsonb("progress").$type<{
    completed: number;
    total: number;
    details: Record<string, unknown>;
  }>(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
