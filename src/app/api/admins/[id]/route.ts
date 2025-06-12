import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Admin update validation schema (email and password are optional for updates)
const adminUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  active: z.boolean().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  updatedAt: z.date().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || id.trim() === '') {
      return NextResponse.json({ error: 'Invalid admin ID' }, { status: 400 });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
    }
    let admin;
    
    try {
      admin = await db.collection('admins').findOne(
        { _id: new ObjectId(id) },
        { projection: { password: 0 } } // Exclude password
      );
    } catch (e) {
      return NextResponse.json({ error: 'Invalid admin ID format' }, { status: 400 });
    }

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json(admin);
  } catch (error) {
    console.error(`Error fetching admin:`, error);
    return NextResponse.json({ error: 'Failed to fetch admin' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || id.trim() === '') {
      return NextResponse.json({ error: 'Invalid admin ID' }, { status: 400 });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
    }
    const updates = await request.json();
    
    // Validate update data
    const validationResult = adminUpdateSchema.safeParse(updates);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationResult.error.format() 
      }, { status: 400 });
    }
    
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid admin ID format' }, { status: 400 });
    }
    
    // Check if admin exists
    const existingAdmin = await db.collection('admins').findOne({ _id: objectId });
    if (!existingAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }
    
    // If email is being updated, check if it's already in use by another admin
    if (updates.email && updates.email !== existingAdmin.email) {
      const emailExists = await db.collection('admins').findOne({
        email: updates.email,
        _id: { $ne: objectId }
      });
      
      if (emailExists) {
        return NextResponse.json({ error: 'Email already in use by another admin' }, { status: 400 });
      }
    }
    
    // Handle password update separately
    const updateData = { ...validationResult.data };
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password as string, salt);
    }
    

    
    // Add updated timestamp
    updateData.updatedAt = new Date();

    const result = await db.collection('admins').updateOne(
      { _id: objectId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Fetch the updated admin to return (without password)
    const updatedAdmin = await db.collection('admins').findOne(
      { _id: objectId },
      { projection: { password: 0 } }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Admin updated successfully',
      admin: updatedAdmin
    });
  } catch (error) {
    console.error(`Error updating admin:`, error);
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || id.trim() === '') {
      return NextResponse.json({ error: 'Invalid admin ID' }, { status: 400 });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
    }
    
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid admin ID format' }, { status: 400 });
    }
    
    // Check if admin exists first
    const adminExists = await db.collection('admins').findOne({ _id: objectId });
    if (!adminExists) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }
    
    // Check if this is the last super_admin
    if (adminExists.role === 'super_admin') {
      const superAdminCount = await db.collection('admins').countDocuments({ role: 'super_admin' });
      if (superAdminCount <= 1) {
        return NextResponse.json({ 
          error: 'Cannot delete the last super admin account' 
        }, { status: 400 });
      }
    }

    const result = await db.collection('admins').deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Failed to delete admin' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Admin deleted successfully',
      id: id
    });
  } catch (error) {
    console.error(`Error deleting admin:`, error);
    return NextResponse.json({ error: 'Failed to delete admin' }, { status: 500 });
  }
}