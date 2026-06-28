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
        body: JSON.stringify({ username, password, loginType }),
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-950 p-4 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 mix-blend-multiply dark:mix-blend-screen"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 mix-blend-multiply dark:mix-blend-screen"></div>

      <div className="max-w-md w-full space-y-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md rounded-2xl shadow-xl ring-1 ring-white/20">
            <Building2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            MY Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-300 font-medium text-center px-4">
            {loginType === 'landlord' ? 'Sign in to your property dashboard' : 'Sign in to your tenant portal'}
          </p>
        </div>

        <Card className="shadow-2xl border border-white/20 dark:border-gray-800/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-3xl overflow-hidden">
          <CardHeader className="pb-4 pt-6 px-6">
            <div className="flex p-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-xl mb-6 backdrop-blur-md">
              <button
                onClick={() => setLoginType('landlord')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  loginType === 'landlord' 
                    ? 'bg-white dark:bg-gray-700 shadow-md text-indigo-700 dark:text-indigo-400 scale-100' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 scale-95 hover:scale-100'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Landlord
              </button>
              <button
                onClick={() => setLoginType('tenant')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  loginType === 'tenant' 
                    ? 'bg-white dark:bg-gray-700 shadow-md text-purple-700 dark:text-purple-400 scale-100' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 scale-95 hover:scale-100'
                }`}
              >
                <User className="w-4 h-4" />
                Tenant
              </button>
            </div>
            
            <CardTitle className="text-xl text-center">{loginType === 'landlord' ? 'Welcome back, Landlord' : 'Welcome back, Tenant'}</CardTitle>
            <CardDescription className="text-center mt-2">
              {loginType === 'landlord' 
                ? 'Enter your credentials to access your properties.' 
                : 'Enter your Tenant ID and password.'}
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
            
            <CardFooter className="px-6 pb-6 pt-2">
              <Button type="submit" disabled={loading} className={`w-full py-6 rounded-xl text-md font-bold text-white shadow-xl transition-all hover:-translate-y-1 ${loginType === 'landlord' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'}`}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
