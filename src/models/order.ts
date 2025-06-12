import { ObjectId } from 'mongodb';

export interface OrderItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  image: string;
  sku?: string;
  category?: string;
  weight?: string;
  dimensions?: {
    length: string;
    width: string;
    height: string;
  };
}

export interface OrderShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  apartment?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  deliveryInstructions?: string;
  addressType?: 'home' | 'business' | 'other';
  shippingAddressId?: string; // Reference to the shipping address in the database
  isDefault?: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface TimelineEvent {
  status: string;
  date: string;
  completed: boolean;
  notes?: string;
  location?: string;
  updatedBy?: string;
}

export interface Order {
  _id?: ObjectId;
  id: string;
  customer: {
    id?: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
    taxId?: string;
  };
  status: string;
  date: string;
  deliveryDate?: string;
  estimatedDelivery?: string;
  total: string;
  subtotal: string;
  tax: string;
  shipping: string;
  paymentMethod: string;
  shippingMethod?: string;
  trackingNumber?: string;
  shippingAddress: OrderShippingAddress;
  items: OrderItem[];
  timeline: TimelineEvent[];
  notes?: string;
  metadata?: {
    source?: string;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
    customFields?: Record<string, any>;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderForList {
  id: string;
  customer: string;
  email: string;
  total: string;
  status: string;
  date: string;
  items: number;
  products: string[];
  shippingAddress?: OrderShippingAddress;
  paymentMethod?: string;
  trackingNumber?: string;
}