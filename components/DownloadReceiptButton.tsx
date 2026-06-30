'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface DownloadReceiptButtonProps {
  payment: any
  className?: string
  iconOnly?: boolean
}

export function DownloadReceiptButton({ payment, className = '', iconOnly = false }: DownloadReceiptButtonProps) {
  const handleDownload = () => {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(22)
    doc.setTextColor(14, 165, 233) // Sky-500
    doc.text('House Rent Management', 105, 20, { align: 'center' })
    
    doc.setFontSize(14)
    doc.setTextColor(100)
    doc.text('Payment Receipt', 105, 30, { align: 'center' })

    doc.setLineWidth(0.5)
    doc.line(20, 35, 190, 35)

    // Details
    doc.setFontSize(11)
    doc.setTextColor(40)
    doc.text(`Receipt No: ${payment._id.substring(18).toUpperCase()}`, 20, 45)
    doc.text(`Date: ${payment.paymentDate || new Date().toISOString().split('T')[0]}`, 140, 45)
    
    doc.text(`Tenant Name: ${payment.tenantName}`, 20, 55)
    doc.text(`Building: ${payment.building}`, 140, 55)
    
    doc.text(`Room/Flat: ${payment.room}`, 20, 65)
    doc.text(`Month: ${payment.month} ${payment.year}`, 140, 65)

    doc.text(`Payment Method: ${payment.paymentMethod || 'Cash'}`, 20, 75)
    doc.text(`Status: ${payment.status}`, 140, 75)

    // Table
    const tableData: any[][] = [
      ['Rent Amount', `Tk ${payment.rentAmount || 0}`]
    ]

    // Backwards compatibility handling
    let gasAmt = payment.gasAmount || 0;
    let elecAmt = payment.electricityAmount || 0;
    if (payment.additionalBills && payment.additionalBills.some((b: any) => b.name === 'Gas')) gasAmt = 0;
    if (payment.additionalBills && payment.additionalBills.some((b: any) => b.name === 'Electricity')) elecAmt = 0;

    if (gasAmt > 0) tableData.push(['Gas Bill', `Tk ${gasAmt}`])
    if (elecAmt > 0) tableData.push(['Electricity Bill', `Tk ${elecAmt}`])

    // Dynamic additional bills
    if (payment.additionalBills && payment.additionalBills.length > 0) {
      payment.additionalBills.forEach((bill: any) => {
        tableData.push([bill.name, `Tk ${Number(bill.amount) || 0}`])
      })
    }
    
    tableData.push(['Total Paid', `Tk ${payment.paidAmount > 0 ? payment.paidAmount : payment.dueAmount}`])

    // @ts-ignore
    doc.autoTable({
      startY: 85,
      head: [['Description', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [14, 165, 233] },
      columnStyles: { 1: { halign: 'right' } }
    })

    // Footer
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY || 120
    doc.setFontSize(10)
    doc.setTextColor(150)
    doc.text('This is a system generated receipt and does not require a signature.', 105, finalY + 20, { align: 'center' })

    // Save
    doc.save(`Receipt_${payment.tenantName.replace(/\s+/g, '_')}_${payment.month}_${payment.year}.pdf`)
  }

  return (
    <Button 
      variant={iconOnly ? "ghost" : "outline"} 
      size={iconOnly ? "icon" : "default"} 
      className={className}
      onClick={handleDownload}
      title="Download Receipt"
    >
      <Download className={iconOnly ? "h-4 w-4" : "h-4 w-4 mr-2"} />
      {!iconOnly && 'Download Receipt'}
    </Button>
  )
}
