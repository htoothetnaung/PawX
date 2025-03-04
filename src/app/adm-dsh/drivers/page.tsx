"use client"

import { useEffect, useState } from "react"
import { supabaseApi, Driver } from '@/services/supabase'
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
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Pencil, Trash2, Search, Filter } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { YANGON_TOWNSHIPS } from "@/constants/townships"

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  // Update state definition
  const [selectedTownship, setSelectedTownship] = useState<string>('all')
  
  // Update filter logic
 
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'BUSY' | 'AVAILABLE'>('ALL')
  
  // For driver form
  const [showDialog, setShowDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [activeDriver, setActiveDriver] = useState<Driver | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [driverName, setDriverName] = useState('')
  const [driverContact, setDriverContact] = useState('')
  const [driverStatus, setDriverStatus] = useState<'BUSY' | 'AVAILABLE'>('AVAILABLE')
  const [driverTownships, setDriverTownships] = useState<string[]>([])

  useEffect(() => {
    loadDrivers()
  }, [])

  const loadDrivers = async () => {
    try {
      setLoading(true)
      const data = await supabaseApi.getAllDrivers()
      setDrivers(data)
    } catch (error) {
      console.error('Error fetching drivers:', error)
      toast.error('Failed to load drivers')
    } finally {
      setLoading(false)
    }
  }

  const openAddDialog = () => {
    resetForm()
    setIsEditing(false)
    setActiveDriver(null)
    setShowDialog(true)
  }

  const openEditDialog = (driver: Driver) => {
    setActiveDriver(driver)
    setIsEditing(true)
    
    // Populate form with driver data
    setDriverName(driver.driver_name)
    setDriverContact(driver.driver_contact)
    setDriverStatus(driver.driver_status)
    setDriverTownships(driver.townships || [])
    
    setShowDialog(true)
  }

  const resetForm = () => {
    setDriverName('')
    setDriverContact('')
    setDriverStatus('AVAILABLE')
    setDriverTownships([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!driverName || !driverContact) {
      toast.error('Please fill in all required fields')
      return
    }
    
    try {
      setSubmitting(true)
      
      const driverData = {
        driver_name: driverName,
        driver_contact: driverContact,
        driver_status: driverStatus,
        townships: driverTownships
      }
      
      if (isEditing && activeDriver) {
        await supabaseApi.updateDriver(activeDriver.id, driverData)
        toast.success(`Driver ${driverName} updated successfully`)
      } else {
        await supabaseApi.addDriver(driverData)
        toast.success(`Driver ${driverName} added successfully`)
      }
      
      setShowDialog(false)
      loadDrivers() // Refresh the list
    } catch (error) {
      console.error('Error saving driver:', error)
      toast.error('Failed to save driver')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (driver: Driver) => {
    if (confirm(`Are you sure you want to delete ${driver.driver_name}?`)) {
      try {
        await supabaseApi.deleteDriver(driver.id)
        toast.success(`Driver ${driver.driver_name} deleted successfully`)
        loadDrivers() // Refresh the list
      } catch (error) {
        console.error('Error deleting driver:', error)
        toast.error('Failed to delete driver')
      }
    }
  }

  // Filter drivers based on search, township, and status
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         driver.driver_contact.includes(searchQuery)
    
    const matchesTownship = selectedTownship === 'all' || 
                           (driver.townships && driver.townships.includes(selectedTownship))
    
    const matchesStatus = statusFilter === 'ALL' || driver.driver_status === statusFilter
    
    return matchesSearch && matchesTownship && matchesStatus
  })

  // Get unique townships from all drivers
  const allTownships = Array.from(
    new Set(
      drivers.flatMap(driver => driver.townships || [])
    )
  ).sort()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Drivers Management</h1>
        <p className="text-gray-600 mt-2">
          View and manage all drivers in the system
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search drivers by name or contact..."
            className="pl-8 bg-white/80 border-gray-200 text-black"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select
          value={selectedTownship}
          onValueChange={setSelectedTownship}
        >
          <SelectTrigger className="w-[200px] bg-white/80 border-gray-200 text-black">
            <SelectValue placeholder="Filter by township" />
          </SelectTrigger>
          <SelectContent className="bg-white text-black">
            <SelectItem value="all">All Townships</SelectItem>
            {allTownships.map(township => (
              <SelectItem key={township} value={township}>{township}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={statusFilter}
          onValueChange={(value: 'ALL' | 'BUSY' | 'AVAILABLE') => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[180px] bg-white/80 border-gray-200 text-black">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-white text-black">
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="BUSY">Busy</SelectItem>
          </SelectContent>
        </Select>
        
        <Button onClick={openAddDialog} className="flex items-center gap-1 bg-black text-white hover:bg-gray-800">
          <Plus className="h-4 w-4" /> Add Driver
        </Button>
      </div>

      {/* Driver Cards */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-black" />
          <span className="ml-2 text-black">Loading drivers...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDrivers.map(driver => (
              <Card key={driver.id} className="overflow-hidden bg-white/80 border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-black">{driver.driver_name}</CardTitle>
                    <Badge className={driver.driver_status === 'AVAILABLE' ? 'bg-green-500/80' : 'bg-amber-500/80'}>
                      {driver.driver_status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Contact:</span> {driver.driver_contact}
                  </p>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Townships:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {driver.townships && driver.townships.map(township => (
                        <Badge key={township} variant="outline" className="text-xs text-gray-700 border-gray-300 bg-gray-50">
                          {township}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(driver)} className="border-gray-300 text-gray-700 hover:bg-gray-100">
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(driver)} className="bg-red-500/80 hover:bg-red-600">
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Drivers Table */}
          <Card className="bg-white/90 shadow-sm border-gray-200 mt-6">
            <CardHeader className="pb-2 border-b border-gray-200">
              <CardTitle className="text-lg font-medium text-black">Drivers List</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50/80">
                  <TableRow className="hover:bg-gray-50 border-gray-200">
                    <TableHead className="text-gray-700 font-medium">ID</TableHead>
                    <TableHead className="text-gray-700 font-medium">Name</TableHead>
                    <TableHead className="text-gray-700 font-medium">Contact</TableHead>
                    <TableHead className="text-gray-700 font-medium">Status</TableHead>
                    <TableHead className="text-gray-700 font-medium">Townships</TableHead>
                    <TableHead className="text-gray-700 font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No drivers found matching your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDrivers.map((driver) => (
                      <TableRow 
                        key={driver.id} 
                        className="hover:bg-gray-50 border-gray-100 transition-colors"
                      >
                        <TableCell className="font-medium text-gray-900">#{driver.id}</TableCell>
                        <TableCell className="text-gray-700">{driver.driver_name}</TableCell>
                        <TableCell className="text-gray-700">{driver.driver_contact}</TableCell>
                        <TableCell>
                          <Badge className={driver.driver_status === 'AVAILABLE' ? 'bg-green-500/80' : 'bg-amber-500/80'}>
                            {driver.driver_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          <div className="flex flex-wrap gap-1">
                            {driver.townships && driver.townships.slice(0, 2).map(township => (
                              <Badge key={township} variant="outline" className="text-xs text-gray-700 border-gray-300 bg-gray-50">
                                {township}
                              </Badge>
                            ))}
                            {driver.townships && driver.townships.length > 2 && (
                              <Badge variant="outline" className="text-xs text-gray-700 border-gray-300 bg-gray-50">
                                +{driver.townships.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            onClick={() => openEditDialog(driver)}
                            variant="outline"
                            size="sm"
                            className="border-gray-300 text-gray-700 hover:bg-gray-100"
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(driver)}
                            variant="destructive"
                            size="sm"
                            className="bg-red-500/80 hover:bg-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Add/Edit Driver Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-black">{isEditing ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
            <DialogDescription className="text-gray-600">
              {isEditing 
                ? 'Update the driver information below.' 
                : 'Fill in the driver details to add a new driver.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="driverName" className="text-gray-700">Driver Name</Label>
                <Input
                  id="driverName"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Enter driver name"
                  required
                  className="bg-white/80 border-gray-200 text-black"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="driverContact" className="text-gray-700">Contact Number</Label>
                <Input
                  id="driverContact"
                  value={driverContact}
                  onChange={(e) => setDriverContact(e.target.value)}
                  placeholder="Enter contact number"
                  required
                  className="bg-white/80 border-gray-200 text-black"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="driverStatus" className="text-gray-700">Status</Label>
                <Select
                  value={driverStatus}
                  onValueChange={(value: 'BUSY' | 'AVAILABLE') => setDriverStatus(value)}
                >
                  <SelectTrigger id="driverStatus" className="bg-white/80 border-gray-200 text-black">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black">
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="BUSY">Busy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="townships" className="text-gray-700">Townships</Label>
                <div className="border border-gray-200 rounded-md p-3 space-y-2 bg-white/80">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {driverTownships.map(township => (
                      <Badge key={township} variant="secondary" className="px-2 py-1 bg-gray-100 text-gray-700">
                        {township}
                        <button 
                          type="button"
                          className="ml-1 text-gray-500 hover:text-gray-700"
                          onClick={() => setDriverTownships(prev => prev.filter(t => t !== township))}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                    {driverTownships.length === 0 && (
                      <span className="text-sm text-gray-500">No townships selected</span>
                    )}
                  </div>
                  
                  <Select
                    onValueChange={(value) => {
                      if (value && !driverTownships.includes(value)) {
                        setDriverTownships(prev => [...prev, value]);
                      }
                    }}
                  >
                    <SelectTrigger className="bg-white/80 border-gray-200 text-black">
                      <SelectValue placeholder="Add township" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black">
                      {Object.values(YANGON_TOWNSHIPS)
                        .filter(township => !driverTownships.includes(township))
                        .map(township => (
                          <SelectItem key={township} value={township}>
                            {township}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowDialog(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={submitting}
                className="bg-black text-white hover:bg-gray-800"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  isEditing ? 'Update Driver' : 'Add Driver'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}