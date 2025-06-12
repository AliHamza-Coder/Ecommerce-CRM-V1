import { Types } from 'mongoose';

export interface Admin {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password?: string; // Not returned in API responses except for authentication
  role: 'super_admin';
  active: boolean;
  status: 'active' | 'inactive';
  lastLogin: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Helper function to check if admin is active
export function isAdminActive(admin: Admin | null): boolean {
  if (!admin) return false;
  return admin.status === 'active';
}

