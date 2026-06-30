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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu'
import { PlusCircle, Search, Filter, FileText, Trash2, Edit } from 'lucide-react'
import { usePropertyType } from '@/components/PropertyTypeContext'
import { useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function PaymentsPage() {
  const { propertyType } = usePropertyType()
  const isShop = propertyType === 'Shop'
  const unitName = isShop ? 'Shop' : 'Room'

  const [payments, setPayments] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [editingPayment, setEditingPayment] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

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

  const handleUpdatePayment = async () => {
    if (!editingPayment) return
    try {
      const res = await fetch(`/api/payments/${editingPayment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editingPayment.status,
          paidAmount: editingPayment.paidAmount
        })
      })
      if (res.ok) {
        setIsEditDialogOpen(false)
        setEditingPayment(null)
        fetchData()
      } else {
        alert('Failed to update payment')
      }
    } catch (error) {
      console.error(error)
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

  const generateReceipt = (payment: any) => {
    const doc = new jsPDF()
    
    // Header (Building Name as Logo)
    doc.setFontSize(28)
    doc.setTextColor(225, 29, 72) // rose-600
    doc.setFont('helvetica', 'bold')
    doc.text(payment.building.toUpperCase(), 105, 25, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setTextColor(156, 163, 175) // gray-400
    doc.setFont('helvetica', 'normal')
    doc.text('P A Y M E N T   R E C E I P T', 105, 34, { align: 'center' })
    
    // Divider
    doc.setDrawColor(226, 232, 240) // gray-200
    doc.setLineWidth(0.5)
    doc.line(20, 42, 190, 42)
    
    // Receipt Info & Status
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128) // gray-500
    doc.text(`Receipt No: #${payment._id.substring(0, 8).toUpperCase()}`, 20, 52)
    doc.text(`Date: ${new Date(payment.paymentDate).toLocaleDateString()}`, 190, 52, { align: 'right' })
    
    doc.setTextColor(payment.status === 'Paid' ? 22 : payment.status === 'Due' ? 220 : 202, payment.status === 'Paid' ? 163 : payment.status === 'Due' ? 38 : 138, payment.status === 'Paid' ? 74 : payment.status === 'Due' ? 38 : 4) // Dynamic status color
    doc.setFont('helvetica', 'bold')
    doc.text(`Status: ${payment.status.toUpperCase()}`, 190, 58, { align: 'right' })
    
    // Tenant Info
    doc.setFontSize(12)
    doc.setTextColor(17, 24, 39) // gray-900
    doc.setFont('helvetica', 'bold')
    doc.text('Billed To:', 20, 65)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(55, 65, 81) // gray-700
    doc.text(`Name: ${payment.tenantName}`, 20, 73)
    doc.text(`Flat/Room: ${payment.room}`, 20, 79)
    doc.text(`Billing Month: ${payment.month} ${payment.year}`, 20, 85)
    
    // Table Data Calculation
    const additionalTotal = payment.additionalBills?.reduce((sum: number, b: any) => sum + (Number(b.amount) || 0), 0) || 0;
    
    // For backwards compatibility, if there are no additionalBills but there is gas/electricity, we use them
    let gasAmt = payment.gasAmount || 0;
    let elecAmt = payment.electricityAmount || 0;
    
    // If additionalBills has Gas/Electricity, don't count the separate fields to avoid double counting
    if (payment.additionalBills && payment.additionalBills.some((b: any) => b.name === 'Gas')) {
      gasAmt = 0;
    }
    if (payment.additionalBills && payment.additionalBills.some((b: any) => b.name === 'Electricity')) {
      elecAmt = 0;
    }

    const totalAmount = payment.rentAmount + gasAmt + elecAmt + additionalTotal

    const tableData: any[][] = [
      ['Monthly Rent', `BDT ${payment.rentAmount.toLocaleString()}`]
    ]

    // Add legacy fields if they exist and aren't in additionalBills
    if (gasAmt > 0) tableData.push(['Gas Bill', `BDT ${gasAmt.toLocaleString()}`])
    if (elecAmt > 0) tableData.push(['Electricity Bill', `BDT ${elecAmt.toLocaleString()}`])
    
    // Add dynamic additional bills
    if (payment.additionalBills && payment.additionalBills.length > 0) {
      payment.additionalBills.forEach((bill: any) => {
        tableData.push([bill.name, `BDT ${(Number(bill.amount) || 0).toLocaleString()}`])
      })
    }

    tableData.push(
      ['Total Amount', `BDT ${totalAmount.toLocaleString()}`],
      ['Paid Amount', `BDT ${payment.paidAmount.toLocaleString()}`],
      ['Due Amount', `BDT ${payment.dueAmount.toLocaleString()}`]
    )

    autoTable(doc, {
      startY: 95,
      head: [['Description', 'Amount (BDT)']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [225, 29, 72], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 11 },
      styles: { halign: 'left', textColor: [55, 65, 81], fontSize: 10, cellPadding: 6, lineColor: [226, 232, 240] },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold', textColor: [17, 24, 39] } },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      willDrawCell: function(data) {
        // Highlight total rows
        if (data.row.index >= tableData.length - 3 && data.section === 'body') {
          doc.setFillColor(255, 241, 242) // rose-50
          doc.setTextColor(225, 29, 72) // rose-600
          doc.setFont('helvetica', 'bold')
        }
      }
    })
    
    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || 150
    
    // Bottom Divider
    doc.setDrawColor(226, 232, 240) // gray-200
    doc.line(20, finalY + 15, 190, finalY + 15)
    
    doc.setFontSize(11)
    doc.setTextColor(55, 65, 81)
    doc.setFont('helvetica', 'bold')
    doc.text(`Payment Method:`, 20, finalY + 25)
    doc.setFont('helvetica', 'normal')
    doc.text(`${payment.paymentMethod || 'Cash'}`, 55, finalY + 25)
    
    doc.setFontSize(9)
    doc.setTextColor(156, 163, 175)
    doc.text('Thank you for your payment. This is a computer-generated receipt.', 105, finalY + 40, { align: 'center' })
    
    doc.save(`${payment.building}_Receipt_${payment.tenantName}_${payment.month}.pdf`)
  }

  const [statusFilter, setStatusFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPayments = propertyType === 'Shop'
    ? payments.filter(p => p.type === 'Shop')
    : payments.filter(p => p.type === 'House' || !p.type)

  const activeTenants = propertyType === 'Shop'
    ? tenants.filter(t => t.type === 'Shop')
    : tenants.filter(t => t.type === 'House' || !t.type)

  if (isLoading) return <div>Loading payments...</div>

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' })
  const currentYear = new Date().getFullYear().toString()

  // Calculate stats for current month
  const thisMonthBills = filteredPayments.filter(p => p.month === currentMonth && p.year === currentYear)
  const paidThisMonth = thisMonthBills.filter(p => p.status === 'Paid').length
  const dueThisMonth = thisMonthBills.filter(p => p.status === 'Due' || p.status === 'Pending').length

  const displayPayments = filteredPayments.filter(p => {
    const matchStatus = statusFilter === 'All' ? true : p.status === statusFilter
    const matchSearch = p.tenantName?.toLowerCase().includes(searchQuery.toLowerCase()) || p.room?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchStatus && matchSearch
  })

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
          
          <div className="flex gap-4 items-center">
            <div 
              className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-center cursor-pointer hover:bg-black/30 transition-colors"
              onClick={() => setStatusFilter('Paid')}
            >
              <div className="text-2xl font-bold text-white">{paidThisMonth}</div>
              <div className="text-xs text-green-300 font-medium uppercase tracking-wider">Paid this month</div>
            </div>
            <div 
              className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-center cursor-pointer hover:bg-black/30 transition-colors"
              onClick={() => setStatusFilter('Due')}
            >
              <div className="text-2xl font-bold text-white">{dueThisMonth}</div>
              <div className="text-xs text-red-300 font-medium uppercase tracking-wider">Due this month</div>
            </div>
          </div>
          
          {/* Edit Payment Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Update Payment Status</DialogTitle>
                <DialogDescription>Modify status and paid amount.</DialogDescription>
              </DialogHeader>
              {editingPayment && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Total Due</Label>
                    <div className="col-span-3 text-sm font-semibold">
                      {(() => {
                        const additionalTotal = editingPayment.additionalBills?.reduce((sum: number, b: any) => sum + (Number(b.amount) || 0), 0) || 0;
                        let gasAmt = editingPayment.gasAmount || 0;
                        let elecAmt = editingPayment.electricityAmount || 0;
                        if (editingPayment.additionalBills && editingPayment.additionalBills.some((b: any) => b.name === 'Gas')) gasAmt = 0;
                        if (editingPayment.additionalBills && editingPayment.additionalBills.some((b: any) => b.name === 'Electricity')) elecAmt = 0;
                        return `৳ ${(editingPayment.rentAmount + gasAmt + elecAmt + additionalTotal).toLocaleString()}`
                      })()}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Paid (৳)</Label>
                    <Input 
                      type="number" 
                      className="col-span-3"
                      value={editingPayment.paidAmount || 0}
                      onChange={e => setEditingPayment({...editingPayment, paidAmount: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Status</Label>
                    <select 
                      className="col-span-3 flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                      value={editingPayment.status}
                      onChange={e => setEditingPayment({...editingPayment, status: e.target.value})}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Partial">Partial</option>
                      <option value="Due">Due</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={handleUpdatePayment}>Save</Button>
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-[280px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-full h-10"
                />
              </div>
              <div className="relative">
                <select 
                  className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full h-10 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Paid">Paid Only</option>
                  <option value="Due">Due Only</option>
                  <option value="Pending">Pending</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
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
                {displayPayments.map((payment) => (
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 gap-2 bg-white dark:bg-gray-950 border-violet-200 dark:border-violet-900 hover:bg-violet-50 dark:hover:bg-violet-900/30 text-violet-700 dark:text-violet-300 transition-all rounded-lg">
                            <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></svg>
                            View Details
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 p-4 rounded-xl shadow-2xl border-violet-100 dark:border-violet-900/50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">Bill Breakdown</h4>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2.5">
                            <div className="flex justify-between items-center"><span className="font-medium">Rent:</span> <span className="font-semibold text-gray-900 dark:text-gray-100">৳ {payment.rentAmount?.toLocaleString()}</span></div>
                            
                            {/* Show legacy fields only if they aren't in additionalBills */}
                            {(payment.gasAmount > 0 && (!payment.additionalBills || !payment.additionalBills.some((b: any) => b.name === 'Gas'))) && (
                              <div className="flex justify-between items-center"><span className="font-medium">Gas:</span> <span className="font-semibold text-gray-900 dark:text-gray-100">৳ {payment.gasAmount?.toLocaleString()}</span></div>
                            )}
                            {(payment.electricityAmount > 0 && (!payment.additionalBills || !payment.additionalBills.some((b: any) => b.name === 'Electricity'))) && (
                              <div className="flex justify-between items-center"><span className="font-medium">Electricity:</span> <span className="font-semibold text-gray-900 dark:text-gray-100">৳ {payment.electricityAmount?.toLocaleString()}</span></div>
                            )}
                            
                            {/* Dynamic Bills */}
                            {payment.additionalBills && payment.additionalBills.map((bill: any) => (
                              <div key={bill.name} className="flex justify-between items-center"><span className="font-medium">{bill.name}:</span> <span className="font-semibold text-gray-900 dark:text-gray-100">৳ {(Number(bill.amount) || 0).toLocaleString()}</span></div>
                            ))}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-black text-violet-600 dark:text-violet-400 tracking-tight mb-2">
                        {(() => {
                          const additionalTotal = payment.additionalBills?.reduce((sum: number, b: any) => sum + (Number(b.amount) || 0), 0) || 0;
                          let gasAmt = payment.gasAmount || 0;
                          let elecAmt = payment.electricityAmount || 0;
                          if (payment.additionalBills && payment.additionalBills.some((b: any) => b.name === 'Gas')) gasAmt = 0;
                          if (payment.additionalBills && payment.additionalBills.some((b: any) => b.name === 'Electricity')) elecAmt = 0;
                          return `৳ ${(payment.rentAmount + gasAmt + elecAmt + additionalTotal).toLocaleString()}`
                        })()}
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
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}</div>
                      <div className="text-xs mt-1 inline-flex items-center px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium border border-gray-200 dark:border-gray-700">
                        {payment.paymentMethod}
                      </div>
                      {payment.paymentMethod === 'Cash' && payment.paidTo && (
                        <div className="text-xs mt-1 text-orange-600 font-medium">
                          To: {payment.paidTo}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full" 
                          onClick={() => {
                            setEditingPayment(payment)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 gap-1 text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-full" 
                          onClick={() => generateReceipt(payment)}
                        >
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
                
                {displayPayments.length === 0 && (
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
