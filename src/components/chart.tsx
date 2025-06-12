"use client"

import { useEffect, useRef, useState } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type Chart as ChartInstance,
} from "chart.js"
import { Bar } from "react-chartjs-2"

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export function Chart({ data }: { data: any }) {
  const chartRef = useRef<ChartInstance<"bar"> | null>(null)
  const [chartHeight, setChartHeight] = useState(350)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [options, setOptions] = useState<ChartOptions<"bar"> | null>(null)

  // Detect dark mode and screen size
  useEffect(() => {
    const darkModeCheck = () => document.documentElement.classList.contains("dark")
    const smallScreenCheck = () => window.innerWidth < 640

    setIsDarkMode(darkModeCheck())
    setIsSmallScreen(smallScreenCheck())

    const handleResize = () => {
      const small = smallScreenCheck()
      setIsSmallScreen(small)
      setChartHeight(small ? 250 : 350)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    const observer = new MutationObserver(() => {
      setIsDarkMode(darkModeCheck())
      chartRef.current?.update()
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => {
      window.removeEventListener("resize", handleResize)
      observer.disconnect()
    }
  }, [])

  // Update chart options dynamically
  useEffect(() => {
    if (typeof window === "undefined") return

    setOptions({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: isDarkMode ? "rgb(248 250 252)" : "rgb(15 23 42)", // slate-50 : slate-900
            font: {
              size: isSmallScreen ? 10 : 12,
              family: "Inter, system-ui, sans-serif",
            },
            padding: 20,
          },
        },
        title: {
          display: false,
        },
        tooltip: {
          backgroundColor: isDarkMode ? "rgb(30 41 59)" : "rgb(255 255 255)", // slate-800 : white
          titleColor: isDarkMode ? "rgb(248 250 252)" : "rgb(15 23 42)", // slate-50 : slate-900
          bodyColor: isDarkMode ? "rgb(148 163 184)" : "rgb(100 116 139)", // slate-400 : slate-500
          borderColor: isDarkMode ? "rgb(51 65 85)" : "rgb(226 232 240)", // slate-600 : slate-200
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: isDarkMode ? "rgb(148 163 184)" : "rgb(100 116 139)", // slate-400 : slate-500
            font: {
              size: isSmallScreen ? 10 : 12,
              family: "Inter, system-ui, sans-serif",
            },
            maxRotation: isSmallScreen ? 45 : 0,
            padding: 8,
          },
          border: {
            display: false,
          },
        },
        y: {
          grid: {
            color: isDarkMode ? "rgba(51, 65, 85, 0.3)" : "rgba(226, 232, 240, 0.5)", // slate-600/30 : slate-200/50
            lineWidth: 1,
          },
          ticks: {
            color: isDarkMode ? "rgb(148 163 184)" : "rgb(100 116 139)", // slate-400 : slate-500
            font: {
              size: isSmallScreen ? 10 : 12,
              family: "Inter, system-ui, sans-serif",
            },
            padding: 8,
            callback: (value) => "PKR " + value.toLocaleString(),
          },
          border: {
            display: false,
          },
        },
      },
      elements: {
        bar: {
          borderRadius: 6,
          borderSkipped: false,
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
    })
  }, [isDarkMode, isSmallScreen])

  if (!options) return null

  // Update data with modern gradient colors
  const updatedData = {
    ...data,
    datasets: data.datasets.map((dataset: any) => ({
      ...dataset,
      backgroundColor: isDarkMode ? "rgba(96, 165, 250, 0.8)" : "rgba(59, 130, 246, 0.8)", // blue-400/80 : blue-500/80
      borderColor: isDarkMode ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)", // blue-400 : blue-500
      borderWidth: 2,
      hoverBackgroundColor: isDarkMode ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)", // blue-400 : blue-500
      hoverBorderColor: isDarkMode ? "rgb(147, 197, 253)" : "rgb(99, 102, 241)", // blue-300 : indigo-500
    })),
  }

  return (
    <div
      className="w-full p-4 rounded-lg backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60"
      style={{ height: chartHeight }}
    >
      <Bar ref={chartRef} options={options} data={updatedData} />
    </div>
  )
}
