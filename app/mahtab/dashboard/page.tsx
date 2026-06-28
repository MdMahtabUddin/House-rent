'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PlusCircle, LogOut, Users, Crown, Shield, Activity, Edit, Trash2, Home, Store, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [landlords, setLandlords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState('free');
  const [accessHouse, setAccessHouse] = useState(true);
  const [accessShop, setAccessShop] = useState(false);

  // Edit states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLandlord, setEditingLandlord] = useState<any>(null);

  const fetchLandlords = async () => {
    try {
      const res = await fetch('/api/landlords');
      if (res.ok) {
        setLandlords(await res.json());
      } else if (res.status === 403 || res.status === 401) {
        router.push('/mahtab');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLandlords();
  }, []);

  const handleCreateLandlord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    try {
      const res = await fetch('/api/landlords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          plan,
          access: { house: accessHouse, shop: accessShop }
        })
      });

      if (res.ok) {
        setUsername('');
        setPassword('');
        fetchLandlords();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create landlord');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/mahtab');
  };

  const handleDelete = async (id: string) => {
    if(confirm('Are you sure you want to permanently delete this landlord?')) {
      try {
        const res = await fetch(`/api/landlords/${id}`, { method: 'DELETE' });
        if (res.ok) fetchLandlords();
      } catch(err) {
        console.error(err);
      }
    }
  };

  const handleUpdate = async () => {
    if (!editingLandlord) return;
    try {
      const res = await fetch(`/api/landlords/${editingLandlord._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: editingLandlord.plan,
          access: editingLandlord.access
        })
      });
      if (res.ok) {
        setIsEditDialogOpen(false);
        setEditingLandlord(null);
        fetchLandlords();
      }
    } catch(err) {
      console.error(err);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500 animate-pulse font-medium tracking-wide">Loading Control Panel...</div>;

  const premiumCount = landlords.filter(l => l.plan === 'premium').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 space-y-8 font-sans">
      
      {/* Top Navigation Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/20 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-blue-500/20 blur-3xl rounded-full"></div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
              <Shield className="w-8 h-8 text-indigo-300" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">System Control Panel</h1>
              <p className="text-indigo-200 text-lg mt-1 font-medium">Welcome back, Super Admin</p>
            </div>
          </div>
          <Button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 rounded-full px-6 py-5 shadow-lg transition-all hover:scale-105">
            <LogOut className="w-5 h-5 mr-2" />
            End Session
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-8 flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Landlords</p>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{landlords.length}</h2>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
              <Users className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-8 flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Premium Accounts</p>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{premiumCount}</h2>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-inner">
              <Crown className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-8 flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">System Status</p>
              <h2 className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">100%</h2>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
              <Activity className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Provision Card */}
        <Card className="lg:col-span-1 rounded-3xl border-0 shadow-2xl bg-white dark:bg-gray-900 overflow-hidden">
          <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 p-8 pb-6">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <PlusCircle className="text-indigo-600" /> Provision Account
            </CardTitle>
            <CardDescription className="text-sm mt-1">Create a new landlord instance on the platform.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleCreateLandlord} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-semibold text-gray-500">Username</Label>
                <Input className="h-12 bg-gray-50/50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 rounded-xl focus-visible:ring-indigo-500" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. landlord_01" required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-semibold text-gray-500">Password</Label>
                <Input className="h-12 bg-gray-50/50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 rounded-xl focus-visible:ring-indigo-500" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-semibold text-gray-500">Subscription Plan</Label>
                <div className="relative">
                  <select 
                    className="flex h-12 w-full appearance-none rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                  >
                    <option value="free">Free Tier</option>
                    <option value="premium">Premium Tier</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
                <Label className="text-xs uppercase tracking-wider font-semibold text-gray-500 block mb-3">Module Permissions</Label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${accessHouse ? 'bg-indigo-50/50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                    <input type="checkbox" checked={accessHouse} onChange={(e) => setAccessHouse(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                    <span className="text-sm font-semibold flex items-center gap-1.5"><Home className="w-4 h-4 text-gray-400" /> House</span>
                  </label>
                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${accessShop ? 'bg-indigo-50/50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                    <input type="checkbox" checked={accessShop} onChange={(e) => setAccessShop(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                    <span className="text-sm font-semibold flex items-center gap-1.5"><Store className="w-4 h-4 text-gray-400" /> Shop</span>
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg mt-6 font-semibold tracking-wide">
                Create Account
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Directory Grid */}
        <Card className="lg:col-span-2 rounded-3xl border-0 shadow-2xl bg-white dark:bg-gray-900 overflow-hidden">
          <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 p-8 pb-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Users className="text-indigo-600" /> Landlord Directory
              </CardTitle>
              <CardDescription className="text-sm mt-1">Manage existing landlord accounts and settings.</CardDescription>
            </div>
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500">Identity</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500">Plan</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500">Permissions</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {landlords.map((landlord) => (
                    <tr key={landlord._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group">
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900 dark:to-blue-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold shadow-sm">
                            {landlord.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">{landlord.username}</div>
                            <div className="text-xs text-gray-500 font-medium tracking-wide">Joined {new Date(landlord.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm border ${landlord.plan === 'premium' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-300' : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}>
                          {landlord.plan === 'premium' ? <Crown className="w-3 h-3" /> : null}
                          {landlord.plan?.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex gap-2">
                          {landlord.access?.house ? (
                            <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-400" title="House Access">
                              <Home className="w-4 h-4" />
                            </span>
                          ) : <span className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 dark:bg-gray-900 dark:border-gray-800" />}
                          {landlord.access?.shop ? (
                            <span className="w-8 h-8 rounded-full bg-green-50 text-green-600 border border-green-100 flex items-center justify-center dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-400" title="Shop Access">
                              <Store className="w-4 h-4" />
                            </span>
                          ) : <span className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 dark:bg-gray-900 dark:border-gray-800" />}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="rounded-full h-9 w-9 bg-white hover:bg-indigo-50 hover:text-indigo-600 border-gray-200"
                            onClick={() => {
                              setEditingLandlord({ ...landlord });
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="rounded-full h-9 w-9 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-gray-200 text-gray-400"
                            onClick={() => handleDelete(landlord._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {landlords.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <Users className="w-12 h-12 mb-3 opacity-50" />
                          <p className="text-lg font-medium text-gray-500">No landlords found</p>
                          <p className="text-sm">Provision a new account to get started.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-indigo-600 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Edit className="w-5 h-5" /> Edit Configuration
              </DialogTitle>
              <DialogDescription className="text-indigo-100">
                Update subscription and permissions for <strong className="text-white">{editingLandlord?.username}</strong>
              </DialogDescription>
            </DialogHeader>
          </div>
          
          {editingLandlord && (
            <div className="p-6 space-y-6 bg-white dark:bg-gray-950">
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider font-semibold text-gray-500">Subscription Tier</Label>
                <div className="relative">
                  <select 
                    className="flex h-12 w-full appearance-none rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editingLandlord.plan}
                    onChange={(e) => setEditingLandlord({...editingLandlord, plan: e.target.value})}
                  >
                    <option value="free">Free Tier</option>
                    <option value="premium">Premium Tier</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider font-semibold text-gray-500">Module Access</Label>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
                    <span className="flex items-center gap-3 font-medium">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Home className="w-4 h-4" /></div>
                      House Rent Module
                    </span>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                      checked={editingLandlord.access?.house}
                      onChange={(e) => setEditingLandlord({
                        ...editingLandlord, 
                        access: { ...editingLandlord.access, house: e.target.checked }
                      })}
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
                    <span className="flex items-center gap-3 font-medium">
                      <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Store className="w-4 h-4" /></div>
                      Shop Rent Module
                    </span>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                      checked={editingLandlord.access?.shop}
                      onChange={(e) => setEditingLandlord({
                        ...editingLandlord, 
                        access: { ...editingLandlord.access, shop: e.target.checked }
                      })}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
            <Button variant="outline" className="rounded-xl border-gray-200" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-6">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

