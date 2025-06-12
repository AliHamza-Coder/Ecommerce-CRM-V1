'use client'

import { useState, useEffect, useRef } from "react"
import { Plus, RefreshCw, Trash2, Tag, Check, X, Pencil, Palette, Image as ImageIcon, RotateCw } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Category } from "@/models/category"
import { uploadImage, deleteImage, getPublicIdFromUrl } from "@/lib/cloudinary"
import { Switch } from "@/components/ui/switch"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("#3B82F6");
  const [isEditing, setIsEditing] = useState(false);
  const [categoryImage, setCategoryImage] = useState<string>("");
  const [useImage, setUseImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to load categories from API
  const loadCategories = async () => {
    try {
      setLoading(true);
      // First, try to initialize categories collection
      await fetch('/api/categories/init', {
        method: 'POST'
      });
      
      // Then fetch all categories
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
      // Initialize with empty array if fetch fails
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const newCategory = {
        name: categoryName.trim(),
        color: categoryColor,
        image: useImage ? categoryImage : null
      };

      // Make API call to create category
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          toast({
            title: "Category Already Exists",
            description: "Please use a different category name as this one already exists.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: errorData.error || "Failed to create category",
            variant: "destructive",
          });
        }
        return;
      }

      const createdCategory = await response.json();

      // Update state
      setCategories(prev => [createdCategory, ...prev]);
      resetForm();
      
      toast({
        title: "Success",
        description: `${categoryName} has been added successfully.`,
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory || !categoryName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const updatedCategory = {
        name: categoryName.trim(),
        color: categoryColor,
        image: useImage ? categoryImage : null
      };

      // Make API call to update category
      const response = await fetch(`/api/categories/${selectedCategory._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCategory),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          toast({
            title: "Category Already Exists",
            description: "Please use a different category name as this one already exists.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: errorData.error || "Failed to update category",
            variant: "destructive",
          });
        }
        return;
      }

      const updated = await response.json();

      // Update state
      setCategories(prev => 
        prev.map(cat => cat._id === selectedCategory._id ? {...cat, ...updatedCategory} : cat)
      );
      
      resetForm();
      
      toast({
        title: "Success",
        description: `${categoryName} has been updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    try {
      // Make API call to delete category
      const response = await fetch(`/api/categories/${category._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete category');
      }
      
      // Update state
      setCategories(categories.filter(cat => cat._id !== category._id));
      
      // Delete the image from Cloudinary if it exists
      if (category.image) {
        try {
          const publicId = getPublicIdFromUrl(category.image);
          if (publicId) {
            await deleteImage(publicId);
            console.log('Successfully deleted image for category:', category.name);
          }
        } catch (imageError) {
          console.error('Error deleting category image:', imageError);
          // Don't show this error to the user as the category was successfully deleted
        }
      }
      
      toast({
        title: "Success",
        description: "Category deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const selectedIds = Array.from(selectedCategories);
      const selectedCategoriesArray = categories.filter(cat => selectedIds.includes(cat._id));
      
      let successCount = 0;
      let failCount = 0;
      
      for (const category of selectedCategoriesArray) {
        try {
          // Make API call to delete category
          const response = await fetch(`/api/categories/${category._id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete category');
          }
          
          // Delete the image from Cloudinary if it exists
          if (category.image) {
            try {
              const publicId = getPublicIdFromUrl(category.image);
              if (publicId) {
                await deleteImage(publicId);
                console.log('Successfully deleted image for category:', category.name);
              }
            } catch (imageError) {
              console.error(`Error deleting image for category ${category._id}:`, imageError);
              // Continue with deletion process even if image deletion fails
            }
          }
          
          successCount++;
        } catch (err) {
          console.error(`Error deleting category ${category._id}:`, err);
          failCount++;
        }
      }
      
      // Update state
      setCategories(categories.filter(cat => !selectedIds.includes(cat._id)));
      setSelectedCategories(new Set());
      
      if (successCount > 0) {
        toast({
          title: "Success",
          description: `${successCount} category${successCount > 1 ? 'ies' : 'y'} deleted successfully${failCount > 0 ? ` (${failCount} failed)` : ''}`
        });
      } else if (failCount > 0) {
        toast({
          title: "Error",
          description: `Failed to delete ${failCount} category${failCount > 1 ? 'ies' : 'y'}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting categories:', error);
      toast({
        title: "Error",
        description: "Failed to delete selected categories",
        variant: "destructive"
      });
    }
  };

  const toggleCategorySelection = (id: string) => {
    const newSelection = new Set(selectedCategories);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedCategories(newSelection);
  };

  // Function to handle image removal
  const handleRemoveImage = async () => {
    try {
      if (categoryImage) {
        // Get the public ID from the image URL
        const publicId = getPublicIdFromUrl(categoryImage);
        
        if (publicId) {
          // Set state to empty immediately for better UX
          setCategoryImage("");
          
          // Delete the image from Cloudinary
          await deleteImage(publicId);
          
          toast({
            title: "Success",
            description: "Image removed successfully",
          });
        } else {
          setCategoryImage("");
          console.error("Could not extract public ID from image URL");
        }
      }
    } catch (error) {
      console.error("Error removing image:", error);
      toast({
        title: "Error",
        description: "Failed to remove image from cloud storage",
        variant: "destructive",
      });
      // Still clear the image from UI even if cloud deletion fails
      setCategoryImage("");
    }
  };

  const resetForm = () => {
    setCategoryName("");
    setCategoryColor("#3B82F6");
    setCategoryImage("");
    setUseImage(false);
    setSelectedCategory(null);
    setIsEditing(false);
    setShowCategoryForm(false);
  };

  const openEditForm = (category: Category) => {
    setSelectedCategory(category);
    setCategoryName(category.name);
    setCategoryColor(category.color);
    setCategoryImage(category.image || "");
    setUseImage(!!category.image);
    setIsEditing(true);
    setShowCategoryForm(true);
  };
  
  // Function to handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      const imageUrl = await uploadImage(file);
      setCategoryImage(imageUrl);
      setUseImage(true);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-white dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 dark:border-violet-500 border-t-transparent" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Categories
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage categories for your products
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => {
              resetForm();
              setShowCategoryForm(true);
            }}
            className="bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-violet-600 transition-all duration-300 hover:scale-105"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
          <Button
            onClick={loadCategories}
            variant="outline"
            className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-105"
          >
            <RotateCw className="mr-2 h-4 w-4" />
            Refresh Categories
          </Button>
          <Button
            onClick={() => {
              // Select all categories
              const allIds = new Set(categories.map(cat => cat._id));
              setSelectedCategories(allIds);
            }}
            variant="outline"
            className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-105"
          >
            <Check className="mr-2 h-4 w-4" />
            Select All
          </Button>
          {selectedCategories.size > 0 && (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="destructive"
              className="transition-all duration-300 hover:scale-105"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedCategories.size})
            </Button>
          )}
        </div>
      </div>

      {/* Search and filter */}
      <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-0 hover:scale-[1.01] hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="grid gap-2">
            <CardTitle className="text-slate-900 dark:text-slate-100">Categories</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {categories.length} categories available
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 ml-auto">
            <div className="relative flex-1">
              <Input
                placeholder="Search categories..."
                className="w-full pl-8 backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
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
          {/* Grid view of categories */}
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredCategories.map((category) => (
                <div 
                  key={category._id} 
                  className={`relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 transition-all duration-200 ${
                    selectedCategories.has(category._id) ? 'ring-2 ring-blue-500' : 'hover:scale-[1.02]'
                  }`}
                >
                  {category.image ? (
                    <div 
                      className="h-24 w-full relative"
                    >
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                      <div 
                        className="absolute inset-0 opacity-30"
                        style={{ backgroundColor: category.color }}
                      ></div>
                    </div>
                  ) : (
                    <div 
                      className="h-24 w-full flex items-center justify-center"
                      style={{ backgroundColor: category.color }}
                    >
                      <Tag className="h-8 w-8 text-white" />
                    </div>
                  )}
                  
                  {/* Selection indicator */}
                  <button
                    onClick={() => toggleCategorySelection(category._id)}
                    className={`absolute top-2 left-2 p-1 rounded-full ${
                      selectedCategories.has(category._id) 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white/80 text-slate-600 opacity-0 group-hover:opacity-100'
                    } hover:bg-blue-600 hover:text-white transition-all duration-200`}
                  >
                    {selectedCategories.has(category._id) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </button>
                  
                  {/* Category info and actions */}
                  <div className="p-3 flex justify-between items-center bg-white dark:bg-slate-800">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate mr-2">
                      {category.name}
                    </h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditForm(category)}
                        className="p-1 rounded-full bg-blue-500/80 text-white hover:bg-blue-600 transition-colors"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-1 rounded-full bg-red-500/80 text-white hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 mx-auto text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">No categories found</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {searchQuery ? 'Try a different search term' : 'Create some categories to get started'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Form Dialog */}
      <Dialog open={showCategoryForm} onOpenChange={(open) => !isSubmitting && setShowCategoryForm(open)}>
        <DialogContent className="w-[95vw] max-w-[500px] backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200/60 dark:border-slate-700/60 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              {isEditing ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. Electronics, Clothing"
                className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category-color" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Category Color <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-110"
                  style={{ backgroundColor: categoryColor }}
                ></div>
                <Input
                  id="category-color"
                  type="color"
                  value={categoryColor}
                  onChange={(e) => setCategoryColor(e.target.value)}
                  className="flex-1 h-10 p-1 backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="use-image" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Add Category Image
                </Label>
                <Switch 
                  id="use-image"
                  checked={useImage}
                  onCheckedChange={setUseImage}
                />
              </div>
              
              {useImage && (
                <div className="space-y-3 mt-2">
                  {isSubmitting ? (
                    <div className="w-full h-40 rounded-lg flex flex-col items-center justify-center gap-2 border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 dark:border-violet-500 border-t-transparent" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">Uploading image...</p>
                    </div>
                  ) : categoryImage ? (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <Image
                        src={categoryImage}
                        alt="Category preview"
                        fill
                        className="object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-90"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full h-40 rounded-lg flex flex-col items-center justify-center gap-2 border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                      <ImageIcon className="h-10 w-10 text-slate-400" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">No image selected</p>
                    </div>
                  )}
                  
                  <div className="flex">
                    <Input
                      id="category-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isSubmitting}
                      className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={isSubmitting}
              className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              onClick={isEditing ? handleUpdateCategory : handleCreateCategory}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-violet-600 transition-all duration-300 hover:scale-105"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                </div>
              ) : (
                `${isEditing ? 'Update' : 'Create'} Category`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            {selectedCategory 
              ? `Are you sure you want to delete "${selectedCategory.name}" category?` 
              : `Are you sure you want to delete ${selectedCategories.size} selected ${selectedCategories.size > 1 ? 'categories' : 'category'}?`
            }
            <br />
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setSelectedCategory(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedCategory) {
                  handleDeleteCategory(selectedCategory);
                  setSelectedCategory(null);
                } else {
                  handleDeleteSelected();
                }
                setShowDeleteConfirm(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}