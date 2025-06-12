'use client'

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Images, Plus, Trash2, Check, ImageIcon, Palette, Package, RefreshCw, Info, SquareCheck, XCircle, Save } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { uploadImage } from "@/lib/cloudinary"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Checkbox } from "@/components/ui/checkbox"

interface GalleryImage {
  id: string;
  url: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
  color: string;
}

export default function NewProductPage() {
  const router = useRouter();
  
  // Product form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [stock, setStock] = useState("");
  
  // Image states
  const [frontImage, setFrontImage] = useState<string>("");
  const [backImage, setBackImage] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);
  const [galleryImages_DB, setGalleryImages_DB] = useState<GalleryImage[]>([]);
  const [selectedGalleryImages, setSelectedGalleryImages] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [activeImageType, setActiveImageType] = useState<'front' | 'back' | 'gallery'>('front');
  
  // Add this state for search
  const [productSearch, setProductSearch] = useState("");
  
  // Load categories and gallery images
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          console.warn('Failed to fetch categories');
          setCategories([]);
          return;
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
        toast({
          title: "Warning",
          description: "Failed to load categories",
          variant: "default"
        });
      }
    };
    
    loadCategories();
  }, []);
  
  // Load gallery images when gallery dialog is opened or when a new image is uploaded
  const loadGalleryImages = async (forceReload = false) => {
    if (galleryImages_DB.length > 0 && !forceReload) return; // Don't reload if already loaded unless forced
    
    try {
      setGalleryLoading(true);
      const response = await fetch('/api/gallery', {
        cache: 'no-store' // Ensure we get fresh data
      });
      if (!response.ok) throw new Error('Failed to fetch gallery images');
      const data = await response.json();
      setGalleryImages_DB(data);
    } catch (error) {
      console.error('Error loading gallery images:', error);
      toast({
        title: "Error",
        description: "Failed to load gallery images",
        variant: "destructive"
      });
    } finally {
      setGalleryLoading(false);
    }
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back' | 'gallery') => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // Set loading state
    setIsSubmitting(true);
    
    try {
      // For gallery, handle multiple files
      if (type === 'gallery' && e.target.files.length > 1) {
        // Show loading toast for multiple images
        toast({
          title: "Uploading...",
          description: <div className="flex items-center"><LoadingSpinner size="sm" /> Uploading {e.target.files.length} images, please wait</div>,
          variant: "default"
        });
        
        const uploadedUrls: string[] = [];
        const failedCount = { value: 0 };
        
        // Process each file in parallel
        const uploadPromises = Array.from(e.target.files).map(async (file) => {
          // Validate file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            failedCount.value++;
            return null;
          }
          
          // Validate file type
          if (!file.type.startsWith('image/')) {
            failedCount.value++;
            return null;
          }
          
          try {
            // Upload the image to Cloudinary
            const imageUrl = await uploadImage(file);
            
            // Save it to the gallery
            const response = await fetch('/api/gallery', {
              method: 'POST',
              body: JSON.stringify({ url: imageUrl, name: file.name }),
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            if (!response.ok) {
              throw new Error('Failed to save image to gallery');
            }
            
            return imageUrl;
          } catch (error) {
            console.error('Error uploading image:', error);
            failedCount.value++;
            return null;
          }
        });
        
        // Wait for all uploads to complete
        const results = await Promise.all(uploadPromises);
        
        // Filter out null results (failed uploads)
        const successfulUrls = results.filter(url => url !== null) as string[];
        
        // Add the successful uploads to the gallery images
        if (successfulUrls.length > 0) {
          setGalleryImages(prev => [...prev, ...successfulUrls]);
        }
        
        // Show results toast
        toast({
          title: "Upload Complete",
          description: `${successfulUrls.length} images uploaded successfully${failedCount.value > 0 ? `, ${failedCount.value} failed` : ''}`,
          variant: failedCount.value > 0 ? "destructive" : "default"
        });
        
      } else {
        // Handle single file upload (for front, back, or single gallery image)
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
        
        // Show loading toast
        toast({
          title: "Uploading...",
          description: <div className="flex items-center"><LoadingSpinner size="sm" /> Uploading image, please wait</div>,
          variant: "default"
        });
        
        // Upload the image to Cloudinary
        const imageUrl = await uploadImage(file);
        
        // Save it to the gallery
        const response = await fetch('/api/gallery', {
          method: 'POST',
          body: JSON.stringify({ url: imageUrl, name: file.name }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to save image to gallery');
        }
        
        // Set image directly based on type
        if (type === 'front') {
          setFrontImage(imageUrl);
        } else if (type === 'back') {
          setBackImage(imageUrl);
        } else if (type === 'gallery') {
          setGalleryImages(prev => [...prev, imageUrl]);
        }
        
        // Success toast
        toast({
          title: "Success",
          description: "Image uploaded successfully",
          variant: "default"
        });
      }
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
  
  const handleRemoveImage = (type: 'front' | 'back' | 'gallery', index?: number) => {
    if (type === 'front') {
      setFrontImage("");
    } else if (type === 'back') {
      setBackImage("");
    } else if (type === 'gallery' && typeof index === 'number') {
      setGalleryImages(prev => prev.filter((_, i) => i !== index));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Product name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      toast({
        title: "Error",
        description: "Valid price is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!frontImage) {
      toast({
        title: "Error",
        description: "Front image is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        categories: selectedCategories,
        stock: Number(stock) || 0,
        frontImage,
        backImage,
        galleryImages
      };
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create product');
      }
      
      toast({
        title: "Success",
        description: "Product created successfully"
      });
      
      // Clear the form after successful submission
      resetProductForm();
      
      // Redirect to products page
      router.push('/products');
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSelectGalleryImages = () => {
    const selectedUrls = Array.from(selectedGalleryImages)
      .map(id => {
        const image = galleryImages_DB.find(img => img.id === id);
        return image ? image.url : null;
      })
      .filter(url => url !== null) as string[];
    
    if (activeImageType === 'front') {
      if (selectedUrls.length > 0) setFrontImage(selectedUrls[0]);
    } else if (activeImageType === 'back') {
      if (selectedUrls.length > 0) setBackImage(selectedUrls[0]);
    } else if (activeImageType === 'gallery') {
      setGalleryImages(prev => [...prev, ...selectedUrls]);
    }
    
    setSelectedGalleryImages(new Set());
    setShowGalleryDialog(false);
  };
  
  // Toggle selection of gallery images
  const toggleImageSelection = (id: string) => {
    const newSelection = new Set(selectedGalleryImages);
    
    if (activeImageType === 'front' || activeImageType === 'back') {
      // For front/back, only allow single selection
      newSelection.clear();
      newSelection.add(id);
    } else {
      // For gallery, allow multiple selection
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
    }
    
    setSelectedGalleryImages(newSelection);
  };
  
  const filteredGalleryImages = galleryImages_DB.filter(image => 
    image.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const [products, setProducts] = useState<any[]>([]);
  const [showAllProducts, setShowAllProducts] = useState(true); // Default to show all products
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [productLoading, setProductLoading] = useState(true);
  const [showProductDetails, setShowProductDetails] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  
  // Function to fetch all products - now called automatically on component mount
  const fetchAllProducts = async () => {
    try {
      setProductLoading(true);
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
      setShowAllProducts(true);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setProductLoading(false);
      setIsSubmitting(false);
    }
  };
  
  // Load products on component mount
  useEffect(() => {
    fetchAllProducts();
  }, []);
  
  // Handle product selection for multi-select
  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };
  
  // Handle deletion of multiple products
  const handleDeleteSelectedProducts = async () => {
    if (selectedProducts.size === 0) return;
    
    try {
      setIsSubmitting(true);
      const deletePromises = Array.from(selectedProducts).map(async (productId) => {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE'
        });
        return { productId, success: response.ok };
      });
      
      const results = await Promise.all(deletePromises);
      const successIds = results.filter(r => r.success).map(r => r.productId);
      
      // Update state to remove deleted products
      setProducts(products.filter(product => !successIds.includes(product._id)));
      
      // Clear selection
      setSelectedProducts(new Set());
      
      toast({
        title: "Success",
        description: `${successIds.length} product(s) deleted successfully`
      });
    } catch (error) {
      console.error('Error deleting products:', error);
      toast({
        title: "Error",
        description: "Failed to delete some products",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle single product deletion
  const handleDeleteProduct = async (productId: string) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      // Update state
      setProducts(products.filter(product => product._id !== productId));
      
      toast({
        title: "Success",
        description: "Product deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // View product details
  const viewProductDetails = (product: any) => {
    setSelectedProduct(product);
    setShowProductDetails(product._id);
  };

  // Filter products by search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Add select all and clear selection handlers
  const handleSelectAllProducts = () => {
    setSelectedProducts(new Set(filteredProducts.map(p => p._id)));
  };
  const handleClearSelection = () => {
    setSelectedProducts(new Set());
  };
  
  // Reset product form
  const resetProductForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setSelectedCategories([]);
    setStock("");
    setFrontImage("");
    setBackImage("");
    setGalleryImages([]);
    
    // Reset UI states
    setActiveImageType('front');
    
    toast({
      title: "Form Cleared",
      description: "Product form has been cleared",
    });
  };

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 animate-fade-in">
      {showAllProducts ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowAllProducts(false)}
                className="bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-violet-600 transition-all duration-300 hover:scale-105"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={fetchAllProducts}
                variant="outline"
                className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-105"
                title="Refresh products"
              >
                <RefreshCw className={`h-4 w-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {selectedProducts.size > 0 && (
                <>
                  <Button
                    onClick={handleDeleteSelectedProducts}
                    variant="destructive"
                    className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-105"
                    disabled={isSubmitting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected ({selectedProducts.size})
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearSelection}
                    className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-105"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Clear Selection
                  </Button>
                </>
              )}
              <Button
                onClick={handleSelectAllProducts}
                variant="outline"
                className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-105"
              >
                <Check className="mr-2 h-4 w-4" />
                Select All
              </Button>
            </div>
          </div>

          <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-0">
            <CardHeader className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="grid gap-2">
                <CardTitle className="text-slate-900 dark:text-slate-100">Product Inventory</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  {filteredProducts.length} products in your inventory
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 ml-auto">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search products..."
                    className="w-full pl-8 backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                  />
                  <Package className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setProductSearch("")}
                  className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-105"
                  title="Reset filters"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {productLoading ? (
                <div className="flex-1 flex items-center justify-center min-h-[300px] bg-white dark:bg-slate-900">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 dark:border-violet-500 border-t-transparent" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">Loading products...</p>
                  </div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className={`relative group aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 transition-all duration-200 ${
                        selectedProducts.has(product._id) ? 'ring-2 ring-blue-500' : 'hover:scale-[1.02]'
                      }`}
                    >
                      {product.frontImage ? (
                        <Image
                          src={product.frontImage}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                          className="object-cover transition-opacity duration-200"
                        />
                      ) : (
                        <div className="h-full w-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-slate-400" />
                        </div>
                      )}
                      {/* Selection indicator */}
                      <button
                        onClick={() => toggleProductSelection(product._id)}
                        className={`absolute top-2 left-2 p-1 rounded-full ${
                          selectedProducts.has(product._id)
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/80 text-slate-600 opacity-0 group-hover:opacity-100'
                        } hover:bg-blue-600 hover:text-white transition-all duration-200`}
                      >
                        {selectedProducts.has(product._id) ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </button>
                      {/* Product info */}
                      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-2 flex flex-col">
                        <span className="text-white text-sm font-semibold truncate">{product.name}</span>
                        <span className="text-white text-xs">${product.price?.toFixed(2)}</span>
                      </div>
                      {/* Delete button */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteProduct(product._id);
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-500/80 text-white hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-slate-400" />
                  <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">No products found</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {productSearch ? 'Try a different search term' : 'Add some products to get started'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <Button
              onClick={() => setShowAllProducts(true)}
              variant="outline"
              className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-105"
            >
              <Package className="mr-2 h-4 w-4" />
              See All Products
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={resetProductForm}
                disabled={isSubmitting}
                variant="outline"
                className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-105"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Clear Form
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-violet-600 transition-all duration-300 hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Product
                  </>
                )}
              </Button>
            </div>
          </div>
          <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-0 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Enter the basic details of your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter product name"
                    className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium">
                    Price ($) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Categories
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200/60 dark:border-slate-700/60">
                    {categories.map((cat) => (
                      <div key={cat._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`category-${cat._id}`}
                          checked={selectedCategories.includes(cat._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, cat._id]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(id => id !== cat._id));
                            }
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`category-${cat._id}`} className="flex items-center space-x-2 text-sm">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          ></div>
                          <span>{cat.name}</span>
                        </label>
                      </div>
                    ))}
                    {categories.length === 0 && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 col-span-full">
                        No categories available. Add categories first.
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-sm font-medium">
                    Stock Quantity
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                    className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your product in detail..."
                  className="min-h-[150px] backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-0 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>Upload images for your product</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="front" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="front" onClick={() => setActiveImageType('front')}>Front Image </TabsTrigger>
                  <TabsTrigger value="back" onClick={() => setActiveImageType('back')}>Back Image</TabsTrigger>
                  <TabsTrigger value="gallery" onClick={() => setActiveImageType('gallery')}>Gallery Images</TabsTrigger>
                </TabsList>
                <TabsContent value="front" className="space-y-4">
                  <div className="flex flex-col items-center justify-center">
                    {frontImage ? (
                      <div className="relative w-full max-w-md h-64 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                        <Image
                          src={frontImage}
                          alt="Front view"
                          fill
                          className="object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage('front')}
                          className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full max-w-md h-64 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-slate-400" />
                        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                          Front image is required
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                    <label className="cursor-pointer">
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'front')}
                        disabled={isSubmitting}
                        id="frontImageInput"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
                        disabled={isSubmitting}
                        onClick={() => document.getElementById('frontImageInput')?.click()}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Upload Image
                      </Button>
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
                      onClick={() => {
                        setActiveImageType('front');
                        loadGalleryImages();
                        setShowGalleryDialog(true);
                      }}
                      disabled={isSubmitting}
                    >
                      <Images className="mr-2 h-4 w-4" />
                      Select from Gallery
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="back" className="space-y-4">
                  <div className="flex flex-col items-center justify-center">
                    {backImage ? (
                      <div className="relative w-full max-w-md h-64 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                        <Image
                          src={backImage}
                          alt="Back view"
                          fill
                          className="object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage('back')}
                          className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full max-w-md h-64 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-slate-400" />
                        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                          No back image uploaded
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                    <label className="cursor-pointer">
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'back')}
                        disabled={isSubmitting}
                        id="backImageInput"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
                        disabled={isSubmitting}
                        onClick={() => document.getElementById('backImageInput')?.click()}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Upload Image
                      </Button>
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
                      onClick={() => {
                        setActiveImageType('back');
                        loadGalleryImages();
                        setShowGalleryDialog(true);
                      }}
                      disabled={isSubmitting}
                    >
                      <Images className="mr-2 h-4 w-4" />
                      Select from Gallery
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="gallery" className="space-y-4">
                  {galleryImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {galleryImages.map((url, index) => (
                        <div 
                          key={index} 
                          className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                        >
                          <Image
                            src={url}
                            alt={`Gallery image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage('gallery', index)}
                            className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                            title="Remove image"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-64 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center">
                      <Images className="h-16 w-16 text-slate-400" />
                      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                        No gallery images added yet
                      </p>
                    </div>
                  )}
                  <div className="flex justify-center gap-2 mt-4">
                    <label className="cursor-pointer">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'gallery')}
                        disabled={isSubmitting}
                        id="galleryImageInput"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
                        disabled={isSubmitting}
                        onClick={() => document.getElementById('galleryImageInput')?.click()}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Images
                      </Button>
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
                      onClick={() => {
                        setActiveImageType('gallery');
                        loadGalleryImages();
                        setShowGalleryDialog(true);
                      }}
                      disabled={isSubmitting}
                    >
                      <Images className="mr-2 h-4 w-4" />
                      Select from Gallery
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                <span className="text-red-500">*</span> Required fields
              </p>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* Gallery Selection Dialog */}
      <Dialog open={showGalleryDialog} onOpenChange={setShowGalleryDialog}>
        <DialogContent className="w-[95vw] max-w-[800px] max-h-[80vh] overflow-y-auto backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200/60 dark:border-slate-700/60 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Select {activeImageType === 'gallery' ? 'Images' : 'Image'} from Gallery
            </DialogTitle>
          </DialogHeader>
          
          {/* Search input */}
          <div className="relative flex mb-4">
            <Input
              placeholder="Search images..."
              className="w-full pl-8 backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <ImageIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
          </div>
          
          {galleryLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
              <span className="ml-2">Loading images...</span>
            </div>
          ) : filteredGalleryImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto py-2">
              {filteredGalleryImages.map((image) => (
                <div 
                  key={image.id} 
                  className={`relative group aspect-square rounded-lg overflow-hidden border cursor-pointer transition-all duration-200 ${
                    selectedGalleryImages.has(image.id) 
                      ? 'ring-2 ring-blue-500 border-blue-500' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                  }`}
                  onClick={() => toggleImageSelection(image.id)}
                >
                  <Image
                    src={image.url}
                    alt={image.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    className="object-cover"
                  />
                  
                  {/* Selection indicator */}
                  <div
                    className={`absolute inset-0 bg-blue-500 bg-opacity-10 flex items-center justify-center ${
                      selectedGalleryImages.has(image.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                    }`}
                  >
                    {selectedGalleryImages.has(image.id) && (
                      <div className="bg-blue-500 text-white rounded-full p-2">
                        <Check className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">No images found</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {searchQuery ? 'Try a different search term' : 'Upload some images first'}
              </p>
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowGalleryDialog(false);
                setSelectedGalleryImages(new Set());
              }}
              className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSelectGalleryImages}
              disabled={selectedGalleryImages.size === 0}
              className="bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-violet-600 transition-all duration-300 hover:scale-105"
            >
              {activeImageType === 'gallery' 
                ? `Add ${selectedGalleryImages.size} Image${selectedGalleryImages.size !== 1 ? 's' : ''}` 
                : 'Select Image'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}