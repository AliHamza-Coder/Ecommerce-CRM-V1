"use client"

import { useState, useEffect } from "react"
import { Search, MoreHorizontal, Eye, Edit, Trash2, RefreshCw, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Order, OrderShippingAddress } from "@/models/order"

// Sample orders data
const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customer: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567"
    },
    status: "delivered",
    date: "2023-04-15",
    deliveryDate: "2023-04-20",
    total: "$825.40",
    subtotal: "$750.00",
    tax: "$60.00",
    shipping: "$15.40",
    paymentMethod: "credit_card",
    shippingMethod: "express",
    trackingNumber: "TRK12345678",
    shippingAddress: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "USA",
      contactName: "John Doe",
      contactPhone: "+1 (555) 123-4567",
      contactEmail: "john.doe@example.com"
    },
    items: [
      {
        id: 1,
        name: "Premium Headphones",
        price: "$299.99",
        quantity: 1,
        image: "/products/headphones.jpg"
      },
      {
        id: 2,
        name: "Wireless Mouse",
        price: "$49.99",
        quantity: 2,
        image: "/products/mouse.jpg"
      }
    ],
    timeline: [
      { status: "Order placed", date: "2023-04-15", completed: true },
      { status: "Processing", date: "2023-04-16", completed: true },
      { status: "Shipped", date: "2023-04-17", completed: true },
      { status: "Out for delivery", date: "2023-04-19", completed: true },
      { status: "Delivered", date: "2023-04-20", completed: true }
    ]
  },
  {
    id: "ORD-002",
    customer: {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+1 (555) 987-6543"
    },
    status: "processing",
    date: "2023-04-18",
    estimatedDelivery: "2023-04-25",
    total: "$1,256.75",
    subtotal: "$1,150.00",
    tax: "$92.00",
    shipping: "$14.75",
    paymentMethod: "paypal",
    shippingAddress: {
      street: "456 Park Ave",
      city: "Boston",
      state: "MA",
      zip: "02108",
      country: "USA",
      apartment: "Apt 7B",
      contactName: "Jane Smith",
      contactPhone: "+1 (555) 987-6543",
      contactEmail: "jane.smith@example.com"
    },
    items: [
      {
        id: 3,
        name: "Smart Watch",
        price: "$249.99",
        quantity: 1,
        image: "/products/watch.jpg"
      },
      {
        id: 4,
        name: "Laptop Stand",
        price: "$59.99",
        quantity: 1,
        image: "/products/laptop-stand.jpg"
      }
    ],
    timeline: [
      { status: "Order placed", date: "2023-04-18", completed: true },
      { status: "Processing", date: "2023-04-19", completed: true },
      { status: "Shipped", date: "2023-04-22", completed: false },
      { status: "Out for delivery", date: "", completed: false },
      { status: "Delivered", date: "", completed: false }
    ]
  },
  {
    id: "ORD-003",
    customer: {
      name: "Robert Johnson",
      email: "robert.j@example.com",
      phone: "+1 (555) 456-7890"
    },
    status: "shipped",
    date: "2023-04-10",
    estimatedDelivery: "2023-04-17",
    total: "$349.99",
    subtotal: "$329.99",
    tax: "$10.00",
    shipping: "$10.00",
    paymentMethod: "credit_card",
    shippingMethod: "standard",
    trackingNumber: "TRK98765432",
    shippingAddress: {
      street: "789 Oak St",
      city: "Chicago",
      state: "IL",
      zip: "60601",
      country: "USA",
      contactName: "Robert Johnson",
      contactPhone: "+1 (555) 456-7890",
      contactEmail: "robert.j@example.com",
      deliveryInstructions: "Leave package at front door"
    },
    items: [
      {
        id: 5,
        name: "Bluetooth Speaker",
        price: "$129.99",
        quantity: 1,
        image: "/products/speaker.jpg"
      }
    ],
    timeline: [
      { status: "Order placed", date: "2023-04-10", completed: true },
      { status: "Processing", date: "2023-04-11", completed: true },
      { status: "Shipped", date: "2023-04-13", completed: true },
      { status: "Out for delivery", date: "", completed: false },
      { status: "Delivered", date: "", completed: false }
    ]
  },
  {
    id: "ORD-004",
    customer: {
      name: "Emily Davis",
      email: "emily.d@example.com",
      phone: "+1 (555) 234-5678"
    },
    status: "delivered",
    date: "2023-04-05",
    deliveryDate: "2023-04-12",
    total: "$789.95",
    subtotal: "$729.95",
    tax: "$50.00",
    shipping: "$10.00",
    paymentMethod: "credit_card",
    shippingMethod: "standard",
    trackingNumber: "TRK45678901",
    shippingAddress: {
      street: "321 Pine St",
      city: "Seattle",
      state: "WA",
      zip: "98101",
      country: "USA",
      contactName: "Emily Davis",
      contactPhone: "+1 (555) 234-5678",
      contactEmail: "emily.d@example.com"
    },
    items: [
      {
        id: 6,
        name: "Tablet",
        price: "$399.99",
        quantity: 1,
        image: "/products/tablet.jpg"
      },
      {
        id: 7,
        name: "Screen Protector",
        price: "$19.99",
        quantity: 1,
        image: "/products/screen-protector.jpg"
      }
    ],
    timeline: [
      { status: "Order placed", date: "2023-04-05", completed: true },
      { status: "Processing", date: "2023-04-06", completed: true },
      { status: "Shipped", date: "2023-04-08", completed: true },
      { status: "Out for delivery", date: "2023-04-11", completed: true },
      { status: "Delivered", date: "2023-04-12", completed: true }
    ]
  },
  {
    id: "ORD-005",
    customer: {
      name: "Michael Wilson",
      email: "michael.w@example.com",
      phone: "+1 (555) 876-5432"
    },
    status: "cancelled",
    date: "2023-04-08",
    total: "$459.98",
    subtotal: "$419.98",
    tax: "$30.00",
    shipping: "$10.00",
    paymentMethod: "paypal",
    shippingAddress: {
      street: "555 Maple Ave",
      city: "San Francisco",
      state: "CA",
      zip: "94102",
      country: "USA",
      contactName: "Michael Wilson",
      contactPhone: "+1 (555) 876-5432",
      contactEmail: "michael.w@example.com"
    },
    items: [
      {
        id: 8,
        name: "Wireless Keyboard",
        price: "$79.99",
        quantity: 1,
        image: "/products/keyboard.jpg"
      }
    ],
    timeline: [
      { status: "Order placed", date: "2023-04-08", completed: true },
      { status: "Processing", date: "2023-04-09", completed: true },
      { status: "Cancelled", date: "2023-04-10", completed: true }
    ]
  },
  {
    id: "ORD-006",
    customer: {
      name: "Sarah Brown",
      email: "sarah.b@example.com",
      phone: "+1 (555) 345-6789"
    },
    status: "delivered",
    date: "2023-04-02",
    deliveryDate: "2023-04-09",
    total: "$1,029.97",
    subtotal: "$949.97",
    tax: "$70.00",
    shipping: "$10.00",
    paymentMethod: "credit_card",
    shippingMethod: "standard",
    trackingNumber: "TRK56789012",
    shippingAddress: {
      street: "777 Cedar Rd",
      city: "Miami",
      state: "FL",
      zip: "33101",
      country: "USA",
      contactName: "Sarah Brown",
      contactPhone: "+1 (555) 345-6789",
      contactEmail: "sarah.b@example.com"
    },
    items: [
      {
        id: 9,
        name: "Wireless Earbuds",
        price: "$159.99",
        quantity: 2,
        image: "/products/earbuds.jpg"
      }
    ],
    timeline: [
      { status: "Order placed", date: "2023-04-02", completed: true },
      { status: "Processing", date: "2023-04-03", completed: true },
      { status: "Shipped", date: "2023-04-05", completed: true },
      { status: "Out for delivery", date: "2023-04-08", completed: true },
      { status: "Delivered", date: "2023-04-09", completed: true }
    ]
  }
]

