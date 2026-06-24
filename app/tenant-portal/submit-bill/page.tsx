'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

export default function SubmitBillPage() {
  const [submitted, setSubmitted] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('bKash')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      // alert('Bill submitted to landlord for verification.')
    }, 500)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 h-[60vh]">
        <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
          <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-500" />
        </div>
        <h2 className="text-2xl font-bold">Bill Submitted Successfully!</h2>
        <p className="text-gray-500 text-center max-w-md">
          Your rent and utility bills have been sent to your landlord for verification. You will be notified once they are approved.
        </p>
        <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-4">
          Submit Another Bill
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Submit Monthly Bill</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter your bill amounts and upload payment proof/receipts for landlord verification.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Fill out the amounts you are paying for this month.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <select id="month" className="w-full h-10 px-3 py-2 rounded-md border border-gray-200 bg-white text-sm dark:border-gray-800 dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>January 2026</option>
                  <option>February 2026</option>
                  <option>March 2026</option>
                  <option>April 2026</option>
                  <option>May 2026</option>
                  <option selected>June 2026</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rent">Base Rent Amount (৳)</Label>
                <Input id="rent" type="number" placeholder="15000" required />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
              <div className="space-y-2">
                <Label htmlFor="gas">Gas Bill (৳)</Label>
                <Input id="gas" type="number" placeholder="1080" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="electricity">Electricity Bill (৳)</Label>
                <Input id="electricity" type="number" placeholder="1250" />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-medium">Payment Proof</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <select 
                    id="method" 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full h-10 px-3 py-2 rounded-md border border-gray-200 bg-white text-sm dark:border-gray-800 dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Payment Date</Label>
                  <Input id="paymentDate" type="date" required />
                </div>
                
                {paymentMethod === 'Cash' ? (
                  <div className="space-y-2">
                    <Label htmlFor="receivedBy">Received By (Name)</Label>
                    <Input id="receivedBy" placeholder="e.g. Landlord / Manager Name" required />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="trxId">Transaction ID ({paymentMethod})</Label>
                    <Input id="trxId" placeholder="TrxID e.g. 9F8A7B6C" required />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="receipt">Upload Receipt Photo (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input id="receipt" type="file" className="cursor-pointer" />
                    <Button type="button" size="icon" variant="outline" className="shrink-0">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-6">
            <Button type="button" variant="ghost">Cancel</Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-8">
              Submit for Verification
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
