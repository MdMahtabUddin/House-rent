import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import os from 'os';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getSession();
    
    // Only super admin has access
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const nodeMemory = process.memoryUsage();
    
    const dbStatus = mongoose.connection.readyState;
    const dbStates = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];

    const metrics = {
      osMemory: {
        total: totalMem,
        free: freeMem,
        used: usedMem,
        usagePercentage: ((usedMem / totalMem) * 100).toFixed(2),
      },
      nodeMemory: {
        rss: nodeMemory.rss,
        heapTotal: nodeMemory.heapTotal,
        heapUsed: nodeMemory.heapUsed,
        external: nodeMemory.external,
      },
      database: {
        status: dbStates[dbStatus] || 'Unknown',
        host: mongoose.connection.host || 'N/A',
        name: mongoose.connection.name || 'N/A',
      },
      system: {
        uptime: os.uptime(),
        platform: os.platform(),
        cpus: os.cpus().length,
      }
    };

    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
