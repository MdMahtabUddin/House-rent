'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckSquare, XCircle, Search, Filter, CheckCircle2, PlusCircle } from 'lucide-react'
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

export default function VerifyBillsPage() {
  const { propertyType } = usePropertyType()
  const isShop = propertyType === 'Shop'
  
  const [tenants, setTenants] = useState<any[]>([])
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
      const res = await fetch('/api/tenants')
      if (res.ok) setTenants(await res.json())
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
        alert('Utility bill added successfully!')
      }
    } catch (error) {
      console.error('Failed to save bill', error)
    }
  }

  const activeTenants = propertyType === 'Shop'
    ? tenants.filter(t => t.type === 'Shop' || !t.type)
    : tenants.filter(t => t.type === 'House' || !t.type)

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Bills</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate monthly rent and utility bills for your tenants.
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white w-fit">
              <PlusCircle className="mr-2 h-4 w-4" />
              Generate Monthly Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Generate Monthly Bill</DialogTitle>
              <DialogDescription>
                Create a due bill for a tenant including rent and utilities.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Tenant</Label>
                <select 
                  className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-950"
                  value={newBill.tenantId}
                  onChange={(e) => setNewBill({...newBill, tenantId: e.target.value})}
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
                  value={newBill.month}
                  onChange={(e) => setNewBill({...newBill, month: e.target.value})}
                >
                  <option value="" disabled>Select Month</option>
                  {months.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Gas (৳)</Label>
                <Input 
                  type="number" 
                  className="col-span-3"
                  value={newBill.gasAmount}
                  onChange={(e) => setNewBill({...newBill, gasAmount: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Electricity (৳)</Label>
                <Input 
                  type="number" 
                  className="col-span-3"
                  value={newBill.electricityAmount}
                  onChange={(e) => setNewBill({...newBill, electricityAmount: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button onClick={handleAddBill} className="bg-green-600 hover:bg-green-700 text-white">
                  Create Bill
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-950">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Pending Verification Queue</CardTitle>
              <CardDescription>
                When tenants submit bills via their portal, they will appear here.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-full mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <p className="font-medium text-lg text-gray-900 dark:text-gray-100">All caught up!</p>
            <p className="text-sm mt-1">There are no pending bills submitted by tenants at this time.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

