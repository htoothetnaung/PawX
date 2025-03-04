import { calculateDistance } from '@/utils/mapUtils'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export interface Report {
  id: number
  lat: number
  lng: number
  township: string
  description: string
  status: 'pending' | 'on_the_way' | 'resolved' | 'rejected'
  pet_type: 'dog' | 'cat' | 'others'
  report_type: 'injured' | 'lost' | 'abandoned'
  urgency_level: 'critical' | 'moderate' | 'stable'
  photo_url?: string[]
  reporter_contact: string
  created_at: string
}

export interface Shelter {
  id: number
  lat: number
  lng: number
  shelter_name: string
  contact: string
  total_capacity: number
  current_capacity: number
  staff: {
    veterinarians: number
    volunteers: number
    drivers: number
  }
  resources: {
    food: number
    medical: number
    equipment: number
  }
}

// Add this interface for Driver
export interface Driver {
  id: number;
  driver_name: string;
  driver_contact: string;
  driver_status: 'BUSY' | 'AVAILABLE';
  townships: string[];
  created_at?: string;
  updated_at?: string;
}

export interface DriverReport {
  driver_id: number;
  report_id: number;
  driver?: Driver;  // Optional joined data
  report?: Report;  // Optional joined data
}

export const supabaseApi = {

  async getReports() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    console.log("User fetched successfully: ", user)

    // Check if user is admin by email
    const isAdmin = user.email === 'htoothetdev@gmail.com'
  // If admin, get all reports
    if (isAdmin) {
      const { data: allData, error: allError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (allError) {
        console.error('Error fetching all reports:', allError)
        throw allError
      }

      return allData as Report[]
    }

    // Get user's reports first
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      
    console.log("Users' own reports fetched successfully")

    if (error) {
      console.error('Error fetching reports:', error)
      throw error
    }

  
    

    return data as Report[]
  },

  async getAllShelters() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('shelters')
        .select('*')
        .order('shelter_name', { ascending: true })

      if (error) {
        console.error('Error fetching all shelters:', error)
        throw error
      }

      return data as Shelter[] || []
    } catch (error) {
      console.error('Error in getAllShelters:', error)
      return [] // Return empty array instead of throwing
    }
  },

  async addShelter(shelterData: Omit<Shelter, 'id'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check if user is admin by email
      const isAdmin = user.email === 'htoothetdev@gmail.com'
      if (!isAdmin) throw new Error('Only admins can add shelters')

      const { data, error } = await supabase
        .from('shelters')
        .insert([shelterData])
        .select()

      if (error) {
        console.error('Error adding shelter:', error)
        throw error
      }

      return data?.[0] as Shelter
    } catch (error) {
      console.error('Error in addShelter:', error)
      throw error
    }
  },

  async updateShelter(id: number, shelterData: Partial<Omit<Shelter, 'id'>>) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check if user is admin by email
      const isAdmin = user.email === 'htoothetdev@gmail.com'
      if (!isAdmin) throw new Error('Only admins can update shelters')

      const { data, error } = await supabase
        .from('shelters')
        .update({
          ...shelterData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) {
        console.error('Error updating shelter:', error)
        throw error
      }

      return data?.[0] as Shelter
    } catch (error) {
      console.error('Error in updateShelter:', error)
      throw error
    }
  },

  async deleteShelter(id: number) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check if user is admin by email
      const isAdmin = user.email === 'htoothetdev@gmail.com'
      if (!isAdmin) throw new Error('Only admins can delete shelters')

      const { error } = await supabase
        .from('shelters')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting shelter:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Error in deleteShelter:', error)
      throw error
    }
  },

  async getShelterById(id: number) {
    try {
      const { data, error } = await supabase
        .from('shelters')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching shelter by ID:', error)
        throw error
      }

      return data as Shelter
    } catch (error) {
      console.error('Error in getShelterById:', error)
      throw error
    }
  },

  async getNearestShelters(lat: number, lng: number, limit = 2) {
    const { data: shelters } = await supabase
      .from('shelters')
      .select('*')

    if (!shelters) return []

    return shelters
      .map(shelter => ({
        ...shelter,
        distance: calculateDistance(lat, lng, shelter.lat, shelter.lng)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
  },

  async getUserReports() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

       // Check if user is admin by email
    const isAdmin = user.email === 'htoothetdev@gmail.com'
    // If admin, get all reports
      if (isAdmin) {
        const { data: allData, error: allError } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false })
  
        if (allError) {
          console.error('Error fetching all reports:', allError)
          throw allError
        }
  
        return allData as Report[]
      }
      

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Report[]
  },

  async getAllReports() {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Report[]
  },

  async getReportsByStatus() {
    const { data, error } = await supabase
      .from('reports')
      .select('status')
    
    if (error) {
      console.error('Error fetching reports by status:', error)
      throw error
    }
    
    // Count reports by status
    const statusCounts = {
      pending: 0,
      on_the_way: 0,
      resolved: 0,
      rejected: 0
    }
    
    data?.forEach(report => {
      if (report.status in statusCounts) {
        statusCounts[report.status as keyof typeof statusCounts]++
      }
    })
    
    return statusCounts
  },

  async getTotalUsers() {
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    return 4
  },

  async getTotalReports() {
    const { count } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
    return count || 0
  },

  async getTotalShelters() {
    const { count } = await supabase
      .from('shelters')
      .select('*', { count: 'exact', head: true })
    return count || 0
  },

  async getTotalDeliveries() {
    try {
      const { count, error } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error fetching total deliveries:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getTotalDeliveries:', error);
      return 0; // Return 0 if there's an error
    }
  },

  // Add this function to the supabaseApi object in supabase.ts

