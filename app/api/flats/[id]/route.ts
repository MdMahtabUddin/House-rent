import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Flat from '@/models/Flat';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    const deletedFlat = await Flat.findByIdAndDelete(id);
    if (!deletedFlat) {
      return NextResponse.json({ error: 'Flat not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Flat deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete flat' }, { status: 500 });
  }
}
