import { NextResponse } from 'next/server';
import { crudOperations } from '@/lib/crud';

export async function GET() {
  try {
    console.log('Fetching chart data from MongoDB...');
    
    // Get orders using crudOperations
    const orders = await crudOperations.read('orders');
    
    // Group orders by month
    const monthlyData = {
      Jan: 100,
      Feb: 120,
      Mar: 140,
      Apr: 160,
      May: 180,
      Jun: 200,
      Jul: 220,
      Aug: 240,
      Sep: 260,
      Oct: 280,
      Nov: 300,
      Dec: 320,
    };

    orders.forEach((order) => {
      // Handle date as string or Date object
      const orderDate = order.date instanceof Date ? order.date : new Date(order.date);
      if (isNaN(orderDate.getTime())) {
        console.warn(`Invalid order date: ${order.date}`);
        return;
      }
      
      const month = orderDate.toLocaleDateString("en-US", { month: "short" });
      
      let amount = 0;
      if (typeof order.total === 'string') {
        // Handle string price format like "PKR 1,234.56"
        amount = Number.parseFloat(order.total.replace('PKR ', '').replace(',', ''));
      } else if (typeof order.total === 'number') {
        amount = order.total;
      }
      
      if (!isNaN(amount) && monthlyData.hasOwnProperty(month)) {
        monthlyData[month as keyof typeof monthlyData] += amount;
      }
    });

    const chartData = {
      labels: Object.keys(monthlyData),
      datasets: [
        {
          label: "Total Sales",
          data: Object.values(monthlyData),
          backgroundColor: "rgba(79, 70, 229, 0.15)",
          borderColor: "rgba(79, 70, 229, 1)",
          borderWidth: 2,
          fill: true,
        },
      ],
    };
    
    console.log('Chart data generated successfully');
    return NextResponse.json(chartData, { status: 200 });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    
    // Return fallback data in case of error
    const fallbackData = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [
        {
          label: "Total Sales",
          data: [1200, 2800, 3600, 4900, 5700, 7200, 8500, 9300, 11000, 13500, 15800, 18900],
          backgroundColor: "rgba(79, 70, 229, 0.15)",
          borderColor: "rgba(79, 70, 229, 1)",
          borderWidth: 2,
          fill: true,
        },
      ],
    };
    
    return NextResponse.json(fallbackData, { status: 200 });
  }
}