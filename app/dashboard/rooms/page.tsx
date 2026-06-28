'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, DoorOpen, Store, Filter, Trash2, Edit } from 'lucide-react'
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
  const [buildingsList, setBuildingsList] = useState<any[]>([])
  const [tenantsList, setTenantsList] = useState<any[]>([])
  const [selectedBuildingFilter, setSelectedBuildingFilter] = useState('All')
  const [isLoading, setIsLoading] = useState(true)
  
  const [newFlat, setNewFlat] = useState({ name: '', building: '', rent: '', status: 'empty' })
  const [editingFlat, setEditingFlat] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

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

      const tenantsRes = await fetch('/api/tenants')
      if (tenantsRes.ok) {
        setTenantsList(await tenantsRes.json())
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
          status: newFlat.status === 'empty' ? 'Empty' : 'Occupied',
          type: propertyType
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

  const handleUpdateFlat = async () => {
    if (!editingFlat || !editingFlat.name || !editingFlat.building) return
    
    try {
      const res = await fetch(`/api/flats/${editingFlat._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingFlat.name,
          building: editingFlat.building,
          rent: parseInt(editingFlat.rent) || 0,
          status: editingFlat.status === 'empty' ? 'Empty' : 'Occupied',
          type: propertyType
        })
      })
      if (res.ok) {
        setEditingFlat(null)
        setIsEditDialogOpen(false)
        fetchData()
      }
    } catch (error) {
      console.error('Failed to update flat:', error)
    }
  }

  if (isLoading) return <div>Loading {unitNamePlural.toLowerCase()}...</div>

  // For the filter dropdown, derive unique buildings from current flats OR buildingsList
  const propertyFlats = propertyType === 'Shop' 
    ? flats.filter(f => f.type === 'Shop') 
    : flats.filter(f => f.type === 'House' || !f.type)

  const displayBuildings = propertyType === 'Shop'
    ? buildingsList.filter(b => b.propertyType === 'Shop')
    : buildingsList.filter(b => b.propertyType === 'House' || !b.propertyType)

  const uniqueBuildings = Array.from(new Set([...propertyFlats.map(f => f.building), ...displayBuildings.map(b => b.name)]))
  const displayFlats = selectedBuildingFilter === 'All' ? propertyFlats : propertyFlats.filter(f => f.building === selectedBuildingFilter)

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 p-8 sm:p-10 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Properties {unitNamePlural}</h1>
            <p className="text-teal-100 text-lg max-w-xl">
              Manage individual {unitNamePlural.toLowerCase()} within your buildings, set rent amounts, and track occupancy.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex items-center bg-black/20 backdrop-blur-md border border-white/10 rounded-full px-4 h-11 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-teal-200 mr-2" />
              <select 
                value={selectedBuildingFilter} 
                onChange={(e) => setSelectedBuildingFilter(e.target.value)}
                className="bg-transparent text-sm font-medium outline-none focus:ring-0 text-white w-[140px] appearance-none cursor-pointer"
              >
                <option value="All" className="text-gray-900">All Buildings</option>
                {uniqueBuildings.map(b => (
                  <option key={b as string} value={b as string} className="text-gray-900">{b as string}</option>
                ))}
              </select>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-white text-teal-700 hover:bg-teal-50 rounded-full font-semibold shadow-md hover:shadow-lg transition-all h-11 px-6 w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add {unitName}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle className="text-xl">Add New {unitName}</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new {unitName.toLowerCase()} unit here.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-5 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="unitNumber">{unitName} No.</Label>
                    <Input 
                      id="unitNumber" 
                      placeholder="e.g. A-101" 
                      value={newFlat.name}
                      onChange={(e) => setNewFlat({...newFlat, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property">Property / Building</Label>
                    <select 
                      id="property" 
                      className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-gray-800 dark:bg-gray-950"
                      value={newFlat.building}
                      onChange={(e) => setNewFlat({...newFlat, building: e.target.value})}
                    >
                      <option value="" disabled>Select Building/Location</option>
                      {displayBuildings.map(b => (
                        <option key={b._id} value={b.name}>{b.name}</option>
                      ))}
                      {buildingsList.length === 0 && <option value="Badda Tower">Badda Tower (Default)</option>}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rent">Rent (৳)</Label>
                      <Input 
                        id="rent" 
                        type="number" 
                        placeholder="15000" 
                        value={newFlat.rent}
                        onChange={(e) => setNewFlat({...newFlat, rent: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <select 
                        id="status" 
                        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-gray-800 dark:bg-gray-950"
                        value={newFlat.status}
                        onChange={(e) => setNewFlat({...newFlat, status: e.target.value})}
                      >
                        <option value="empty">Empty</option>
                        <option value="rented">Rented</option>
                      </select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button onClick={handleAddFlat} className="bg-teal-600 hover:bg-teal-700 text-white w-full">
                      Save {unitName}
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      
      {/* Cards Grid */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        {displayFlats.map((room) => (
          <Card key={room._id} className="relative overflow-hidden rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-950/60 backdrop-blur-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 translate-y-2 group-hover:translate-y-0">
              <Button 
                variant="secondary" 
                size="icon" 
                className="h-8 w-8 rounded-full shadow-md bg-white hover:bg-gray-100 text-gray-700"
                onClick={() => {
                  setEditingFlat({
                    ...room,
                    status: room.status === 'Occupied' || room.status === 'rented' ? 'rented' : 'empty'
                  })
                  setIsEditDialogOpen(true)
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="destructive" 
                size="icon" 
                className="h-8 w-8 rounded-full shadow-md"
                onClick={() => handleDelete(room._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6 relative z-10">
              <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-2xl text-teal-600 dark:text-teal-400">
                <UnitIcon className="h-6 w-6" />
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                room.status === 'Occupied' || room.status === 'rented' 
                  ? 'bg-blue-100/80 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800' 
                  : 'bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 ring-1 ring-yellow-200 dark:ring-yellow-800'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${room.status === 'Occupied' || room.status === 'rented' ? 'bg-blue-500' : 'bg-yellow-500 animate-pulse'}`}></span>
                {room.status === 'rented' ? 'Occupied' : room.status}
              </span>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-4 relative z-10">
              <CardTitle className="text-xl font-bold mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {isShop ? `Shop ${room.name}` : room.name}
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {room.building}
              </p>

              {(room.status === 'Occupied' || room.status === 'rented') && (
                <div className="mt-4 p-3 bg-teal-50 dark:bg-teal-950/30 rounded-lg border border-teal-100 dark:border-teal-900/50">
                  {(() => {
                    const tenant = tenantsList.find(t => t.room === room.name && t.building === room.building)
                    return tenant ? (
                      <div>
                        <div className="text-xs text-teal-600 dark:text-teal-400 font-semibold mb-1 uppercase tracking-wider">Current Tenant</div>
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{tenant.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{tenant.phone}</div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 italic">Tenant data missing</div>
                    )
                  })()}
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mb-1">Monthly Rent</div>
                <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">৳ {room.rent?.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {displayFlats.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50 dark:bg-gray-900/20 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mb-4">
              <UnitIcon className="h-10 w-10 text-teal-600 dark:text-teal-400 opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No units found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              You haven't added any {unitNamePlural.toLowerCase()} yet, or none match your selected filter. Start by adding a new unit.
            </p>
          </div>
        )}
      </div>

      {/* Edit Flat Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit {unitName}</DialogTitle>
            <DialogDescription>
              Update details for this {unitName.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          {editingFlat && (
            <div className="grid gap-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_flat_name">{unitName} Number/Name</Label>
                <Input 
                  id="edit_flat_name" 
                  value={editingFlat.name}
                  onChange={(e) => setEditingFlat({...editingFlat, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_building">Building</Label>
                  <select 
                    id="edit_building" 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-gray-800 dark:bg-gray-950"
                    value={editingFlat.building}
                    onChange={(e) => setEditingFlat({...editingFlat, building: e.target.value})}
                  >
                    <option value="" disabled>Select Building</option>
                    {uniqueBuildings.map(b => (
                      <option key={b as string} value={b as string}>{b as string}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_rent">Monthly Rent</Label>
                  <Input 
                    id="edit_rent" 
                    type="number" 
                    value={editingFlat.rent}
                    onChange={(e) => setEditingFlat({...editingFlat, rent: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_status">Status</Label>
                <select 
                  id="edit_status" 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-gray-800 dark:bg-gray-950"
                  value={editingFlat.status}
                  onChange={(e) => setEditingFlat({...editingFlat, status: e.target.value})}
                >
                  <option value="empty">Empty</option>
                  <option value="rented">Rented</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateFlat} className="bg-teal-600 hover:bg-teal-700 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
