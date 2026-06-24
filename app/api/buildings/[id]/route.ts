import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Building from '@/models/Building';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    const deletedBuilding = await Building.findByIdAndDelete(id);
    if (!deletedBuilding) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Building deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete building' }, { status: 500 });
  }
}
