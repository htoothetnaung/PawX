'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ReportFormProps {
  isOpen: boolean
  onClose: () => void
  location: { lat: number; lng: number; } | null | undefined
  isSelectingLocation: boolean
  onLocationSelect?: (location: { lat: number; lng: number }) => void
}

export default function ReportForm({
  isOpen,
  onClose,
  location,
  isSelectingLocation,
  onLocationSelect
}: ReportFormProps) {
  console.log("ReportForm props:", { isOpen, location, isSelectingLocation });
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      const form = e.target as HTMLFormElement
      const formElements = form.elements as HTMLFormControlsCollection
      const photoUrls: string[] = []

      // Upload photos to Supabase Storage
      for (const photo of photos) {
        const { data, error } = await supabase.storage
          .from('report-photos')
          .upload(`${Date.now()}-${photo.name}`, photo)

        if (error) throw error
        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('report-photos')
            .getPublicUrl(data.path)
          photoUrls.push(publicUrl)
        }
      }

      // Create report with form values
      const { error } = await supabase.from('reports').insert({
        user_id: user.id,
        lat: location?.lat,
        lng: location?.lng,
        township: (formElements.namedItem('township') as HTMLInputElement)?.value,
        pet_type: (formElements.namedItem('pet_type') as HTMLSelectElement)?.value,
        report_type: (formElements.namedItem('report_type') as HTMLSelectElement)?.value,
        urgency_level: (formElements.namedItem('urgency_level') as HTMLSelectElement)?.value,
        description: (formElements.namedItem('description') as HTMLTextAreaElement)?.value,
        photo_url: photoUrls,
        reporter_contact: (formElements.namedItem('reporter_contact') as HTMLInputElement)?.value,
      })

      if (error) throw error

      toast.success('Report submitted successfully!')
      onClose()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to submit report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg shadow-lg z-[9999]">
        <DialogHeader>
          <DialogTitle>Submit Report</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {isSelectingLocation ? (
            <p className="text-sm text-muted-foreground">
              Click on the map to select a location
            </p>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Township</label>
                <input
                  name="township"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Pet Type</label>
                <select name="pet_type" required className="w-full p-2 border rounded">
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="others">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Report Type</label>
                <select name="report_type" required className="w-full p-2 border rounded">
                  <option value="injured">Injured</option>
                  <option value="lost">Lost</option>
                  <option value="abandoned">Abandoned</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Urgency Level</label>
                <select name="urgency_level" required className="w-full p-2 border rounded">
                  <option value="critical">Critical</option>
                  <option value="moderate">Moderate</option>
                  <option value="stable">Stable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  required
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Photos</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setPhotos(Array.from(e.target.files || []))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Contact Number</label>
                <input
                  name="reporter_contact"
                  type="tel"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
} 