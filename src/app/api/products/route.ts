import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { crudOperations } from '@/lib/crud';
import { uploadImage, deleteImage, getPublicIdFromUrl } from '@/lib/cloudinary';
import { getDatabase } from '@/lib/mongodb';

import { Product } from '@/models/product';

// Remove the local Product interface since we're using the imported one

export async function GET() {
  try {
    console.log('Attempting to connect to MongoDB...');
    // Get database instance to ensure it exists
    const db = await getDatabase();
    console.log('Successfully connected to database');
    
    if (!db) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
    }
    
    // Check if products collection exists, if not it will be created automatically on first insert
    const collections = await db.listCollections().toArray();
    const productsCollection = collections.find(c => c.name === 'products');
    console.log('Products collection exists:', !!productsCollection);
    
    // If collection doesn't exist or is empty, return empty array
    if (!productsCollection) {
      console.log('No products collection found, returning empty array');
      return NextResponse.json([], { status: 200 });
    }
    
    console.log('Fetching products from collection...');
    const products = await crudOperations.read('products');
    console.log(`Successfully fetched ${products.length} products`);
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('Received product creation request');
    const productData = await request.json();
    
    // Log received data
    console.log('JSON data received:', productData);

    const { name, description, price, categories, stock, frontImage, backImage, galleryImages } = productData;

    // Validate required fields
    if (!name || !price || isNaN(Number(price))) {
      console.error('Validation failed:', { name, price });
      return NextResponse.json(
        { error: 'Name and price are required and must be valid' },
        { status: 400 }
      );
    }

    const product = {
      name,
      description: description || '',
      price: Number(price),
      categories: categories || [],
      stock: Number(stock) || 0,
      frontImage: frontImage || '',
      backImage: backImage || '',
      galleryImages: galleryImages || [],
      createdAt: new Date(),
    };

    console.log('Creating product in database:', product);
    const result = await crudOperations.create('products', product);
    console.log('Product created successfully:', result);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    console.log('Received product update request');
    const formData = await request.formData();
    console.log('Form data received:', Object.fromEntries(formData.entries()));

    const id = formData.get('id');
    const name = formData.get('name');
    const description = formData.get('description');
    const price = formData.get('price');
    const category = formData.get('category');
    const stock = formData.get('stock');
    const image = formData.get('image') as File | null;

    if (!id || !name || !description || !price || !category || !stock) {
      console.error('Missing required fields:', { id, name, description, price, category, stock });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
    }
    const products = db.collection('products');

    // Get the existing product
    const existingProduct = await products.findOne({ _id: new ObjectId(id as string) });
    if (!existingProduct) {
      console.error('Product not found:', id);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const updateData: any = {
      name,
      description,
      price: parseFloat(price as string),
      category,
      stock: parseInt(stock as string),
      updatedAt: new Date()
    };

    // Handle image upload if a new image is provided
    if (image && image.size > 0) {
      try {
        // Delete old image if it exists
        if (existingProduct.image) {
          await deleteImage(existingProduct.image.public_id);
        }

        // Upload new image
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString('base64');
        const dataURI = `data:${image.type};base64,${base64Image}`;

        const uploadResponse = await uploadImage(image);

        updateData.image = {
          url: uploadResponse,
          public_id: getPublicIdFromUrl(uploadResponse)
        };
      } catch (error) {
        console.error('Error handling image upload:', error);
        return NextResponse.json(
          { error: 'Failed to process image upload' },
          { status: 500 }
        );
      }
    }

    console.log('Updating product with data:', updateData);

    const result = await products.updateOne(
      { _id: new ObjectId(id as string) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      console.error('No product found to update:', id);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (result.modifiedCount === 0) {
      console.log('No changes made to product:', id);
      return NextResponse.json(
        { message: 'No changes made to product' },
        { status: 200 }
      );
    }

    console.log('Product updated successfully:', id);
    return NextResponse.json(
      { message: 'Product updated successfully', id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    console.log('Attempting to delete product:', id);

    // Get product to delete its image from Cloudinary
    const [product] = await crudOperations.read<Product>('products', { _id: new ObjectId(id) });
    if (!product) {
      console.log('Product not found:', id);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete image from Cloudinary if it exists
    if (product?.image) {
      console.log('Found product image:', product.image);
      const publicId = getPublicIdFromUrl(product.image);
      console.log('Extracted public ID:', publicId);
      
      if (publicId) {
        try {
          console.log('Attempting to delete image from Cloudinary...');
          await deleteImage(publicId);
          console.log('Successfully deleted image from Cloudinary');
        } catch (error) {
          console.error('Error deleting image from Cloudinary:', error);
          // Log the error but continue with product deletion
        }
      } else {
        console.error('Could not extract public ID from image URL:', product.image);
      }
    } else {
      console.log('No image found for product');
    }

    // Delete the product from the database
    console.log('Deleting product from database...');
    await crudOperations.delete('products', id);
    console.log('Successfully deleted product from database');

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/products:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete product' },
      { status: 500 }
    );
  }
}
