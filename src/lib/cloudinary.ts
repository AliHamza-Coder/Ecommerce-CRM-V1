import { CldUploadWidget } from 'next-cloudinary';
import crypto from 'crypto';

/**
 * Uploads an image to Cloudinary.
 * @param {File} file - The image file to upload.
 * @returns {Promise<string>} The secure URL of the uploaded image.
 * @throws {Error} If the upload fails.
 */
export const uploadImage = async (file: File): Promise<string> => {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'products';

  // Get Cloudinary signature from API
  const res = await fetch('/api/cloudinary-signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timestamp, folder }),
  });

  const { signature } = await res.json();

  // Prepare form data for Cloudinary upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '');
  formData.append('timestamp', String(timestamp));
  formData.append('folder', folder);
  formData.append('signature', signature);

  // Upload to Cloudinary
  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  const data = await uploadRes.json();
  if (!uploadRes.ok) {
    throw new Error(data.error?.message || 'Upload failed');
  }

  return data.secure_url;
};

/**
 * Extracts the public ID from a Cloudinary URL.
 * @param {string} url - The Cloudinary URL.
 * @returns {string} The public ID, or an empty string if extraction fails.
 */
export function getPublicIdFromUrl(url: string): string {
  if (!url) {
    console.warn('No URL provided to extract public ID from.');
    return '';
  }

  try {
    // URL structure: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{extension}
    const parts = url.split('/upload/');
    if (parts.length < 2) {
      console.warn('URL does not contain "/upload/" segment, cannot extract public ID.');
      return '';
    }

    const publicIdWithExtension = parts[1].substring(parts[1].indexOf('/') + 1);
    const publicId = publicIdWithExtension.split('.')[0];

    if (!publicId) {
      console.warn('Could not determine public ID from URL.');
      return '';
    }

    return publicId;
  } catch (error: any) {
    console.error('Error extracting public ID from URL:', error);
    return '';
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  if (!publicId) {
    console.error('No public ID provided for deletion');
    return;
  }

  console.log('Attempting to delete image with public ID:', publicId);
  const timestamp = Math.floor(Date.now() / 1000);

  try {
    // Get the delete signature
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/cloudinary-delete-signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        public_id: publicId,
        timestamp 
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to get delete signature');
    }

    const { signature } = await res.json();

    // Delete the image from Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_id: publicId,
          api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
          timestamp,
          signature,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Cloudinary delete error:', error);
      throw new Error(`Cloudinary delete failed for public ID ${publicId}: ${error.error?.message || 'Unknown error'}`);
    }

    console.log('Successfully deleted image with public ID:', publicId);
  } catch (error: any) {
    console.error('Error deleting image:', error);
    throw new Error(`Failed to delete image with public ID ${publicId}: ${error.message || 'Unknown error'}`);
  }
}
