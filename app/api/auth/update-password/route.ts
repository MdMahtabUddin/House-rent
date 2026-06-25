import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    // Since we don't have bcrypt yet and passwords were created plain, we'll check it plain for this MVP
    // In production, ALWAYS use bcrypt.compare(currentPassword, admin.password)
    if (admin.password !== currentPassword) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 });
    }

    admin.password = newPassword;
    await admin.save();

    return NextResponse.json({ success: true, message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to update password:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
