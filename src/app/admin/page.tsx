"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  UserPlus, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2,
  UserCog,
  AlertTriangle
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"

const adminFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
role: z.enum(["super_admin", "sub_admin"]).default("super_admin"),
  permissions: z.array(z.string()).optional(),
});

// Define admin type for the list view
type Admin = {
  _id: string;
  name: string;
  email: string;
  role: 'super_admin';
  status?: 'active' | 'inactive';
  permissions?: string[];
  lastLogin?: string | null;
  createdAt: string;
  updatedAt?: string;
};

type FormValues = z.infer<typeof adminFormSchema>;

type AdminFormValues = Omit<FormValues, 'role'> & {
  role?: "super_admin" | "sub_admin";
};

export default function AdminPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewAdminForm, setShowNewAdminForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<string | null>(null);
  
  // Function to fetch admins
  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      setAdmins([]); // Clear any existing data
      
      const response = await fetch("/api/admins");
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Failed to fetch admins");
      
      // Update admins state with data from the API
      if (data.admins && Array.isArray(data.admins)) {
        setAdmins(data.admins);
      } else {
        console.error("Unexpected API response format:", data);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast({
        title: "Error",
        description: "Failed to load admin accounts.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch admins on component mount
  useEffect(() => {
    fetchAdmins();
  }, []);
  
const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "super_admin",
      permissions: [],
    },
  });
  
async function onSubmit(values: AdminFormValues) {
    try {
      setIsSubmitting(true);
      
      const adminData = {
        ...values,
      };
      
      const response = await fetch("/api/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adminData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error("API Error:", data);
        throw new Error(data.error || "Failed to create admin");
      }
      
      toast({
        title: "Admin Created",
        description: "New admin account has been created successfully.",
      });
      
      // Reset form and hide it
      form.reset();
      setShowNewAdminForm(false);
      
      // Add the new admin to the list with data from the API
      if (data.admin) {
        setAdmins(prev => [...prev, data.admin]);
      } else {
        // If the API doesn't return the admin object, refetch all admins
        fetchAdmins();
      }
      
    } catch (error: any) {
      console.error("Error creating admin:", error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to create admin account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  function showDeleteConfirmation(id: string) {
    setAdminToDelete(id);
    setDeleteDialogOpen(true);
  }
  
  async function handleDeleteAdmin() {
    if (!adminToDelete) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/admins/${adminToDelete}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Don't throw error, just show toast with the error message
        toast({
          title: "Cannot Delete Admin",
          description: data.error || "Failed to delete admin. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Remove the admin from the list
      setAdmins(admins.filter(admin => admin._id !== adminToDelete));
      
      toast({
        title: "Admin Deleted",
        description: "Admin account has been deleted successfully.",
      });
    } catch (error: any) {
      // Handle unexpected errors
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setAdminToDelete(null);
    }
  }
  
  function handleEditAdmin(id: string) {
    router.push(`/admin/edit/${id}`);
  }
  
  return (
    <div className="flex-1 space-y-6 p-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-white min-h-screen">
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-violet-500" />
              Confirm Admin Deletion
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete this admin account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAdmin}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium shadow-lg hover:shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-800 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Deleting...
                </>
              ) : (
                "Confirm Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Admin Management</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage administrator accounts
          </p>
        </div>
        <Button
          onClick={() => setShowNewAdminForm(!showNewAdminForm)}
          className="bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-violet-600 transition-all duration-300 hover:scale-105"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {showNewAdminForm ? "Cancel" : "Add New Admin"}
        </Button>
      </div>
      
      {/* Admin List */}
      {!showNewAdminForm && (
        <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-0 hover:scale-[1.01] hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <UserCog className="h-5 w-5" />
              Admin Accounts
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Manage existing admin accounts for your system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                  <TableRow className="hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                    <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Name</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Email</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Role</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Created</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300 font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 dark:border-violet-500 border-t-transparent" />
                          <p className="text-slate-500 dark:text-slate-400">Loading admins...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : admins.length === 0 ? (
                    <TableRow className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <TableCell colSpan={5} className="text-center text-slate-500 dark:text-slate-400 py-8">
                        No admin accounts found. Click "Add New Admin" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    admins.map((admin) => (
                      <TableRow key={admin._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 hover:scale-[1.01] transition-all duration-200">
                        <TableCell className="font-medium text-slate-900 dark:text-white">{admin.name}</TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-300">{admin.email}</TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-300">
                          {admin.role === 'super_admin' ? 'Super Admin' : ''}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-300">
                          {new Date(admin.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditAdmin(admin._id)}
                              className="bg-transparent border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 transition-all duration-200 hover:scale-105"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => showDeleteConfirmation(admin._id)}
                              className="bg-transparent border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-all duration-200 hover:scale-105"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* New Admin Form */}
      {showNewAdminForm && (
        <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-0 hover:scale-[1.01] hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <UserPlus className="h-5 w-5" />
              Create New Admin
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Fill out the information below to create a new admin account.
              All fields are required unless marked as optional.
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
                              placeholder="Enter secure password" 
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
                          Must be at least 8 characters
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
                    onClick={() => setShowNewAdminForm(false)}
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
                        Creating...
                      </>
                    ) : (
                      "Create Admin"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
