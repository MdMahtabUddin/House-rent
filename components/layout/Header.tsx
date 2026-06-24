'use client'

import { Bell, Menu, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-gray-50/40 px-4 lg:h-[60px] lg:px-6 dark:bg-gray-800/40">
      <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </Button>
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search tenants, rooms, payments..."
              className="w-full appearance-none bg-white pl-8 shadow-none md:w-2/3 lg:w-1/3 dark:bg-gray-950"
            />
          </div>
        </form>
      </div>
      <Button variant="outline" size="icon" className="ml-auto h-8 w-8 rounded-full">
        <Bell className="h-4 w-4" />
        <span className="sr-only">Toggle notifications</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="secondary" size="icon" className="rounded-full" />}>
          <User className="h-5 w-5" />
          <span className="sr-only">Toggle user menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
