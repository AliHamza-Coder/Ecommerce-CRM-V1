import { useState, useRef, useCallback } from 'react'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import { Button } from './button'
import { uploadImage, getPublicIdFromUrl, deleteImage } from '@/lib/cloudinary'
import { toast } from '@/hooks/use-toast'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive"
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive"
      })
      return
    }

    try {
      setIsUploading(true)
      const url = await uploadImage(file)
      onChange(url)
      toast({
        title: "Success",
        description: "Image uploaded successfully"
      })
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = useCallback(async () => {
    if (!value) return;

    const publicId = getPublicIdFromUrl(value);
    if (!publicId) {
      toast({
        title: "Error",
        description: "Failed to extract public ID from URL",
        variant: "destructive"
      });
      return;
    }

    try {
      await deleteImage(publicId);
      toast({
        title: "Success",
        description: "Image deleted successfully",
        duration: 5000, // Keep the toast open for 5 seconds
      });
      onRemove(); // Notify parent component to remove the URL
    } catch (error: any) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete image",
        variant: "destructive",
        duration: 5000, // Keep the toast open for 5 seconds
      });
    }
  }, [value, onRemove]);

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-[200px] h-[200px] rounded-lg overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700">
        {value ? (
          <>
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
            <Upload className="h-8 w-8" />
            <span className="text-sm">Upload image</span>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />
      {!value && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
        >
          {isUploading ? 'Uploading...' : 'Select Image'}
        </Button>
      )}
    </div>
  )
}
