import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    const landlords = await User.find({ role: 'landlord' }).select('-password').sort({ createdAt: -1 });
    return NextResponse.json(landlords);
  } catch (error) {
    console.error('Failed to get landlords:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    const data = await req.json();

    if (!data.username || !data.password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ username: data.username });
    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const landlord = await User.create({
      username: data.username,
      password: hashedPassword,
      role: 'landlord',
      plan: data.plan || 'free',
      access: {
        house: data.access?.house ?? true,
        shop: data.access?.shop ?? false,
      }
    });

    return NextResponse.json({ success: true, landlord: { id: landlord._id, username: landlord.username } });
  } catch (error) {
    console.error('Failed to create landlord:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
