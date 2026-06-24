'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building2, User } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loginType, setLoginType] = useState<'landlord' | 'tenant'>('landlord')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (loginType === 'landlord') {
          if (data.user.role === 'landlord') {
            router.push('/dashboard')
          } else {
            setError('Please login at /mahtab')
          }
        } else {
          // tenant logic goes here
          router.push('/tenant-portal')
        }
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
            <Building2 className="w-8 h-8 text-green-600 dark:text-green-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            House Rent Manager
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {loginType === 'landlord' ? 'Sign in to your landlord dashboard' : 'Sign in to your tenant portal'}
          </p>
        </div>

        <Card className="shadow-lg border-0 ring-1 ring-gray-200 dark:ring-gray-800">
          <CardHeader className="pb-4">
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
              <button
                onClick={() => setLoginType('landlord')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                  loginType === 'landlord' 
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-green-700 dark:text-green-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Landlord
              </button>
              <button
                onClick={() => setLoginType('tenant')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                  loginType === 'tenant' 
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-green-700 dark:text-green-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <User className="w-4 h-4" />
                Tenant
              </button>
            </div>
            
            <CardTitle>{loginType === 'landlord' ? 'Welcome back, Landlord' : 'Tenant Login'}</CardTitle>
            <CardDescription>
              {loginType === 'landlord' 
                ? 'Enter your email and password to access your account.' 
                : 'Enter your Tenant ID and password provided by your landlord.'}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
                  {error}
                </div>
              )}
              {loginType === 'landlord' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username / ID</Label>
                    <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="landlord_id" required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="#" className="text-sm font-medium text-green-600 hover:text-green-500">
                        Forgot password?
                      </Link>
                    </div>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="tenantId">Tenant ID</Label>
                    <Input id="tenantId" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. T-01711223344" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenantPassword">Password</Label>
                    <Input id="tenantPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </>
              )}
            </CardContent>
            
            <CardFooter>
              <Button type="submit" disabled={loading} className={`w-full text-white ${loginType === 'landlord' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {loading ? 'Signing In...' : (loginType === 'landlord' ? 'Landlord Sign In' : 'Tenant Sign In')}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
