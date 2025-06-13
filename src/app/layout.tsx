"use client"; // ✅ MUST be first!

import { usePathname } from "next/navigation";
import { SidebarNav } from "@/components/sidebar-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/user-nav";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { MongoDBCheck } from "@/components/mongodb-check";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            {({ loading, isAuthenticated }) => (
              <>
                <MongoDBCheck />
                {loading ? (
                  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 dark:border-violet-500 border-t-transparent"></div>
                      <p className="text-slate-600 dark:text-slate-400">Authenticating...</p>
                    </div>
                  </div>
                ) : !isAuthenticated && !isLoginPage ? (
                  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 dark:border-violet-500 border-t-transparent"></div>
                      <p className="text-slate-600 dark:text-slate-400">Redirecting to login...</p>
                    </div>
                  </div>
                ) : isLoginPage ? (
                  children
                ) : (
                  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                    <SidebarNav />
                    <div className="md:pl-[260px] lg:pl-[300px]">
                      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-4 md:px-6 border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                        <div className="flex-1">
                          {/* Left side of header - can add title or breadcrumbs here */}
                        </div>
                        <div className="flex items-center gap-4">
                          <UserNav />
                          <ModeToggle />
                        </div>
                      </header>
                      <main className="min-h-[calc(100vh-4rem)]">
                        {children}
                      </main>
                    </div>
                  </div>
                )}
                <Toaster />
              </>
            )}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
