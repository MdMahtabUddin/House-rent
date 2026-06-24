import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tenant from '@/models/Tenant';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    const deletedTenant = await Tenant.findByIdAndDelete(id);
    if (!deletedTenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete tenant' }, { status: 500 });
  }
}
