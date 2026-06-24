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
import { PlusCircle, Search, Filter, Download, FileText } from 'lucide-react'
import { usePropertyType } from '@/components/PropertyTypeContext'

// Mock Data
const payments = [
  {
    id: 'PAY-1001',
    tenantName: 'Abdur Rahman',
    room: 'A-101',
    month: 'May 2026',
    rentAmount: 15000,
    gasAmount: 1080,
    electricityAmount: 1250,
    paidAmount: 17330,
    dueAmount: 0,
    paymentDate: '2026-05-02',
    status: 'Paid',
  },
  {
    id: 'PAY-1002',
    tenantName: 'Rafiqul Islam',
    room: 'B-205',
    month: 'May 2026',
    rentAmount: 10000,
    gasAmount: 0,
    electricityAmount: 850,
    paidAmount: 5000,
    dueAmount: 5850,
    paymentDate: '2026-05-05',
    status: 'Partial',
  },
  {
    id: 'PAY-1003',
    tenantName: 'Kamal Hossain',
    room: 'A-102',
    month: 'May 2026',
    rentAmount: 20000,
    gasAmount: 1080,
    electricityAmount: 2000,
    paidAmount: 0,
    dueAmount: 23080,
    paymentDate: '-',
    status: 'Due',
  },
  {
    id: 'PAY-1004',
    tenantName: 'Abdur Rahman',
    room: 'A-101',
    month: 'April 2026',
    rentAmount: 15000,
    gasAmount: 1080,
    electricityAmount: 1100,
    paidAmount: 17180,
    dueAmount: 0,
    paymentDate: '2026-04-03',
    status: 'Paid',
  },
]

export default function PaymentsPage() {
  const { propertyType } = usePropertyType()
  const isShop = propertyType === 'Shop'
  const unitName = isShop ? 'Shop' : 'Room'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{propertyType} Payments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track {propertyType.toLowerCase()} rent collections, view due amounts, and generate receipts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <PlusCircle className="mr-2 h-4 w-4" />
            Collect Rent
          </Button>
        </div>
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
          <div className="rounded-md border border-gray-100 dark:border-gray-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Breakdown (Rent+Gas+Elec)</TableHead>
                  <TableHead>Total & Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <TableCell>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {payment.tenantName}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {unitName}: {payment.room}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{payment.month}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{payment.id}</div>
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
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{payment.paymentDate}</div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20" disabled={payment.status === 'Due'}>
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">PDF</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
