'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Wrench, Clock, CheckCircle2, AlertTriangle, Building, DoorOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePropertyType } from '@/components/PropertyTypeContext'
import { useRouter } from 'next/navigation'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// Dummy data for maintenance
const INITIAL_REQUESTS = [
  { id: 1, title: 'Leaking Pipe', type: 'Plumbing', priority: 'High', status: 'Pending', building: 'Rose Villa', unit: 'Flat 4A', date: '2026-06-30' },
  { id: 2, title: 'Broken Window Glass', type: 'Carpentry', priority: 'Medium', status: 'In Progress', building: 'Sunrise Tower', unit: 'Flat 2B', date: '2026-06-29' },
  { id: 3, title: 'AC Not Cooling', type: 'Electrical', priority: 'Normal', status: 'Resolved', building: 'Rose Villa', unit: 'Flat 1A', date: '2026-06-25' },
]

export default function MaintenancePage() {
  const { userAccess } = usePropertyType()
  const router = useRouter()
  
  const [requests, setRequests] = useState(INITIAL_REQUESTS)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newReq, setNewReq] = useState({ title: '', type: 'Plumbing', priority: 'Normal', building: '', unit: '' })
  
  if (!userAccess?.maintenance) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 bg-red-100 text-red-600 rounded-full">
          <AlertTriangle size={48} />
        </div>
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-gray-500">You do not have permission to view Maintenance.</p>
        <Button onClick={() => router.push('/dashboard')} variant="outline">Go Back</Button>
      </div>
    )
  }

  const handleAddRequest = () => {
    if (!newReq.title || !newReq.building || !newReq.unit) return
    const req = {
      id: Date.now(),
      title: newReq.title,
      type: newReq.type,
      priority: newReq.priority,
      status: 'Pending',
      building: newReq.building,
      unit: newReq.unit,
      date: new Date().toISOString().split('T')[0]
    }
    setRequests([req, ...requests])
    setNewReq({ title: '', type: 'Plumbing', priority: 'Normal', building: '', unit: '' })
    setIsAddOpen(false)
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200'
      case 'In Progress': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200'
      case 'Resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'High': return 'text-rose-600'
      case 'Medium': return 'text-amber-600'
      case 'Normal': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-500 to-rose-600 p-8 sm:p-10 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Maintenance Hub</h1>
            <p className="text-red-100 text-lg max-w-xl">
              Track and resolve property maintenance requests efficiently.
            </p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-white text-red-600 hover:bg-red-50 hover:text-red-700 font-bold rounded-xl shadow-xl transition-all hover:scale-105 hover:shadow-red-500/25">
                <Plus className="mr-2 h-5 w-5" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] rounded-3xl overflow-hidden p-0 border-0 shadow-2xl">
              <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 sm:p-8 text-white relative">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white/10 blur-2xl rounded-full"></div>
                <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight mb-2 relative z-10">New Maintenance</DialogTitle>
                <DialogDescription className="text-red-100 font-medium relative z-10">Log a new issue that needs to be fixed.</DialogDescription>
              </div>
              
              <div className="p-6 sm:p-8 space-y-6 bg-white dark:bg-gray-950">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">Issue Description</Label>
                    <Input 
                      placeholder="e.g. Leaking Pipe in Kitchen" 
                      className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                      value={newReq.title} 
                      onChange={e => setNewReq({...newReq, title: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">Issue Type</Label>
                    <Select value={newReq.type} onValueChange={(v) => setNewReq({...newReq, type: v})}>
                      <SelectTrigger className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 font-medium">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Plumbing">Plumbing</SelectItem>
                        <SelectItem value="Electrical">Electrical</SelectItem>
                        <SelectItem value="Carpentry">Carpentry</SelectItem>
                        <SelectItem value="Appliance">Appliance</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">Priority Level</Label>
                    <Select value={newReq.priority} onValueChange={(v) => setNewReq({...newReq, priority: v})}>
                      <SelectTrigger className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 font-medium">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="High" className="font-medium text-rose-600">High Priority</SelectItem>
                        <SelectItem value="Medium" className="font-medium text-amber-600">Medium Priority</SelectItem>
                        <SelectItem value="Normal" className="font-medium text-blue-600">Normal Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">Building</Label>
                    <Input 
                      placeholder="e.g. Rose Villa" 
                      className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                      value={newReq.building} 
                      onChange={e => setNewReq({...newReq, building: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">Unit / Flat</Label>
                    <Input 
                      placeholder="e.g. Flat 4A" 
                      className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                      value={newReq.unit} 
                      onChange={e => setNewReq({...newReq, unit: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <Button variant="outline" className="h-12 px-6 rounded-xl font-bold" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAddRequest} className="h-12 px-8 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-500/30">Create Request</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tools & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Input placeholder="Search issues..." className="h-12 pl-12 rounded-2xl bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800 shadow-sm" />
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          <Button variant="outline" className="h-12 rounded-xl bg-white dark:bg-gray-950 whitespace-nowrap"><Filter className="w-4 h-4 mr-2" /> All Requests</Button>
          <Button variant="outline" className="h-12 rounded-xl bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/10 dark:border-rose-900/50 whitespace-nowrap">Pending</Button>
          <Button variant="outline" className="h-12 rounded-xl bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/50 whitespace-nowrap">In Progress</Button>
        </div>
      </div>

      {/* Maintenance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {requests.map((req) => (
          <Card key={req.id} className="rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-none bg-white dark:bg-gray-950 overflow-hidden group hover:border-red-200 dark:hover:border-red-900/50 transition-all duration-300">
            <CardHeader className="p-6 pb-4">
              <div className="flex justify-between items-start mb-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(req.status)}`}>
                  {req.status === 'Resolved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : req.status === 'In Progress' ? <Clock className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {req.status}
                </span>
                <span className={`text-xs font-bold ${getPriorityColor(req.priority)}`}>
                  {req.priority} Priority
                </span>
              </div>
              <CardTitle className="text-xl font-bold leading-tight group-hover:text-red-600 transition-colors">{req.title}</CardTitle>
              <div className="text-sm font-semibold text-gray-500 mt-1">{req.type}</div>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-3">
              <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-xl">
                <Building className="w-4 h-4 text-gray-400" />
                {req.building}
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-xl">
                <DoorOpen className="w-4 h-4 text-gray-400" />
                {req.unit}
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-4 border-t border-gray-50 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/20 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500">{req.date}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl font-bold h-9">
                    Update Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                  <DropdownMenuItem className="font-medium text-amber-600">Mark In Progress</DropdownMenuItem>
                  <DropdownMenuItem className="font-medium text-green-600">Mark Resolved</DropdownMenuItem>
                  <DropdownMenuItem className="font-medium text-red-600">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
