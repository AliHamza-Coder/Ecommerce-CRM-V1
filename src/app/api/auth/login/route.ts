import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { SignJWT } from 'jose';
import { getJwtSecret, generateTokenId } from '@/lib/auth-utils';

// Login validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate login data
    const validationResult = loginSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationResult.error.format() 
      }, { status: 400 });
    }
    
    const { email, password } = validationResult.data;
    
    const db = await getDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database connection not available' 
      }, { status: 503 });
    }
    
    // Find admin by email
    const admin = await db.collection('admins').findOne({ email });
    
    // If admin not found or inactive
    if (!admin || admin.status === 'inactive') {
      return NextResponse.json({ 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json({ 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }
    
    // Update last login time
    await db.collection('admins').updateOne(
      { _id: admin._id },
      { $set: { lastLogin: new Date() } }
    );
    
    // Create user session info (exclude password)
    const { password: _, ...userInfo } = admin;
    
    // If admin is a viewer and tries to do anything other than read
    if (admin.role === 'viewer') {
      userInfo.canEdit = false;
      userInfo.canCreate = false;
      userInfo.canDelete = false;
    } else {
      userInfo.canEdit = true;
      userInfo.canCreate = true;
      userInfo.canDelete = true;
    }
    
    // Generate a JWT token with our fixed secret
    const token = await new SignJWT({ 
      userId: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      sessionId: generateTokenId(admin._id.toString()) // Add a unique session ID
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d') // Token expires in 30 days
      .sign(getJwtSecret());
    
    // Return user info and token
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userInfo,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}