"use client"

import { useEffect, useState } from "react"
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart } from "@/components/chart"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalRevenue: "$0",
    totalOrders: "0",
    totalProducts: "0",
    activeCustomers: "0",
  })
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string;
        borderColor: string;
        borderWidth: number;
        fill: boolean;
    }[];
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // AuthContext now handles the authentication check and redirects
    
    async function loadData() {
      try {
        // Use the new API endpoints
        const [statsResponse, chartResponse] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/dashboard/chart')
        ])
        
        if (!statsResponse.ok || !chartResponse.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        
        const statsData = await statsResponse.json()
        const chartDataResult = await chartResponse.json()
        
        setStats(statsData)
        setChartData(chartDataResult)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  const statsConfig = [
    {
      title: "Total Revenue",
      value: stats.totalRevenue,
      change: "+20.1% from last month",
      icon: DollarSign,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      change: "+19% from last month",
      icon: ShoppingCart,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50",
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      change: "+12 new products",
      icon: Package,
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50",
    },
    {
      title: "Total Sales",
      value: stats.activeCustomers,
      change: "+180 this week",
      icon: Users,
      color: "from-violet-500 to-violet-600",
      bgColor: "from-violet-50 to-violet-100 dark:from-violet-950/50 dark:to-violet-900/50",
    },
  ]

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-7">
          <div className="lg:col-span-4 h-96 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          <div className="lg:col-span-3 h-96 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
            <Activity className="h-4 w-4" />
            <span>Live data</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat, index) => (
          <Card
            key={index}
            className={`backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-0 bg-gradient-to-br ${stat.bgColor} hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">{stat.title}</CardTitle>
              <div
                className={`h-10 w-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110`}
              >
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{stat.value}</div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-600" />
                <p className="text-xs text-slate-600 dark:text-slate-400">{stat.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-0 hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Sales Overview</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Monthly sales overview for the current year
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">{chartData && <Chart data={chartData} />}</CardContent>
        </Card>

        <Card className="lg:col-span-3 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-0 hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Recent Activity</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Latest updates from your business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { action: "New order received", time: "2 minutes ago", color: "bg-blue-500" },
              { action: "Product updated", time: "5 minutes ago", color: "bg-emerald-500" },
              { action: "Customer registered", time: "10 minutes ago", color: "bg-violet-500" },
              { action: "Payment processed", time: "15 minutes ago", color: "bg-orange-500" },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-700/70 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              >
                <div className={`h-2 w-2 rounded-full ${activity.color} animate-pulse`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{activity.action}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}