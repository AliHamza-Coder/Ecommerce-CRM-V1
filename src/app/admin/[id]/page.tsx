"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, Shield, Clock, User, Mail, CheckCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Admin {
  _id: string
  name: string
  email: string
  role: string
  permissions: string[]
  active: boolean
  lastLogin?: string | Date | null
  createdAt: string | Date
  updatedAt: string | Date
}

export default function AdminDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`/api/admins/${params.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Admin not found")
            return
          }
          throw new Error("Failed to fetch admin details")
        }
        
        const data = await response.json()
        setAdmin(data)
      } catch (err: any) {
        console.error("Error fetching admin:", err)
        setError(err.message || "Failed to load admin details")
      } finally {
        setIsLoading(false)
      }
    }
    
    if (params.id) {
      fetchAdmin()
    }
  }, [params.id])
  
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "Never"
    const d = new Date(date)
    return d.toLocaleString()
  }
  
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admins/${params.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete admin")
      }
      
      toast({
        title: "Admin Deleted",
        description: "Admin has been successfully deleted",
      })
      
      router.push('/admin')
    } catch (err: any) {
      console.error("Error deleting admin:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to delete admin",
        variant: "destructive",
      })
    } finally {
      setShowDeleteConfirm(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading admin details...</p>
        </div>
      </div>
    )
  }
  
  if (error || !admin) {
    return (
      <div className="flex-1 p-8">
        <Button variant="outline" onClick={() => router.push('/admin')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admins
        </Button>
        
        <Card>
          <CardContent className="p-8 flex flex-col items-center">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Admin Not Found</h2>
            <p className="text-muted-foreground mb-6">{error || "The requested admin could not be found"}</p>
            <Button onClick={() => router.push('/admin')}>
              Return to Admin List
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-white animate-fade-in">
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200/60 dark:border-slate-700/60">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete this admin account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This will permanently remove <span className="font-medium text-slate-900 dark:text-white">{admin.name}</span> from the system.
              {admin.role === 'super_admin' && (
                <span className="mt-2 block text-amber-600 dark:text-amber-400 font-medium">
                  Warning: You are deleting a Super Admin account.
                </span>
              )}
            </p>
          </div>
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white transition-all duration-300"
            >
              Delete Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Details</h1>
            <p className="text-muted-foreground">
              View and manage admin account information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.push(`/admin/${admin._id}/edit`)}
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Edit Admin</span>
            <span className="sm:hidden">Edit</span>
          </Button>
          <Button
            variant="destructive"
            className="flex items-center gap-2"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete Admin</span>
            <span className="sm:hidden">Delete</span>
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Admin Information */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Admin Information
            </CardTitle>
            <CardDescription>
              Detailed information about this admin account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="font-medium">{admin.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                  <p className="font-medium">{admin.email}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={
                    admin.active 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }>
                    {admin.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                  <p className="text-sm">{formatDate(admin.lastLogin)}</p>
                </div>
              </div>
            </div>
            
            {/* Permissions */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Permissions</h3>
              {admin.permissions && admin.permissions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {admin.permissions.map((permission, index) => (
                    <Badge key={index} variant="secondary">
                      {permission}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {admin.role === 'super_admin' 
                    ? 'Super Admin has all permissions by default' 
                    : 'No specific permissions assigned'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Activity and System Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Admin ID</p>
                <p className="text-xs font-mono bg-muted p-2 rounded">{admin._id}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Created On</p>
                <p className="text-sm">{formatDate(admin.createdAt)}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-sm">{formatDate(admin.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Login Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Last Active</p>
                  <p className="text-sm">{admin.lastLogin ? formatDate(admin.lastLogin) : 'Never'}</p>
                </div>
                
                <Separator />
                
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full text-sm">
                    View Login History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}