'use client'

import { useState } from 'react'
import { Plus, Bell, Calendar, Info, AlertTriangle, AlertCircle, FileText, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePropertyType } from '@/components/PropertyTypeContext'
import { useRouter } from 'next/navigation'

// Dummy data for notices
const INITIAL_NOTICES = [
  { id: 1, title: 'Water Supply Interruption', type: 'High', date: '2026-06-30', content: 'Water supply will be interrupted on July 1st from 10 AM to 2 PM due to main line repair work. Please store adequate water.' },
  { id: 2, title: 'Monthly Maintenance Fee', type: 'Normal', date: '2026-06-25', content: 'Gentle reminder to all tenants to clear their monthly maintenance fees by the 5th of every month to avoid late fines.' },
  { id: 3, title: 'New Security Rules', type: 'Medium', date: '2026-06-20', content: 'Main gates will be locked at 12:00 AM sharp. Please ensure you inform the guards if you are arriving late.' },
]

export default function NoticeBoardPage() {
  const { propertyType, userAccess } = usePropertyType()
  const router = useRouter()
  
  const [notices, setNotices] = useState(INITIAL_NOTICES)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newNotice, setNewNotice] = useState({ title: '', type: 'Normal', content: '' })
  
  if (!userAccess?.noticeBoard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 bg-red-100 text-red-600 rounded-full">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-gray-500">You do not have permission to view the Notice Board.</p>
        <Button onClick={() => router.push('/dashboard')} variant="outline">Go Back</Button>
      </div>
    )
  }

  const handleAddNotice = () => {
    if (!newNotice.title || !newNotice.content) return
    const notice = {
      id: Date.now(),
      title: newNotice.title,
      type: newNotice.type,
      date: new Date().toISOString().split('T')[0],
      content: newNotice.content
    }
    setNotices([notice, ...notices])
    setNewNotice({ title: '', type: 'Normal', content: '' })
    setIsAddOpen(false)
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'High': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
      case 'Normal': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'High': return <AlertTriangle className="w-4 h-4" />
      case 'Medium': return <Info className="w-4 h-4" />
      case 'Normal': return <Bell className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 p-8 sm:p-10 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Notice Board</h1>
            <p className="text-purple-100 text-lg max-w-xl">
              Publish announcements, alerts, and general notices to your tenants and staff.
            </p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 hover:text-purple-700 font-bold rounded-xl shadow-xl transition-all hover:scale-105 hover:shadow-purple-500/25">
                <Plus className="mr-2 h-5 w-5" />
                Create Notice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] rounded-3xl overflow-hidden p-0 border-0 shadow-2xl">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 sm:p-8 text-white relative">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white/10 blur-2xl rounded-full"></div>
                <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight mb-2 relative z-10">New Announcement</DialogTitle>
                <DialogDescription className="text-purple-100 font-medium relative z-10">Draft a new notice to be displayed on the board.</DialogDescription>
              </div>
              
              <div className="p-6 sm:p-8 space-y-6 bg-white dark:bg-gray-950">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">Notice Title</Label>
                  <Input 
                    placeholder="e.g. Water Supply Interruption" 
                    className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                    value={newNotice.title} 
                    onChange={e => setNewNotice({...newNotice, title: e.target.value})} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">Priority Level</Label>
                  <Select value={newNotice.type} onValueChange={(v) => setNewNotice({...newNotice, type: v || ''})}>
                    <SelectTrigger className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 font-medium">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="High" className="font-medium text-rose-600">High Priority (Alert)</SelectItem>
                      <SelectItem value="Medium" className="font-medium text-amber-600">Medium Priority (Warning)</SelectItem>
                      <SelectItem value="Normal" className="font-medium text-blue-600">Normal (Info)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">Notice Content</Label>
                  <textarea 
                    className="w-full min-h-[120px] p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-medium text-sm"
                    placeholder="Type the detailed announcement here..."
                    value={newNotice.content}
                    onChange={e => setNewNotice({...newNotice, content: e.target.value})}
                  />
                </div>
              </div>

              <div className="p-6 sm:p-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <Button variant="outline" className="h-12 px-6 rounded-xl font-bold" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAddNotice} className="h-12 px-8 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg shadow-purple-500/30">Publish Notice</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tools & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Input placeholder="Search notices..." className="h-12 pl-12 rounded-2xl bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800 shadow-sm" />
          <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          <Button variant="outline" className="h-12 rounded-xl bg-white dark:bg-gray-950 whitespace-nowrap"><Filter className="w-4 h-4 mr-2" /> All Notices</Button>
          <Button variant="outline" className="h-12 rounded-xl bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/10 dark:border-rose-900/50 whitespace-nowrap">High Priority</Button>
        </div>
      </div>

      {/* Notice Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {notices.map((notice) => (
          <Card key={notice.id} className="rounded-3xl border-0 shadow-lg shadow-gray-200/50 dark:shadow-none bg-white dark:bg-gray-950 overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className={`h-2 w-full ${notice.type === 'High' ? 'bg-rose-500' : notice.type === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
            <CardHeader className="p-6 pb-4">
              <div className="flex justify-between items-start mb-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getTypeColor(notice.type)}`}>
                  {getTypeIcon(notice.type)}
                  {notice.type}
                </span>
                <span className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-2.5 py-1 rounded-lg">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  {notice.date}
                </span>
              </div>
              <CardTitle className="text-xl font-bold leading-tight group-hover:text-purple-600 transition-colors">{notice.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {notice.content}
              </p>
            </CardContent>
            <CardFooter className="p-6 pt-4 border-t border-gray-50 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/20">
              <Button variant="ghost" size="sm" className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl font-semibold">
                Read Full Announcement
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
