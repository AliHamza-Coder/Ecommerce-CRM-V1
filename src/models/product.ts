import { Schema, model, Types } from 'mongoose';

export interface Product {
  _id?: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string; // Cloudinary image URL
  createdAt?: Date;
  updatedAt?: Date;
}

const productSchema = new Schema<Product>({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const ProductModel = model<Product>('Product', productSchema);
