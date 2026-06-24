'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type PropertyType = 'House' | 'Shop'

interface PropertyTypeContextType {
  propertyType: PropertyType
  setPropertyType: (type: PropertyType) => void
}

const PropertyTypeContext = createContext<PropertyTypeContextType | undefined>(undefined)

export function PropertyTypeProvider({ children }: { children: ReactNode }) {
  const [propertyType, setPropertyType] = useState<PropertyType>('House')

  return (
    <PropertyTypeContext.Provider value={{ propertyType, setPropertyType }}>
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
