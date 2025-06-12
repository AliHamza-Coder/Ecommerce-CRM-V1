import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Fetch all gallery images
export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    // Create gallery collection if it doesn't exist
    const collections = await db.listCollections({name: 'gallery'}).toArray();
    if (collections.length === 0) {
      await db.createCollection('gallery');
      console.log('Created gallery collection');
    }
    
    const images = await db.collection('gallery').find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json(images.map(image => ({
      id: image._id.toString(),
      url: image.url,
      name: image.name || 'Untitled',
      createdAt: image.createdAt,
    })));
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery images' },
      { status: 500 }
    );
  }
}

// POST - Create a new gallery image
export async function POST(req: NextRequest) {
  try {
    // Handle both JSON and FormData
    let url = '';
    let name = 'Untitled';
    
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const body = await req.json();
      url = body.url;
      name = body.name || 'Untitled';
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      url = formData.get('url') as string;
      name = (formData.get('name') as string) || 'Untitled';
    }
    
    if (!url) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Create gallery collection if it doesn't exist
    const collections = await db.listCollections({name: 'gallery'}).toArray();
    if (collections.length === 0) {
      await db.createCollection('gallery');
      console.log('Created gallery collection');
    }
    
    const newImage = {
      url,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection('gallery').insertOne(newImage);
    
    return NextResponse.json({
      id: result.insertedId.toString(),
      ...newImage
    });
  } catch (error) {
    console.error('Error creating gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to create gallery image' },
      { status: 500 }
    );
  }
}