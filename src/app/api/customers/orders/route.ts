import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Order } from '@/models/order';
import { crudOperations } from '@/lib/crud';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    // Use crudOperations for consistent database access
    const orders = await crudOperations.read('orders', { 'customer.email': email }) as Order[];

    // Transform orders for the list view
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      customer: order.customer.name,
      email: order.customer.email,
      total: order.total,
      status: order.status,
      date: order.date,
      items: order.items.length,
      products: order.items.map(item => item.name),
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders by email:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}