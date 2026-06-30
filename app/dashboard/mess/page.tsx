'use client'

import { useState } from 'react'
import { Plus, Search, Utensils, Users, Check, X, Calendar, Settings, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { usePropertyType } from '@/components/PropertyTypeContext'
import { useRouter } from 'next/navigation'

// Dummy data for mess members
const INITIAL_MEMBERS = [
  { id: 1, name: 'Sajid Islam', room: '201', meals: { breakfast: 1, lunch: 1, dinner: 1 }, totalMeals: 45, deposit: 3000 },
  { id: 2, name: 'Tanvir Ahmed', room: '201', meals: { breakfast: 0, lunch: 1, dinner: 1 }, totalMeals: 38, deposit: 2500 },
  { id: 3, name: 'Rakib Hasan', room: '202', meals: { breakfast: 1, lunch: 0, dinner: 1 }, totalMeals: 40, deposit: 3500 },
  { id: 4, name: 'Fahim Rahman', room: '203', meals: { breakfast: 0, lunch: 0, dinner: 0 }, totalMeals: 15, deposit: 1000 },
]

export default function MessPage() {
  const { userAccess } = usePropertyType()
  const router = useRouter()
  
  const [members, setMembers] = useState(INITIAL_MEMBERS)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newMember, setNewMember] = useState({ name: '', room: '', deposit: '' })

  const mealRate = 65.50 // Mock current meal rate
  
  if (!userAccess?.mess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 bg-red-100 text-red-600 rounded-full">
          <Utensils size={48} />
        </div>
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-gray-500">You do not have permission to view the Mess System.</p>
        <Button onClick={() => router.push('/dashboard')} variant="outline">Go Back</Button>
      </div>
    )
  }

  const handleAddMember = () => {
    if (!newMember.name || !newMember.room) return
    const member = {
      id: Date.now(),
      name: newMember.name,
      room: newMember.room,
      meals: { breakfast: 1, lunch: 1, dinner: 1 }, // Default all meals ON
      totalMeals: 0,
      deposit: Number(newMember.deposit) || 0
    }
    setMembers([member, ...members])
    setNewMember({ name: '', room: '', deposit: '' })
    setIsAddOpen(false)
  }

  const toggleMeal = (memberId: number, type: 'breakfast' | 'lunch' | 'dinner') => {
    setMembers(members.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          meals: {
            ...m.meals,
            [type]: m.meals[type] === 1 ? 0 : 1
          }
        }
      }
      return m
    }))
  }

  // Calculate totals
  const totalBreakfast = members.reduce((sum, m) => sum + m.meals.breakfast, 0)
  const totalLunch = members.reduce((sum, m) => sum + m.meals.lunch, 0)
  const totalDinner = members.reduce((sum, m) => sum + m.meals.dinner, 0)
  const totalMealsToday = totalBreakfast + totalLunch + totalDinner

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-500 to-emerald-600 p-8 sm:p-10 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Mess Management</h1>
            <p className="text-teal-100 text-lg max-w-xl">
              Track daily meals, manage members, and calculate monthly meal rates.
            </p>
          </div>
          <div className="flex gap-3">
            <Button size="lg" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl backdrop-blur-md border border-white/20">
              <Settings className="w-5 h-5" />
            </Button>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 font-bold rounded-xl shadow-xl transition-all hover:scale-105 hover:shadow-teal-500/25">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px] rounded-3xl overflow-hidden p-0 border-0 shadow-2xl">
                <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-6 sm:p-8 text-white relative">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white/10 blur-2xl rounded-full"></div>
                  <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight mb-2 relative z-10">New Mess Member</DialogTitle>
                  <DialogDescription className="text-teal-100 font-medium relative z-10">Add a tenant to the mess system.</DialogDescription>
                </div>
                
                <div className="p-6 sm:p-8 space-y-6 bg-white dark:bg-gray-950">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">Member Name</Label>
                      <Input 
                        placeholder="e.g. Sajid Islam" 
                        className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                        value={newMember.name} 
                        onChange={e => setNewMember({...newMember, name: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">Room No.</Label>
                      <Input 
                        placeholder="e.g. 201" 
                        className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                        value={newMember.room} 
                        onChange={e => setNewMember({...newMember, room: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">Initial Deposit (৳)</Label>
                      <Input 
                        type="number"
                        placeholder="e.g. 3000" 
                        className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                        value={newMember.deposit} 
                        onChange={e => setNewMember({...newMember, deposit: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                  <Button variant="outline" className="h-12 px-6 rounded-xl font-bold" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddMember} className="h-12 px-8 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg shadow-teal-500/30">Add Member</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-3xl border-0 shadow-lg shadow-gray-200/40 dark:shadow-none bg-white dark:bg-gray-950 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 text-gray-100 dark:text-gray-800"><Utensils size={64} /></div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Today's Total Meals</p>
            <h3 className="text-4xl font-black text-gray-900 dark:text-white">{totalMealsToday}</h3>
            <div className="flex gap-4 mt-4">
              <div className="text-sm font-medium"><span className="text-amber-500 font-bold">{totalBreakfast}</span> Brkfst</div>
              <div className="text-sm font-medium"><span className="text-blue-500 font-bold">{totalLunch}</span> Lunch</div>
              <div className="text-sm font-medium"><span className="text-indigo-500 font-bold">{totalDinner}</span> Dinner</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-3xl border-0 shadow-lg shadow-gray-200/40 dark:shadow-none bg-white dark:bg-gray-950 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 text-gray-100 dark:text-gray-800"><Settings size={64} /></div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Current Meal Rate</p>
            <h3 className="text-4xl font-black text-teal-600 dark:text-teal-400">৳ {mealRate.toFixed(2)}</h3>
            <p className="text-sm font-medium text-gray-500 mt-4 flex items-center">
              <Calendar className="w-4 h-4 mr-1.5" /> Updated up to yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-3xl border-0 shadow-lg shadow-gray-200/40 dark:shadow-none bg-white dark:bg-gray-950 overflow-hidden relative sm:col-span-2 lg:col-span-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between h-full relative z-10">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Shopping Expense (This Month)</p>
              <h3 className="text-4xl font-black">৳ 12,450</h3>
              <Button variant="link" className="text-teal-400 p-0 h-auto mt-2 font-semibold">View shopping logs <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
            <div className="mt-4 sm:mt-0 p-4 bg-white/10 rounded-2xl backdrop-blur-md">
              <Button className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold h-12 px-6 w-full">
                <Plus className="w-5 h-5 mr-2" /> Add Bazaar Expense
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Meal Input Table */}
      <Card className="rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-none bg-white dark:bg-gray-950 overflow-hidden">
        <CardHeader className="p-6 border-b border-gray-100 dark:border-gray-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-900/20">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Calendar className="text-teal-600" /> Today's Meal Input
            </CardTitle>
            <p className="text-sm font-medium text-gray-500 mt-1">Manage today's breakfast, lunch, and dinner count for all members.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Input placeholder="Search member..." className="h-10 pl-10 rounded-xl bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800" />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 text-gray-500 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Member Info</th>
                <th className="px-6 py-4 text-center text-amber-600 bg-amber-50 dark:bg-amber-900/10 border-x border-gray-100 dark:border-gray-800">Breakfast</th>
                <th className="px-6 py-4 text-center text-blue-600 bg-blue-50 dark:bg-blue-900/10 border-r border-gray-100 dark:border-gray-800">Lunch</th>
                <th className="px-6 py-4 text-center text-indigo-600 bg-indigo-50 dark:bg-indigo-900/10 border-r border-gray-100 dark:border-gray-800">Dinner</th>
                <th className="px-6 py-4 text-right">Summary (Month)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {members.map(member => (
                <tr key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 flex items-center justify-center font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100">{member.name}</div>
                        <div className="text-xs font-medium text-gray-500">Room {member.room}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center bg-amber-50/30 dark:bg-amber-900/5 border-x border-gray-100 dark:border-gray-800">
                    <button 
                      onClick={() => toggleMeal(member.id, 'breakfast')}
                      className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-all ${member.meals.breakfast === 1 ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200'}`}
                    >
                      {member.meals.breakfast === 1 ? <Check size={18} strokeWidth={3} /> : <X size={18} />}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center bg-blue-50/30 dark:bg-blue-900/5 border-r border-gray-100 dark:border-gray-800">
                    <button 
                      onClick={() => toggleMeal(member.id, 'lunch')}
                      className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-all ${member.meals.lunch === 1 ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200'}`}
                    >
                      {member.meals.lunch === 1 ? <Check size={18} strokeWidth={3} /> : <X size={18} />}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center bg-indigo-50/30 dark:bg-indigo-900/5 border-r border-gray-100 dark:border-gray-800">
                    <button 
                      onClick={() => toggleMeal(member.id, 'dinner')}
                      className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-all ${member.meals.dinner === 1 ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200'}`}
                    >
                      {member.meals.dinner === 1 ? <Check size={18} strokeWidth={3} /> : <X size={18} />}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-bold text-gray-900 dark:text-gray-100">{member.totalMeals} Meals</div>
                    <div className="text-xs font-medium text-gray-500">Deposit: ৳{member.deposit}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
        <CardFooter className="p-4 border-t border-gray-100 dark:border-gray-900 bg-gray-50 dark:bg-gray-900/50 justify-end">
          <Button className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-gray-900 text-white rounded-xl font-bold">
            Save Today's Input
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
