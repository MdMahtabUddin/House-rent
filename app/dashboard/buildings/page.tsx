'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, Building, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialBuildings = [
  { id: 1, name: 'Badda Tower', address: 'Middle Badda, Dhaka', rooms: 10, occupied: 8 },
  { id: 2, name: 'Mirpur Villa', address: 'Mirpur 10, Dhaka', rooms: 5, occupied: 4 }
]

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<any[]>([])
  const [newBuilding, setNewBuilding] = useState({ name: '', address: '', rooms: '' })
  const [isLoading, setIsLoading] = useState(true)

  const fetchBuildings = async () => {
    try {
      const res = await fetch('/api/buildings')
      if (res.ok) {
        const data = await res.json()
        setBuildings(data)
      }
    } catch (error) {
      console.error('Failed to fetch buildings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBuildings()
  }, [])

  const handleAddBuilding = async () => {
    if (!newBuilding.name) return
    
    try {
      const res = await fetch('/api/buildings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBuilding.name,
          type: newBuilding.address || 'Dhaka', // Reusing 'type' field from model as address for now
          rooms: parseInt(newBuilding.rooms) || 0,
        })
      })
      
      if (res.ok) {
        setNewBuilding({ name: '', address: '', rooms: '' })
        fetchBuildings()
      }
    } catch (error) {
      console.error('Failed to create building:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if(confirm('Are you sure you want to delete this building?')) {
      try {
        const res = await fetch(`/api/buildings/${id}`, { method: 'DELETE' })
        if (res.ok) {
          fetchBuildings()
        }
      } catch (error) {
        console.error('Failed to delete building:', error)
      }
    }
  }

  if (isLoading) return <div>Loading buildings...</div>


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Buildings</h1>
          <p className="text-sm text-gray-500">Manage your properties and buildings.</p>
        </div>
        <Dialog>
          <DialogTrigger render={<Button className="bg-green-600 hover:bg-green-700 text-white" />}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Building
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Building</DialogTitle>
              <DialogDescription>
                Enter the details of the new property here.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="b_name" className="text-right">Name</Label>
                <Input 
                  id="b_name" 
                  placeholder="e.g. Gulshan Heights" 
                  className="col-span-3" 
                  value={newBuilding.name}
                  onChange={(e) => setNewBuilding({...newBuilding, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="b_address" className="text-right">Address</Label>
                <Input 
                  id="b_address" 
                  placeholder="e.g. Gulshan 1, Dhaka" 
                  className="col-span-3" 
                  value={newBuilding.address}
                  onChange={(e) => setNewBuilding({...newBuilding, address: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="b_rooms" className="text-right">Total Units</Label>
                <Input 
                  id="b_rooms" 
                  type="number" 
                  placeholder="20" 
                  className="col-span-3" 
                  value={newBuilding.rooms}
                  onChange={(e) => setNewBuilding({...newBuilding, rooms: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button onClick={handleAddBuilding} className="bg-green-600 hover:bg-green-700 text-white" />}>
                Save Building
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {buildings.map((building) => (
          <Card key={building._id} className="border-gray-100 shadow-sm relative group">
            <Button 
              variant="destructive" 
              size="icon" 
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              onClick={() => handleDelete(building._id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <CardHeader className="flex flex-row items-center justify-between pb-2 pr-14">
              <CardTitle className="text-lg font-bold">{building.name}</CardTitle>
              <Building className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500 mb-4">{building.type}</div>
              <div className="flex justify-between text-sm">
                <div>
                  <span className="font-semibold">{building.rooms}</span> Total Rooms
                </div>
                <div>
                  <span className="font-semibold text-green-600">0</span> Occupied
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
