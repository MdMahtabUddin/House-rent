import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tenant from '@/models/Tenant';
import { getSession } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'landlord')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const deletedTenant = await Tenant.findOneAndDelete({ _id: id, landlordId: session.userId });
    if (!deletedTenant) {
      return NextResponse.json({ error: 'Tenant not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete tenant' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'landlord')) {
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

    // Require bcrypt here inline if needed, but wait it's not imported. I must add the import!
    const bcrypt = require('bcryptjs');
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'landlord')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { id } = await params;
    
    const tenant = await Tenant.findOne({ _id: id, landlordId: session.userId });
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const updatableFields = ['name', 'phone', 'nid', 'entryDate', 'contractStartDate', 'contractEndDate', 'building', 'room', 'rent'];
    
    updatableFields.forEach(field => {
      if (body[field] !== undefined) {
        tenant[field] = body[field];
      }
    });

    await tenant.save();

    return NextResponse.json({ success: true, tenant });
  } catch (error: any) {
    console.error('Failed to update tenant:', error);
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 });
  }
}
