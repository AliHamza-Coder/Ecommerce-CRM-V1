'use client';

import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export function MongoDBCheck() {
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await fetch('/api/auth/check-config');
        const data = await response.json();
        
        if (!data.isConfigured) {
          toast({
            title: "Configuration Required",
            description: "Please add your MongoDB URI to the .env.local file. Example: MONGODB_URI=mongodb+srv://username:password@your-cluster.mongodb.net/?retryWrites=true&w=majority",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error checking MongoDB configuration:', error);
      }
    };

    checkConfig();
  }, []);

  return null;
} 