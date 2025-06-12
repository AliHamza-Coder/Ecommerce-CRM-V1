"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, User, Mail, Phone, CreditCard, Trash2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Order, OrderShippingAddress } from "@/models/order"
import { ShippingAddressDialog } from "@/components/shipping-address-dialog"
import Image from "next/image"

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered';

const statusConfig: Record<OrderStatus, {
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
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
}

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [newStatus, setNewStatus] = useState<string | null>(null)
  const [showAddressDialog, setShowAddressDialog] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`/api/orders/${params.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Order not found')
          } else {
            setError('Failed to fetch order details')
          }
          return
        }
        
        const orderData = await response.json()
        setOrder(orderData)
      } catch (err) {
        console.error('Error fetching order:', err)
        setError('An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (params.id) {
      fetchOrder()
    }
  }, [params.id])

  const handleStatusChange = (status: string) => {
    setNewStatus(status);
    setShowStatusConfirm(true);
  };
  
  const handleAddressUpdate = async (shippingAddress: OrderShippingAddress) => {
    if (!order) return;
    
    try {
      // Update the order with the new shipping address
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          shippingAddress: {
            ...shippingAddress,
            shippingAddressId: order.shippingAddress.shippingAddressId
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order shipping address');
      }
      
      const result = await response.json();
      
      // Update local state with the updated order
      if (result.order) {
        setOrder(result.order);
      } else {
        // If the API doesn't return the updated order, update locally
        setOrder({ 
          ...order,
          shippingAddress: {
            ...shippingAddress,
            shippingAddressId: order.shippingAddress.shippingAddressId
          }
        });
      }
      
      toast({
        title: "Address Updated",
        description: `Shipping address for order ${order.id} has been updated.`,
      });
    } catch (err) {
      console.error('Error updating shipping address:', err);
      toast({
        title: "Update Failed",
        description: "Failed to update shipping address. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (newStatusToSet: string) => {
    if (!order) return;
    
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatusToSet }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      const result = await response.json();
      
      // Update local state with the updated order from the API
      if (result.order) {
        setOrder(result.order);
      } else {
        // If the API doesn't return the updated order, update locally
        setOrder({ 
          ...order, 
          status: newStatusToSet,
          timeline: [
            ...order.timeline,
            {
              status: `Order ${newStatusToSet}`,
              date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              completed: true
            }
          ]
        });
      }
      
      toast({
        title: "Order Updated",
        description: `Order ${order.id} status changed to ${newStatusToSet}.`,
      });
    } catch (err) {
      console.error('Error updating order status:', err);
      toast({
        title: "Update Failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    }

    setShowStatusConfirm(false);
    setNewStatus(null);
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="h-8 w-48 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-48 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-32 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-48 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!isLoading && (!order || error)) {
    return (
      <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
              <Package className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {error === 'Order not found' ? 'Order Not Found' : 'Error Loading Order'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {error ? error : 'The order you\'re looking for couldn\'t be found.'}
            </p>
            {error && error !== 'Order not found' && (
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!order) return null;

  const StatusIcon = statusConfig[order.status as OrderStatus]?.icon || Clock

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 animate-fade-in">
      {/* Status Change Confirmation Dialog */}
      <Dialog open={showStatusConfirm} onOpenChange={setShowStatusConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the order status from <span className="font-medium">{order?.status}</span> to <span className="font-medium">{newStatus}</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This will update the order timeline and notify relevant departments.
              {(order?.status === 'shipped' || order?.status === 'delivered') && newStatus && ['pending', 'processing'].includes(newStatus) && (
                <span className="mt-2 block text-amber-600 dark:text-amber-400 font-medium">
                  Warning: You are changing from a later stage ({order.status}) to an earlier stage ({newStatus}).
                </span>
              )}
            </p>
          </div>
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button
              variant="outline"
              onClick={() => setShowStatusConfirm(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => newStatus && updateOrderStatus(newStatus)}
              className={
                newStatus === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600' :
                newStatus === 'processing' ? 'bg-blue-500 hover:bg-blue-600' :
                newStatus === 'shipped' ? 'bg-purple-500 hover:bg-purple-600' :
                newStatus === 'delivered' ? 'bg-emerald-500 hover:bg-emerald-600' :
                ''
              }
            >
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Shipping Address Dialog */}
      <ShippingAddressDialog
        open={showAddressDialog}
        onOpenChange={setShowAddressDialog}
        onSave={handleAddressUpdate}
        initialAddress={order?.shippingAddress}
        title={order?.shippingAddress?.shippingAddressId ? "Edit Shipping Address" : "Save Shipping Address"}
        description={order?.shippingAddress?.shippingAddressId 
          ? "Update the shipping address details for this order" 
          : "Save this address to your address book for future orders"}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Order {order.id}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Placed on {order.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${statusConfig[order.status as OrderStatus]?.color} capitalize flex items-center gap-1`}>
            <StatusIcon className="h-3 w-3" />
            {order.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-0 hover:scale-[1.01] hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-700/70 transition-all duration-200"
                  >
                    <div className="h-20 w-20 rounded-lg overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                      {item.image ? (
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-slate-600 dark:text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">{item.name}</h3>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">SKU</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{item.sku || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Category</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{item.category || 'N/A'}</p>
                        </div>
                        {item.weight && (
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Weight</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{item.weight}</p>
                          </div>
                        )}
                        {item.dimensions && (
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Dimensions</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {item.dimensions.length} x {item.dimensions.width} x {item.dimensions.height}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{item.price}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Quantity: {item.quantity}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Total: PKR {(parseFloat(item.price.replace(/[^0-9.-]+/g, '')) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-0 hover:scale-[1.01] hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.timeline.map((event, index) => (
                    <div
                    key={index}
                    className={`flex items-start gap-4 p-4 rounded-lg ${
                        event.completed
                        ? "bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30"
                        : "bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/30"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      event.completed
                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                        : "bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-400"
                    }`}>
                      {event.completed ? (
                      <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-medium text-slate-900 dark:text-slate-100">{event.status}</h3>
                        <span className="text-sm text-slate-500 dark:text-slate-400">{event.date}</span>
                      </div>
                      {event.location && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          <MapPin className="h-3 w-3 inline-block mr-1" />
                          {event.location}
                        </p>
                      )}
                      {event.notes && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{event.notes}</p>
                      )}
                      {event.updatedBy && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Updated by: {event.updatedBy}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-0 hover:scale-[1.01] hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-900/30 dark:to-violet-900/30 flex items-center justify-center mt-1">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">{order.customer.name}</h3>
                    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {order.customer.company && (
                        <p className="font-medium">{order.customer.company}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        <a href={`mailto:${order.customer.email}`} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
                          {order.customer.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        <a href={`tel:${order.customer.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
                          {order.customer.phone}
                        </a>
                      </div>
                      {order.customer.taxId && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          <span>Tax ID: {order.customer.taxId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm mb-2">Shipping Address</h4>
                  <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                      <p className="font-medium">{order.shippingAddress.contactName || order.customer.name}</p>
                      <p>{order.shippingAddress.street}</p>
                      {order.shippingAddress.apartment && <p>Apt/Suite: {order.shippingAddress.apartment}</p>}
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                      
                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <h5 className="font-medium text-slate-900 dark:text-slate-100 text-sm">Contact Information</h5>
                        <div className="grid grid-cols-1 gap-1 mt-1">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            <span>{order.shippingAddress.contactPhone || order.customer.phone}</span>
                          </div>
                          {order.shippingAddress.contactEmail && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                              <span>{order.shippingAddress.contactEmail}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {order.shippingAddress.deliveryInstructions && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        <h5 className="font-medium text-slate-900 dark:text-slate-100 text-sm">Delivery Instructions</h5>
                          <p className="text-sm italic mt-1">{order.shippingAddress.deliveryInstructions}</p>
                        </div>
                      )}
                  </div>
                </div>
                
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    View on Map
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/30"
                    onClick={() => setShowAddressDialog(true)}
                  >
                    {order.shippingAddress.shippingAddressId ? "Edit Address" : "Save as Address"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-0 hover:scale-[1.01] hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Order ID</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{order.id}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Order Date</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{order.date}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Payment Method</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{order.paymentMethod}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Shipping Method</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{order.shippingMethod || 'Standard'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Subtotal</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{order.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Shipping</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{order.shipping}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Tax</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{order.tax}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-base font-medium text-slate-900 dark:text-slate-100">Total</span>
                      <span className="text-base font-bold text-slate-900 dark:text-slate-100">{order.total}</span>
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Order Notes</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{order.notes}</p>
                  </div>
                )}

                {order.metadata && (
                  <div className="pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Additional Information</h4>
                    <div className="space-y-2">
                      {order.metadata.source && (
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Source</span>
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{order.metadata.source}</span>
                        </div>
                      )}
                      {order.metadata.priority && (
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Priority</span>
                          <Badge
                            className={`${
                              order.metadata.priority === 'high'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : order.metadata.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            }`}
                          >
                            {order.metadata.priority}
                          </Badge>
                        </div>
                      )}
                      {order.metadata.tags && order.metadata.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {order.metadata.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                            >
                              {tag}
                            </Badge>
                          ))}
                </div>
                      )}
                </div>
              </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-0 hover:scale-[1.01] hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Order Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-slate-50/50 dark:bg-slate-800/50 p-3 rounded-lg">
                <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Change Order Status</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={order.status === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange("pending")}
                    className={order.status === "pending" ? 
                      "bg-yellow-500 hover:bg-yellow-600" : 
                      "hover:border-yellow-500 hover:text-yellow-600"}
                    disabled={order.status === "pending"}
                  >
                    <Clock className="mr-1 h-3 w-3" />
                    Pending
                  </Button>
                  
                  <Button
                    variant={order.status === "processing" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange("processing")}
                    className={order.status === "processing" ? 
                      "bg-blue-500 hover:bg-blue-600" : 
                      "hover:border-blue-500 hover:text-blue-600"}
                    disabled={order.status === "processing"}
                  >
                    <Package className="mr-1 h-3 w-3" />
                    Processing
                  </Button>
                  
                  <Button
                    variant={order.status === "shipped" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange("shipped")}
                    className={order.status === "shipped" ? 
                      "bg-purple-500 hover:bg-purple-600" : 
                      "hover:border-purple-500 hover:text-purple-600"}
                    disabled={order.status === "shipped"}
                  >
                    <Truck className="mr-1 h-3 w-3" />
                    Shipped
                  </Button>
                  
                  <Button
                    variant={order.status === "delivered" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange("delivered")}
                    className={order.status === "delivered" ? 
                      "bg-emerald-500 hover:bg-emerald-600" : 
                      "hover:border-emerald-500 hover:text-emerald-600"}
                    disabled={order.status === "delivered"}
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Delivered
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
              >
                Print Invoice
              </Button>
              
              <Button
                variant="outline"
                className="w-full backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
              >
                Send Email Update
              </Button>
              
              <Button
                variant="outline"
                className="w-full backdrop-blur-md bg-red-50/80 dark:bg-red-900/20 border-red-200/60 dark:border-red-800/40 hover:bg-red-100/80 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all duration-300"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Cancel Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
