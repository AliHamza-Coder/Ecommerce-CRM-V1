import { ObjectId } from 'mongodb';

export interface ShippingAddress {
  _id?: ObjectId;
  customerId: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  addressType: 'home' | 'business' | 'other';
  isDefault: boolean;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  deliveryInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

// This type is for creating a new shipping address
export interface CreateShippingAddressInput {
  customerId: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  addressType: 'home' | 'business' | 'other';
  isDefault: boolean;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  deliveryInstructions?: string;
}