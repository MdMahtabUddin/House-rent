'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { PlusCircle, Search, MoreHorizontal, Filter, AlertTriangle } from 'lucide-react'
import { usePropertyType } from '@/components/PropertyTypeContext'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

import { useState, useEffect } from 'react'
import { Copy, KeyRound, CheckCircle2, Trash2 } from 'lucide-react'

export default function TenantsPage() {
  const { propertyType } = usePropertyType()
  const isShop = propertyType === 'Shop'
  
  const [tenantsList, setTenantsList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [loginCreds, setLoginCreds] = useState<{id: string, pass: string, name: string} | null>(null)
  const [copied, setCopied] = useState(false)
  const [tenantToDelete, setTenantToDelete] = useState<{id: string, name: string} | null>(null)
  
  const [buildingsList, setBuildingsList] = useState<any[]>([])
  const [newTenant, setNewTenant] = useState({
    name: '',
    phone: '',
    nid: '',
    entryDate: '',
    contractStartDate: '',
    contractEndDate: '',
    building: '',
    room: '',
    shopName: '',
    tradeLicense: '',
    rent: 0,
    advance: 0,
    gasCardNo: '',
    electricityCardNo: '',
  })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const fetchData = async () => {
    try {
      const [tRes, bRes] = await Promise.all([
        fetch('/api/tenants'),
        fetch('/api/buildings')
      ])
      if (tRes.ok) setTenantsList(await tRes.json())
      if (bRes.ok) setBuildingsList(await bRes.json())
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddTenant = async () => {
    if (!newTenant.name || !newTenant.building || !newTenant.room) {
      alert('Please fill required fields (Name, Building, Room/Shop)')
      return
    }

    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTenant,
          type: propertyType // Strictly binding to current property context
        })
      })
      if (res.ok) {
        setIsAddDialogOpen(false)
        setNewTenant({
          name: '', phone: '', nid: '', entryDate: '', contractStartDate: '', contractEndDate: '', building: '', room: '', shopName: '', tradeLicense: '', rent: 0, advance: 0, gasCardNo: '', electricityCardNo: ''
        })
        fetchData()
      } else {
        alert('Failed to add tenant')
      }
    } catch (error) {
      console.error('Error adding tenant:', error)
    }
  }

  const generateLogin = async (tenantId: string, tenantName: string, tenantPhone: string) => {
    try {
      const phoneStr = tenantPhone || '';
      const phoneDigits = phoneStr.replace(/\D/g, ''); 
      const loginId = phoneDigits.length >= 11 ? phoneDigits : `user${Math.floor(Math.random()*10000)}`;
      
      const randomPass = Math.random().toString(36).slice(-6);

      const res = await fetch(`/api/tenants/${tenantId}/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password: randomPass })
      });

      if (res.ok) {
        setLoginCreds({ id: loginId, pass: randomPass, name: tenantName || 'Tenant' });
        setCopied(false);
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to generate credentials')
      }
    } catch (error) {
      console.error(error);
      alert('Error generating login');
    }
  }

  const copyCreds = () => {
    if (loginCreds) {
      navigator.clipboard.writeText(`Login ID: ${loginCreds.id}\nPassword: ${loginCreds.pass}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const confirmDelete = async () => {
    if (!tenantToDelete) return;
    try {
      const res = await fetch(`/api/tenants/${tenantToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setTenantsList(tenantsList.filter(t => t._id !== tenantToDelete.id));
        setTenantToDelete(null);
      } else {
        alert('Failed to delete tenant');
      }
    } catch (error) {
      console.error(error);
    }
  }

  const getDaysLeft = (endDate: string) => {
    if (!endDate) return null;
    const diff = new Date(endDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading tenants...</div>

  // Strict filtering based on propertyType
  const displayTenants = tenantsList.filter(t => t.type === propertyType)

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-rose-500 to-pink-600 p-8 sm:p-10 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">{propertyType} Tenants</h1>
            <p className="text-rose-100 text-lg max-w-xl">
              Manage your {propertyType.toLowerCase()} tenants, view their details, and track their payment status in one place.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Delete Confirmation Dialog */}
            <Dialog open={!!tenantToDelete} onOpenChange={(open) => !open && setTenantToDelete(null)}>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Delete Tenant</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to remove <strong>{tenantToDelete?.name}</strong>? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 flex gap-2">
                  <Button variant="outline" onClick={() => setTenantToDelete(null)}>Cancel</Button>
                  <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Login Creds Popup Dialog */}
            <Dialog open={!!loginCreds} onOpenChange={(open) => !open && setLoginCreds(null)}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-rose-600" />
                    Generated Login Credentials
                  </DialogTitle>
                  <DialogDescription>
                    Share these login details securely with {loginCreds?.name}.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm border border-gray-200 dark:border-gray-800 shadow-inner">
                    <div><span className="text-gray-500">Tenant ID:</span> <span className="font-bold text-gray-900 dark:text-gray-100 ml-2">{loginCreds?.id}</span></div>
                    <div className="mt-2"><span className="text-gray-500">Password:</span> <span className="font-bold text-rose-600 dark:text-rose-500 ml-2">{loginCreds?.pass}</span></div>
                  </div>
                  <Button onClick={copyCreds} variant="outline" className="w-full flex items-center justify-center gap-2 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-900/20">
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied to Clipboard' : 'Copy Credentials'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-rose-600 hover:bg-rose-50 rounded-full font-semibold shadow-md hover:shadow-lg transition-all h-11 px-6 w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add Tenant
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl">Add New {propertyType} Tenant</DialogTitle>
                  <DialogDescription>
                    Enter the tenant details below. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" placeholder="Abdur Rahman" value={newTenant.name} onChange={e => setNewTenant({...newTenant, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="01711-223344" value={newTenant.phone} onChange={e => setNewTenant({...newTenant, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nid">NID Number</Label>
                      <Input id="nid" placeholder="1990123456789" value={newTenant.nid} onChange={e => setNewTenant({...newTenant, nid: e.target.value})} />
                    </div>
                    {isShop ? (
                      <div className="space-y-2">
                        <Label htmlFor="contractStartDate">Contract Start Date</Label>
                        <Input id="contractStartDate" type="date" value={newTenant.contractStartDate} onChange={e => setNewTenant({...newTenant, contractStartDate: e.target.value})} />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="entryDate">Entry Date</Label>
                        <Input id="entryDate" type="date" value={newTenant.entryDate} onChange={e => setNewTenant({...newTenant, entryDate: e.target.value})} />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="property">Property *</Label>
                      <select 
                        id="property" 
                        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:border-gray-800 dark:bg-gray-950"
                        value={newTenant.building}
                        onChange={(e) => setNewTenant({...newTenant, building: e.target.value})}
                      >
                        <option value="" disabled>Select a building</option>
                        {buildingsList.map(b => (
                          <option key={b.name} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">{isShop ? 'Shop No' : 'Room No'} *</Label>
                      <Input id="unit" placeholder={isShop ? 'e.g. Shop-12' : 'e.g. A-101'} value={newTenant.room} onChange={e => setNewTenant({...newTenant, room: e.target.value})} />
                    </div>
                  </div>

                  {isShop && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-rose-50/50 dark:bg-rose-900/10 rounded-lg border border-rose-100 dark:border-rose-800">
                      <div className="space-y-2">
                        <Label htmlFor="shopName">Shop Name</Label>
                        <Input id="shopName" placeholder="Rahman Store" value={newTenant.shopName} onChange={e => setNewTenant({...newTenant, shopName: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tradeLicense">Trade License No</Label>
                        <Input id="tradeLicense" placeholder="TR-123456" value={newTenant.tradeLicense} onChange={e => setNewTenant({...newTenant, tradeLicense: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contractEndDate" className="text-rose-600 font-bold">Contract End Date</Label>
                        <Input id="contractEndDate" type="date" value={newTenant.contractEndDate} onChange={e => setNewTenant({...newTenant, contractEndDate: e.target.value})} className="border-rose-300 focus-visible:ring-rose-500" />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rent">Monthly Rent (৳)</Label>
                      <Input id="rent" type="number" placeholder="15000" value={newTenant.rent || ''} onChange={e => setNewTenant({...newTenant, rent: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="advance">Advance Payment (৳)</Label>
                      <Input id="advance" type="number" placeholder="30000" value={newTenant.advance || ''} onChange={e => setNewTenant({...newTenant, advance: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gasCard">Gas Card No (Optional)</Label>
                      <Input id="gasCard" placeholder="G-123456" value={newTenant.gasCardNo} onChange={e => setNewTenant({...newTenant, gasCardNo: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="electricityCard">Electricity Card No (Optional)</Label>
                      <Input id="electricityCard" placeholder="E-123456" value={newTenant.electricityCardNo} onChange={e => setNewTenant({...newTenant, electricityCardNo: e.target.value})} />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddTenant} className="bg-rose-600 hover:bg-rose-700 text-white w-full">Save Tenant</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <Card className="border border-gray-200/50 dark:border-gray-800/50 shadow-md bg-white/60 dark:bg-gray-950/60 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-2 h-6 bg-rose-500 rounded-full"></div>
              All {propertyType} Tenants Directory
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search by name or phone..."
                  className="pl-9 w-full sm:w-[280px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-full h-10"
                />
              </div>
              <Button variant="outline" size="icon" className="shrink-0 rounded-full h-10 w-10 border-gray-200 dark:border-gray-800">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-gray-900/30">
                <TableRow className="border-b border-gray-100 dark:border-gray-800">
                  <TableHead className="pl-6 font-semibold">Tenant Info</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  {propertyType === 'Shop' ? (
                    <TableHead className="font-semibold">Shop Details & Contract</TableHead>
                  ) : (
                    <TableHead className="font-semibold">Room Details</TableHead>
                  )}
                  <TableHead className="font-semibold">Financials</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right pr-6 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayTenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                      No tenants found. Add your first tenant to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayTenants.map((tenant, idx) => {
                    const daysLeft = propertyType === 'Shop' ? getDaysLeft(tenant.contractEndDate) : null;
                    const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 90;
                    const isExpired = daysLeft !== null && daysLeft < 0;

                    return (
                      <TableRow key={`${tenant._id}-${idx}`} className="hover:bg-rose-50/30 dark:hover:bg-rose-900/10 border-b border-gray-50 dark:border-gray-800/50 transition-colors">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shadow-inner">
                              {tenant.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-gray-100">
                                {tenant.name}
                              </div>
                              <div className="text-xs font-mono text-gray-500 mt-0.5">
                                {tenant._id?.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{tenant.phone}</div>
                          <div className="text-xs text-gray-500 mt-0.5 font-mono">NID: {tenant.nid}</div>
                        </TableCell>
                        <TableCell>
                          {propertyType === 'Shop' ? (
                            <>
                              <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{tenant.shopName} - {tenant.room}</div>
                              {tenant.contractEndDate && (
                                <div className="mt-1">
                                  {isExpired ? (
                                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold ring-1 ring-red-300">
                                      <AlertTriangle className="w-3 h-3" /> Expired
                                    </span>
                                  ) : isExpiringSoon ? (
                                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold ring-1 ring-yellow-300 animate-pulse">
                                      <AlertTriangle className="w-3 h-3" /> Expires in {daysLeft} days
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-500">Exp: {tenant.contractEndDate}</span>
                                  )}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{tenant.room}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{tenant.building}</div>
                            </>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-black text-rose-600 dark:text-rose-400 tracking-tight">৳ {tenant.rent?.toLocaleString()} <span className="text-xs font-medium text-gray-400">/mo</span></div>
                          <div className="text-xs text-gray-500 mt-0.5 bg-gray-100 dark:bg-gray-800 inline-block px-2 py-0.5 rounded-md">
                            Adv: ৳ {tenant.advance?.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                              tenant.status === 'Paid'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-1 ring-green-200 dark:ring-green-800'
                                : tenant.status === 'Due'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 ring-1 ring-yellow-200 dark:ring-yellow-800'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${tenant.status === 'Paid' ? 'bg-green-500' : tenant.status === 'Due' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                            {tenant.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="flex h-8 w-8 ml-auto items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 outline-none">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4 text-gray-500" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel className="font-normal text-xs text-gray-500">Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer font-medium" onClick={() => generateLogin(tenant._id, tenant.name, tenant.phone)}>
                                  <KeyRound className="w-4 h-4 mr-2 text-rose-500" /> Generate Login
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Search className="w-4 h-4 mr-2 text-blue-500" /> View Profile
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600 font-bold focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-900/20 cursor-pointer"
                                  onClick={() => setTenantToDelete({ id: tenant._id, name: tenant.name })}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete Tenant
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
