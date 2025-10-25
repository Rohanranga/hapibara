import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { recipes } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function updateRecipeImages() {
  try {
    console.log('🔄 Updating recipe images...');
    
    // Update the coconut curry recipe image
    await db.update(recipes)
      .set({ image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop' })
      .where(eq(recipes.slug, 'coconut-chickpea-curry-bowl'));
    
    // Update the pasta recipe image
    await db.update(recipes)
      .set({ image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop' })
      .where(eq(recipes.slug, 'one-pot-pasta-primavera'));
    
    console.log('✅ Recipe images updated successfully!');
  } catch (error) {
    console.error('❌ Error updating recipe images:', error);
  }
}

updateRecipeImages();
