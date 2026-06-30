import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Building from '@/models/Building';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'landlord')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const buildings = await Building.find({ landlordId: session.userId }).sort({ createdAt: -1 });
    return NextResponse.json(buildings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch buildings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'landlord')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await request.json();
    body.landlordId = session.userId; // Enforce landlordId
    
    const building = await Building.create(body);
    return NextResponse.json(building, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create building' }, { status: 500 });
  }
}