// In supabase.ts, update the updateReportStatus function

async updateReportStatus(reportId: number, status: string, notes: string, driverAction: string) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User is not authenticated')
  }
  
  // First, get the current report to preserve existing data
  const { data: existingReport, error: fetchError } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single()
    
  if (fetchError) {
    console.error('Error fetching report:', fetchError)
    throw fetchError
  }
  
  // Map the driver action to match the enum values in your database
  let mappedDriverAction;
  switch (driverAction) {
    case 'send_driver':
      mappedDriverAction = 'driver_dispatched';
      break;
    case 'nearest_shelter':
      mappedDriverAction = 'redirect_to_shelter';
      break;
    case 'no_action':
      mappedDriverAction = 'no_action';
      break;
    default:
      mappedDriverAction = 'no_action';
  }
  
  // Update the report with new status and admin notes
  const { data, error } = await supabase
    .from('reports')
    .update({
      status: status,
      admin_notes: notes || existingReport.admin_notes,
      driver_action: mappedDriverAction,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reportId)
    .select()
  
  if (error) {
    console.error('Error updating report status:', error)
    throw error
  }
  
  // Create an entry in the report_history table to track changes
  const { error: historyError } = await supabase
    .from('report_history')
    .insert({
      report_id: reportId,
      previous_status: existingReport.status,
      new_status: status,
      updated_by: user.id,
      notes: notes,
      driver_action: mappedDriverAction
    })
  
  if (historyError) {
    console.error('Error creating history record:', historyError)
    // We don't throw here to avoid blocking the main update
  }
  
  return data
},

 // Driver CRUD operations
 async getAllDrivers() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('driver_name', { ascending: true })

    if (error) {
      console.error('Error fetching drivers:', error)
      throw error
    }

    return data as Driver[] || []
  } catch (error) {
    console.error('Error in getAllDrivers:', error)
    return [] // Return empty array on error
  }
},

async getDriverById(id: number) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching driver by ID:', error)
      throw error
    }

    return data as Driver
  } catch (error) {
    console.error('Error in getDriverById:', error)
    throw error
  }
},

async getDriversByStatus(status: 'BUSY' | 'AVAILABLE') {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('driver_status', status)
      .order('driver_name', { ascending: true })

    if (error) {
      console.error(`Error fetching ${status} drivers:`, error)
      throw error
    }

    return data as Driver[] || []
  } catch (error) {
    console.error(`Error in getDriversByStatus(${status}):`, error)
    return [] // Return empty array on error
  }
},

async getDriversByTownship(township: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .contains('townships', [township])
      .order('driver_name', { ascending: true })

    if (error) {
      console.error(`Error fetching drivers for township ${township}:`, error)
      throw error
    }

    return data as Driver[] || []
  } catch (error) {
    console.error(`Error in getDriversByTownship(${township}):`, error)
    return [] // Return empty array on error
  }
},

async addDriver(driverData: Omit<Driver, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check if user is admin by email
    const isAdmin = user.email === 'htoothetdev@gmail.com'
    if (!isAdmin) throw new Error('Only admins can add drivers')

    const { data, error } = await supabase
      .from('drivers')
      .insert([driverData])
      .select()

    if (error) {
      console.error('Error adding driver:', error)
      throw error
    }

    return data?.[0] as Driver
  } catch (error) {
    console.error('Error in addDriver:', error)
    throw error
  }
},

async updateDriver(id: number, driverData: Partial<Omit<Driver, 'id' | 'created_at' | 'updated_at'>>) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check if user is admin by email
    const isAdmin = user.email === 'htoothetdev@gmail.com'
    if (!isAdmin) throw new Error('Only admins can update drivers')

    const { data, error } = await supabase
      .from('drivers')
      .update({
        ...driverData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating driver:', error)
      throw error
    }

    return data?.[0] as Driver
  } catch (error) {
    console.error('Error in updateDriver:', error)
    throw error
  }
},

async deleteDriver(id: number) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check if user is admin by email
    const isAdmin = user.email === 'htoothetdev@gmail.com'
    if (!isAdmin) throw new Error('Only admins can delete drivers')

    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting driver:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('Error in deleteDriver:', error)
    throw error
  }
},

async getTotalDrivers() {
  try {
    const { count, error } = await supabase
      .from('drivers')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Error getting total drivers count:', error)
      throw error
    }

    return count || 0
  } catch (error) {
    console.error('Error in getTotalDrivers:', error)
    return 0
  }
},

async getDriversByStatusCount() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const [busyResult, availableResult] = await Promise.all([
      supabase.from('drivers').select('*', { count: 'exact' }).eq('driver_status', 'BUSY'),
      supabase.from('drivers').select('*', { count: 'exact' }).eq('driver_status', 'AVAILABLE')
    ])

    return {
      busy: busyResult.count || 0,
      available: availableResult.count || 0
    }
  } catch (error) {
    console.error('Error in getDriversByStatusCount:', error)
    return { busy: 0, available: 0 }
  }
},







}