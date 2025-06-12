import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Order, OrderForList } from '@/models/order';
import { crudOperations } from '@/lib/crud';

export async function GET() {
  try {
    const orders = await crudOperations.read('orders');

    // Transform orders for the list view
    const formattedOrders: OrderForList[] = orders.map((order: any) => ({
      id: order.id,
      customer: order.customer.name,
      email: order.customer.email,
      total: order.total,
      status: order.status,
      date: order.date,
      items: order.items.length,
      products: order.items.map((item: { name: string }) => item.name),
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
    }
    const order = await request.json();

    // Generate a new order ID
    const lastOrder = await db.collection('orders')
      .find({})
      .sort({ id: -1 })
      .limit(1)
      .toArray();
    
    let newOrderId = 'ORD-001';
    if (lastOrder.length > 0) {
      const lastId = lastOrder[0].id;
      const numericPart = parseInt(lastId.split('-')[1]);
      newOrderId = `ORD-${(numericPart + 1).toString().padStart(3, '0')}`;
    }

    // Add the order ID and timestamps
    const newOrder = {
      ...order,
      id: newOrderId,
      date: new Date().toISOString().split('T')[0],
    };

    const result = await db.collection('orders').insertOne(newOrder);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Order created successfully',
      orderId: newOrderId,
      insertedId: result.insertedId
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}