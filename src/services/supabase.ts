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

  async getShelters() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Simple query without any role checks
    const { data, error } = await supabase
      .from('shelters')
      .select('*');

    if (error) {
      console.error('Supabase response:', { data, error });
      console.error('Error fetching shelters:', error);
      throw error;
    }

    return data;
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
    const { count } = await supabase
      .from('deliveries')
      .select('*', { count: 'exact', head: true })
    return count || 0
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
}
} 