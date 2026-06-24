import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Calendar, CreditCard, Flame, Zap, MapPin, Download, AlertCircle } from 'lucide-react'

// Mock Tenant Data
const myData = {
  name: 'Abdur Rahman',
  id: 'T-01711223344',
  phone: '01711-223344',
  room: 'A-101',
  building: 'Badda Tower',
  address: 'Middle Badda, Dhaka',
  rent: 15000,
  advance: 30000,
  entryDate: 'January 1, 2023',
  gasCardNo: 'G-778899',
  electricityCardNo: 'E-112233',
  dueAmount: 0,
}

// Mock Payment History
const myPayments = [
  { id: 'PAY-1004', month: 'May 2026', paid: 15000, date: 'May 2, 2026', status: 'Paid' },
  { id: 'PAY-0902', month: 'April 2026', paid: 15000, date: 'April 3, 2026', status: 'Paid' },
  { id: 'PAY-0811', month: 'March 2026', paid: 15000, date: 'March 1, 2026', status: 'Paid' },
]

export default function TenantDashboard() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {myData.name}!</h1>
        <p className="text-gray-500 mt-1">Here is the overview of your rental account.</p>
      </div>

      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white dark:bg-gray-950 border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Due</CardTitle>
            <AlertCircle className={`h-4 w-4 ${myData.dueAmount > 0 ? 'text-red-500' : 'text-green-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${myData.dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ৳ {myData.dueAmount.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {myData.dueAmount === 0 ? 'All caught up!' : 'Please pay your dues'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-950 border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳ {myData.rent.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Room {myData.room}, {myData.building}</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-950 border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Advance Paid</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳ {myData.advance.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Moved in: {myData.entryDate}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Utility Cards */}
        <Card className="bg-white dark:bg-gray-950 border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>My Details & Utilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-gray-500">{myData.room}, {myData.building}</p>
                <p className="text-sm text-gray-500">{myData.address}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Gas Bill Card</p>
                <p className="text-sm text-gray-500 font-mono mt-1">{myData.gasCardNo}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Zap className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Electricity Bill Card (DESCO/DPDC)</p>
                <p className="text-sm text-gray-500 font-mono mt-1">{myData.electricityCardNo}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History Table */}
        <Card className="bg-white dark:bg-gray-950 border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.month}</TableCell>
                    <TableCell className="text-sm text-gray-500">{payment.date}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        ৳ {payment.paid.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
