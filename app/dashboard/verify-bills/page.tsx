'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckSquare, XCircle, CheckCircle2, PlusCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { usePropertyType } from '@/components/PropertyTypeContext'
import { DownloadReceiptButton } from '@/components/DownloadReceiptButton'

export default function VerifyBillsPage() {
  const { propertyType } = usePropertyType()
  
  const [tenants, setTenants] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [newBill, setNewBill] = useState({
    tenantId: '',
    month: '',
    year: new Date().getFullYear(),
    gasAmount: 0,
    electricityAmount: 0,
  })

  const fetchData = async () => {
    try {
      const [tenantsRes, paymentsRes] = await Promise.all([
        fetch('/api/tenants'),
        fetch('/api/payments')
      ])
      
      if (tenantsRes.ok) setTenants(await tenantsRes.json())
      if (paymentsRes.ok) setPayments(await paymentsRes.json())
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddBill = async () => {
    if (!newBill.tenantId || !newBill.month) return
    
    const t = tenants.find(x => x._id === newBill.tenantId)
    if (!t) return

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
          month: newBill.month,
          year: newBill.year,
          rentAmount: t.rent || 0,
          gasAmount: newBill.gasAmount,
          electricityAmount: newBill.electricityAmount,
          paidAmount: 0,
          dueAmount: (t.rent || 0) + newBill.gasAmount + newBill.electricityAmount,
          status: 'Due',
        })
      })
      if (res.ok) {
        setNewBill({
          ...newBill,
          tenantId: '',
          gasAmount: 0,
          electricityAmount: 0,
        })
        fetchData()
        alert('Utility bill added successfully!')
      }
    } catch (error) {
      console.error('Failed to save bill', error)
    }
  }

  const handleVerify = async (paymentId: string, action: 'Approve' | 'Reject') => {
    try {
      const status = action === 'Approve' ? 'Paid' : 'Due'
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        fetchData()
        alert(`Bill has been ${action.toLowerCase()}d successfully.`)
      }
    } catch (error) {
      console.error('Failed to verify bill', error)
    }
  }

  const activeTenants = propertyType === 'Shop'
    ? tenants.filter(t => t.type === 'Shop')
    : tenants.filter(t => t.type === 'House' || !t.type)

  const pendingBills = payments.filter(p => p.status === 'Pending' && (propertyType === 'Shop' ? p.type === 'Shop' : (p.type === 'House' || !p.type)))

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 p-8 sm:p-10 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Manage Bills & Utilities</h1>
            <p className="text-sky-100 text-lg max-w-xl">
              Generate monthly rent, gas, and electricity bills for your tenants. They will be notified automatically.
            </p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-white text-sky-700 hover:bg-sky-50 rounded-full font-semibold shadow-md hover:shadow-lg transition-all h-11 px-6 w-full sm:w-auto">
                <PlusCircle className="mr-2 h-5 w-5" />
                Generate Monthly Bill
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Generate Monthly Bill</DialogTitle>
                <DialogDescription>
                  Create a new bill for a tenant including rent and utilities.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-5 py-4">
                <div className="space-y-2">
                  <Label>Select Tenant</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-gray-800 dark:bg-gray-950"
                    value={newBill.tenantId}
                    onChange={(e) => setNewBill({...newBill, tenantId: e.target.value})}
                  >
                    <option value="" disabled>Select a tenant</option>
                    {activeTenants.map(t => (
                      <option key={t._id} value={t._id}>{t.name} ({t.room})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Billing Month</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-gray-800 dark:bg-gray-950"
                    value={newBill.month}
                    onChange={(e) => setNewBill({...newBill, month: e.target.value})}
                  >
                    <option value="" disabled>Select Month</option>
                    {months.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gas Bill (৳)</Label>
                    <Input 
                      type="number" 
                      placeholder="0"
                      value={newBill.gasAmount}
                      onChange={(e) => setNewBill({...newBill, gasAmount: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Electricity Bill (৳)</Label>
                    <Input 
                      type="number" 
                      placeholder="0"
                      value={newBill.electricityAmount}
                      onChange={(e) => setNewBill({...newBill, electricityAmount: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button onClick={handleAddBill} className="bg-sky-600 hover:bg-sky-700 text-white w-full">
                    Create Bill
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
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-2 h-6 bg-cyan-500 rounded-full"></div>
                Pending Verification Queue
              </CardTitle>
              <CardDescription className="mt-1 ml-4">
                When tenants submit bills via their portal, they will appear here.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {pendingBills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full"></div>
                <div className="relative p-6 bg-green-50 dark:bg-green-900/20 rounded-full mb-6 border border-green-100 dark:border-green-800/50">
                  <CheckCircle2 className="h-16 w-16 text-green-500 drop-shadow-md" />
                </div>
              </div>
              <h3 className="font-extrabold text-2xl text-gray-900 dark:text-gray-100 mb-2">You're all caught up!</h3>
              <p className="text-base max-w-sm mx-auto">There are no pending bills submitted by tenants waiting for your verification at this time.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/80 dark:bg-gray-900/50">
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Total Paid</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingBills.map(bill => (
                    <TableRow key={bill._id}>
                      <TableCell>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{bill.tenantName}</div>
                        <div className="text-xs text-gray-500">{bill.room}, {bill.building}</div>
                      </TableCell>
                      <TableCell>{bill.month} {bill.year}</TableCell>
                      <TableCell className="font-semibold text-green-600">৳ {bill.paidAmount}</TableCell>
                      <TableCell>{bill.paymentMethod}</TableCell>
                      <TableCell>{bill.paymentDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                            onClick={() => handleVerify(bill._id, 'Approve')}
                          >
                            <CheckSquare className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                            onClick={() => handleVerify(bill._id, 'Reject')}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      

    </div>
  )
}
