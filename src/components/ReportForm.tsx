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
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
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

      // Create report
      const { error } = await supabase.from('reports').insert({
        lat: location?.lat,
        lng: location?.lng,
        township: formData.get('township'),
        pet_type: formData.get('pet_type'),
        report_type: formData.get('report_type'),
        urgency_level: formData.get('urgency_level'),
        description: formData.get('description'),
        photo_url: photoUrls,
        reporter_contact: formData.get('reporter_contact'),
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit Report</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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