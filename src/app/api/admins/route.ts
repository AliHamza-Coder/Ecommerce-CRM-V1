import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Admin validation schema
const adminCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  active: z.boolean().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const db = await getDatabase();
    
    if (!db) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
    }
    
    // Get total count for pagination
    const totalCount = await db.collection('admins').countDocuments();
    
    // Get admins with pagination, excluding password field
    const admins = await db.collection('admins')
      .find({})
      .project({ password: 0 }) // Exclude password from results
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({
      admins,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    const validationResult = adminCreateSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationResult.error.format() 
      }, { status: 400 });
    }
    
    let { name, email, password, active, status } = validationResult.data;
    
    const db = await getDatabase();
    
    if (!db) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
    }
    
    // Check if email already exists
    const existingAdmin = await db.collection('admins').findOne({ email });
    if (existingAdmin) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Add timestamps
    const now = new Date();
    
    const newAdmin = {
      name,
      email,
      password: hashedPassword,
      role: 'super_admin' as const,
      active: active ?? true,
      status: status ?? 'active' as 'active' | 'inactive',
      lastLogin: null,
      createdAt: now,
      updatedAt: now
    };
    
    const result = await db.collection('admins').insertOne(newAdmin);
    
    if (!result.insertedId) {
      return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
    }
    
    // Return created admin without password
    const { password: _, ...adminWithoutPassword } = newAdmin;
    return NextResponse.json({ 
      success: true, 
      message: 'Admin created successfully',
      admin: adminWithoutPassword
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}