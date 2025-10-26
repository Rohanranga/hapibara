import { db } from '../src/db/drizzle';
import { recipes, products } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function updateImages() {
  try {
    console.log('🔄 Updating image URLs...');

    // Update recipe images
    await db.update(recipes)
      .set({ 
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop' 
      })
      .where(eq(recipes.slug, 'coconut-chickpea-curry-bowl'));

    await db.update(recipes)
      .set({ 
        image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop' 
      })
      .where(eq(recipes.slug, 'roasted-vegetable-quinoa-salad'));

    // Update product images
    await db.update(products)
      .set({ 
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop' 
      })
      .where(eq(products.slug, 'organic-cotton-tote-bag'));

    await db.update(products)
      .set({ 
        image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=600&fit=crop' 
      })
      .where(eq(products.slug, 'bamboo-utensil-set'));

    await db.update(products)
      .set({ 
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop' 
      })
      .where(eq(products.slug, 'eco-friendly-cleaning-kit'));

    console.log('✅ Image URLs updated successfully!');
  } catch (error) {
    console.error('❌ Error updating images:', error);
  }
}

updateImages();
