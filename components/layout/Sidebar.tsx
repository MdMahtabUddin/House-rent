'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Building, DoorOpen, Users, Receipt, Settings, Home, Store, ChevronsUpDown, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePropertyType } from '@/components/PropertyTypeContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Properties', href: '/dashboard/buildings', icon: Building },
  { name: 'Units', href: '/dashboard/rooms', icon: DoorOpen },
  { name: 'Tenants', href: '/dashboard/tenants', icon: Users },
  { name: 'Verify Bills', href: '/dashboard/verify-bills', icon: CheckSquare },
  { name: 'Payments', href: '/dashboard/payments', icon: Receipt },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { propertyType, setPropertyType, userAccess } = usePropertyType()

  return (
    <div className="hidden border-r bg-gray-50/40 lg:block dark:bg-gray-800/40 lg:w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <DropdownMenu>
            <DropdownMenuTrigger 
              disabled={!userAccess || (!userAccess.house || !userAccess.shop)}
              className="w-full flex items-center justify-between px-4 py-2 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md outline-none disabled:opacity-80 disabled:cursor-default"
            >
              <div className="flex items-center gap-2">
                {propertyType === 'House' ? (
                  <Home className="h-5 w-5 text-green-600" />
                ) : (
                  <Store className="h-5 w-5 text-blue-600" />
                )}
                <span>{propertyType} Rent</span>
              </div>
              {userAccess?.house && userAccess?.shop && (
                <ChevronsUpDown className="h-4 w-4 text-gray-500" />
              )}
            </DropdownMenuTrigger>
            {userAccess?.house && userAccess?.shop && (
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuItem onClick={() => setPropertyType('House')} className="cursor-pointer">
                  <Home className="mr-2 h-4 w-4 text-green-600" />
                  <span>House Rent</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPropertyType('Shop')} className="cursor-pointer">
                  <Store className="mr-2 h-4 w-4 text-blue-600" />
                  <span>Shop Rent</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => {
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
      </div>
    </div>
  )
}
