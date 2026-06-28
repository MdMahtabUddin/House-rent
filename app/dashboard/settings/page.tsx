'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { usePropertyType } from '@/components/PropertyTypeContext'

export default function SettingsPage() {
  const { propertyType } = usePropertyType()
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [status, setStatus] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match' })
      return
    }

    if (passwords.newPassword.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters' })
      return
    }
    
    setIsLoading(true)
    setStatus(null)

    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      })

      const data = await res.json()

      if (res.ok) {
        setStatus({ type: 'success', message: 'Password updated successfully' })
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to update password' })
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your {propertyType.toLowerCase()} management account preferences and security.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Security Settings */}
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-950">
          <CardHeader>
            <CardTitle className="text-lg">Change Password</CardTitle>
            <CardDescription>
              Update the admin password used to log in to this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {status && (
                <div className={`p-3 rounded-md text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {status.message}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input 
                  id="currentPassword" 
                  type="password" 
                  value={passwords.currentPassword}
                  onChange={e => setPasswords({...passwords, currentPassword: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input 
                  id="newPassword" 
                  type="password" 
                  value={passwords.newPassword}
                  onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={passwords.confirmPassword}
                  onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Application Preferences */}
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-950 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Application Preferences</CardTitle>
            <CardDescription>
              Customize how the application looks and feels.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">Currency Display</h4>
                  <p className="text-sm text-gray-500">Default currency symbol for amounts</p>
                </div>
                <select className="h-9 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm outline-none">
                  <option value="BDT">৳ (BDT)</option>
                  <option value="USD">$ (USD)</option>
                </select>
              </div>
              <hr className="border-gray-100 dark:border-gray-800" />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive alerts for new payments</p>
                </div>
                <div className="relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full bg-green-500">
                  <span className="translate-x-5 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                </div>
              </div>
              <hr className="border-gray-100 dark:border-gray-800" />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">Language</h4>
                  <p className="text-sm text-gray-500">Dashboard interface language</p>
                </div>
                <select className="h-9 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm outline-none">
                  <option value="en">English</option>
                  <option value="bn">Bengali</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-950 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Data Management</CardTitle>
            <CardDescription>
              Export your property and tenant data for backup purposes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50">
                Export Tenants (CSV)
              </Button>
              <Button variant="outline" className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50">
                Export Payments (CSV)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
