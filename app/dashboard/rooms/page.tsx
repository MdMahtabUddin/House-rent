'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, DoorOpen, Store, Filter, Trash2 } from 'lucide-react'
import { usePropertyType } from '@/components/PropertyTypeContext'
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialFlats = [
  { id: 1, name: 'A-101', building: 'Badda Tower', status: 'Occupied', rent: 15000 },
  { id: 2, name: 'A-102', building: 'Badda Tower', status: 'Occupied', rent: 20000 },
  { id: 3, name: 'A-103', building: 'Badda Tower', status: 'Empty', rent: 12000 },
  { id: 4, name: 'B-205', building: 'Mirpur Villa', status: 'Occupied', rent: 10000 }
]

export default function RoomsPage() {
  const { propertyType } = usePropertyType()
  const isShop = propertyType === 'Shop'
  const unitName = isShop ? 'Shop' : 'Flat'
  const unitNamePlural = isShop ? 'Shops' : 'Flats'
  const UnitIcon = isShop ? Store : DoorOpen

  const [flats, setFlats] = useState<any[]>([])
  const [buildingsList, setBuildingsList] = useState<{name: string}[]>([])
  const [selectedBuildingFilter, setSelectedBuildingFilter] = useState('All')
  const [isLoading, setIsLoading] = useState(true)
  
  const [newFlat, setNewFlat] = useState({ name: '', building: '', rent: '', status: 'empty' })

  const fetchData = async () => {
    try {
      const flatsRes = await fetch('/api/flats')
      if (flatsRes.ok) {
        setFlats(await flatsRes.json())
      }
      
      const bldgsRes = await fetch('/api/buildings')
      if (bldgsRes.ok) {
        setBuildingsList(await bldgsRes.json())
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddFlat = async () => {
    if (!newFlat.name || !newFlat.building) return
    
    try {
      const res = await fetch('/api/flats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFlat.name,
          building: newFlat.building,
          rent: parseInt(newFlat.rent) || 0,
          status: newFlat.status === 'empty' ? 'Empty' : 'Occupied'
        })
      })
      if (res.ok) {
        setNewFlat({ name: '', building: '', rent: '', status: 'empty' })
        fetchData()
      }
    } catch (error) {
      console.error('Failed to create flat:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if(confirm(`Are you sure you want to delete this ${unitName.toLowerCase()}?`)) {
      try {
        const res = await fetch(`/api/flats/${id}`, { method: 'DELETE' })
        if (res.ok) {
          fetchData()
        }
      } catch (error) {
        console.error('Failed to delete flat:', error)
      }
    }
  }

  if (isLoading) return <div>Loading {unitNamePlural.toLowerCase()}...</div>

  // For the filter dropdown, derive unique buildings from current flats OR buildingsList
  const uniqueBuildings = Array.from(new Set([...flats.map(f => f.building), ...buildingsList.map(b => b.name)]))
  const displayFlats = selectedBuildingFilter === 'All' ? flats : flats.filter(f => f.building === selectedBuildingFilter)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{unitNamePlural}</h1>
          <p className="text-sm text-gray-500">Manage {unitNamePlural.toLowerCase()} inside your properties.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative flex items-center bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-md px-3 h-10">
            <Filter className="w-4 h-4 text-gray-500 mr-2" />
            <select 
              value={selectedBuildingFilter} 
              onChange={(e) => setSelectedBuildingFilter(e.target.value)}
              className="bg-transparent text-sm outline-none focus:ring-0 text-gray-700 dark:text-gray-200 w-[150px]"
            >
              <option value="All">All Buildings</option>
              {uniqueBuildings.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add {unitName}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New {unitName}</DialogTitle>
                <DialogDescription>
                  Enter the details of the new {unitName.toLowerCase()} here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unitNumber" className="text-right">
                    {unitName} No.
                  </Label>
                  <Input 
                    id="unitNumber" 
                    placeholder="e.g. A-101" 
                    className="col-span-3"
                    value={newFlat.name}
                    onChange={(e) => setNewFlat({...newFlat, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="property" className="text-right">
                    Property
                  </Label>
                  <select 
                    id="property" 
                    className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 dark:border-gray-800 dark:bg-gray-950"
                    value={newFlat.building}
                    onChange={(e) => setNewFlat({...newFlat, building: e.target.value})}
                  >
                    <option value="" disabled>Select a building</option>
                    {buildingsList.map(b => (
                      <option key={b.name} value={b.name}>{b.name}</option>
                    ))}
                    {buildingsList.length === 0 && <option value="Badda Tower">Badda Tower (Default)</option>}
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rent" className="text-right">
                    Rent (৳)
                  </Label>
                  <Input 
                    id="rent" 
                    type="number" 
                    placeholder="15000" 
                    className="col-span-3"
                    value={newFlat.rent}
                    onChange={(e) => setNewFlat({...newFlat, rent: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <select 
                    id="status" 
                    className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-950 dark:border-gray-800 dark:bg-gray-950"
                    value={newFlat.status}
                    onChange={(e) => setNewFlat({...newFlat, status: e.target.value})}
                  >
                    <option value="empty">Empty</option>
                    <option value="rented">Rented</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button onClick={handleAddFlat} className="bg-green-600 hover:bg-green-700 text-white">
                    Save {unitName}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {displayFlats.map((room) => (
          <Card key={room._id} className="border-gray-100 shadow-sm relative group">
            <Button 
              variant="destructive" 
              size="icon" 
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              onClick={() => handleDelete(room._id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <CardHeader className="flex flex-row items-center justify-between pb-2 pr-14">
              <CardTitle className="text-lg font-bold">{isShop ? `Shop ${room.name}` : room.name}</CardTitle>
              <UnitIcon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500 mb-2">{room.building}</div>
              <div className="text-lg font-semibold mb-2">৳ {room.rent}</div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${room.status === 'Occupied' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {room.status}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
