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
import { Calendar, CreditCard, Flame, Zap, AlertCircle, KeyRound, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react'
import { DownloadReceiptButton } from '@/components/DownloadReceiptButton'

export default function TenantDashboard() {
  const [data, setData] = useState<{ tenant: any, payments: any[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [newLoginId, setNewLoginId] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateMsg, setUpdateMsg] = useState({ type: '', text: '' })

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
      const res = await fetch(`/api/tenant/update-credentials`, {
        method: 'POST',
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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 font-sans tracking-wide"><div className="animate-pulse flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-indigo-500 animate-spin" /> <span className="font-medium text-gray-500">Loading Portal...</span></div></div>
  if (!data || !data.tenant) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><div className="text-red-500 font-bold p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl">Failed to load data</div></div>

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 space-y-8 font-sans">
      {myData.type === 'Shop' && (isExpired || isExpiringSoon) && (
        <div className={`p-4 md:p-6 rounded-2xl shadow-xl flex items-center gap-4 text-white backdrop-blur-xl border ${isExpired ? 'bg-red-500/90 border-red-400' : 'bg-yellow-500/90 border-yellow-400'}`}>
          <div className="p-3 bg-white/20 rounded-xl"><AlertTriangle className="w-8 h-8" /></div>
          <div>
            <h3 className="font-extrabold text-xl tracking-tight">{isExpired ? 'Contract Expired!' : 'Contract Expiring Soon!'}</h3>
            <p className="font-medium text-white/90">
              {isExpired 
                ? `Your shop contract ended on ${myData.contractEndDate}. Please contact your landlord immediately.`
                : `Your shop contract will expire in ${daysLeft} days (on ${myData.contractEndDate}). Contact landlord to renew.`}
            </p>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-900 via-indigo-950 to-sky-900 p-8 sm:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-sky-500/20 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="relative z-10">
          <p className="text-sky-200 text-sm font-bold uppercase tracking-widest mb-2">Tenant Portal</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Welcome back, {myData.name}!</h1>
          <p className="text-sky-100 mt-3 text-lg font-medium max-w-xl">Overview of your rental account, payment history, and security settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-3xl border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative group">
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${totalDueAmount > 0 ? 'from-red-500/5 to-orange-500/5' : 'from-emerald-500/5 to-teal-500/5'}`}></div>
          <CardContent className="p-8 flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Dues</p>
              <h2 className={`text-4xl font-black tracking-tighter ${totalDueAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                ৳ {totalDueAmount.toLocaleString()}
              </h2>
              <p className="text-xs font-medium mt-2 text-gray-400">{totalDueAmount === 0 ? 'All caught up!' : 'Please clear your dues'}</p>
            </div>
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-inner ${totalDueAmount > 0 ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'}`}>
              <AlertCircle className="w-8 h-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-8 flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Monthly Rent</p>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">৳ {(myData.rent || 0).toLocaleString()}</h2>
              <p className="text-xs font-medium mt-2 text-gray-400">Unit {myData.room}, {myData.building}</p>
            </div>
            <div className="h-16 w-16 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
              <CreditCard className="w-8 h-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-8 flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Advance Paid</p>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">৳ {(myData.advance || 0).toLocaleString()}</h2>
              <p className="text-xs font-medium mt-2 text-gray-400">
                {myData.type === 'Shop' ? `Start: ${myData.contractStartDate || 'N/A'}` : `Move-in: ${myData.entryDate}`}
              </p>
            </div>
            <div className="h-16 w-16 rounded-2xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-inner">
              <Calendar className="w-8 h-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-3xl border-0 shadow-xl bg-white dark:bg-gray-900 overflow-hidden border-t-4 border-red-500">
            <CardHeader className="bg-red-50/50 dark:bg-red-900/10 p-8 pb-6 border-b border-red-100 dark:border-red-900/20">
              <CardTitle className="text-xl font-bold flex items-center gap-3 text-red-700 dark:text-red-400">
                <AlertCircle className="w-6 h-6" /> Pending Dues
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {dues.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">You're all caught up!</h3>
                  <p className="text-gray-500 font-medium">No pending dues right now.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                      <TableRow>
                        <TableHead className="font-bold py-4">Month</TableHead>
                        <TableHead className="font-bold py-4">Total Amount</TableHead>
                        <TableHead className="font-bold py-4 text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dues.map(bill => (
                        <TableRow key={bill._id} className="hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors">
                          <TableCell className="font-bold py-5">{bill.month} {bill.year}</TableCell>
                          <TableCell className="font-black text-red-600 dark:text-red-400 text-lg">৳ {bill.dueAmount}</TableCell>
                          <TableCell className="text-right">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold shadow-sm ${
                              bill.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-orange-100 text-orange-800 border-orange-200'
                            } border`}>
                              {bill.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-xl bg-white dark:bg-gray-900 overflow-hidden">
            <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 p-8 pb-6 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-indigo-500" /> Payment History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {history.length === 0 ? (
                 <div className="p-12 text-center text-gray-500 font-medium">No payment history found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
                      <TableRow>
                        <TableHead className="font-bold py-4">Month</TableHead>
                        <TableHead className="font-bold py-4">Date</TableHead>
                        <TableHead className="font-bold py-4">Amount</TableHead>
                        <TableHead className="font-bold py-4">Status</TableHead>
                        <TableHead className="font-bold py-4 text-right">Receipt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((payment) => (
                        <TableRow key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <TableCell className="font-bold py-4">{payment.month} {payment.year}</TableCell>
                          <TableCell className="text-sm font-medium text-gray-500">{payment.paymentDate || 'N/A'}</TableCell>
                          <TableCell>
                            <span className="font-black text-gray-900 dark:text-white">
                              ৳ {payment.paidAmount > 0 ? payment.paidAmount : payment.dueAmount}
                            </span>
                          </TableCell>
                          <TableCell>
                            {payment.status === 'Paid' ? (
                               <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400 shadow-sm">
                                 <CheckCircle2 className="w-3 h-3 mr-1" /> Paid
                               </span>
                            ) : (
                               <span className="inline-flex items-center text-xs font-bold text-blue-700 bg-blue-100 border border-blue-200 px-3 py-1 rounded-full dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400 shadow-sm">
                                 Pending
                               </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {payment.status === 'Paid' ? (
                              <DownloadReceiptButton payment={payment} iconOnly={true} />
                            ) : (
                              <span className="text-xs text-gray-400 font-medium italic">Available after approval</span>
                            )}
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

        <div className="space-y-8 lg:col-span-1">
          <Card className="rounded-3xl border-0 shadow-xl bg-white dark:bg-gray-900 overflow-hidden">
            <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 p-6 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-lg font-bold">Property Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {myData.type === 'Shop' && (
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Contract Period</p>
                    <p className="text-sm font-medium text-gray-500 mt-1">Start: {myData.contractStartDate || 'N/A'}</p>
                    <p className="text-sm font-medium text-gray-500">End: {myData.contractEndDate || 'N/A'}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Gas Card Number</p>
                  <p className="text-sm font-mono font-medium text-gray-500 mt-1">{myData.gasCardNo || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-xl">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Electricity Card Number</p>
                  <p className="text-sm font-mono font-medium text-gray-500 mt-1">{myData.electricityCardNo || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-xl bg-white dark:bg-gray-900 overflow-hidden">
            <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 p-6 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-indigo-600" />
                Security Settings
              </CardTitle>
              <CardDescription className="font-medium mt-1">Update your login credentials.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateCredentials}>
              <CardContent className="p-6 space-y-5">
                {updateMsg.text && (
                  <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${updateMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {updateMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    {updateMsg.text}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="newId" className="text-xs uppercase tracking-widest font-bold text-gray-500">New Login ID</Label>
                  <Input 
                    id="newId" 
                    className="h-12 bg-gray-50/50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 rounded-xl font-medium focus-visible:ring-indigo-500"
                    placeholder="e.g. mahtab123" 
                    value={newLoginId} 
                    onChange={(e) => setNewLoginId(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-xs uppercase tracking-widest font-bold text-gray-500">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password"
                    className="h-12 bg-gray-50/50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 rounded-xl font-medium focus-visible:ring-indigo-500"
                    placeholder="Enter new password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required 
                  />
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Button type="submit" disabled={isUpdating} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg font-bold tracking-wide">
                  {isUpdating ? 'Updating...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
