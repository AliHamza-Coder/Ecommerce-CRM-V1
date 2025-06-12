import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET: Fetch all categories
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const categories = await db.collection('categories').find({}).toArray();
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST: Create a new category
export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();

    // Check if category with same name exists (case-insensitive)
    const existingCategory = await db.collection('categories').findOne({
      name: { $regex: new RegExp(`^${data.name}$`, 'i') }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 400 }
      );
    }

    const result = await db.collection('categories').insertOne({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const newCategory = await db.collection('categories').findOne({
      _id: result.insertedId
    });

    return NextResponse.json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Check if another category with same name exists (case-insensitive)
    const existingCategory = await db.collection('categories').findOne({
      _id: { $ne: ObjectId.createFromHexString(id) },
      name: { $regex: new RegExp(`^${updateData.name}$`, 'i') }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Another category with this name already exists' },
        { status: 400 }
      );
    }

    const result = await db.collection('categories').findOneAndUpdate(
      { _id: ObjectId.createFromHexString(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result || !result.value) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const result = await db.collection('categories').deleteOne({
      _id: ObjectId.createFromHexString(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}