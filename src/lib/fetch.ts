import { toast } from '@/hooks/use-toast'

export const fetchProducts = async (): Promise<any[]> => {
  try {
    const response = await fetch('/api/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
    
    if (!response.ok) {
      console.error(`Server returned ${response.status}: ${response.statusText}`)
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please try again later.",
        variant: "destructive"
      })
      return []
    }
    
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Network error:', error)
    toast({
      title: "Connection Error",
      description: "Please check your internet connection and try again.",
      variant: "destructive"
    })
    return []
  }
}

export const createProduct = async (data: FormData): Promise<void> => {
  try {
    console.log('Sending product creation request...');
    const response = await fetch('/api/products', {
      method: 'POST',
      body: data
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Server error response:', responseData);
      throw new Error(responseData.error || 'Failed to create product');
    }

    console.log('Product created successfully:', responseData);
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

export const updateProduct = async (data: FormData): Promise<void> => {
  try {
    console.log('Sending product update request...');
    const response = await fetch('/api/products', {
      method: 'PUT',
      body: data
    });

    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      console.error('Non-JSON response received:', await response.text());
      throw new Error('Server returned invalid response format');
    }

    if (!response.ok) {
      console.error('Server error response:', responseData);
      const errorMessage = responseData?.error || 'Failed to update product';
      throw new Error(errorMessage);
    }

    if (!responseData) {
      throw new Error('No response data received from server');
    }

    console.log('Product updated successfully:', responseData);
  } catch (error) {
    console.error('Error updating product:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while updating the product');
  }
}

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`/api/products?id=${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete product')
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}

// Gallery operations
export const fetchGalleryImages = async (): Promise<any[]> => {
  try {
    const response = await fetch('/api/gallery', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
    
    if (!response.ok) {
      console.error(`Server returned ${response.status}: ${response.statusText}`)
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please try again later.",
        variant: "destructive"
      })
      return []
    }
    
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Network error:', error)
    toast({
      title: "Connection Error",
      description: "Please check your internet connection and try again.",
      variant: "destructive"
    })
    return []
  }
}

export const createGalleryImage = async (data: FormData): Promise<any> => {
  try {
    console.log('Sending image creation request...');
    const response = await fetch('/api/gallery', {
      method: 'POST',
      body: data
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Server error response:', responseData);
      throw new Error(responseData.error || 'Failed to save image to gallery');
    }

    console.log('Image added to gallery successfully:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error adding image to gallery:', error);
    throw error;
  }
}

export const deleteGalleryImage = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`/api/gallery/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete image from gallery')
    }
  } catch (error) {
    console.error('Error deleting gallery image:', error)
    throw error
  }
}
