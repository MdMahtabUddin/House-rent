'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckSquare, XCircle, Search, Filter, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { usePropertyType } from '@/components/PropertyTypeContext'

export default function VerifyBillsPage() {
  const { propertyType } = usePropertyType()
  const isShop = propertyType === 'Shop'
  
  // Mock Data
  const [pendingBills, setPendingBills] = useState([
    {
      id: 'B-1001',
      tenantName: 'Abdur Rahman',
      unit: 'A-101',
      building: 'Badda Tower',
      month: 'June 2026',
      rent: 15000,
      gas: 1080,
      electricity: 1250,
      trxId: '9F8A7B6C',
      date: '2026-06-23',
    },
    {
      id: 'B-1002',
      tenantName: 'Rafiqul Islam',
      unit: 'B-205',
      building: 'Mirpur Villa',
      month: 'June 2026',
      rent: 10000,
      gas: 0,
      electricity: 850,
      trxId: 'Nagad-X2Y9',
      date: '2026-06-24',
    }
  ])

  const handleApprove = (id: string) => {
    // In a real app, send API request
    setPendingBills(prev => prev.filter(bill => bill.id !== id))
    // alert('Bill Approved! It has been added to the official payments ledger.')
  }

  const handleReject = (id: string) => {
    // In a real app, send API request
    setPendingBills(prev => prev.filter(bill => bill.id !== id))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Verify Bills</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Review and approve monthly bills submitted by your tenants.
          </p>
        </div>
      </div>

      <Card className="border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-950">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Pending Verification Queue</CardTitle>
              <CardDescription>
                {pendingBills.length} bills are waiting for your approval.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search tenants..."
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
          {pendingBills.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
              <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-full mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <p className="font-medium text-lg text-gray-900 dark:text-gray-100">All caught up!</p>
              <p className="text-sm mt-1">There are no pending bills to verify at this time.</p>
            </div>
          ) : (
            <div className="rounded-md border border-gray-100 dark:border-gray-800 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Submission</TableHead>
                    <TableHead>Breakdown</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingBills.map((bill) => (
                    <TableRow key={bill.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                      <TableCell>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {bill.tenantName}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {isShop ? 'Shop' : 'Room'} {bill.unit} • {bill.building}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{bill.month}</div>
                        <div className="text-xs text-gray-500 mt-0.5">TrxID: {bill.trxId}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          <div className="flex justify-between w-32"><span>Rent:</span> <span>৳{bill.rent}</span></div>
                          <div className="flex justify-between w-32"><span>Gas:</span> <span>৳{bill.gas}</span></div>
                          <div className="flex justify-between w-32"><span>Elect:</span> <span>৳{bill.electricity}</span></div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-base font-bold text-gray-900 dark:text-gray-100">
                          ৳{(bill.rent + bill.gas + bill.electricity).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
                            onClick={() => handleApprove(bill.id)}
                          >
                            <CheckSquare className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200"
                            onClick={() => handleReject(bill.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Reject
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
