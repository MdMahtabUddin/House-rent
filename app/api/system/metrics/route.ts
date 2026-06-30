import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import os from 'os';
import { getSession } from '@/lib/auth';
import User from '@/models/User';
import Tenant from '@/models/Tenant';
import dbConnect from '@/lib/mongodb';

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

    await dbConnect();
    
    let totalLandlords = 0;
    let totalTenants = 0;
    try {
      totalLandlords = await User.countDocuments({ role: 'landlord' });
      totalTenants = await Tenant.countDocuments();
    } catch (e) {
      // ignore
    }

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
        totalLandlords,
        totalTenants
      },
      system: {
        uptime: os.uptime(),
        platform: os.platform(),
        cpus: os.cpus().length,
        loadAvg: os.loadavg(),
        nodeUptime: process.uptime()
      }
    };

    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
