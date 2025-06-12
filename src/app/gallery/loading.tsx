import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function GalleryLoading() {
  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Gallery card skeleton */}
      <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-0">
        <CardHeader className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="grid gap-2">
            <CardTitle><Skeleton className="h-6 w-40" /></CardTitle>
            <CardDescription><Skeleton className="h-4 w-32" /></CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 ml-auto">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-10" />
          </div>
        </CardHeader>

        <CardContent>
          {/* Drop area skeleton */}
          <Skeleton className="w-full h-48 mb-6 rounded-lg" />

          {/* Grid skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array(15).fill(null).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}