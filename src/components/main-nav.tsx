"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/orders", label: "Orders" },
    { href: "/gallery", label: "Gallery" },
    { href: "/products", label: "Products" },
    { href: "/customers", label: "Customers" },
  ]

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-all duration-200 hover:scale-105 px-3 py-2 rounded-lg",
            pathname === item.href
              ? "text-primary bg-primary/10 shadow-sm"
              : "text-muted-foreground hover:text-primary hover:bg-slate-100/50 dark:hover:bg-slate-800/50",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
