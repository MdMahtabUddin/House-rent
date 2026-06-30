'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, Building, Trash2, Edit } from 'lucide-react'
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
import { usePropertyType } from '@/components/PropertyTypeContext'

export default function BuildingsPage() {
  const { propertyType } = usePropertyType()
  const [buildings, setBuildings] = useState<any[]>([])
  const [newBuilding, setNewBuilding] = useState({ name: '', address: '', rooms: '' })
  const [editingBuilding, setEditingBuilding] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
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
          propertyType: propertyType
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
      alert("Deleting ID: " + id);
      try {
        const res = await fetch(`/api/buildings/${id}`, { method: 'DELETE' })
        alert("Delete response status: " + res.status);
        if (res.ok) {
          fetchBuildings()
        } else {
          const errData = await res.json();
          alert("Delete error: " + errData.error);
        }
      } catch (error) {
        alert("Delete exception: " + error);
        console.error('Failed to delete building:', error)
      }
    }
  }

  const handleUpdateBuilding = async () => {
    if (!editingBuilding || !editingBuilding.name) {
      alert("Missing editingBuilding or name");
      return;
    }
    
    alert("Updating ID: " + editingBuilding._id);
    try {
      const res = await fetch(`/api/buildings/${editingBuilding._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingBuilding.name,
          type: editingBuilding.address || editingBuilding.type || 'Dhaka',
          rooms: parseInt(editingBuilding.rooms) || 0
        })
      })
      
      alert("Update response status: " + res.status);
      if (res.ok) {
        setEditingBuilding(null)
        setIsEditDialogOpen(false)
        fetchBuildings()
      } else {
        const errData = await res.json();
        alert("Update error: " + errData.error);
      }
    } catch (error) {
      alert("Update exception: " + error);
      console.error('Failed to update building:', error)
    }
  }

  if (isLoading) return <div>Loading buildings...</div>

  const displayBuildings = propertyType === 'Shop'
    ? buildings.filter(b => b.propertyType === 'Shop')
    : buildings.filter(b => b.propertyType === 'House' || !b.propertyType)


  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-10 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Properties & Buildings</h1>
            <p className="text-blue-100 text-lg max-w-xl">
              Manage your real estate portfolio, add new properties, and track their capacity.
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-full font-semibold shadow-md hover:shadow-lg transition-all h-11 px-6">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Building
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Add New Property</DialogTitle>
                <DialogDescription>
                  Enter the details of your new building or property complex.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-5 py-4">
                <div className="space-y-2">
                  <Label htmlFor="b_name">Property Name</Label>
                  <Input 
                    id="b_name" 
                    placeholder="e.g. Gulshan Heights" 
                    value={newBuilding.name}
                    onChange={(e) => setNewBuilding({...newBuilding, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b_address">Location / Address</Label>
                  <Input 
                    id="b_address" 
                    placeholder="e.g. Gulshan 1, Dhaka" 
                    value={newBuilding.address}
                    onChange={(e) => setNewBuilding({...newBuilding, address: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b_rooms">Total Units/Rooms</Label>
                  <Input 
                    id="b_rooms" 
                    type="number" 
                    placeholder="20" 
                    value={newBuilding.rooms}
                    onChange={(e) => setNewBuilding({...newBuilding, rooms: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button onClick={handleAddBuilding} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
                    Save Property
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayBuildings.map((building) => (
          <Card key={building._id} className="relative overflow-hidden rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-950/60 backdrop-blur-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="absolute top-4 right-4 flex gap-2 z-20">
              <Button 
                variant="secondary" 
                size="icon" 
                className="h-8 w-8 rounded-full shadow-md bg-white hover:bg-gray-100 text-gray-700"
                onClick={() => {
                  setEditingBuilding({ ...building, address: building.type })
                  setIsEditDialogOpen(true)
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="destructive" 
                size="icon" 
                className="h-8 w-8 rounded-full shadow-md"
                onClick={() => handleDelete(building._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6 relative z-10">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
                <Building className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300">
                {building.rooms} Units Total
              </span>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-4 relative z-10">
              <CardTitle className="text-xl font-bold mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {building.name}
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {building.type || 'Dhaka, Bangladesh'}
              </p>
              
              <div className="flex justify-between items-center text-sm pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">Status</span>
                  <span className="font-bold text-green-600 dark:text-green-400 mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Active
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">Occupancy</span>
                  <span className="font-bold text-gray-900 dark:text-white mt-1">
                    -- / {building.rooms}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {displayBuildings.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50 dark:bg-gray-900/20 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
              <Building className="h-10 w-10 text-indigo-600 dark:text-indigo-400 opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No properties yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              You haven't added any buildings or properties to your portfolio. Start by adding your first property.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Your First Property
                </Button>
              </DialogTrigger>
              {/* Note: The dialog content is already above, so ideally we extract it or just reuse the trigger */}
            </Dialog>
          </div>
        )}
      </div>

      {/* Edit Building Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Property</DialogTitle>
            <DialogDescription>
              Update the details of this property.
            </DialogDescription>
          </DialogHeader>
          {editingBuilding && (
            <div className="grid gap-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_b_name">Property Name</Label>
                <Input 
                  id="edit_b_name" 
                  value={editingBuilding.name}
                  onChange={(e) => setEditingBuilding({...editingBuilding, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_b_address">Location / Address</Label>
                <Input 
                  id="edit_b_address" 
                  value={editingBuilding.address}
                  onChange={(e) => setEditingBuilding({...editingBuilding, address: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_b_rooms">Total Units/Rooms</Label>
                <Input 
                  id="edit_b_rooms" 
                  type="number" 
                  value={editingBuilding.rooms}
                  onChange={(e) => setEditingBuilding({...editingBuilding, rooms: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateBuilding} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
