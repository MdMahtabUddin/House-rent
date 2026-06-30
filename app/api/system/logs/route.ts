import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getLogs, clearLogs } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getSession();
    
    // Only super admin has access
    if (!user || user.username !== 'mahtab') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(getLogs());
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getSession();
    
    // Only super admin has access
    if (!user || user.username !== 'mahtab') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    clearLogs();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
