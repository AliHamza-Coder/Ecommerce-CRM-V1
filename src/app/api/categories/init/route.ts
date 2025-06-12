import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST() {
  try {
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
    }
    
    // Create categories collection if it doesn't exist
    const collections = await db.listCollections().toArray();
    const categoriesCollection = collections.find(c => c.name === 'categories');
    
    if (!categoriesCollection) {
      await db.createCollection('categories');
      console.log('Categories collection created');
    }

    // Check if categories collection is empty
    const count = await db.collection('categories').countDocuments();
    
    return NextResponse.json({
      message: 'Categories collection initialized',
      count
    });
  } catch (error) {
    console.error('Error initializing categories:', error);
    return NextResponse.json(
      { error: 'Failed to initialize categories' },
      { status: 500 }
    );
  }
}