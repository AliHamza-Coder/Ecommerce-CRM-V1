"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, LogOut, Package, ShoppingCart, Users, Menu, Tag, Home, Shield, Image, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

const navigationItems = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/products", label: "Products", icon: Package },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/admin", label: "Admin", icon: Shield },
]

export function SidebarNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth() // Get logout function from auth context
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const [categoryColor, setCategoryColor] = useState("#3B82F6")

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleLogout = () => {
    // Call the logout function from auth context
    logout()
    
    // Display a toast notification
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: categoryName,
          color: categoryColor,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create category')
      }

      setShowCategoryForm(false)
      setCategoryName("")
      setCategoryColor("#3B82F6")

      toast({
        title: "Category Created",
        description: `${categoryName} has been added successfully.`,
      })
    } catch (error) {
      console.error('Error creating category:', error)
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      })
    }
  }

  const SidebarContent = ({ closeMenu }: { closeMenu: () => void }) => (
    <div className="flex h-full flex-col backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-r border-slate-200/60 dark:border-slate-800/60">
      <div className="space-y-6 py-8">
        <div className="px-6 py-2">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
              <Home className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Dashboard
            </h2>
          </div>

          <div className="space-y-4">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.href} href={item.href} onClick={closeMenu}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`w-full justify-start py-5 px-7 transition-all duration-300 hover:scale-[1.02] hover:cursor-pointer mb-4 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg font-medium hover:from-blue-600 hover:to-violet-600 hover:shadow-xl"
                        : "hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  >
                    <Icon className="mr-4 h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Button>
                </Link>
              )
            })}

            <div className="my-8 border-t border-slate-200/60 dark:border-slate-700/60"></div>

            <Link href="/gallery" onClick={closeMenu}>
              <Button
                variant="outline"
                size="sm"
                className={`w-full justify-start py-5 px-5 mb-4 transition-all duration-300 backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 hover:scale-[1.02] hover:shadow-md text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:cursor-pointer ${
                  pathname === "/gallery" ? "bg-blue-50 dark:bg-slate-700/60 text-blue-600 dark:text-blue-400" : ""
                }`}
              >
                <Image className="mr-4 h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Image Gallery</span>
              </Button>
            </Link>

            <Link href="/categories" onClick={closeMenu}>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start mb-4 py-5 px-5 transition-all duration-300 backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 hover:scale-[1.02] hover:shadow-md text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:cursor-pointer"
              >
                <Tag className="mr-4 h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Create Category</span>
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start py-5 px-5 transition-all duration-300 backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-red-200/60 dark:border-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20 hover:scale-[1.02] hover:shadow-md text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-4 h-5 w-5" />
              <span className="text-sm font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Hamburger Menu */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/90"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[300px] p-0 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200/60 dark:border-slate-700/60"
            >
              <SidebarContent
                closeMenu={() => (document.querySelector("[data-radix-collection-item]") as HTMLElement)?.click()}
              />
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed top-0 left-0 h-screen border-r border-slate-200/60 dark:border-slate-700/60 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 md:w-[260px] lg:w-[300px] z-30 shadow-lg">
        <SidebarContent closeMenu={() => {}} />
      </div>

      {/* Create Category Dialog */}
      <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
        <DialogContent className="w-[95vw] max-w-[425px] backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200/60 dark:border-slate-700/60 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Create New Category
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Category Name
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
                Category Color
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCategoryForm(false)}
              className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCategory}
              className="bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-violet-600 transition-all duration-300 hover:scale-105"
            >
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
