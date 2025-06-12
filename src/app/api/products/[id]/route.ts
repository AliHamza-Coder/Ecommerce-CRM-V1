import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { crudOperations } from '@/lib/crud';
import { getDatabase } from '@/lib/mongodb';
import { deleteImage, getPublicIdFromUrl } from '@/lib/cloudinary';

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
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }
    
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
    }
    const product = await db.collection('products').findOne({
      _id: objectId
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

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
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }
    
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
    }
    
    // Find the product first to get its details
    const product = await db.collection('products').findOne({
      _id: objectId
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Delete images from Cloudinary if they exist
    try {
      if (product.frontImage) {
        const frontImageId = getPublicIdFromUrl(product.frontImage);
        if (frontImageId) await deleteImage(frontImageId);
      }
      
      if (product.backImage) {
        const backImageId = getPublicIdFromUrl(product.backImage);
        if (backImageId) await deleteImage(backImageId);
      }
      
      if (product.galleryImages && Array.isArray(product.galleryImages)) {
        for (const imageUrl of product.galleryImages) {
          const galleryImageId = getPublicIdFromUrl(imageUrl);
          if (galleryImageId) await deleteImage(galleryImageId);
        }
      }
    } catch (imageError) {
      console.error('Error deleting product images:', imageError);
      // Continue with product deletion even if image deletion fails
    }
    
    // Delete the product from the database
    await db.collection('products').deleteOne({
      _id: objectId
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

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
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }
    
    const productData = await req.json();
    
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
    }
    const products = db.collection('products');
    
    // Update the product
    const result = await products.updateOne(
      { _id: objectId },
      { $set: {
        ...productData,
        updatedAt: new Date()
      }}
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}