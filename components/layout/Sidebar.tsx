'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Building, DoorOpen, Users, Receipt, Settings, Home, Store, ChevronsUpDown, CheckSquare, LogOut, ClipboardList, Wrench, Contact, Utensils } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePropertyType } from '@/components/PropertyTypeContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'



export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { propertyType, setPropertyType, userAccess } = usePropertyType()

  // Determine which nav items to show based on the active module (propertyType)
  let activeNavItems = []
  
  if (propertyType === 'House' || propertyType === 'Shop') {
    activeNavItems = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Properties', href: '/dashboard/buildings', icon: Building },
      { name: 'Units', href: '/dashboard/rooms', icon: DoorOpen },
      { name: 'Tenants', href: '/dashboard/tenants', icon: Users },
      { name: 'Verify Bills', href: '/dashboard/verify-bills', icon: CheckSquare },
      { name: 'Payments', href: '/dashboard/payments', icon: Receipt },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ]
  } else if (propertyType === 'Notice Board') {
    activeNavItems = [
      { name: 'Notice Board', href: '/dashboard/notice-board', icon: ClipboardList },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ]
  } else if (propertyType === 'Staff') {
    activeNavItems = [
      { name: 'Staff Management', href: '/dashboard/staff', icon: Contact },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ]
  } else if (propertyType === 'Maintenance') {
    activeNavItems = [
      { name: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ]
  } else if (propertyType === 'Mess') {
    activeNavItems = [
      { name: 'Mess System', href: '/dashboard/mess', icon: Utensils },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ]
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  // Count how many modules the user has access to, to disable dropdown if only 1
  const accessCount = [userAccess?.house, userAccess?.shop, userAccess?.noticeBoard, userAccess?.staff, userAccess?.maintenance, userAccess?.mess].filter(Boolean).length

  const getModuleIcon = (type: string, className: string) => {
    switch (type) {
      case 'House': return <Home className={className} />
      case 'Shop': return <Store className={className} />
      case 'Notice Board': return <ClipboardList className={className} />
      case 'Staff': return <Contact className={className} />
      case 'Maintenance': return <Wrench className={className} />
      case 'Mess': return <Utensils className={className} />
      default: return <Home className={className} />
    }
  }

  const getModuleColor = (type: string) => {
    switch (type) {
      case 'House': return 'text-green-600'
      case 'Shop': return 'text-blue-600'
      case 'Notice Board': return 'text-purple-600'
      case 'Staff': return 'text-orange-600'
      case 'Maintenance': return 'text-red-600'
      case 'Mess': return 'text-amber-600'
      default: return 'text-gray-600'
    }
  }

  const handleModuleChange = (type: any, path: string) => {
    setPropertyType(type)
    router.push(path)
    onNavigate?.()
  }

  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <DropdownMenu>
          <DropdownMenuTrigger 
            disabled={!userAccess || accessCount <= 1}
            className="w-full flex items-center justify-between px-4 py-2 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md outline-none disabled:opacity-80 disabled:cursor-default"
          >
            <div className="flex items-center gap-2">
              {getModuleIcon(propertyType, `h-5 w-5 ${getModuleColor(propertyType)}`)}
              <span>{propertyType === 'House' || propertyType === 'Shop' ? `${propertyType} Rent` : propertyType}</span>
            </div>
            {accessCount > 1 && (
              <ChevronsUpDown className="h-4 w-4 text-gray-500" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            {userAccess?.house && (
              <DropdownMenuItem onClick={() => handleModuleChange('House', '/dashboard')} className="cursor-pointer">
                <Home className="mr-2 h-4 w-4 text-green-600" />
                <span>House Rent</span>
              </DropdownMenuItem>
            )}
            {userAccess?.shop && (
              <DropdownMenuItem onClick={() => handleModuleChange('Shop', '/dashboard')} className="cursor-pointer">
                <Store className="mr-2 h-4 w-4 text-blue-600" />
                <span>Shop Rent</span>
              </DropdownMenuItem>
            )}
            {userAccess?.noticeBoard && (
              <DropdownMenuItem onClick={() => handleModuleChange('Notice Board', '/dashboard/notice-board')} className="cursor-pointer">
                <ClipboardList className="mr-2 h-4 w-4 text-purple-600" />
                <span>Notice Board</span>
              </DropdownMenuItem>
            )}
            {userAccess?.staff && (
              <DropdownMenuItem onClick={() => handleModuleChange('Staff', '/dashboard/staff')} className="cursor-pointer">
                <Contact className="mr-2 h-4 w-4 text-orange-600" />
                <span>Staff Management</span>
              </DropdownMenuItem>
            )}
            {userAccess?.maintenance && (
              <DropdownMenuItem onClick={() => handleModuleChange('Maintenance', '/dashboard/maintenance')} className="cursor-pointer">
                <Wrench className="mr-2 h-4 w-4 text-red-600" />
                <span>Maintenance</span>
              </DropdownMenuItem>
            )}
            {userAccess?.mess && (
              <DropdownMenuItem onClick={() => handleModuleChange('Mess', '/dashboard/mess')} className="cursor-pointer">
                <Utensils className="mr-2 h-4 w-4 text-amber-600" />
                <span>Mess System</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {activeNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            // Adjust name based on property type for context
            let displayName = item.name
            if (propertyType === 'Shop' && item.name === 'Units') displayName = 'Shops'
            if (propertyType === 'House' && item.name === 'Units') displayName = 'Flats'

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-green-600',
                  isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                )}
              >
                <Icon className="h-4 w-4" />
                {displayName}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-950/50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <div className="hidden border-r bg-gray-50/40 lg:block dark:bg-gray-800/40 lg:w-64">
      <SidebarContent />
    </div>
  )
}

