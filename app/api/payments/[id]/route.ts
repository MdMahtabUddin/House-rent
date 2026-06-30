import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Payment from '@/models/Payment';
import { getSession } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'landlord')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Await params for Next.js 15+
    const resolvedParams = await params;
    
    const payment = await Payment.findByIdAndDelete(resolvedParams.id);
    
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete payment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const resolvedParams = await params;
    const body = await request.json();
    
    const payment = await Payment.findById(resolvedParams.id);
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // If tenant, they can only submit a bill (change to Pending)
    if (session.role === 'tenant') {
      if (payment.tenantId.toString() !== session.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      payment.status = 'Pending';
      payment.paymentDate = body.paymentDate || new Date().toISOString().split('T')[0];
      payment.paymentMethod = body.paymentMethod || 'Cash';
      if (payment.paymentMethod === 'Cash' && body.paidTo) {
        payment.paidTo = body.paidTo;
      }
      // Assume they pay full amount when submitting
      payment.paidAmount = payment.dueAmount;
    } else {
      // Landlord/Admin can approve or reject
      if (body.status) payment.status = body.status;
      if (body.paidAmount !== undefined) payment.paidAmount = body.paidAmount;
    }

    await payment.save();
    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error('Failed to update payment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