// Customer type derived from orders
type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: string[];
  orderIds: string[];
  totalSpent: string;
  lastOrder: string;
  address: OrderShippingAddress;
}

export default function CustomersPage() {
  // State for derived customers
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [isLoading, setIsLoading] = useState(true)
  
  // UI state
  const [searchQuery, setSearchQuery] = useState("")
  const [showCustomerDetails, setShowCustomerDetails] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditCustomer, setShowEditCustomer] = useState(false)
  const [editedCustomer, setEditedCustomer] = useState<Customer | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  
  // Generate customers from orders on component mount
  useEffect(() => {
    // This would be replaced with an API call in a real app
    // async function fetchOrders() {
    //   try {
    //     const response = await fetch('/api/orders');
    //     const data = await response.json();
    //     setOrders(data);
    //   } catch (error) {
    //     console.error('Error fetching orders:', error);
    //     toast({
    //       title: "Error",
    //       description: "Failed to load orders. Please try again.",
    //       variant: "destructive",
    //     });
    //   }
    // }
    
    // fetchOrders();
    generateCustomersFromOrders();
  }, []);
  
  // Function to generate customers from orders
  const generateCustomersFromOrders = () => {
    setIsLoading(true);
    
    const customerMap = new Map<string, Customer>();
    
    // Process each order to build customer data
    orders.forEach(order => {
      const email = order.customer.email;
      
      if (!customerMap.has(email)) {
        // Create new customer entry
        customerMap.set(email, {
          id: `CUST-${Math.random().toString(36).substring(2, 10)}`,
          name: order.customer.name,
          email: email,
          phone: order.customer.phone || '',
          orders: [order.id],
          orderIds: [order.id],
          totalSpent: order.total,
          lastOrder: order.date,
          address: order.shippingAddress
        });
      } else {
        // Update existing customer
        const existingCustomer = customerMap.get(email)!;
        
        // Add order ID if not already present
        if (!existingCustomer.orderIds.includes(order.id)) {
          existingCustomer.orderIds.push(order.id);
          existingCustomer.orders.push(order.id);
          
          // Parse and add total spent
          const existingTotal = parseFloat(existingCustomer.totalSpent.replace('$', '').replace(',', ''));
          const newTotal = parseFloat(order.total.replace('$', '').replace(',', ''));
          existingCustomer.totalSpent = `$${(existingTotal + newTotal).toFixed(2)}`;
          
          // Update last order date if newer
          const existingDate = new Date(existingCustomer.lastOrder);
          const newDate = new Date(order.date);
          if (newDate > existingDate) {
            existingCustomer.lastOrder = order.date;
          }
        }
      }
    });
    
    // Convert map to array
    const customerList = Array.from(customerMap.values());
    
    // Format the data
    const formattedCustomers = customerList.map(customer => {
      return {
        ...customer,
        orders: customer.orders,
        totalSpent: customer.totalSpent,
      };
    });
    
    setCustomers(formattedCustomers);
    setFilteredCustomers(formattedCustomers);
    setIsLoading(false);
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(query.toLowerCase()) ||
          customer.email.toLowerCase().includes(query.toLowerCase()) ||
          customer.phone.includes(query) ||
          customer.orders.some(order => order.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredCustomers(filtered);
    }
  };
  
  // Filter customers by tab
  const filterByTab = (tab: string) => {
    setActiveTab(tab);
    
    if (tab === "all") {
      setFilteredCustomers(customers);
    } else if (tab === "recent") {
      // Get customers with orders in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const filtered = customers.filter(customer => {
        const lastOrderDate = new Date(customer.lastOrder);
        return lastOrderDate >= thirtyDaysAgo;
      });
      
      setFilteredCustomers(filtered);
    } else if (tab === "repeat") {
      // Customers with more than one order
      const filtered = customers.filter(customer => 
        customer.orderIds.length > 1
      );
      setFilteredCustomers(filtered);
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditedCustomer({ ...customer });
    setShowEditCustomer(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!selectedCustomer) return;
    
    setCustomers(customers.filter((c) => c.id !== selectedCustomer.id));
    setFilteredCustomers(filteredCustomers.filter((c) => c.id !== selectedCustomer.id));
    setShowDeleteConfirm(false);
    
    toast({
      title: "Customer Deleted",
      description: `${selectedCustomer.name} has been removed from your customer database.`,
    });
  };

  const saveEditedCustomer = () => {
    if (!editedCustomer) return;
    
    const updatedCustomers = customers.map((c) => {
      if (c.id === editedCustomer.id) {
        return editedCustomer;
      }
      return c;
    });
    
    setCustomers(updatedCustomers);
    setFilteredCustomers(updatedCustomers);
    setShowEditCustomer(false);
    
    toast({
      title: "Customer Updated",
      description: `${editedCustomer.name}'s information has been updated successfully.`,
    });
  };

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Customers
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Customer database derived from your orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-violet-600 transition-all duration-300 hover:scale-105"
            onClick={() => generateCustomersFromOrders()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Customers
          </Button>
        </div>
      </div>

      <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-0 hover:scale-[1.01] hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="grid gap-2">
            <CardTitle className="text-slate-900 dark:text-slate-100">Customer Management</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Customers are automatically created from your orders.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 ml-auto">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
              <Input
                placeholder="Search customers or orders..."
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
        
        <CardContent className="space-y-4">
          {/* Tabs for customer filtering */}
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={filterByTab}
            className="w-full"
          >
            <TabsList className="bg-slate-100/70 dark:bg-slate-800/70 p-1">
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
              >
                All Customers
              </TabsTrigger>
              <TabsTrigger 
                value="recent"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
              >
                Recent Orders
              </TabsTrigger>
              <TabsTrigger 
                value="repeat"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
              >
                Repeat Customers
              </TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                      <TableRow className="hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Customer</TableHead>
                        <TableHead className="hidden md:table-cell text-slate-700 dark:text-slate-300 font-semibold">
                          Email
                        </TableHead>
                        <TableHead className="hidden md:table-cell text-slate-700 dark:text-slate-300 font-semibold">
                          Phone
                        </TableHead>
                        <TableHead className="hidden lg:table-cell text-slate-700 dark:text-slate-300 font-semibold">
                          Total Spent
                        </TableHead>
                        <TableHead className="hidden lg:table-cell text-slate-700 dark:text-slate-300 font-semibold">
                          Orders
                        </TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <TableRow
                          key={customer.id}
                          className="cursor-pointer transition-all duration-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 hover:scale-[1.01]"
                          onClick={() => handleViewCustomer(customer)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="transition-all duration-300 hover:scale-110 bg-gradient-to-r from-blue-400 to-violet-400 text-white shadow-md">
                                <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold">
                                  {customer.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-slate-900 dark:text-slate-100">{customer.name}</div>
                                <div className="text-sm text-slate-600 dark:text-slate-400 md:hidden">{customer.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-slate-600 dark:text-slate-400">
                            {customer.email}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-slate-600 dark:text-slate-400">
                            {customer.phone}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-slate-600 dark:text-slate-400 font-semibold">
                            {customer.totalSpent}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-slate-600 dark:text-slate-400">
                            <div className="flex gap-1 flex-wrap">
                              {customer.orders.map((order, index) => (
                                <Badge key={index} variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                  #{order}
                                </Badge>
                              ))}
                            </div>
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
                                    handleViewCustomer(customer)
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors duration-200"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditCustomer(customer)
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit customer
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteCustomer(customer)
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete customer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                            <Search className="h-8 w-8 mb-2 opacity-50" />
                            <p>{searchQuery 
                              ? "No customers found matching your search." 
                              : "No customers found. Create orders to generate customers."}</p>
                            {searchQuery && (
                              <Button
                                variant="link"
                                onClick={() => setSearchQuery("")}
                                className="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Clear search
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      {selectedCustomer && (
        <Dialog open={showCustomerDetails} onOpenChange={setShowCustomerDetails}>
          <DialogContent className="w-[95vw] max-w-[600px] h-[80vh] max-h-[600px] overflow-y-auto backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200/60 dark:border-slate-700/60 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Customer Details
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Avatar className="h-16 w-16 bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg">
                  <AvatarFallback className="text-lg font-bold">
                    {(selectedCustomer as any).name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{(selectedCustomer as any).name}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{(selectedCustomer as any).email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Phone</p>
                  <p className="text-slate-900 dark:text-slate-100">{(selectedCustomer as any).phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Spent</p>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">{(selectedCustomer as any).totalSpent}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Orders</p>
                  <p className="text-slate-900 dark:text-slate-100">{(selectedCustomer as any).orders}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Last Order Date</p>
                  <p className="text-slate-900 dark:text-slate-100">{(selectedCustomer as any).lastOrder}</p>
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCustomerDetails(false)}
                className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowCustomerDetails(false)
                  handleEditCustomer(selectedCustomer)
                }}
                className="bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:from-blue-600 hover:to-violet-600 transition-all duration-300 hover:scale-105"
              >
                Edit Customer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Customer Dialog */}
      {editedCustomer && (
        <Dialog open={showEditCustomer} onOpenChange={setShowEditCustomer}>
          <DialogContent className="backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200/60 dark:border-slate-700/60 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">Edit Customer</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                <Input
                  value={(editedCustomer as any).name}
                  onChange={(e) => setEditedCustomer({ ...(editedCustomer as any), name: e.target.value })}
                  className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <Input
                  value={(editedCustomer as any).email}
                  onChange={(e) => setEditedCustomer({ ...(editedCustomer as any), email: e.target.value })}
                  className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                <Input
                  value={(editedCustomer as any).phone}
                  onChange={(e) => setEditedCustomer({ ...(editedCustomer as any), phone: e.target.value })}
                  className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditCustomer(false)}
                className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                onClick={saveEditedCustomer}
                className="bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:from-blue-600 hover:to-violet-600 transition-all duration-300 hover:scale-105"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedCustomer && (
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200/60 dark:border-slate-700/60 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-red-600">Confirm Deletion</DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">{(selectedCustomer as any).name}</span>? This
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
                Delete Customer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
