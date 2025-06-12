"use client"

import React from "react"

import { useState, useEffect } from "react"
import {
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  RefreshCw,
  Package,
  Truck,
  CheckCircle,
  Clock,
  FileSpreadsheet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

// Type for order list
interface OrderForList {
  id: string;
  customer: string;
  email: string;
  total: string;
  status: string;
  date: string;
  items: number;
  products: string[];
}

const statusConfig = {
  pending: {
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700",
    icon: Clock,
  },
  processing: {
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-700",
    icon: Package,
  },
  shipped: {
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-700",
    icon: Truck,
  },
  delivered: {
    color:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700",
    icon: CheckCircle,
  },
  cancelled: {
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-700",
    icon: Trash2,
  },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderForList[]>([])
  const [filteredOrders, setFilteredOrders] = useState<OrderForList[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderForList | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddOrder, setShowAddOrder] = useState(false)
  const [newOrder, setNewOrder] = useState({
    customer: "",
    email: "",
    total: "",
    status: "pending",
    items: 0,
    products: []
  })
  
  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/orders')
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }
        
        const data = await response.json()
        setOrders(data)
        setFilteredOrders(data)
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError('Failed to load orders')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchOrders()
  }, [])

  const handleSearch = (e:any) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.trim() === "") {
      setFilteredOrders(orders)
    } else {
      const filtered = orders.filter(
        (order) =>
          order.id.toLowerCase().includes(query.toLowerCase()) ||
          order.customer.toLowerCase().includes(query.toLowerCase()) ||
          order.email.toLowerCase().includes(query.toLowerCase()) ||
          order.status.toLowerCase().includes(query.toLowerCase()),
      )
      setFilteredOrders(filtered)
    }
  }

  const handleViewOrder = (order:any) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const handleDeleteOrder = (order:any) => {
    setSelectedOrder(order)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!selectedOrder) return
    
    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete order');
      }
      
      // Update local state after successful API call
      setOrders(orders.filter((o) => o.id !== selectedOrder.id));
      setFilteredOrders(filteredOrders.filter((o) => o.id !== selectedOrder.id));
      setShowDeleteConfirm(false);
      
      toast({
        title: "Order Deleted",
        description: `Order ${selectedOrder.id} has been removed.`,
      });
    } catch (err) {
      console.error('Error deleting order:', err);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the order. Please try again.",
        variant: "destructive",
      });
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      // Update local state after successful API call
      const updatedOrders = orders.map((order) => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      
      setOrders(updatedOrders);
      setFilteredOrders(
        filteredOrders.map((order) => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      toast({
        title: "Order Updated",
        description: `Order ${orderId} status changed to ${newStatus}.`,
      });
    } catch (err) {
      console.error('Error updating order status:', err);
      toast({
        title: "Update Failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    }
  }

  const exportToExcel = () => {
    setIsExporting(true)

    // Simulate export process
    setTimeout(() => {
      // Create CSV content
      const headers = ["Order ID", "Customer", "Email", "Date", "Status", "Total", "Items"]
      const csvContent = [
        headers.join(","),
        ...filteredOrders.map((order) =>
          [order.id, `"${order.customer}"`, order.email, order.date, order.status, order.total, order.items].join(","),
        ),
      ].join("\n")

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `orders_export_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setIsExporting(false)
      toast({
        title: "Export Successful",
        description: `${filteredOrders.length} orders exported to CSV file.`,
      })
    }, 2000)
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Orders
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage and track customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-violet-600 transition-all duration-300 hover:scale-105"
            onClick={() => setShowAddOrder(true)}
          >
            <Package className="mr-2 h-4 w-4" />
            Add Order
          </Button>
          <Button
            onClick={exportToExcel}
            disabled={isExporting}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 hover:scale-105 disabled:opacity-50"
          >
            {isExporting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Exporting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Export to Excel
              </div>
            )}
          </Button>
        </div>
      </div>

      <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-0 hover:scale-[1.01] hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="grid gap-2">
            <CardTitle className="text-slate-900 dark:text-slate-100">Order Management</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Track and manage customer orders.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 ml-auto">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
              <Input
                placeholder="Search orders..."
                className="w-full pl-8 backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSearchQuery("")}
              className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-105"
              title="Reset search"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                <TableRow className="hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Order ID</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Customer</TableHead>
                  <TableHead className="hidden md:table-cell text-slate-700 dark:text-slate-300 font-semibold">
                    Date
                  </TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Total</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Status</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading state
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                        <div className="text-slate-600 dark:text-slate-400">Loading orders...</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  // Error state
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <RefreshCw className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>{error}</div>
                        <Button 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => window.location.reload()}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Retry
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const StatusIcon = (statusConfig as Record<string, typeof statusConfig[keyof typeof statusConfig]>)[order.status]?.icon || Clock
                    return (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer transition-all duration-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 hover:scale-[1.01]"
                        onClick={() => handleViewOrder(order)}
                      >
                        <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                          <Link
                            href={`/orders/${order.id}`}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {order.id}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">{order.customer}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">{order.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-slate-600 dark:text-slate-400">
                          {order.date}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                          {order.total}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${(statusConfig as Record<string, typeof statusConfig[keyof typeof statusConfig]>)[order.status as keyof typeof statusConfig]?.color} capitalize flex items-center gap-1 w-fit`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200/60 dark:border-slate-700/60 shadow-lg"
                            >
                              <DropdownMenuItem
                                className="cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors duration-200"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleViewOrder(order)
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                              {order.status === "pending" && (
                                <DropdownMenuItem
                                  className="cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors duration-200"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateOrderStatus(order.id, "processing")
                                  }}
                                >
                                  <Package className="mr-2 h-4 w-4" />
                                  Mark as Processing
                                </DropdownMenuItem>
                              )}
                              {order.status === "processing" && (
                                <DropdownMenuItem
                                  className="cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors duration-200"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateOrderStatus(order.id, "shipped")
                                  }}
                                >
                                  <Truck className="mr-2 h-4 w-4" />
                                  Mark as Shipped
                                </DropdownMenuItem>
                              )}
                              {order.status === "shipped" && (
                                <DropdownMenuItem
                                  className="cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors duration-200"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateOrderStatus(order.id, "delivered")
                                  }}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Mark as Delivered
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteOrder(order)
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                        {searchQuery.trim() !== "" ? (
                          <>
                            <Search className="h-8 w-8 mb-2 opacity-50" />
                            <p>No orders found matching "{searchQuery}"</p>
                            <Button
                              variant="link"
                              onClick={() => {
                                setSearchQuery("");
                                setFilteredOrders(orders);
                              }}
                              className="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Clear search
                            </Button>
                          </>
                        ) : (
                          <>
                            <Package className="h-8 w-8 mb-2 opacity-50" />
                            <p>No orders found</p>
                            <Button
                              variant="outline"
                              className="mt-4"
                              onClick={() => window.location.href = "/api/orders/init"}
                            >
                              Initialize Sample Orders
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
          <DialogContent className="w-[95vw] max-w-[600px] h-[80vh] overflow-y-auto backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200/60 dark:border-slate-700/60 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">Order Details</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Order ID</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{(selectedOrder as any).id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</p>
                  <Badge
                    className={`${(statusConfig as Record<string, { color: string; icon: React.ComponentType }>)?.[(selectedOrder as any).status]?.color} capitalize flex items-center gap-1 w-fit`}
                  >
                    {React.createElement(
                      (statusConfig as {
                        [key: string]: { color: string; icon: React.ForwardRefExoticComponent<Omit<any, "ref"> & React.RefAttributes<SVGSVGElement>> };
                      })[(selectedOrder as { status: string }).status]?.icon || Clock,
                      { className: "h-3 w-3" }
                    )}
                    {(selectedOrder as any).status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Customer</p>
                  <p className="text-slate-900 dark:text-slate-100">{(selectedOrder as any).customer}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{(selectedOrder as any).email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Order Date</p>
                  <p className="text-slate-900 dark:text-slate-100">{(selectedOrder as any).date}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Amount</p>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-lg">{(selectedOrder as any).total}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Items</p>
                  <p className="text-slate-900 dark:text-slate-100">{(selectedOrder as any).items} item(s)</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Products</h3>
                <div className="space-y-2">
                  {(selectedOrder as { products: string[] }).products.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-700/70 transition-all duration-200"
                    >
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center mr-3">
                        <Package className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{product}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowOrderDetails(false)}
                className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedOrder && (
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200/60 dark:border-slate-700/60 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-red-600">Confirm Deletion</DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Are you sure you want to delete order{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">{(selectedOrder as any).id}</span>? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white transition-all duration-300 hover:scale-105"
              >
                Delete Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Order Dialog */}
      <Dialog open={showAddOrder} onOpenChange={setShowAddOrder}>
        <DialogContent className="backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200/60 dark:border-slate-700/60 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">Add New Order</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Create a new customer order
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Customer Name</Label>
              <Input
                value={newOrder.customer}
                onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
                className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Customer Email</Label>
              <Input
                value={newOrder.email}
                onChange={(e) => setNewOrder({ ...newOrder, email: e.target.value })}
                className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Order Total</Label>
              <Input
                value={newOrder.total}
                onChange={(e) => setNewOrder({ ...newOrder, total: e.target.value })}
                className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                placeholder="PKR 0.00"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</Label>
              <Select
                value={newOrder.status}
                onValueChange={(value) => setNewOrder({ ...newOrder, status: value })}
              >
                <SelectTrigger className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200/60 dark:border-slate-700/60">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddOrder(false)}
              className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Implement add order logic here
                toast({
                  title: "Feature Coming Soon",
                  description: "Adding orders will be available in the next update.",
                });
                setShowAddOrder(false);
              }}
              className="bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:from-blue-600 hover:to-violet-600 transition-all duration-300 hover:scale-105"
            >
              Add Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
