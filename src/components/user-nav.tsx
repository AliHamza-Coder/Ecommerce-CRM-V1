"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Mail, Shield } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function UserNav() {
  const { user } = useAuth()
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:scale-105 transition-all duration-200">
          <Avatar className="h-10 w-10 shadow-md">
            <AvatarImage src="/placeholder-user.jpg" alt={user?.name || '@user'} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200/60 dark:border-slate-700/60 shadow-lg"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-slate-900 dark:text-slate-100">
              {user?.name || 'User'}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Mail className="h-3 w-3" />
              <span>{user?.email || 'user@example.com'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Shield className="h-3 w-3" />
              <span className="capitalize">{user?.role?.replace('_', ' ') || 'User'}</span>
            </div>
          </div>
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
