import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Order } from '@/models/order';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || id.trim() === '') {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
    }
    const order = await db.collection('orders').findOne({ id: id });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error(`Error fetching order:`, error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || id.trim() === '') {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
    }
    const updates = await request.json();
    
    // Validate required fields in the update
    if (updates.id && updates.id !== id) {
      return NextResponse.json({ error: 'Cannot change order ID' }, { status: 400 });
    }

    const result = await db.collection('orders').updateOne(
      { id: id },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Fetch the updated order to return
    const updatedOrder = await db.collection('orders').findOne({ id: id });

    return NextResponse.json({ 
      success: true, 
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error(`Error updating order:`, error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || id.trim() === '') {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
    }
    
    // First check if the order exists
    const orderExists = await db.collection('orders').findOne({ id: id });
    if (!orderExists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const result = await db.collection('orders').deleteOne({ id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Order deleted successfully',
      id: id
    });
  } catch (error) {
    console.error(`Error deleting order:`, error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}