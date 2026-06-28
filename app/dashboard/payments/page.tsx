'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import { PlusCircle, Search, Filter, FileText, Trash2 } from 'lucide-react'
import { usePropertyType } from '@/components/PropertyTypeContext'
import { useState, useEffect } from 'react'

export default function PaymentsPage() {
  const { propertyType } = usePropertyType()
  const isShop = propertyType === 'Shop'
  const unitName = isShop ? 'Shop' : 'Room'

  const [payments, setPayments] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [newPayment, setNewPayment] = useState({
    tenantId: '',
    month: '',
    year: new Date().getFullYear(),
    rentAmount: 0,
    gasAmount: 0,
    electricityAmount: 0,
    paidAmount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash'
  })

  const fetchData = async () => {
    try {
      const [paymentsRes, tenantsRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/tenants')
      ])
      
      if (paymentsRes.ok) setPayments(await paymentsRes.json())
      if (tenantsRes.ok) setTenants(await tenantsRes.json())
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSelectTenant = (tId: string) => {
    const t = tenants.find(x => x._id === tId)
    if (t) {
      setNewPayment({
        ...newPayment,
        tenantId: t._id,
        rentAmount: t.rent || 0
      })
    }
  }

  const handleCollectRent = async () => {
    if (!newPayment.tenantId || !newPayment.month) return
    
    const t = tenants.find(x => x._id === newPayment.tenantId)
    if (!t) return

    const rent = Number(newPayment.rentAmount) || 0
    const gas = Number(newPayment.gasAmount) || 0
    const elec = Number(newPayment.electricityAmount) || 0
    const paid = Number(newPayment.paidAmount) || 0
    
    const totalDue = (rent + gas + elec) - paid
    let status = 'Due'
    if (totalDue <= 0 && paid > 0) status = 'Paid'
    else if (paid > 0 && totalDue > 0) status = 'Partial'

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: t._id,
          tenantName: t.name,
          room: t.room,
          building: t.building,
          type: t.type || 'House',
          month: newPayment.month,
          year: newPayment.year,
          rentAmount: rent,
          gasAmount: gas,
          electricityAmount: elec,
          paidAmount: paid,
          dueAmount: totalDue > 0 ? totalDue : 0,
          paymentDate: newPayment.paymentDate,
          status,
          paymentMethod: newPayment.paymentMethod
        })
      })
      if (res.ok) {
        // Reset and fetch
        setNewPayment({
          ...newPayment,
          tenantId: '',
          rentAmount: 0,
          gasAmount: 0,
          electricityAmount: 0,
          paidAmount: 0,
        })
        fetchData()
      }
    } catch (error) {
      console.error('Failed to save payment', error)
    }
  }

  const handleDelete = async (id: string) => {
    if(confirm('Are you sure you want to delete this payment record?')) {
      try {
        const res = await fetch(`/api/payments/${id}`, { method: 'DELETE' })
        if (res.ok) {
          fetchData()
        }
      } catch (error) {
        console.error('Failed to delete payment', error)
      }
    }
  }

  const filteredPayments = propertyType === 'Shop'
    ? payments.filter(p => p.type === 'Shop' || !p.type)
    : payments.filter(p => p.type === 'House' || !p.type)

  const activeTenants = propertyType === 'Shop'
    ? tenants.filter(t => t.type === 'Shop' || !t.type)
    : tenants.filter(t => t.type === 'House' || !t.type)

  if (isLoading) return <div>Loading payments...</div>

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 p-8 sm:p-10 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">{propertyType} Payments</h1>
            <p className="text-violet-100 text-lg max-w-xl">
              Track {propertyType.toLowerCase()} rent collections, view due amounts, and generate receipts.
            </p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-white text-violet-700 hover:bg-violet-50 rounded-full font-semibold shadow-md hover:shadow-lg transition-all h-11 px-6 w-full sm:w-auto">
                <PlusCircle className="mr-2 h-5 w-5" />
                Collect Rent
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">Collect Rent Payment</DialogTitle>
                <DialogDescription>
                  Record a new payment from a tenant.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Tenant</Label>
                  <select 
                    className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-gray-800 dark:bg-gray-950"
                    value={newPayment.tenantId}
                    onChange={(e) => handleSelectTenant(e.target.value)}
                  >
                    <option value="" disabled>Select a tenant</option>
                    {activeTenants.map(t => (
                      <option key={t._id} value={t._id}>{t.name} ({t.room})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Month</Label>
                  <select 
                    className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-gray-800 dark:bg-gray-950"
                    value={newPayment.month}
                    onChange={(e) => setNewPayment({...newPayment, month: e.target.value})}
                  >
                    <option value="" disabled>Select Month</option>
                    {months.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Rent (৳)</Label>
                  <Input 
                    type="number" 
                    className="col-span-3"
                    value={newPayment.rentAmount || ''}
                    onChange={(e) => setNewPayment({...newPayment, rentAmount: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Gas (৳)</Label>
                  <Input 
                    type="number" 
                    className="col-span-3"
                    value={newPayment.gasAmount || ''}
                    onChange={(e) => setNewPayment({...newPayment, gasAmount: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Electricity (৳)</Label>
                  <Input 
                    type="number" 
                    className="col-span-3"
                    value={newPayment.electricityAmount || ''}
                    onChange={(e) => setNewPayment({...newPayment, electricityAmount: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold text-violet-600">Paid Amount (৳)</Label>
                  <Input 
                    type="number" 
                    className="col-span-3 border-violet-300 bg-violet-50 focus-visible:ring-violet-500 dark:bg-violet-950/20"
                    value={newPayment.paidAmount || ''}
                    onChange={(e) => setNewPayment({...newPayment, paidAmount: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Method</Label>
                  <select 
                    className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-gray-800 dark:bg-gray-950"
                    value={newPayment.paymentMethod}
                    onChange={(e) => setNewPayment({...newPayment, paymentMethod: e.target.value})}
                  >
                    <option value="Cash">Cash</option>
                    <option value="bKash">bKash</option>
                    <option value="Bank">Bank Transfer</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Date</Label>
                  <Input 
                    type="date" 
                    className="col-span-3"
                    value={newPayment.paymentDate}
                    onChange={(e) => setNewPayment({...newPayment, paymentDate: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button onClick={handleCollectRent} className="bg-violet-600 hover:bg-violet-700 text-white w-full">
                    Save Payment
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border border-gray-200/50 dark:border-gray-800/50 shadow-md bg-white/60 dark:bg-gray-950/60 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-2 h-6 bg-violet-500 rounded-full"></div>
              Payment History
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder={`Search tenant or ${unitName.toLowerCase()}...`}
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
                  <TableHead className="pl-6 font-semibold">Tenant</TableHead>
                  <TableHead className="font-semibold">Month</TableHead>
                  <TableHead className="font-semibold">Breakdown</TableHead>
                  <TableHead className="font-semibold">Total & Status</TableHead>
                  <TableHead className="font-semibold">Date & Method</TableHead>
                  <TableHead className="text-right pr-6 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment._id} className="hover:bg-violet-50/30 dark:hover:bg-violet-900/10 border-b border-gray-50 dark:border-gray-800/50 transition-colors">
                    <TableCell className="pl-6">
                      <div className="font-bold text-gray-900 dark:text-gray-100">
                        {payment.tenantName}
                      </div>
                      <div className="text-xs font-mono text-gray-500 mt-0.5">
                        {unitName}: <span className="font-bold text-gray-700 dark:text-gray-300">{payment.room}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{payment.month} {payment.year}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{payment.building}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 bg-white/50 dark:bg-gray-900/50 p-2 rounded-md border border-gray-100 dark:border-gray-800 inline-block">
                        <div className="flex justify-between w-32"><span className="font-medium">Rent:</span> <span>৳ {payment.rentAmount?.toLocaleString()}</span></div>
                        <div className="flex justify-between w-32"><span className="font-medium">Gas:</span> <span>৳ {payment.gasAmount?.toLocaleString()}</span></div>
                        <div className="flex justify-between w-32"><span className="font-medium">Elect:</span> <span>৳ {payment.electricityAmount?.toLocaleString()}</span></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-black text-violet-600 dark:text-violet-400 tracking-tight mb-2">
                        ৳ {(payment.rentAmount + payment.gasAmount + payment.electricityAmount).toLocaleString()}
                      </div>
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            payment.status === 'Paid'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-1 ring-green-200 dark:ring-green-800'
                              : payment.status === 'Due'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 ring-1 ring-yellow-200 dark:ring-yellow-800'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${payment.status === 'Paid' ? 'bg-green-500' : payment.status === 'Due' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                          {payment.status}
                        </span>
                        {payment.dueAmount > 0 && <span className="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-900/20 px-2 rounded-md">Due: ৳ {payment.dueAmount.toLocaleString()}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{new Date(payment.paymentDate).toLocaleDateString()}</div>
                      <div className="text-xs mt-1 inline-flex items-center px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium border border-gray-200 dark:border-gray-700">
                        {payment.paymentMethod}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 gap-1 text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-full" disabled={payment.status === 'Due'}>
                          <FileText className="h-4 w-4" />
                          <span className="hidden sm:inline font-medium">Receipt</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full" onClick={() => handleDelete(payment._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredPayments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">No payment records found.</p>
                        <p className="text-sm mt-1">Collect rent to see payment history here.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
