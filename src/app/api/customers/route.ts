import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Order } from '@/models/order';

export async function GET() {
  try {
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
    }
    const orders = await db.collection('orders').find({}).toArray();

    // Process orders to get unique customers with their order stats
    const customersMap = new Map();

    for (const order of orders) {
      const email = order.customer.email;
      
      if (!customersMap.has(email)) {
        customersMap.set(email, {
          name: order.customer.name,
          email: email,
          phone: order.customer.phone,
          orders: 1,
          totalSpent: parseFloat(order.total.replace('$', '').replace(',', '')),
          lastOrder: order.date,
          orderIds: [order.id]
        });
      } else {
        const customer = customersMap.get(email);
        customer.orders += 1;
        customer.totalSpent += parseFloat(order.total.replace('$', '').replace(',', ''));
        
        // Update last order date if this order is more recent
        if (new Date(order.date) > new Date(customer.lastOrder)) {
          customer.lastOrder = order.date;
        }
        
        // Add order ID to the list
        customer.orderIds.push(order.id);
      }
    }

    // Convert to array and format for response
    const customers = Array.from(customersMap.values()).map(customer => ({
      id: customer.email.split('@')[0], // Generate ID from email
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      orders: customer.orders.toString(),
      totalSpent: `$${customer.totalSpent.toFixed(2)}`,
      lastOrder: customer.lastOrder,
      orderIds: customer.orderIds
    }));

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}