import mongoose, { Schema, Document } from 'mongoose';

export interface IGalleryImage extends Document {
  url: string;
  name: string;
  publicId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryImageSchema: Schema = new Schema(
  {
    url: { type: String, required: true },
    name: { type: String, required: true, default: 'Untitled' },
    publicId: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Check if the model is already defined to prevent errors in development with hot reloading
export default mongoose.models.GalleryImage || mongoose.model<IGalleryImage>('GalleryImage', GalleryImageSchema);