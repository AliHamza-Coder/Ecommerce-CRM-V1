"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import ClientOnly from "./client-only"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <ClientOnly fallback={
      <Button
        variant="outline"
        size="icon"
        className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 shadow-sm"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] text-slate-400" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    }>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 hover:scale-105 shadow-sm hover:shadow-md"
      >
        {theme === "dark" ? (
          <Sun className="h-[1.2rem] w-[1.2rem] text-orange-500 hover:text-orange-400" />
        ) : (
          <Moon className="h-[1.2rem] w-[1.2rem] text-blue-500 hover:text-blue-400" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </ClientOnly>
  )
}
