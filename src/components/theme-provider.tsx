"use client"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      defaultTheme="system"
      enableSystem={true}
      themes={["light", "dark", "system"]}
      attribute="class"
      disableTransitionOnChange={true}
      storageKey="dashboard-theme"
    >
      {children}
    </NextThemesProvider>
  )
}
