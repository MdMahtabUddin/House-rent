import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Flat from '@/models/Flat';
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
    const deletedFlat = await Flat.findOneAndDelete({ _id: id, landlordId: session.userId });
    if (!deletedFlat) {
      return NextResponse.json({ error: 'Flat not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Flat deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete flat' }, { status: 500 });
  }
}
