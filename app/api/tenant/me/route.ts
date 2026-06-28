import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tenant from '@/models/Tenant';
import Payment from '@/models/Payment';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'tenant') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Fetch tenant details (exclude password)
    const tenant = await Tenant.findById(session.userId).select('-password');
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Fetch payments for this tenant, sorted by newest first
    const payments = await Payment.find({ tenantId: session.userId }).sort({ createdAt: -1 });

    return NextResponse.json({ tenant, payments });
  } catch (error) {
    console.error('Failed to fetch tenant profile:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}
