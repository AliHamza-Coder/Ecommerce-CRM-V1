'use client'

import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, Plus, RefreshCw, Trash2, Image as ImageIcon, Images, X, Check, Pencil, FileEdit } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { uploadImage, deleteImage, getPublicIdFromUrl } from "@/lib/cloudinary"
import { fetchGalleryImages, createGalleryImage, deleteGalleryImage } from "@/lib/fetch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/loading-spinner"

interface GalleryImage {
  id: string;
  url: string;
  name: string;
  createdAt: string | Date;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [imageToRename, setImageToRename] = useState<GalleryImage | null>(null);
  const [newImageName, setNewImageName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multipleFileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  const loadGalleryImages = async () => {
    try {
      setLoading(true);
      const data = await fetchGalleryImages();
      setImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: "Error",
        description: "Failed to load gallery images",
        variant: "destructive"
      });
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGalleryImages();
  }, []);

  // Handle file drop events
  useEffect(() => {
    const dropArea = dropAreaRef.current;
    if (!dropArea) return;

    const preventDefaults = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const highlight = () => {
      dropArea.classList.add('bg-slate-100', 'dark:bg-slate-800');
    };

    const unhighlight = () => {
      dropArea.classList.remove('bg-slate-100', 'dark:bg-slate-800');
    };

    const handleDrop = (e: DragEvent) => {
      preventDefaults(e);
      unhighlight();
      
      if (e.dataTransfer?.files) {
        handleFiles(Array.from(e.dataTransfer.files));
      }
    };

    // Add event listeners
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, unhighlight, false);
    });

    dropArea.addEventListener('drop', handleDrop, false);

    // Clean up
    return () => {
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea?.removeEventListener(eventName, preventDefaults);
      });

      ['dragenter', 'dragover'].forEach(eventName => {
        dropArea?.removeEventListener(eventName, highlight);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        dropArea?.removeEventListener(eventName, unhighlight);
      });

      dropArea?.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setUploading(true);
    const newImages: GalleryImage[] = [];
    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        failCount++;
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 5MB limit`,
          variant: "destructive"
        });
        continue;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        failCount++;
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive"
        });
        continue;
      }

      try {
        // Upload to Cloudinary
        const url = await uploadImage(file);
        
        // Save to database via API
        const formData = new FormData();
        formData.append('url', url);
        formData.append('name', file.name);
        
        const response = await fetch('/api/gallery', {
          method: 'POST',
          body: JSON.stringify({ url, name: file.name }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to save image to database');
        }
        
        const savedImage = await response.json();
        
        // Add to new images array with the ID from the database
        newImages.push({
          id: savedImage.id,
          url,
          name: file.name,
          createdAt: new Date()
        });
        
        successCount++;
      } catch (error) {
        console.error('Error uploading image:', error);
        failCount++;
      }
    }

    // Update state with new images
    setImages(prev => [...newImages, ...prev]);
    setUploading(false);

    // Show toast with upload results
    if (successCount > 0) {
      toast({
        title: "Success",
        description: `${successCount} image${successCount > 1 ? 's' : ''} uploaded successfully${failCount > 0 ? `, ${failCount} failed` : ''}`
      });
    } else if (failCount > 0) {
      toast({
        title: "Error",
        description: `Failed to upload ${failCount} image${failCount > 1 ? 's' : ''}`,
        variant: "destructive"
      });
    }
  };

  const handleSingleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleMultipleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleDeleteImage = async (image: GalleryImage) => {
    try {
      // Set loading state
      setLoading(true);
      
      // Show loading toast
      toast({
        title: "Deleting...",
        description: <div className="flex items-center"><LoadingSpinner size="sm" /> Deleting image, please wait</div>,
        variant: "default"
      });
      
      // Delete from Cloudinary
      const publicId = getPublicIdFromUrl(image.url);
      if (publicId) {
        try {
          await deleteImage(publicId);
        } catch (cloudinaryError) {
          console.error('Error deleting from Cloudinary:', cloudinaryError);
          // Continue with database deletion even if Cloudinary deletion fails
        }
      }
      
      // Remove from database via API
      const response = await fetch(`/api/gallery/${image.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete image from database');
      }
      
      // Update state
      setImages(images.filter(img => img.id !== image.id));
      
      toast({
        title: "Success",
        description: "Image deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      // Set loading state
      setLoading(true);
      
      const selectedIds = Array.from(selectedImages);
      const selectedImagesArray = images.filter(img => selectedIds.includes(img.id));
      
      // Show loading toast
      toast({
        title: "Deleting...",
        description: <div className="flex items-center"><LoadingSpinner size="sm" /> Deleting {selectedImagesArray.length} images, please wait</div>,
        variant: "default"
      });
      
      let successCount = 0;
      let failCount = 0;
      
      for (const image of selectedImagesArray) {
        try {
          // Delete from Cloudinary
          const publicId = getPublicIdFromUrl(image.url);
          if (publicId) {
            try {
              await deleteImage(publicId);
            } catch (cloudinaryError) {
              console.error('Error deleting from Cloudinary:', cloudinaryError);
              // Continue with database deletion even if Cloudinary deletion fails
            }
          }
          
          // Remove from database via API
          const response = await fetch(`/api/gallery/${image.id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) {
            failCount++;
            continue;
          }
          
          successCount++;
        } catch (err) {
          console.error(`Error deleting image ${image.id}:`, err);
          failCount++;
        }
      }
      
      // Update state
      setImages(images.filter(img => !selectedIds.includes(img.id)));
      setSelectedImages(new Set());
      
      if (successCount > 0) {
        toast({
          title: "Success",
          description: `${successCount} image${successCount > 1 ? 's' : ''} deleted successfully${failCount > 0 ? ` (${failCount} failed)` : ''}`
        });
      } else if (failCount > 0) {
        toast({
          title: "Error",
          description: `Failed to delete ${failCount} image${failCount > 1 ? 's' : ''}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting images:', error);
      toast({
        title: "Error",
        description: "Failed to delete selected images",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRenameImage = async () => {
    if (!imageToRename || !newImageName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid name for the image",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Update image name in database
      const response = await fetch(`/api/gallery/${imageToRename.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newImageName.trim() })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update image name');
      }
      
      // Update state
      setImages(prevImages => 
        prevImages.map(img => 
          img.id === imageToRename.id 
            ? { ...img, name: newImageName.trim() } 
            : img
        )
      );
      
      toast({
        title: "Success",
        description: "Image renamed successfully"
      });
      
      setShowRenameDialog(false);
      setImageToRename(null);
      setNewImageName("");
    } catch (error) {
      console.error('Error renaming image:', error);
      toast({
        title: "Error",
        description: "Failed to rename image",
        variant: "destructive"
      });
    }
  };
  
  const generateRandomName = () => {
    const prefix = "image";
    const randomNum = Math.floor(Math.random() * 10000);
    const timestamp = new Date().getTime().toString().slice(-4);
    return `${prefix}_${randomNum}_${timestamp}`;
  };

  const toggleImageSelection = (id: string) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedImages(newSelection);
  };

  const filteredImages = images.filter(image => 
    image.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-white dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 dark:border-violet-500 border-t-transparent" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (uploading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-white dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 dark:border-violet-500 border-t-transparent" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Uploading images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Image Gallery
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your image gallery
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => multipleFileInputRef.current?.click()}
            className="bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-violet-600 transition-all duration-300 hover:scale-105"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Images
          </Button>
          {selectedImages.size > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-105"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedImages.size})
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedImages(new Set())}
                className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-105"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Selection
              </Button>
            </>
          )}
          <Button
            onClick={() => {
              // Select all images
              const allIds = new Set(images.map(img => img.id));
              setSelectedImages(allIds);
            }}
            variant="outline"
            className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-105"
          >
            <Check className="mr-2 h-4 w-4" />
            Select All
          </Button>
          <Button
            onClick={() => {
              setImages([]);
              loadGalleryImages();
            }}
            variant="outline"
            className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-105"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleSingleFileUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={multipleFileInputRef}
        onChange={handleMultipleFileUpload}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Search and filter */}
      <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-0 hover:scale-[1.01] hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="grid gap-2">
            <CardTitle className="text-slate-900 dark:text-slate-100">Gallery Images</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {images.length} images available
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 ml-auto">
            <div className="relative flex-1">
              <Input
                placeholder="Search images..."
                className="w-full pl-8 backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <ImageIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSearchQuery("")}
              className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-105"
              title="Reset filters"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Hidden drop area - still functional but not visible */}
          <div 
            ref={dropAreaRef}
            className="w-full hidden"
          ></div>

          {/* Grid view of images */}
          {filteredImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredImages.map((image) => (
                <div 
                  key={image.id} 
                  className={`relative group aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 transition-all duration-200 ${
                    selectedImages.has(image.id) ? 'ring-2 ring-blue-500' : 'hover:scale-[1.02]'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    className="object-cover transition-opacity duration-200"
                  />
                  
                  {/* Selection indicator */}
                  <button
                    onClick={() => toggleImageSelection(image.id)}
                    className={`absolute top-2 left-2 p-1 rounded-full ${
                      selectedImages.has(image.id) 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white/80 text-slate-600 opacity-0 group-hover:opacity-100'
                    } hover:bg-blue-600 hover:text-white transition-all duration-200`}
                  >
                    {selectedImages.has(image.id) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </button>
                  
                  {/* Image actions */}
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-white truncate flex-1">{image.name}</p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setImageToRename(image);
                            setNewImageName(image.name);
                            setShowRenameDialog(true);
                          }}
                          className="p-1 rounded-full bg-blue-500/80 text-white hover:bg-blue-600 transition-colors"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedImage(image);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-1 rounded-full bg-red-500/80 text-white hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">No images found</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {searchQuery ? 'Try a different search term' : 'Upload some images to get started'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            {selectedImage 
              ? `Are you sure you want to delete this image?` 
              : `Are you sure you want to delete ${selectedImages.size} selected image${selectedImages.size > 1 ? 's' : ''}?`
            }
            <br />
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setSelectedImage(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedImage) {
                  handleDeleteImage(selectedImage);
                  setSelectedImage(null);
                } else {
                  handleDeleteSelected();
                }
                setShowDeleteConfirm(false);
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Deleting...</span>
                </>
              ) : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Image Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="w-[95vw] max-w-[425px] backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200/60 dark:border-slate-700/60 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Rename Image
            </DialogTitle>
            <DialogDescription>
              Provide a new name for this image or generate a random one.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {imageToRename && (
              <div className="relative w-full h-40 rounded-md overflow-hidden mb-2">
                <Image
                  src={imageToRename.url}
                  alt={imageToRename.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="image-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Image Name
              </Label>
              <div className="flex gap-2">
                <Input
                  id="image-name"
                  value={newImageName}
                  onChange={(e) => setNewImageName(e.target.value)}
                  placeholder="Enter image name"
                  className="flex-1 backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
                <Button
                  variant="outline"
                  onClick={() => setNewImageName(generateRandomName())}
                  className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
                  title="Generate random name"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRenameDialog(false);
                setImageToRename(null);
              }}
              className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameImage}
              className="bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-violet-600 transition-all duration-300 hover:scale-105"
            >
              Rename Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}