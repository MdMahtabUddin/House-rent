'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

export type PropertyType = 'House' | 'Shop' | 'Notice Board' | 'Staff' | 'Maintenance' | 'Mess'

interface UserAccess {
  house: boolean
  shop: boolean
  noticeBoard?: boolean
  staff?: boolean
  maintenance?: boolean
  mess?: boolean
}

interface PropertyTypeContextType {
  propertyType: PropertyType
  setPropertyType: (type: PropertyType) => void
  userAccess: UserAccess | null
  loading: boolean
}

const PropertyTypeContext = createContext<PropertyTypeContextType | undefined>(undefined)

export function PropertyTypeProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [propertyType, setPropertyType] = useState<PropertyType>('House')
  const [userAccess, setUserAccess] = useState<UserAccess | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          const access = data.user.access
          setUserAccess(access)
          
          // Set initial property type based on access
          if (access.house) {
            setPropertyType('House')
          } else if (access.shop) {
            setPropertyType('Shop')
          } else if (access.noticeBoard) {
            setPropertyType('Notice Board')
          } else if (access.staff) {
            setPropertyType('Staff')
          } else if (access.maintenance) {
            setPropertyType('Maintenance')
          } else if (access.mess) {
            setPropertyType('Mess')
          }
        } else {
          router.push('/')
        }
      } catch (err) {
        console.error('Failed to fetch user access:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [router])

  return (
    <PropertyTypeContext.Provider value={{ propertyType, setPropertyType, userAccess, loading }}>
      {children}
    </PropertyTypeContext.Provider>
  )
}

export function usePropertyType() {
  const context = useContext(PropertyTypeContext)
  if (context === undefined) {
    throw new Error('usePropertyType must be used within a PropertyTypeProvider')
  }
  return context
}
