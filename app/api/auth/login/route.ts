import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { login } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Missing username or password' }, { status: 400 });
    }

    // Since this is the initial setup, we could potentially create the first admin
    let user = await User.findOne({ username });

    if (!user) {
      // Check if trying to login as super admin for the first time
      if (username === 'admin' && password === 'admin123') { // Temporary backdoor to create first admin
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await User.create({
          username: 'admin',
          password: hashedPassword,
          role: 'admin',
          plan: 'premium',
          access: { house: true, shop: true }
        });
      } else {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Set JWT Cookie
    await login(user._id.toString(), user.role, user.username);

    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user._id, 
        username: user.username, 
        role: user.role,
        access: user.access
      } 
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
