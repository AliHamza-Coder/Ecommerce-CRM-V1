import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Fetch a single gallery image by ID
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;
    
    // Make sure the ID is valid
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid image ID format' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const image = await db.collection('gallery').findOne({
      _id: objectId
    });
    
    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      id: image._id.toString(),
      url: image.url,
      name: image.name || 'Untitled',
      createdAt: image.createdAt,
    });
  } catch (error) {
    console.error('Error fetching gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery image' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a gallery image by ID
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;
    
    // Make sure the ID is valid
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid image ID format' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Find the image first to get its details
    const image = await db.collection('gallery').findOne({
      _id: objectId
    });
    
    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }
    
    // Delete the image from the database
    await db.collection('gallery').deleteOne({
      _id: objectId
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to delete gallery image' },
      { status: 500 }
    );
  }
}

// PATCH - Update a gallery image by ID
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;
    
    // Make sure the ID is valid
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid image ID format' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Get the data to update
    const data = await req.json();
    
    // Validate required fields
    if (!data || (data.name === undefined && data.url === undefined)) {
      return NextResponse.json(
        { error: 'No data provided for update' },
        { status: 400 }
      );
    }
    
    // Prepare update object
    const updateData: any = {
      updatedAt: new Date()
    };
    
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    
    if (data.url !== undefined) {
      updateData.url = data.url;
    }
    
    // Update the image
    const result = await db.collection('gallery').updateOne(
      { _id: objectId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to update gallery image' },
      { status: 500 }
    );
  }
}