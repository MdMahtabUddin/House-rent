import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getSession } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    
    // We prevent deleting the admin themselves just in case
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (userToDelete.role === 'admin') {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 400 });
    }

    await User.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Landlord deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete landlord' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (userToUpdate.role === 'admin') {
      return NextResponse.json({ error: 'Cannot edit admin users this way' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { 
        $set: {
          plan: body.plan,
          access: {
            house: body.access?.house,
            shop: body.access?.shop,
            noticeBoard: body.access?.noticeBoard,
            staff: body.access?.staff,
            maintenance: body.access?.maintenance,
            mess: body.access?.mess,
          }
        }
      },
      { new: true }
    ).select('-password');

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update landlord' }, { status: 500 });
  }
}
