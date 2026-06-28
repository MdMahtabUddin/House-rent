'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, CreditCard, Flame, Zap, MapPin, AlertCircle, KeyRound, CheckCircle2, ChevronRight, XCircle, AlertTriangle } from 'lucide-react'
import { DownloadReceiptButton } from '@/components/DownloadReceiptButton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function TenantDashboard() {
  const [data, setData] = useState<{ tenant: any, payments: any[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [newLoginId, setNewLoginId] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateMsg, setUpdateMsg] = useState({ type: '', text: '' })

  const [selectedBill, setSelectedBill] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState('bKash')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [isSubmittingBill, setIsSubmittingBill] = useState(false)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/tenant/me')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      } else {
        window.location.href = '/'
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLoginId || !newPassword) return

    setIsUpdating(true)
    setUpdateMsg({ type: '', text: '' })

    try {
      // Re-using the landlord's API path since we bypassed the folder bug using PATCH
      const res = await fetch(`/api/tenants/${data?.tenant._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: newLoginId, password: newPassword })
      })

      const json = await res.json()
      if (res.ok) {
        setUpdateMsg({ type: 'success', text: 'Credentials updated successfully!' })
        setNewLoginId('')
        setNewPassword('')
      } else {
        setUpdateMsg({ type: 'error', text: json.error || 'Update failed' })
      }
    } catch (err) {
      setUpdateMsg({ type: 'error', text: 'An error occurred' })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSubmitBill = async () => {
    if (!selectedBill) return
    setIsSubmittingBill(true)
    try {
      const res = await fetch(`/api/payments/${selectedBill._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          paymentDate,
        })
      })
      if (res.ok) {
        alert('Bill submitted for verification successfully!')
        setSelectedBill(null)
        fetchData()
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to submit bill')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred')
    } finally {
      setIsSubmittingBill(false)
    }
  }

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading your portal...</div>
  if (!data || !data.tenant) return <div className="p-8 text-center text-red-500">Failed to load data</div>

  const myData = data.tenant
  const myPayments = data.payments || []

  const dues = myPayments.filter(p => p.status === 'Due' || p.status === 'Rejected')
  const history = myPayments.filter(p => p.status === 'Paid' || p.status === 'Pending')

  const totalDueAmount = dues.reduce((acc, curr) => acc + (curr.dueAmount || 0), 0)

  const getDaysLeft = (endDate: string) => {
    if (!endDate) return null;
    const diff = new Date(endDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  const daysLeft = myData.type === 'Shop' ? getDaysLeft(myData.contractEndDate) : null;
  const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 90;
  const isExpired = daysLeft !== null && daysLeft < 0;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-12">
      {myData.type === 'Shop' && isExpired && (
        <div className="bg-red-500 text-white p-4 rounded-xl shadow-md flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <div>
            <h3 className="font-bold">Contract Expired!</h3>
            <p className="text-sm text-red-100">Your shop contract ended on {myData.contractEndDate}. Please contact your landlord immediately to renew.</p>
          </div>
        </div>
      )}
      {myData.type === 'Shop' && isExpiringSoon && (
        <div className="bg-yellow-500 text-white p-4 rounded-xl shadow-md flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <div>
            <h3 className="font-bold">Contract Expiring Soon!</h3>
            <p className="text-sm text-yellow-100">Your shop contract will expire in {daysLeft} days (on {myData.contractEndDate}). Please contact your landlord to discuss renewal.</p>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-700 to-sky-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {myData.name}!</h1>
          <p className="text-blue-100 mt-2 text-lg">Here is the overview of your rental account.</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white dark:bg-gray-950 shadow-sm border-gray-100 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Dues</CardTitle>
            <AlertCircle className={`h-5 w-5 ${totalDueAmount > 0 ? 'text-red-500' : 'text-green-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${totalDueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ৳ {totalDueAmount.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {totalDueAmount === 0 ? 'All caught up!' : 'Please clear your dues'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-950 shadow-sm border-gray-100 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
            <CreditCard className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">৳ {(myData.rent || 0).toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Room {myData.room}, {myData.building}</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-950 shadow-sm border-gray-100 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Advance Paid</CardTitle>
            <Calendar className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">৳ {(myData.advance || 0).toLocaleString()}</div>
            {myData.type === 'Shop' ? (
              <p className="text-xs text-gray-500 mt-1">Contract Start: {myData.contractStartDate || 'N/A'}</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Moved in: {myData.entryDate}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Area (Bills & History) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Due Bills Section */}
          <Card className="border border-red-100 dark:border-red-900/30 shadow-md">
            <CardHeader className="bg-red-50/50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/30">
              <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Action Required: Pending Dues
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {dues.length === 0 ? (
                <div className="p-8 text-center text-gray-500">You have no pending dues.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dues.map(bill => (
                      <TableRow key={bill._id}>
                        <TableCell className="font-medium">{bill.month} {bill.year}</TableCell>
                        <TableCell className="font-bold text-red-600">৳ {bill.dueAmount}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            bill.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {bill.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            className="bg-sky-600 hover:bg-sky-700 text-white"
                            onClick={() => setSelectedBill(bill)}
                          >
                            Pay Now <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Payment History Table */}
          <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {history.length === 0 ? (
                 <div className="p-8 text-center text-gray-500">No payment history found.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((payment) => (
                      <TableRow key={payment._id}>
                        <TableCell className="font-medium">{payment.month} {payment.year}</TableCell>
                        <TableCell className="text-sm text-gray-500">{payment.paymentDate || 'N/A'}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            ৳ {payment.paidAmount > 0 ? payment.paidAmount : payment.dueAmount}
                          </span>
                        </TableCell>
                        <TableCell>
                          {payment.status === 'Paid' ? (
                             <span className="inline-flex items-center text-xs font-medium text-green-600">
                               <CheckCircle2 className="w-3 h-3 mr-1" /> Paid
                             </span>
                          ) : (
                             <span className="inline-flex items-center text-xs font-medium text-amber-600">
                               <AlertCircle className="w-3 h-3 mr-1" /> Verifying
                             </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {payment.status === 'Paid' ? (
                            <DownloadReceiptButton payment={payment} iconOnly={true} />
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <Card className="bg-white dark:bg-gray-950 border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle>My Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Property</p>
                  <p className="text-sm text-gray-500">
                    {myData.type === 'Shop' && myData.shopName ? `${myData.shopName} - ` : ''}{myData.room}, {myData.building}
                  </p>
                </div>
              </div>

              {myData.type === 'Shop' && (
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Contract Period</p>
                    <p className="text-sm text-gray-500 mt-1">Start: {myData.contractStartDate || 'N/A'}</p>
                    <p className="text-sm text-gray-500">End: {myData.contractEndDate || 'N/A'}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Flame className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Gas Card Number</p>
                  <p className="text-sm text-gray-500 font-mono mt-1">{myData.gasCardNo || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Zap className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Electricity Card Number</p>
                  <p className="text-sm text-gray-500 font-mono mt-1">{myData.electricityCardNo || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security & Settings */}
          <Card className="bg-white dark:bg-gray-950 border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-blue-600" />
                Security Settings
              </CardTitle>
              <CardDescription>Update your login credentials.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateCredentials}>
              <CardContent className="space-y-4">
                {updateMsg.text && (
                  <div className={`p-3 rounded-md text-sm text-center ${updateMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {updateMsg.text}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="newId">New Login ID</Label>
                  <Input 
                    id="newId" 
                    placeholder="e.g. mahtab123" 
                    value={newLoginId} 
                    onChange={(e) => setNewLoginId(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password"
                    placeholder="Enter new password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required 
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isUpdating} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  {isUpdating ? 'Updating...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      {/* Submit Bill Dialog */}
      <Dialog open={!!selectedBill} onOpenChange={(open) => !open && setSelectedBill(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Submit Bill Payment</DialogTitle>
            <DialogDescription>
              Submit your payment details for {selectedBill?.month} {selectedBill?.year}. The landlord will verify and approve it.
            </DialogDescription>
          </DialogHeader>
          {selectedBill && (
            <div className="grid gap-4 py-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Rent Amount:</span>
                  <span className="font-medium">৳ {selectedBill.rentAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Gas Bill:</span>
                  <span className="font-medium">৳ {selectedBill.gasAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Electricity Bill:</span>
                  <span className="font-medium">৳ {selectedBill.electricityAmount}</span>
                </div>
                <div className="pt-2 border-t flex justify-between font-bold">
                  <span>Total Amount Due:</span>
                  <span className="text-red-600">৳ {selectedBill.dueAmount}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-gray-800 dark:bg-gray-950"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="bKash">bKash</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Input 
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBill(null)}>Cancel</Button>
            <Button onClick={handleSubmitBill} disabled={isSubmittingBill} className="bg-sky-600 hover:bg-sky-700 text-white">
              {isSubmittingBill ? 'Submitting...' : 'Submit Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
