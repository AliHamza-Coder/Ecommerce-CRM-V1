import { NextResponse } from 'next/server';
import { crudOperations } from '@/lib/crud';

export async function GET() {
  try {
    console.log('Fetching dashboard stats from MongoDB...');
    
    // Get data from all collections in parallel using crudOperations
    const [products, orders, customers] = await Promise.all([
      crudOperations.read('products'),
      crudOperations.read('orders'),
      crudOperations.read('customers')
    ]);
    
    // Calculate total revenue
    let totalRevenue = 0;
    orders.forEach(order => {
      if (order.total && typeof order.total === 'string') {
        // Handle string price format like "PKR 1,234.56"
        const amount = Number.parseFloat(order.total.replace('PKR ', '').replace(',', ''));
        if (!isNaN(amount)) {
          totalRevenue += amount;
        }
      } else if (typeof order.total === 'number') {
        totalRevenue += order.total;
      }
    });

    const stats = {
      totalRevenue: `PKR ${totalRevenue.toLocaleString()}`,
      totalOrders: `+${orders.length}`,
      totalProducts: products.length.toString(),
      activeCustomers: `+${orders.length}`, // Changed to show total sales (same as order count)
    };
    
    console.log('Dashboard stats calculated:', stats);
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { 
        totalRevenue: "PKR 0",
        totalOrders: "0",
        totalProducts: "0",
        activeCustomers: "0" // This now represents total sales
      }, 
      { status: 200 }
    );
  }
}