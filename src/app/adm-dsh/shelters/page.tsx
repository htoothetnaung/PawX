"use client"

import { useEffect, useState } from "react"
import { supabaseApi, Shelter } from '@/services/supabase'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function SheltersPage() {
  const [shelters, setShelters] = useState<Shelter[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [activeShelter, setActiveShelter] = useState<Shelter | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [shelterName, setShelterName] = useState('')
  const [contact, setContact] = useState('')
  const [lat, setLat] = useState<number>(0)
  const [lng, setLng] = useState<number>(0)
  const [totalCapacity, setTotalCapacity] = useState<number>(0)
  const [currentCapacity, setCurrentCapacity] = useState<number>(0)
  const [vets, setVets] = useState<number>(0)
  const [volunteers, setVolunteers] = useState<number>(0)
  const [drivers, setDrivers] = useState<number>(0)
  const [food, setFood] = useState<number>(0)
  const [medical, setMedical] = useState<number>(0)
  const [equipment, setEquipment] = useState<number>(0)

  useEffect(() => {
    loadShelters()
  }, [])

  const loadShelters = async () => {
    try {
      setLoading(true)
      const data = await supabaseApi.getAllShelters()
      setShelters(data)
    } catch (error) {
      console.error('Error fetching shelters:', error)
      toast.error('Failed to load shelters')
    } finally {
      setLoading(false)
    }
  }

  const openAddDialog = () => {
    resetForm()
    setIsEditing(false)
    setActiveShelter(null)
    setShowDialog(true)
  }

  const openEditDialog = (shelter: Shelter) => {
    setActiveShelter(shelter)
    setIsEditing(true)
    
    // Populate form with shelter data
    setShelterName(shelter.shelter_name)
    setContact(shelter.contact)
    setLat(shelter.lat)
    setLng(shelter.lng)
    setTotalCapacity(shelter.total_capacity)
    setCurrentCapacity(shelter.current_capacity)
    setVets(shelter.staff.veterinarians)
    setVolunteers(shelter.staff.volunteers)
    setDrivers(shelter.staff.drivers)
    setFood(shelter.resources.food)
    setMedical(shelter.resources.medical)
    setEquipment(shelter.resources.equipment)
    
    setShowDialog(true)
  }

  const resetForm = () => {
    setShelterName('')
    setContact('')
    setLat(0)
    setLng(0)
    setTotalCapacity(0)
    setCurrentCapacity(0)
    setVets(0)
    setVolunteers(0)
    setDrivers(0)
    setFood(0)
    setMedical(0)
    setEquipment(0)
  }

  const handleSubmit = async () => {
    // Basic validation
    if (!shelterName || !contact || lat === 0 || lng === 0) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      
      const shelterData = {
        shelter_name: shelterName,
        contact,
        lat,
        lng,
        total_capacity: totalCapacity,
        current_capacity: currentCapacity,
        staff: {
          veterinarians: vets,
          volunteers: volunteers,
          drivers: drivers
        },
        resources: {
          food: food,
          medical: medical,
          equipment: equipment
        }
      }

      if (isEditing && activeShelter) {
        // Update existing shelter
        await supabaseApi.updateShelter(activeShelter.id, shelterData)
        toast.success(`Shelter ${shelterName} updated successfully`)
      } else {
        // Add new shelter
        await supabaseApi.addShelter(shelterData)
        toast.success(`Shelter ${shelterName} added successfully`)
      }
      
      // Refresh shelters list
      await loadShelters()
      setShowDialog(false)
    } catch (error) {
      console.error('Error saving shelter:', error)
      toast.error(`Failed to ${isEditing ? 'update' : 'add'} shelter`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (shelter: Shelter) => {
    if (!confirm(`Are you sure you want to delete ${shelter.shelter_name}?`)) {
      return
    }
    
    try {
      await supabaseApi.deleteShelter(shelter.id)
      toast.success(`Shelter ${shelter.shelter_name} deleted successfully`)
      await loadShelters()
    } catch (error) {
      console.error('Error deleting shelter:', error)
      toast.error('Failed to delete shelter')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Shelters Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage all animal shelters in the system
          </p>
        </div>
        <Button onClick={openAddDialog} className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600">
          <Plus className="h-4 w-4" /> 
          Add Shelter
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading shelters...</span>
        </div>
      ) : (
        <Card className="bg-white shadow-sm border border-gray-100">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="hover:bg-gray-50 border-gray-100">
                  <TableHead className="text-gray-600 font-medium">ID</TableHead>
                  <TableHead className="text-gray-600 font-medium">Name</TableHead>
                  <TableHead className="text-gray-600 font-medium">Contact</TableHead>
                  <TableHead className="text-gray-600 font-medium">Location</TableHead>
                  <TableHead className="text-gray-600 font-medium">Capacity</TableHead>
                  <TableHead className="text-gray-600 font-medium">Staff</TableHead>
                  <TableHead className="text-gray-600 font-medium">Resources</TableHead>
                  <TableHead className="text-gray-600 font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shelters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No shelters found. Click "Add Shelter" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  shelters.map((shelter) => (
                    <TableRow 
                      key={shelter.id} 
                      className="hover:bg-gray-50 border-gray-100 transition-colors"
                    >
                      <TableCell className="font-medium text-gray-900">#{shelter.id}</TableCell>
                      <TableCell className="text-gray-700">{shelter.shelter_name}</TableCell>
                      <TableCell className="text-gray-700">{shelter.contact}</TableCell>
                      <TableCell className="text-gray-700">
                        {shelter.lat.toFixed(4)}, {shelter.lng.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {shelter.current_capacity}/{shelter.total_capacity}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        <div className="text-xs">
                          <div>Vets: {shelter.staff.veterinarians}</div>
                          <div>Volunteers: {shelter.staff.volunteers}</div>
                          <div>Drivers: {shelter.staff.drivers}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        <div className="text-xs">
                          <div>Food: {shelter.resources.food}%</div>
                          <div>Medical: {shelter.resources.medical}%</div>
                          <div>Equipment: {shelter.resources.equipment}%</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => openEditDialog(shelter)}
                            variant="outline"
                            size="sm"
                            className="border-gray-200 hover:bg-gray-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(shelter)}
                            variant="outline"
                            size="sm"
                            className="border-gray-200 hover:bg-gray-50 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-white max-w-2xl border-gray-100 shadow-lg">
          <DialogHeader className="border-b pb-4 border-gray-100">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Shelter' : 'Add New Shelter'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {isEditing 
                ? 'Update this shelter\'s information'
                : 'Enter details to add a new animal shelter'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-gray-700">Shelter Name *</Label>
              <Input 
                id="name"
                value={shelterName}
                onChange={(e) => setShelterName(e.target.value)}
                placeholder="Animal Care Shelter"
                className="border-gray-200 focus:border-blue-500 bg-white"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contact" className="text-gray-700">Contact Number *</Label>
              <Input 
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="border-gray-200 focus:border-blue-500 bg-white"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lat" className="text-gray-700">Latitude *</Label>
              <Input 
                id="lat"
                type="number"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value))}
                placeholder="37.7749"
                step="0.0001"
                className="border-gray-200 focus:border-blue-500 bg-white"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lng" className="text-gray-700">Longitude *</Label>
              <Input 
                id="lng"
                type="number"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value))}
                placeholder="-122.4194"
                step="0.0001"
                className="border-gray-200 focus:border-blue-500 bg-white"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="total_capacity" className="text-gray-700">Total Capacity</Label>
              <Input 
                id="total_capacity"
                type="number"
                value={totalCapacity}
                onChange={(e) => setTotalCapacity(parseInt(e.target.value))}
                placeholder="50"
                className="border-gray-200 focus:border-blue-500 bg-white"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="current_capacity" className="text-gray-700">Current Capacity</Label>
              <Input 
                id="current_capacity"
                type="number"
                value={currentCapacity}
                onChange={(e) => setCurrentCapacity(parseInt(e.target.value))}
                placeholder="25"
                className="border-gray-200 focus:border-blue-500 bg-white"
              />
            </div>

            <div className="col-span-2">
              <h3 className="font-medium mb-2 text-gray-800">Staff Information</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="vets" className="text-gray-700">Veterinarians</Label>
                  <Input 
                    id="vets"
                    type="number"
                    value={vets}
                    onChange={(e) => setVets(parseInt(e.target.value))}
                    placeholder="3"
                    className="border-gray-200 focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="volunteers" className="text-gray-700">Volunteers</Label>
                  <Input 
                    id="volunteers"
                    type="number"
                    value={volunteers}
                    onChange={(e) => setVolunteers(parseInt(e.target.value))}
                    placeholder="10"
                    className="border-gray-200 focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="drivers" className="text-gray-700">Drivers</Label>
                  <Input 
                    id="drivers"
                    type="number"
                    value={drivers}
                    onChange={(e) => setDrivers(parseInt(e.target.value))}
                    placeholder="5"
                    className="border-gray-200 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <h3 className="font-medium mb-2 text-gray-800">Resources (% available)</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="food" className="text-gray-700">Food</Label>
                  <Input 
                    id="food"
                    type="number"
                    value={food}
                    onChange={(e) => setFood(parseInt(e.target.value))}
                    placeholder="80"
                    min="0"
                    max="100"
                    className="border-gray-200 focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="medical" className="text-gray-700">Medical</Label>
                  <Input 
                    id="medical"
                    type="number"
                    value={medical}
                    onChange={(e) => setMedical(parseInt(e.target.value))}
                    placeholder="65"
                    min="0"
                    max="100"
                    className="border-gray-200 focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="equipment" className="text-gray-700">Equipment</Label>
                  <Input 
                    id="equipment"
                    type="number"
                    value={equipment}
                    onChange={(e) => setEquipment(parseInt(e.target.value))}
                    placeholder="70"
                    min="0"
                    max="100"
                    className="border-gray-200 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4 border-gray-100">
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
              className="border-gray-200 hover:bg-white-50 text-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? 'Update Shelter' : 'Add Shelter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}