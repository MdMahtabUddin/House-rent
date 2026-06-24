'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, LogOut } from 'lucide-react';

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

  if (isLoading) return <div className="p-8 text-center">Loading Admin Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
          <p className="text-gray-500">Manage Landlords, Access, and Billing Plans</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Landlord Form */}
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Create New Landlord</CardTitle>
            <CardDescription>Provision a new account for a landlord.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateLandlord} className="space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="landlord_id" required />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Plan</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              
              <div className="pt-2 border-t mt-4">
                <Label className="mb-2 block font-semibold text-gray-700">Module Access</Label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={accessHouse} onChange={(e) => setAccessHouse(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                    <span className="text-sm font-medium">House Rent</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={accessShop} onChange={(e) => setAccessShop(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                    <span className="text-sm font-medium">Shop Rent</span>
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">
                <PlusCircle className="w-4 h-4 mr-2" /> Create Landlord
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Landlords List */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Registered Landlords</CardTitle>
            <CardDescription>Overview of all landlords in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead className="text-right">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {landlords.map((landlord) => (
                    <TableRow key={landlord._id}>
                      <TableCell className="font-medium">{landlord.username}</TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${landlord.plan === 'premium' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                          {landlord.plan?.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {landlord.access?.house && <span className="text-xs bg-blue-100 text-blue-800 px-2 rounded">House</span>}
                          {landlord.access?.shop && <span className="text-xs bg-green-100 text-green-800 px-2 rounded">Shop</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-gray-500 text-sm">
                        {new Date(landlord.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {landlords.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                        No landlords registered yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
