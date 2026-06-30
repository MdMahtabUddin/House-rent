'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Phone, Mail, MoreHorizontal, UserCheck, UserX, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePropertyType } from '@/components/PropertyTypeContext'
import { useRouter } from 'next/navigation'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// Dummy data for staff
const INITIAL_STAFF = [
  { id: 1, name: 'Abdur Rahman', role: 'Security Guard', phone: '01711-223344', status: 'Active', shift: 'Night (10 PM - 6 AM)', salary: 12000 },
  { id: 2, name: 'Hasina Begum', role: 'Cleaner', phone: '01911-334455', status: 'Active', shift: 'Morning (8 AM - 4 PM)', salary: 8000 },
  { id: 3, name: 'Karim Uddin', role: 'Maintenance', phone: '01811-445566', status: 'On Leave', shift: 'General (9 AM - 5 PM)', salary: 15000 },
]

export default function StaffPage() {
  const { userAccess } = usePropertyType()
  const router = useRouter()
  
  const [staff, setStaff] = useState(INITIAL_STAFF)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newStaff, setNewStaff] = useState({ name: '', role: '', phone: '', shift: '', salary: '' })
  
  if (!userAccess?.staff) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 bg-red-100 text-red-600 rounded-full">
          <UserX size={48} />
        </div>
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-gray-500">You do not have permission to view Staff Management.</p>
        <Button onClick={() => router.push('/dashboard')} variant="outline">Go Back</Button>
      </div>
    )
  }

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.role) return
    const s = {
      id: Date.now(),
      name: newStaff.name,
      role: newStaff.role,
      phone: newStaff.phone,
      shift: newStaff.shift || 'General',
      salary: Number(newStaff.salary) || 0,
      status: 'Active'
    }
    setStaff([s, ...staff])
    setNewStaff({ name: '', role: '', phone: '', shift: '', salary: '' })
    setIsAddOpen(false)
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 p-8 sm:p-10 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Staff Management</h1>
            <p className="text-orange-100 text-lg max-w-xl">
              Manage your employees, security guards, cleaners, and maintenance staff.
            </p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-bold rounded-xl shadow-xl transition-all hover:scale-105 hover:shadow-orange-500/25">
                <Plus className="mr-2 h-5 w-5" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] rounded-3xl overflow-hidden p-0 border-0 shadow-2xl">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 sm:p-8 text-white relative">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white/10 blur-2xl rounded-full"></div>
                <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight mb-2 relative z-10">New Employee</DialogTitle>
                <DialogDescription className="text-orange-100 font-medium relative z-10">Add a new staff member to the directory.</DialogDescription>
              </div>
              
              <div className="p-6 sm:p-8 space-y-6 bg-white dark:bg-gray-950">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">Full Name</Label>
                    <Input 
                      placeholder="e.g. Abdur Rahman" 
                      className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                      value={newStaff.name} 
                      onChange={e => setNewStaff({...newStaff, name: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">Role/Designation</Label>
                    <Select value={newStaff.role} onValueChange={(v) => setNewStaff({...newStaff, role: v})}>
                      <SelectTrigger className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 font-medium">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Security Guard">Security Guard</SelectItem>
                        <SelectItem value="Cleaner">Cleaner</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">Phone Number</Label>
                    <Input 
                      placeholder="01711-223344" 
                      className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                      value={newStaff.phone} 
                      onChange={e => setNewStaff({...newStaff, phone: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">Monthly Salary (৳)</Label>
                    <Input 
                      type="number"
                      placeholder="e.g. 15000" 
                      className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                      value={newStaff.salary} 
                      onChange={e => setNewStaff({...newStaff, salary: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">Working Shift</Label>
                    <Input 
                      placeholder="e.g. Night (10 PM - 6 AM)" 
                      className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                      value={newStaff.shift} 
                      onChange={e => setNewStaff({...newStaff, shift: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <Button variant="outline" className="h-12 px-6 rounded-xl font-bold" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAddStaff} className="h-12 px-8 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-500/30">Save Employee</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tools & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Input placeholder="Search staff by name or role..." className="h-12 pl-12 rounded-2xl bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800 shadow-sm" />
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          <Button variant="outline" className="h-12 rounded-xl bg-white dark:bg-gray-950 whitespace-nowrap"><Filter className="w-4 h-4 mr-2" /> All Staff</Button>
          <Button variant="outline" className="h-12 rounded-xl bg-white dark:bg-gray-950 whitespace-nowrap">Security</Button>
          <Button variant="outline" className="h-12 rounded-xl bg-white dark:bg-gray-950 whitespace-nowrap">Cleaners</Button>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {staff.map((s) => (
          <Card key={s.id} className="rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-none bg-white dark:bg-gray-950 overflow-hidden group hover:border-orange-200 dark:hover:border-orange-900/50 transition-all duration-300">
            <CardHeader className="p-6 pb-4 flex flex-row items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xl font-black">
                  {s.name.charAt(0)}
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">{s.name}</CardTitle>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{s.role}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <MoreHorizontal className="h-5 w-5 text-gray-500" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                  <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <UserCheck className="w-4 h-4 text-gray-400" />
                  Status
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {s.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                {s.phone || 'N/A'}
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                {s.shift}
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-4 border-t border-gray-50 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/20 flex justify-between items-center">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Monthly Salary</div>
              <div className="text-lg font-black text-gray-900 dark:text-gray-100">৳ {s.salary.toLocaleString()}</div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
