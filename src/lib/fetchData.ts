import { Product } from '../models/product';
import { connectDB } from './mongodb';
import mongoose from 'mongoose';

export async function getProducts(): Promise<Product[]> {
  try {
    await connectDB();
    const products = await mongoose.models.Product.find({});
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    await connectDB();
    const product = await mongoose.models.Product.findById(id);
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

export async function createProduct(productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  try {
    await connectDB();
    const product = new mongoose.models.Product(productData);
    await product.save();
    return product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

export async function updateProduct(id: string, updateData: Partial<Omit<Product, '_id'>>): Promise<Product | null> {
  try {
    await connectDB();
    const product = await mongoose.models.Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    return product;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    await connectDB();
    await mongoose.models.Product.findByIdAndDelete(id);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  try {
    await connectDB();
    const regex = new RegExp(query, 'i');
    const products = await mongoose.models.Product.find({
      $or: [
        { name: regex },
        { description: regex },
        { category: regex }
      ]
    });
    return products;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
}
