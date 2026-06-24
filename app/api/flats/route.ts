import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Flat from '@/models/Flat';

export async function GET() {
  try {
    await dbConnect();
    const flats = await Flat.find({}).sort({ createdAt: -1 });
    return NextResponse.json(flats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch flats' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const flat = await Flat.create(body);
    return NextResponse.json(flat, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create flat' }, { status: 500 });
  }
}
