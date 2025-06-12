"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { LockClosedIcon, EnvelopeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isConfigured, setIsConfigured] = useState(true)

  useEffect(() => {
    // Check if MongoDB URI is configured
    const checkConfiguration = async () => {
      try {
        const response = await fetch('/api/auth/check-config', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new TypeError("Response was not JSON");
        }

        const data = await response.json();
        setIsConfigured(data.isConfigured);
        
        if (!data.isConfigured) {
          toast({
            title: "Configuration Required",
            description: "Please add your MongoDB URI to the .env.local file. Example: MONGODB_URI=mongodb+srv://username:password@your-cluster.mongodb.net/?retryWrites=true&w=majority",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error checking configuration:', error);
        setIsConfigured(false);
        toast({
          title: "Configuration Error",
          description: "Unable to verify MongoDB configuration. Please check your server setup.",
          variant: "destructive",
        });
      }
    };
    
    checkConfiguration();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConfigured) {
      toast({
        title: "Configuration Required",
        description: "Please configure MongoDB URI before attempting to login",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Validate form data
      if (!formData.email || !formData.password) {
        toast({
          title: "Login failed",
          description: "Please fill in all fields",
          variant: "destructive",
        })
        return
      }

      // Use the login function from AuthContext
      const result = await login(formData.email, formData.password)
      
      if (result.success) {
        // Show success message
        toast({
          title: "Login successful",
          description: "Welcome back! Redirecting to dashboard...",
        })
      } else {
        // Handle login failure without throwing error to console
        let errorMessage = "Invalid email or password. Please try again."
        
        if (result.error) {
          if (result.error === 'Network or server error') {
            errorMessage = "Network error. Please check your connection."
          } else {
            errorMessage = result.error
          }
        }
        
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <div className="flex w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl">
        {/* Left side - brand imagery */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <div className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-6">
              <ShieldCheckIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">CRM By Ali Hamza</h1>
            <p className="text-white/80 text-lg">Professional Customer Relationship Management System</p>
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-white/80">Intuitive dashboards and analytics</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-white/80">Advanced customer management</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-white/80">Role-based security access</p>
            </div>
          </div>
          
          <div className="relative z-10">
            <p className="text-sm text-white/60 italic">"Streamlining business relationships for optimal growth."</p>
          </div>
        </div>
        
        {/* Right side - login form */}
        <div className="w-full md:w-1/2 bg-white dark:bg-slate-900 p-8 md:p-12">
          <div className="md:hidden text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-800 flex items-center justify-center shadow-lg">
                <ShieldCheckIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              CRM By Ali Hamza
            </h1>
          </div>
          
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome back</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Please sign in to access your dashboard
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">Email address</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                    className="pl-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">Password</Label>
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                    className="pl-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 dark:text-slate-400">
                  Remember me
                </label>
              </div>
              
              <Button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-800 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Signing in...
                  </>
                ) : (
                  "Sign in to Dashboard"
                )}
              </Button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                © 2025 CRM By Ali Hamza. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}