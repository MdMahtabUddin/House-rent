import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Tenant from '@/models/Tenant';
import bcrypt from 'bcryptjs';
import { login } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { username, password, loginType } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Missing username or password' }, { status: 400 });
    }

    if (loginType === 'tenant') {
      const tenant = await Tenant.findOne({ loginId: username });
      if (!tenant) {
        return NextResponse.json({ error: 'Invalid Tenant ID or Password' }, { status: 401 });
      }

      const isMatch = await bcrypt.compare(password, tenant.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Invalid Tenant ID or Password' }, { status: 401 });
      }

      // Set JWT Cookie for tenant
      await login(tenant._id.toString(), 'tenant', tenant.name);

      return NextResponse.json({ 
        success: true, 
        user: { 
          id: tenant._id, 
          username: tenant.name, 
          role: 'tenant'
        } 
      });
    } else {
      // Landlord/Admin Login Logic
      let user = await User.findOne({ username });

      if (!user) {
        // Check if trying to login as super admin for the first time
        if (username === 'admin' && password === 'admin123') { // Temporary backdoor to create first admin
          const hashedPassword = await bcrypt.hash(password, 10);
          user = await User.create({
            username: 'admin',
            password: hashedPassword,
            role: 'admin',
            plan: 'premium',
            access: { house: true, shop: true }
          });
        } else {
          return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      // Set JWT Cookie
      await login(user._id.toString(), user.role, user.username);

      return NextResponse.json({ 
        success: true, 
        user: { 
          id: user._id, 
          username: user.username, 
          role: user.role,
          access: user.access
        } 
      });
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
