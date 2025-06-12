"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { 
  ArrowLeft, 
  UserCog,
  Eye, 
  EyeOff, 
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const editAdminFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }).optional().or(z.literal('')),
});

type FormValues = {
  name: string;
  email: string;
  password?: string;
};

export default function EditAdminPage() {
  const router = useRouter();
  const params = useParams();
  const adminId = params.id as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(editAdminFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  
  // Fetch admin data
  useEffect(() => {
    async function fetchAdmin() {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/admins/${adminId}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch admin details");
        }
        const adminData = await response.json();
        
        form.reset({
          name: adminData.name,
          email: adminData.email,
          password: "", // Don't pre-fill password
        });
      } catch (error: any) {
        console.error("Error fetching admin:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load admin details.",
          variant: "destructive",
        });
        router.push('/admin');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (adminId) {
      fetchAdmin();
    }
  }, [adminId, form, router]);
  
  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true);
      
      // If password is empty, remove it from the payload
      const adminData = {...values, role: "super_admin"};
      if (!adminData.password) {
        delete adminData.password;
      }
      
      const response = await fetch(`/api/admins/${adminId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adminData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to update admin");
      }
      
      toast({
        title: "Admin Updated",
        description: "Admin account has been updated successfully.",
      });
      
      router.push("/admin");
    } catch (error: any) {
      console.error("Error updating admin:", error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to update admin account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-white min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 dark:border-violet-500 border-t-transparent" />
      </div>
    );
  }
  
  return (
    <div className="flex-1 space-y-6 p-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-white min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push('/admin')}
          className="bg-transparent border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Edit Admin</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Update administrator account details
          </p>
        </div>
      </div>
      
      {/* Form */}
      <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-0 hover:scale-[1.01] hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
            <UserCog className="h-5 w-5" />
            Edit Admin Account
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Update the information below to edit this admin account.
            Leave password blank to keep the existing password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-900 dark:text-slate-300">Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter admin's full name" 
                          {...field} 
                          className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-900 dark:text-slate-300">Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="admin@example.com" 
                          {...field} 
                          className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        />
                      </FormControl>
                      <FormDescription className="text-slate-500 dark:text-slate-400">
                        This will be used for login and notifications
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-900 dark:text-slate-300">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password or leave blank" 
                            {...field} 
                            className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription className="text-slate-500 dark:text-slate-400">
                        Leave blank to keep the current password, or enter a new password (min 8 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                

              </div>
              
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin')}
                  className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-violet-600 transition-all duration-300 hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
