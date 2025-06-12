"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

const data = [
  { name: "Jan", total: 1200 },
  { name: "Feb", total: 2800 },
  { name: "Mar", total: 3600 },
  { name: "Apr", total: 4900 },
  { name: "May", total: 5700 },
  { name: "Jun", total: 7200 },
  { name: "Jul", total: 8500 },
  { name: "Aug", total: 9300 },
  { name: "Sep", total: 11000 },
  { name: "Oct", total: 13500 },
  { name: "Nov", total: 15800 },
  { name: "Dec", total: 18900 },
]

export function Overview() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === "dark"

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Find the month index for gradient color matching
      const monthIndex = data.findIndex(item => item.name === label);
      
      // Set gradient for the tooltip title background
      const gradientColors = monthIndex > -1 ? {
        from: monthIndex < 6 ? "from-blue-500" : "from-indigo-500",
        to: monthIndex < 6 ? "to-indigo-500" : "to-violet-500"
      } : { from: "from-blue-500", to: "to-violet-500" };
      
      // Calculate percent increase from first month
      const percentIncrease = data[0].total > 0 
        ? Math.round(((payload[0].value - data[0].total) / data[0].total) * 100) 
        : 0;
      
      return (
        <div className="backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-slate-700/60 p-0 rounded-xl shadow-lg overflow-hidden">
          <div className={`bg-gradient-to-r ${gradientColors.from} ${gradientColors.to} px-4 py-2`}>
            <p className="text-sm font-bold text-white">{label}</p>
          </div>
          <div className="p-3 space-y-1">
            <p className="text-base font-bold text-slate-900 dark:text-slate-100">
              ${payload[0].value.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {percentIncrease > 0 ? `+${percentIncrease}%` : `${percentIncrease}%`}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                from January
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="relative">
      {/* Decorative elements */}
      <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-indigo-300/20 dark:from-blue-900/10 dark:to-indigo-800/10 rounded-full blur-xl z-0"></div>
      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-indigo-300/20 to-violet-300/20 dark:from-indigo-800/10 dark:to-violet-800/10 rounded-full blur-xl z-0"></div>
      
      <ResponsiveContainer width="100%" height={350} className="z-10 relative">
        <BarChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          className="animate-fade-in"
        >
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={isDark ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)"} />
              <stop offset="100%" stopColor={isDark ? "rgb(167, 139, 250)" : "rgb(139, 92, 246)"} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            stroke={isDark ? "rgb(148 163 184)" : "rgb(100 116 139)"} // slate-400 : slate-500
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fontFamily: "Inter, system-ui, sans-serif" }}
          />
          <YAxis
            stroke={isDark ? "rgb(148 163 184)" : "rgb(100 116 139)"} // slate-400 : slate-500
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `$${value.toLocaleString()}`}
            tick={{ fontFamily: "Inter, system-ui, sans-serif" }}
          />
          <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 20 }} />
        <Bar 
          dataKey="total" 
          radius={[8, 8, 0, 0]} 
          fill={isDark ? "rgb(96 165 250)" : "rgb(59 130 246)"}
          barSize={36}
          animationDuration={1500}
          animationEasing="ease-in-out"
        >
          {data.map((entry, index) => {
            // Create a gradient effect from blue to purple based on the month index
            const colorIntensity = (index / (data.length - 1)) * 100;
            const fillColor = isDark 
              ? `rgb(${Math.max(96 - index * 2, 79)}, ${Math.min(165 + index * 3, 190)}, ${250 - index * 4 + (index > 6 ? 20 : 0)})`
              : `rgb(${Math.max(59 - index * 2, 45)}, ${Math.min(130 + index * 4, 170)}, ${246 - index * 4 + (index > 6 ? 15 : 0)})`;
              
            return (
              <Cell
                key={`cell-${index}`}
                fill={fillColor}
                className="hover:opacity-90 hover:brightness-110 transition-all duration-300"
                style={{
                  filter: `drop-shadow(0 4px 6px rgba(${isDark ? '0, 0, 30, 0.3' : '0, 0, 0, 0.1'}))`
                }}
              />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    
    {/* Legend */}
    <div className="flex justify-center items-center mt-4 text-sm text-slate-600 dark:text-slate-400">
      <div className="flex items-center gap-2 mx-2">
        <span className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-400"></span>
        <span>Beginning of Year</span>
      </div>
      <div className="w-6 h-0.5 bg-slate-200 dark:bg-slate-700"></div>
      <div className="flex items-center gap-2 mx-2">
        <span className="h-3 w-3 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"></span>
        <span>End of Year</span>
      </div>
    </div>
    </div>
  )
}
