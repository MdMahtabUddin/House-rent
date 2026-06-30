import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Flat from '@/models/Flat';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'landlord')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const flats = await Flat.find({ landlordId: session.userId }).sort({ createdAt: -1 });
    return NextResponse.json(flats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch flats' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'landlord')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await request.json();
    body.landlordId = session.userId; // Enforce landlordId
    
    const flat = await Flat.create(body);
    return NextResponse.json(flat, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create flat' }, { status: 500 });
  }
}
