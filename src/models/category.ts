export interface Category {
  _id: string;
  name: string;
  color: string;
  image?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export type CategoryInput = Omit<Category, '_id' | 'createdAt' | 'updatedAt'>;