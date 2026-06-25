'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, DoorOpen, Home, Wallet, TrendingUp, AlertCircle, Store, ArrowRight, ArrowUpRight, Download, PlusCircle, Activity, Sun, Moon, CloudSun, Clock } from 'lucide-react'
import { usePropertyType } from '@/components/PropertyTypeContext'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function DashboardPage() {
  const { propertyType } = usePropertyType()
  const isShop = propertyType === 'Shop'
  const unitName = isShop ? 'Shop' : 'Flat'
  const unitNamePlural = isShop ? 'Shops' : 'Flats'
  const UnitIcon = isShop ? Store : DoorOpen

  const [greeting, setGreeting] = useState('Welcome back')
  const [GreetingIcon, setGreetingIcon] = useState<any>(Sun)
  const [currentTime, setCurrentTime] = useState('')
  const [isMounted, setIsMounted] = useState(false)

  // Local Storage States
  const [buildings, setBuildings] = useState<any[]>([])
  const [flats, setFlats] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])

  useEffect(() => {
    setIsMounted(true)
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting('Good Morning')
      setGreetingIcon(CloudSun)
    } else if (hour < 18) {
      setGreeting('Good Afternoon')
      setGreetingIcon(Sun)
    } else {
      setGreeting('Good Evening')
      setGreetingIcon(Moon)
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }))
    }, 1000)

    // Fetch real stats
    const fetchDashboardData = async () => {
      try {
        const [bRes, fRes, tRes, pRes] = await Promise.all([
          fetch('/api/buildings'),
          fetch('/api/flats'),
          fetch('/api/tenants'),
          fetch('/api/payments')
        ])
        if (bRes.ok) setBuildings(await bRes.json())
        if (fRes.ok) setFlats(await fRes.json())
        if (tRes.ok) setTenants(await tRes.json())
        if (pRes.ok) setPayments(await pRes.json())
      } catch (err) {
        console.error('Failed to load dashboard stats', err)
      }
    }
    fetchDashboardData()

    return () => clearInterval(timer)
  }, [])

  if (!isMounted) return null

  const emptyFlats = flats.filter(f => f.status === 'Empty')
  
  // Calculate from real Payments
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' })
  const thisMonthPayments = payments.filter(p => p.month === currentMonth)
  
  // Total Income this month
  const totalIncome = thisMonthPayments.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0)
  
  // Due payments total
  const duePayments = payments.filter(p => p.status === 'Due' || p.status === 'Partial')
  const totalDueAmount = duePayments.reduce((acc, curr) => acc + (curr.dueAmount || 0), 0)

  // Calculate Building Occupancy dynamically
  const buildingStats = buildings.map(b => {
    const bFlats = flats.filter(f => f.building === b.name)
    const occupied = bFlats.filter(f => f.status === 'Occupied' || f.status === 'rented').length
    const total = bFlats.length || b.rooms || 1 // fallback to avoid div by zero
    const percentage = Math.round((occupied / total) * 100)
    return { name: b.name, occupied, total, percentage }
  })

  return (
    <div className="flex flex-col gap-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Premium Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 dark:from-indigo-900 dark:via-purple-900 dark:to-blue-900 p-8 sm:p-10 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-black/10 blur-3xl rounded-full"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <GreetingIcon className="w-8 h-8 text-yellow-300 animate-pulse" />
              <h1 className="text-4xl font-extrabold tracking-tight">
                {greeting}, Landlord!
              </h1>
            </div>
            <p className="text-indigo-100 text-lg max-w-xl">
              Here's a comprehensive overview of your {propertyType.toLowerCase()} properties today.
            </p>
          </div>
          
          <div className="flex flex-col items-start sm:items-end gap-2">
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <Clock className="w-4 h-4 text-indigo-200" />
              <span className="font-medium font-mono">{currentTime || '...'}</span>
            </div>
            <Link href="/dashboard/payments">
              <Button className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all">
                Generate Reports <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Dynamic Glassmorphic Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/40 dark:bg-gray-950/40 backdrop-blur-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monthly Income</CardTitle>
            <div className="p-2.5 bg-green-100/80 dark:bg-green-900/40 rounded-xl ring-1 ring-green-200 dark:ring-green-800">
              <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">৳ {totalIncome.toLocaleString()}</div>
            <div className="mt-2 flex items-center text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 w-fit px-2 py-1 rounded-md">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>Projected total</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/40 dark:bg-gray-950/40 backdrop-blur-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Tenants</CardTitle>
            <div className="p-2.5 bg-blue-100/80 dark:bg-blue-900/40 rounded-xl ring-1 ring-blue-200 dark:ring-blue-800">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">{tenants.length}</div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center">
              Across {buildings.length} buildings
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/40 dark:bg-gray-950/40 backdrop-blur-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Empty {unitNamePlural}</CardTitle>
            <div className="p-2.5 bg-yellow-100/80 dark:bg-yellow-900/40 rounded-xl ring-1 ring-yellow-200 dark:ring-yellow-800">
              <UnitIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">{emptyFlats.length}</div>
            <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-500 font-medium bg-yellow-50 dark:bg-yellow-900/20 w-fit px-2 py-1 rounded-md">
              Needs attention
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/40 dark:bg-gray-950/40 backdrop-blur-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Payments</CardTitle>
            <div className="p-2.5 bg-red-100/80 dark:bg-red-900/40 rounded-xl ring-1 ring-red-200 dark:ring-red-800">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black tracking-tight text-red-600 dark:text-red-500">৳ {totalDueAmount.toLocaleString()}</div>
            <div className="mt-2 flex items-center text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 w-fit px-2 py-1 rounded-md">
              <span>{duePayments.length} tenants pending</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 md:grid-cols-7 lg:gap-8">
        {/* Recent Activity Timeline Section */}
        <Card className="md:col-span-4 lg:col-span-4 rounded-3xl border border-gray-200/60 dark:border-gray-800/60 shadow-md bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Latest updates from your properties
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative pl-6 border-l-2 border-indigo-100 dark:border-indigo-900/50 space-y-8">
              {tenants.slice(0, 4).map((t, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-950 ${t.status === 'Paid' ? 'bg-green-500' : t.status === 'Due' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm transition-transform hover:-translate-y-0.5">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">{t.name}</h4>
                      <span className="text-xs font-medium text-gray-400">{i === 0 ? 'Just now' : `${i*2} hours ago`}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t.status === 'Paid' 
                        ? `Paid ৳${t.rent?.toLocaleString()} for ${unitName} ${t.room} via bKash.`
                        : t.status === 'Due' 
                        ? `Missed payment deadline for ${unitName} ${t.room}.`
                        : `Partial payment received.`}
                    </p>
                  </div>
                </div>
              ))}
              
              {tenants.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No recent activity found. Add some tenants first!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Building Occupancy Section */}
        <Card className="md:col-span-3 lg:col-span-3 rounded-3xl border border-gray-200/60 dark:border-gray-800/60 shadow-md bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl flex flex-col">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <BuildingIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Occupancy Rate</CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Live status of your buildings</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-5 pt-6">
            {buildingStats.map((stat, i) => (
              <div key={i} className="group flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{stat.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                    {stat.percentage}% Full
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 mb-1.5 overflow-hidden shadow-inner">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                      stat.percentage >= 80 ? 'bg-green-500' : stat.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} 
                    style={{ width: `${stat.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-right font-medium">
                  {stat.occupied} of {stat.total} {unitNamePlural} occupied
                </p>
              </div>
            ))}

            {buildingStats.length === 0 && (
              <div className="text-center py-8 text-gray-500 flex-1 flex items-center justify-center">
                Add buildings to see occupancy stats.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function BuildingIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  )
}
