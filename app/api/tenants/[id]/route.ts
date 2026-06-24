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
    if (!session || session.role !== 'landlord') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
