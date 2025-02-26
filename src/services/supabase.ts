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
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Report[]
  },

  async getShelters() {
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

    console.log('Fetched shelters:', data) // Debug log
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
  }
} 