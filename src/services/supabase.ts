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

    // First check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    // If admin, get all reports, otherwise get user's reports
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id) // Always filter by user_id first
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reports:', error)
      throw error
    }

    // If admin, get all reports in a separate query
    if (roleData?.role === 'admin') {
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

    return data as Report[]
  },

  async getShelters() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('shelters')
      .select('*')

    if (error) {
      console.error('Error fetching shelters:', error)
      throw error
    }

    if (!data) {
      console.warn('No shelter data returned')
      return []
    }

    return data as Shelter[]
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

  async getTotalUsers() {
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    return count || 0
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
} 