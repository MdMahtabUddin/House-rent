import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tenant from '@/models/Tenant';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'landlord') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { loginId, password } = body;

    if (!loginId || !password) {
      return NextResponse.json({ error: 'Missing loginId or password' }, { status: 400 });
    }

    const { id } = await params;
    const tenant = await Tenant.findOne({ _id: id, landlordId: session.userId });
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found or unauthorized' }, { status: 404 });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    tenant.loginId = loginId;
    tenant.password = hashedPassword;
    await tenant.save();

    return NextResponse.json({ success: true, message: 'Credentials updated successfully' });
  } catch (error: any) {
    console.error('Failed to update tenant credentials:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Login ID already exists. Please use a different one.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update credentials' }, { status: 500 });
  }
}
