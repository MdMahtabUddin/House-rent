import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Building from '@/models/Building';

export async function GET() {
  try {
    await dbConnect();
    const buildings = await Building.find({}).sort({ createdAt: -1 });
    return NextResponse.json(buildings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch buildings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const building = await Building.create(body);
    return NextResponse.json(building, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create building' }, { status: 500 });
  }
}
