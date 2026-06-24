import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Building from '@/models/Building';
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
    const deletedBuilding = await Building.findOneAndDelete({ _id: id, landlordId: session.userId });
    if (!deletedBuilding) {
      return NextResponse.json({ error: 'Building not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Building deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete building' }, { status: 500 });
  }
}
