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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{propertyType} Payments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track {propertyType.toLowerCase()} rent collections, view due amounts, and generate receipts.
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white w-fit">
              <PlusCircle className="mr-2 h-4 w-4" />
              Collect Rent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Collect Rent Payment</DialogTitle>
              <DialogDescription>
                Record a new payment from a tenant.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Tenant</Label>
                <select 
                  className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-950"
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
                  className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-950"
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
                  value={newPayment.rentAmount}
                  onChange={(e) => setNewPayment({...newPayment, rentAmount: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Gas (৳)</Label>
                <Input 
                  type="number" 
                  className="col-span-3"
                  value={newPayment.gasAmount}
                  onChange={(e) => setNewPayment({...newPayment, gasAmount: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Electricity (৳)</Label>
                <Input 
                  type="number" 
                  className="col-span-3"
                  value={newPayment.electricityAmount}
                  onChange={(e) => setNewPayment({...newPayment, electricityAmount: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold text-green-600">Paid Amount (৳)</Label>
                <Input 
                  type="number" 
                  className="col-span-3 border-green-500 bg-green-50 dark:bg-green-950/20"
                  value={newPayment.paidAmount}
                  onChange={(e) => setNewPayment({...newPayment, paidAmount: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Method</Label>
                <select 
                  className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-950"
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
                <Button onClick={handleCollectRent} className="bg-green-600 hover:bg-green-700 text-white">
                  Save Payment
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-950">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">Payment History</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder={`Search tenant or ${unitName.toLowerCase()}...`}
                  className="pl-8 w-full sm:w-[250px] bg-gray-50 dark:bg-gray-900"
                />
              </div>
              <Button variant="outline" size="icon" className="shrink-0">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-gray-100 dark:border-gray-800 overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Breakdown</TableHead>
                  <TableHead>Total & Status</TableHead>
                  <TableHead>Date & Method</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <TableCell>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {payment.tenantName}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {unitName}: {payment.room}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{payment.month} {payment.year}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{payment.building}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <div className="flex justify-between w-32"><span>Rent:</span> <span>৳{payment.rentAmount}</span></div>
                        <div className="flex justify-between w-32"><span>Gas:</span> <span>৳{payment.gasAmount}</span></div>
                        <div className="flex justify-between w-32"><span>Elect:</span> <span>৳{payment.electricityAmount}</span></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold mb-1">
                        Total: ৳ {(payment.rentAmount + payment.gasAmount + payment.electricityAmount).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            payment.status === 'Paid'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : payment.status === 'Due'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}
                        >
                          {payment.status}
                        </span>
                        {payment.dueAmount > 0 && <span className="text-xs text-red-500 font-bold">Due ৳{payment.dueAmount}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{payment.paymentDate}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{payment.paymentMethod}</div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20" disabled={payment.status === 'Due'}>
                          <FileText className="h-4 w-4" />
                          <span className="hidden sm:inline">PDF</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDelete(payment._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredPayments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No payment records found. Collect rent to see history here.
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
