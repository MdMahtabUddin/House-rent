import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tenant from '@/models/Tenant';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'landlord') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const tenants = await Tenant.find({ landlordId: session.userId }).sort({ createdAt: -1 });
    return NextResponse.json(tenants);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'landlord') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await request.json();
    body.landlordId = session.userId; // Enforce landlordId
    
    const tenant = await Tenant.create(body);
    return NextResponse.json(tenant, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 });
  }
}
