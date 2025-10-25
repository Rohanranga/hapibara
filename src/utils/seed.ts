import { db } from "../db/drizzle";
import { 
  users, 
  recipes, 
  products, 
  communityEvents, 
  communityStories,
  kindnessActivities,
  hapiTips,
  challenges,
  eventAttendees,
  productReviews,
  recipeReviews
} from "../db/schema";
import bcrypt from "bcryptjs";

const seedData = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Create admin user
    const hashedPassword = await bcrypt.hash("password123", 12);
    const [adminUser] = await db.insert(users).values({
      name: "Hapi Admin",
      email: "admin@hapibara.com",
      username: "hapiadmin",
      password: hashedPassword,
      provider: "creds" as const,
      bio: "The friendly face behind HapiBara, spreading kindness one recipe at a time 🌱",
      location: "San Francisco, CA",
      isAdmin: true,
      isEmailVerified: true,
      dietaryPreferences: ["vegan", "gluten-free", "organic"],
      plantBasedSince: "2020-01-01",
      kindnessScore: 2500,
      interests: ["cooking", "sustainability", "community", "wellness"],
      lookingFor: "community" as const,
      isProfilePublic: true,
    }).returning();

    // Create sample users
    const sampleUsers = await db.insert(users).values([
      {
        name: "Sarah Chen",
        email: "sarah@example.com",
        username: "sarahcooks",
        password: hashedPassword,
        provider: "creds" as const,
        bio: "Plant-based chef and wellness enthusiast 🌿 Sharing nourishing recipes for busy souls",
        location: "Austin, TX",
        isEmailVerified: true,
        dietaryPreferences: ["vegan", "whole-foods"],
        plantBasedSince: "2019-03-15",
        kindnessScore: 1850,
        interests: ["cooking", "yoga", "meditation", "nutrition"],
        lookingFor: "friends" as const,
      },
      {
        name: "Marcus Johnson",
        email: "marcus@example.com", 
        username: "marcusgreen",
        password: hashedPassword,
        provider: "creds" as const,
        bio: "Environmental activist and recipe creator 🌍 Making plant-based accessible to everyone",
        location: "Portland, OR",
        isEmailVerified: true,
        dietaryPreferences: ["vegan", "organic", "local"],
        plantBasedSince: "2018-06-10",
        kindnessScore: 2100,
        interests: ["environment", "activism", "cooking", "hiking"],
        lookingFor: "both" as const,
      },
    ]).returning();

    console.log("✅ Created users");

    // Seed Recipes
    const insertedRecipes = await db.insert(recipes).values([
      {
        title: "Coconut Chickpea Curry Bowl",
        slug: "coconut-chickpea-curry-bowl",
        description: "Warming spices meet creamy coconut in this nourishing bowl that feels like a warm hug",
        story: "This recipe came to me during a particularly stressful week. I was craving something warm and comforting, but also nourishing. The gentle spices and creamy coconut create the perfect balance - it's like a warm hug in a bowl. I've made this countless times now, and it never fails to center me.",
        hapiAdvice: "Eat this when you feel scattered or need grounding. The warming spices help center your energy while the protein keeps you satisfied. Perfect for busy weekdays when you need comfort and nutrition in equal measure.",
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop",
        prepTime: 15,
        cookTime: 25,
        servings: 2,
        difficulty: "Easy" as const,
        category: "dinner" as const,
        moodCategory: "cozy" as const,
        tags: ["cozy", "protein", "warming", "comfort", "one-pot", "gluten-free"],
        ingredients: [
          { item: "Coconut milk (canned)", amount: "400", unit: "ml" },
          { item: "Chickpeas (cooked)", amount: "300", unit: "g" },
          { item: "Yellow onion", amount: "1", unit: "medium" },
          { item: "Fresh ginger", amount: "2", unit: "cm piece" },
          { item: "Garlic cloves", amount: "3", unit: "cloves" },
          { item: "Curry powder", amount: "2", unit: "tsp" },
          { item: "Turmeric", amount: "1", unit: "tsp" },
          { item: "Coconut oil", amount: "1", unit: "tbsp" },
          { item: "Baby spinach", amount: "100", unit: "g" },
          { item: "Brown rice", amount: "200", unit: "g cooked" },
        ],
        steps: [
          { 
            number: 1, 
            title: "Prepare mindfully", 
            instruction: "Heat coconut oil in a large pan over medium heat. Take a moment to breathe in the gentle aroma. Dice the onion, mince garlic and ginger." 
          },
          { 
            number: 2, 
            title: "Build the flavor base", 
            instruction: "Sauté onion until translucent (3-4 minutes). Add garlic, ginger, curry powder, and turmeric. Cook for 1 minute until fragrant." 
          },
          { 
            number: 3, 
            title: "Create the curry", 
            instruction: "Pour in coconut milk and bring to a gentle simmer. Add chickpeas and let everything meld together for 10-15 minutes." 
          },
          { 
            number: 4, 
            title: "Finish with love", 
            instruction: "Stir in spinach until wilted. Season with salt and pepper. Serve over brown rice with a sprinkle of fresh herbs if you have them." 
          },
        ],
        nutrition: {
          calories: 485,
          protein: "18g",
          carbs: "52g",
          fiber: "12g",
          fat: "24g",
          vitamins: ["Vitamin A", "Iron", "Folate", "Magnesium"],
        },
        environmentalImpact: {
          waterSaved: 1200,
          co2Reduced: 2.5,
          animalsSpared: 1,
        },
        saves: 342,
        likes: 856,
        ratingAverage: "4.8",
        ratingCount: 127,
        authorId: adminUser.id,
        isPublished: true,
        isFeatured: true,
      },
      {
        title: "Energizing Green Smoothie Bowl",
        slug: "energizing-green-smoothie-bowl",
        description: "A vibrant, nutrient-packed bowl to kickstart your morning with natural energy",
        story: "I created this recipe during my early morning ritual phase. I wanted something that would give me sustained energy without the crash. The combination of greens, healthy fats, and natural sweetness creates the perfect morning fuel.",
        hapiAdvice: "Best enjoyed in the morning when you need a gentle energy boost. The natural sugars provide quick energy while the healthy fats keep you satisfied. Perfect before yoga or meditation practice.",
        image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop",
        prepTime: 10,
        cookTime: 0,
        servings: 1,
        difficulty: "Super Easy" as const,
        category: "breakfast" as const,
        moodCategory: "energy" as const,
        tags: ["energizing", "raw", "antioxidants", "quick", "gluten-free", "refreshing"],
        ingredients: [
          { item: "Frozen banana", amount: "1", unit: "large" },
          { item: "Baby spinach", amount: "50", unit: "g" },
          { item: "Avocado", amount: "1/2", unit: "medium" },
          { item: "Coconut milk", amount: "200", unit: "ml" },
          { item: "Chia seeds", amount: "1", unit: "tbsp" },
          { item: "Medjool dates", amount: "2", unit: "pitted" },
          { item: "Fresh berries", amount: "100", unit: "g" },
          { item: "Granola", amount: "30", unit: "g" },
          { item: "Coconut flakes", amount: "1", unit: "tbsp" },
        ],
        steps: [
          { 
            number: 1, 
            title: "Blend the base", 
            instruction: "Add banana, spinach, avocado, coconut milk, chia seeds, and dates to a blender. Blend until smooth and creamy." 
          },
          { 
            number: 2, 
            title: "Create your canvas", 
            instruction: "Pour the smoothie into a bowl, creating a thick, ice-cream-like consistency." 
          },
          { 
            number: 3, 
            title: "Top with intention", 
            instruction: "Arrange berries, granola, and coconut flakes on top. Take a moment to appreciate the colors before diving in!" 
          },
        ],
        nutrition: {
          calories: 420,
          protein: "12g",
          carbs: "48g",
          fiber: "16g",
          fat: "22g",
          vitamins: ["Vitamin K", "Vitamin C", "Folate", "Potassium"],
        },
        environmentalImpact: {
          waterSaved: 800,
          co2Reduced: 1.2,
          animalsSpared: 0.5,
        },
        saves: 267,
        likes: 634,
        ratingAverage: "4.6",
        ratingCount: 89,
        authorId: sampleUsers[0].id,
        isPublished: true,
        isFeatured: false,
      },
    ]).returning();
    console.log("✅ Created recipes");

    // Seed Products
    await db.insert(products).values([
      {
        name: "Organic Coconut Oil - Cold Pressed",
        slug: "organic-coconut-oil-cold-pressed",
        description: "Premium quality, cold-pressed coconut oil perfect for cooking and skincare",
        longDescription: "Our organic coconut oil is sustainably sourced from small-scale farmers and cold-pressed to retain maximum nutrients. Perfect for high-heat cooking, baking, or as a natural moisturizer.",
        price: "24.99",
        originalPrice: "29.99",
        category: "food" as const,
        subCategory: "cooking-oils",
        brand: "Pure Harvest Co.",
        label: "ECO" as const,
        image: "https://images.unsplash.com/photo-1577003833619-76bbd7760710?w=500&auto=format&fit=crop",
        tags: ["organic", "cold-pressed", "multipurpose", "sustainable"],
        ingredients: ["100% Organic Coconut Oil"],
        howToUse: "Use for cooking at medium-high heat, add to smoothies, or apply to skin as a natural moisturizer.",
        hapiNote: "This coconut oil comes from a cooperative that provides fair wages to 200+ farming families in the Philippines 🥥",
        inventory: 150,
        certifications: ["Organic", "Fair Trade", "Non-GMO"],
        ethicalScore: 92,
        ratingAverage: "4.7",
        ratingCount: 234,
        isBestseller: true,
      },
      {
        name: "Bamboo Fiber Bowl Set",
        slug: "bamboo-fiber-bowl-set",
        description: "Eco-friendly, lightweight bowls perfect for smoothie bowls and mindful eating",
        longDescription: "Made from renewable bamboo fiber, these bowls are biodegradable, dishwasher-safe, and perfect for your daily smoothie bowls. Each set includes 2 bowls in calming earth tones.",
        price: "32.00",
        category: "household" as const,
        subCategory: "kitchenware",
        brand: "EcoLife",
        label: "VEGAN" as const,
        image: "https://images.unsplash.com/photo-1566740933430-b5e70b06d2d5?w=500&auto=format&fit=crop",
        tags: ["bamboo", "eco-friendly", "reusable", "biodegradable"],
        howToUse: "Perfect for smoothie bowls, salads, and mindful eating. Dishwasher safe on top rack.",
        hapiNote: "For every bowl sold, EcoLife plants a bamboo tree and supports reforestation efforts 🌱",
        inventory: 75,
        certifications: ["Biodegradable", "BPA-Free", "Food Safe"],
        ethicalScore: 88,
        ratingAverage: "4.5",
        ratingCount: 67,
        isNew: true,
      },
      {
        name: "Calming Lavender Body Oil",
        slug: "calming-lavender-body-oil",
        description: "Organic lavender-infused body oil for relaxation and skin nourishment",
        longDescription: "Hand-crafted with organic lavender and jojoba oil to soothe both mind and skin. Perfect for your evening self-care ritual.",
        price: "28.50",
        originalPrice: "34.00",
        category: "skincare" as const,
        subCategory: "body-care",
        brand: "Mindful Beauty",
        label: "CRUELTY-FREE" as const,
        image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&auto=format&fit=crop",
        tags: ["lavender", "organic", "relaxing", "aromatherapy"],
        ingredients: ["Organic Jojoba Oil", "Lavender Essential Oil", "Vitamin E"],
        howToUse: "Apply to damp skin after shower. Use 2-3 drops for face or 1 tsp for body. Perfect for evening rituals.",
        hapiNote: "Made by a women-owned cooperative that supports mental wellness programs in rural communities 💜",
        inventory: 120,
        certifications: ["Organic", "Cruelty-Free", "Vegan"],
        ethicalScore: 85,
        ratingAverage: "4.8",
        ratingCount: 156,
        isFeatured: true,
      },
    ]);
    console.log("✅ Created products");

    // Seed Community Events
    const insertedEvents = await db.insert(communityEvents).values([
      {
        title: "Plant-Based Cooking Workshop: Comfort Foods",
        description: "Learn to make delicious comfort foods that happen to be plant-based! We'll cook together, share stories, and enjoy a communal meal.",
        eventType: "workshop" as const,
        location: "Community Kitchen, 123 Green St, San Francisco, CA",
        city: "San Francisco",
        isOnline: false,
        startDate: new Date("2025-09-15T14:00:00Z"),
        endDate: new Date("2025-09-15T17:00:00Z"),
        maxAttendees: 15,
        price: "45.00",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop",
        organizerId: adminUser.id,
        isApproved: true,
        isFeatured: true,
        attendeeCount: 8,
      },
      {
        title: "Mindful Eating Circle",
        description: "Join us for a gentle exploration of mindful eating practices. We'll share a simple meal together and practice presence with our food.",
        eventType: "meetup" as const,
        location: "Zen Garden Center, 456 Peace Ave, Austin, TX",
        city: "Austin",
        isOnline: false,
        startDate: new Date("2025-09-10T18:30:00Z"),
        endDate: new Date("2025-09-10T20:30:00Z"),
        maxAttendees: 12,
        price: "0.00",
        image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&auto=format&fit=crop",
        organizerId: sampleUsers[0].id,
        isApproved: true,
        attendeeCount: 5,
      },
      {
        title: "Virtual Recipe Swap & Story Share",
        description: "Bring your favorite plant-based recipe to share! We'll cook together virtually and share the stories behind our favorite dishes.",
        eventType: "cooking" as const,
        location: "Online Event",
        city: "Virtual",
        isOnline: true,
        meetingUrl: "https://zoom.us/j/example",
        startDate: new Date("2025-09-20T19:00:00Z"),
        endDate: new Date("2025-09-20T21:00:00Z"),
        maxAttendees: 25,
        price: "0.00",
        organizerId: sampleUsers[1].id,
        isApproved: true,
        attendeeCount: 18,
      },
    ]).returning();
    console.log("✅ Created community events");

    // Add some event attendees
    await db.insert(eventAttendees).values([
      { eventId: insertedEvents[0].id, userId: sampleUsers[0].id, status: "attending" as const },
      { eventId: insertedEvents[0].id, userId: sampleUsers[1].id, status: "attending" as const },
      { eventId: insertedEvents[1].id, userId: adminUser.id, status: "attending" as const },
      { eventId: insertedEvents[2].id, userId: adminUser.id, status: "maybe" as const },
    ]);

    // Seed Community Stories
    await db.insert(communityStories).values([
      {
        title: "How HapiBara helped me quit burnout meals",
        story: "I used to survive on takeout and energy drinks during busy weeks. My body felt tired, my mind was foggy, and I was spending way too much money on food that didn't nourish me. When I found HapiBara, I was skeptical - could plant-based meals really be as quick as ordering takeout?\n\nThe coconut chickpea curry bowl was my gateway recipe. It took me 30 minutes the first time (including grocery shopping panic), but by the third time, I had it down to 20 minutes. More importantly, I felt energized after eating it, not sluggish.\n\nNow, six months later, I meal prep on Sundays, keep a few HapiBara emergency recipes bookmarked, and haven't ordered takeout in weeks. My energy is more stable, my skin is clearer, and I'm saving about $200 a month. But the best part? I actually enjoy cooking now - it's become my Sunday self-care ritual.",
        authorId: sampleUsers[0].id,
        tag: "Wellness Journey" as const,
        preview: "I used to survive on takeout and energy drinks during busy weeks. HapiBara recipes taught me that nourishing meals could be just as quick...",
        likes: 89,
        isApproved: true,
        isFeatured: true,
      },
      {
        title: "Finding community through plant-based cooking",
        story: "Moving to a new city during the pandemic was lonely. I missed my family's Sunday dinners and felt disconnected from everything familiar. When I saw a HapiBara cooking workshop in my area, I almost didn't go - cooking with strangers felt intimidating.\n\nBut that workshop changed everything. We were all beginners, all a little nervous, and all just wanting to connect. Making that green smoothie bowl together broke down barriers in a way I hadn't expected. Food has this amazing power to bring people together.\n\nThree months later, our 'HapiBara group' still meets monthly. We've become real friends, sharing not just recipes but life stories, career challenges, and weekend adventures. What started as a cooking class became my chosen family in this new city.",
        authorId: sampleUsers[1].id,
        tag: "Community Impact" as const,
        preview: "Moving to a new city during the pandemic was lonely. When I saw a HapiBara cooking workshop, I almost didn't go...",
        likes: 156,
        isApproved: true,
      },
    ]);
    console.log("✅ Created community stories");

    // Seed Kindness Activities
    await db.insert(kindnessActivities).values([
      {
        userId: adminUser.id,
        activityType: "recipe_cooked" as const,
        points: 25,
        waterSaved: 1200,
        co2Reduced: 2.5,
        animalsSpared: 1,
        relatedId: insertedRecipes[0].id,
        description: "Made the Coconut Chickpea Curry Bowl",
      },
      {
        userId: sampleUsers[0].id,
        activityType: "product_bought" as const,
        points: 15,
        waterSaved: 50,
        co2Reduced: 0.8,
        animalsSpared: 0,
        description: "Purchased Organic Coconut Oil",
      },
      {
        userId: sampleUsers[1].id,
        activityType: "event_attended" as const,
        points: 30,
        description: "Attended Plant-Based Cooking Workshop",
        relatedId: insertedEvents[0].id,
      },
    ]);
    console.log("✅ Created kindness activities");

    // Seed Hapi Tips
    await db.insert(hapiTips).values([
      {
        title: "Did you know?",
        content: "Soaking nuts and seeds for 4-8 hours makes them easier to digest and increases nutrient absorption! Try soaking your cashews before making creamy sauces.",
        category: "nutrition" as const,
        icon: "🌰",
        isActive: true,
      },
      {
        title: "Mindful Eating Tip",
        content: "Take three deep breaths before your first bite. This simple practice helps your body prepare for digestion and enhances the flavors of your food.",
        category: "wellness" as const,
        icon: "🧘‍♀️",
        isActive: true,
      },
      {
        title: "Kitchen Hack",
        content: "Save vegetable scraps in a freezer bag to make homemade broth! Onion peels, carrot tops, and herb stems all add amazing flavor.",
        category: "cooking" as const,
        icon: "♻️",
        isActive: true,
      },
      {
        title: "Fun Fact",
        content: "Capybaras are nature's therapists! Their calm presence is so soothing that other animals often rest on them. Channel your inner capybara today 🦫",
        category: "fun_fact" as const,
        icon: "🦫",
        isActive: true,
      },
    ]);
    console.log("✅ Created Hapi tips");

    // Seed Challenges
    await db.insert(challenges).values([
      {
        title: "7-Day Plant-Based Challenge",
        description: "Commit to eating plant-based meals for 7 consecutive days and track your energy levels, mood, and how you feel.",
        challengeType: "weekly" as const,
        category: "cooking" as const,
        points: 100,
        difficulty: "easy" as const,
        requirements: [
          {
            type: "meals_cooked",
            target: 21,
            description: "Cook 21 plant-based meals (3 per day for 7 days)",
          },
        ],
        startDate: new Date("2025-09-01T00:00:00Z"),
        endDate: new Date("2025-09-30T23:59:59Z"),
        isActive: true,
      },
      {
        title: "Community Connection",
        description: "Attend one HapiBara community event this month and share your experience.",
        challengeType: "monthly" as const,
        category: "community" as const,
        points: 75,
        difficulty: "medium" as const,
        requirements: [
          {
            type: "events_attended",
            target: 1,
            description: "Attend at least 1 community event",
          },
        ],
        startDate: new Date("2025-09-01T00:00:00Z"),
        endDate: new Date("2025-09-30T23:59:59Z"),
        isActive: true,
      },
    ]);
    console.log("✅ Created challenges");

    // Add some product reviews
    await db.insert(productReviews).values([
      {
        productId: 1, // Coconut oil
        userId: sampleUsers[0].id,
        rating: 5,
        comment: "This coconut oil is amazing! I use it for everything - cooking, skincare, even in my coffee. The quality is outstanding and I love knowing it's ethically sourced.",
        isVerifiedPurchase: true,
        helpfulCount: 12,
      },
      {
        productId: 2, // Bamboo bowls
        userId: adminUser.id,
        rating: 4,
        comment: "Beautiful bowls that are perfect for smoothie bowls! They're the perfect size and I love that they're eco-friendly. Only wish they came in more colors.",
        isVerifiedPurchase: true,
        helpfulCount: 8,
      },
    ]);

    // Add some recipe reviews
    await db.insert(recipeReviews).values([
      {
        recipeId: insertedRecipes[0].id,
        userId: sampleUsers[1].id,
        rating: 5,
        comment: "This curry bowl has become my go-to comfort meal! The flavors are incredible and it's so satisfying. I added some extra vegetables and it was perfect.",
        didMake: true,
        modifications: "Added bell peppers and mushrooms",
        helpfulCount: 15,
      },
      {
        recipeId: insertedRecipes[1].id,
        userId: adminUser.id,
        rating: 4,
        comment: "Love this smoothie bowl! So energizing in the morning. I sometimes substitute the banana with mango for a tropical twist.",
        didMake: true,
        modifications: "Used mango instead of banana sometimes",
        helpfulCount: 7,
      },
    ]);

    console.log("✅ Created reviews");
    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📊 Seeded data summary:");
    console.log("- 3 users (1 admin, 2 regular users)");
    console.log("- 2 recipes with detailed ingredients and steps");
    console.log("- 3 products with ethical information");
    console.log("- 3 community events");
    console.log("- 2 community stories");
    console.log("- 3 kindness activities");
    console.log("- 4 daily tips");
    console.log("- 2 challenges");
    console.log("- 4 reviews (2 product, 2 recipe)");
    console.log("\n🔐 Login credentials:");
    console.log("Email: admin@hapibara.com");
    console.log("Password: password123");

  } catch (error) {
    console.error("❌ Seeding error:", error);
    throw error;
  }
};

export default seedData;
