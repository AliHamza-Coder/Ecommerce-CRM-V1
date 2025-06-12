import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Order } from '@/models/order';

// Sample order data for initialization
const defaultOrders: Order[] = [
  {
    id: "ORD-001",
    customer: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
    },
    status: "delivered",
    date: "2023-04-15",
    deliveryDate: "2023-04-18",
    total: "$299.99",
    subtotal: "$249.99",
    tax: "$25.00",
    shipping: "$25.00",
    paymentMethod: "Credit Card (**** 4242)",
    shippingAddress: {
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "United States",
    },
    items: [
      {
        id: 1,
        name: "Premium Headphones",
        price: "$199.99",
        quantity: 1,
        image: "/placeholder.svg",
      },
      {
        id: 2,
        name: "USB Cable",
        price: "$29.99",
        quantity: 1,
        image: "/placeholder.svg",
      },
      {
        id: 3,
        name: "Carrying Case",
        price: "$19.99",
        quantity: 1,
        image: "/placeholder.svg",
      },
    ],
    timeline: [
      { status: "Order Placed", date: "2023-04-15 10:30 AM", completed: true },
      { status: "Payment Confirmed", date: "2023-04-15 10:35 AM", completed: true },
      { status: "Processing", date: "2023-04-15 2:00 PM", completed: true },
      { status: "Shipped", date: "2023-04-16 9:00 AM", completed: true },
      { status: "Out for Delivery", date: "2023-04-18 8:00 AM", completed: true },
      { status: "Delivered", date: "2023-04-18 3:30 PM", completed: true },
    ],
  },
  {
    id: "ORD-002",
    customer: {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+1 (555) 987-6543",
    },
    status: "shipped",
    date: "2023-04-18",
    deliveryDate: "2023-04-21",
    total: "$149.50",
    subtotal: "$129.50",
    tax: "$10.00",
    shipping: "$10.00",
    paymentMethod: "PayPal",
    shippingAddress: {
      street: "456 Oak Avenue",
      city: "Los Angeles",
      state: "CA",
      zip: "90001",
      country: "United States",
    },
    items: [
      {
        id: 1,
        name: "Smart Watch",
        price: "$99.50",
        quantity: 1,
        image: "/placeholder.svg",
      },
      {
        id: 2,
        name: "Watch Band",
        price: "$30.00",
        quantity: 1,
        image: "/placeholder.svg",
      },
    ],
    timeline: [
      { status: "Order Placed", date: "2023-04-18 11:15 AM", completed: true },
      { status: "Payment Confirmed", date: "2023-04-18 11:20 AM", completed: true },
      { status: "Processing", date: "2023-04-18 3:00 PM", completed: true },
      { status: "Shipped", date: "2023-04-19 10:00 AM", completed: true },
      { status: "Out for Delivery", date: "2023-04-21 9:00 AM", completed: false },
      { status: "Delivered", date: "Pending", completed: false },
    ],
  },
  {
    id: "ORD-003",
    customer: {
      name: "Robert Johnson",
      email: "robert.j@example.com",
      phone: "+1 (555) 456-7890",
    },
    status: "processing",
    date: "2023-04-20",
    deliveryDate: "2023-04-24",
    total: "$79.99",
    subtotal: "$69.99",
    tax: "$5.00",
    shipping: "$5.00",
    paymentMethod: "Credit Card (**** 1234)",
    shippingAddress: {
      street: "789 Pine Road",
      city: "Chicago",
      state: "IL",
      zip: "60007",
      country: "United States",
    },
    items: [
      {
        id: 1,
        name: "Kitchen Blender",
        price: "$69.99",
        quantity: 1,
        image: "/placeholder.svg",
      },
    ],
    timeline: [
      { status: "Order Placed", date: "2023-04-20 9:45 AM", completed: true },
      { status: "Payment Confirmed", date: "2023-04-20 9:50 AM", completed: true },
      { status: "Processing", date: "2023-04-20 2:30 PM", completed: true },
      { status: "Shipped", date: "Pending", completed: false },
      { status: "Out for Delivery", date: "Pending", completed: false },
      { status: "Delivered", date: "Pending", completed: false },
    ],
  },
  {
    id: "ORD-004",
    customer: {
      name: "Emily Davis",
      email: "emily.d@example.com",
      phone: "+1 (555) 789-0123",
    },
    status: "pending",
    date: "2023-04-22",
    deliveryDate: "2023-04-26",
    total: "$199.99",
    subtotal: "$179.99",
    tax: "$10.00",
    shipping: "$10.00",
    paymentMethod: "Debit Card (**** 5678)",
    shippingAddress: {
      street: "321 Maple Street",
      city: "Houston",
      state: "TX",
      zip: "77001",
      country: "United States",
    },
    items: [
      {
        id: 1,
        name: "Cotton T-Shirt",
        price: "$29.99",
        quantity: 2,
        image: "/placeholder.svg",
      },
      {
        id: 2,
        name: "Jeans",
        price: "$59.99",
        quantity: 2,
        image: "/placeholder.svg",
      },
    ],
    timeline: [
      { status: "Order Placed", date: "2023-04-22 3:20 PM", completed: true },
      { status: "Payment Confirmed", date: "Pending", completed: false },
      { status: "Processing", date: "Pending", completed: false },
      { status: "Shipped", date: "Pending", completed: false },
      { status: "Out for Delivery", date: "Pending", completed: false },
      { status: "Delivered", date: "Pending", completed: false },
    ],
  },
];

export async function GET() {
  try {
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
    }
    
    // Check if orders collection exists
    const collections = await db.listCollections().toArray();
    const orderCollectionExists = collections.some(c => c.name === 'orders');
    
    if (!orderCollectionExists) {
      await db.createCollection('orders');
    }
    
    // Check if there are already orders in the database
    const existingOrders = await db.collection('orders').countDocuments();
    
    if (existingOrders > 0) {
      // Delete existing orders to start fresh
      await db.collection('orders').deleteMany({});
    }
    
    // Insert the default orders
    await db.collection('orders').insertMany(defaultOrders);
    
    return NextResponse.json({
      success: true,
      message: 'Orders initialized successfully',
      count: defaultOrders.length
    });
  } catch (error) {
    console.error('Error initializing orders:', error);
    return NextResponse.json({ error: 'Failed to initialize orders' }, { status: 500 });
  }
}