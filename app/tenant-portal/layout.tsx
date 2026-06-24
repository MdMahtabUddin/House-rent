import { Home, LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 flex flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white dark:bg-gray-950 px-4 shadow-sm sm:px-6">
        <div className="flex items-center gap-6 font-semibold flex-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Home className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-lg hidden sm:inline-block">My Rent Portal</span>
          </div>
          
          <nav className="flex items-center gap-4 ml-4 text-sm font-medium">
            <Link href="/tenant-portal" className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400">
              Dashboard
            </Link>
            <Link href="/tenant-portal/submit-bill" className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400">
              Submit Bill
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
            <User className="h-4 w-4" />
            <span>Abdur Rahman</span>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-50">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
