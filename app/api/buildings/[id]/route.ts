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
    if (!session || (session.role !== 'admin' && session.role !== 'landlord')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    console.log("DELETE building id:", id, "session.userId:", session.userId);
    const deletedBuilding = await Building.findOneAndDelete({ _id: id, landlordId: session.userId });
    if (!deletedBuilding) {
      console.log("Building not found or unauthorized for delete. ID:", id);
      return NextResponse.json({ error: 'Building not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Building deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete building' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'landlord')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    console.log("PUT building id:", id, "session.userId:", session.userId, "body:", body);
    const updatedBuilding = await Building.findOneAndUpdate(
      { _id: id, landlordId: session.userId },
      { $set: body },
      { new: true }
    );
    if (!updatedBuilding) {
      console.log("Building not found or unauthorized for update. ID:", id);
      return NextResponse.json({ error: 'Building not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json({ building: updatedBuilding });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update building' }, { status: 500 });
  }
}
