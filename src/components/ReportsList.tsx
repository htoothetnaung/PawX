'use client'

import { useEffect, useState } from 'react'
import { supabaseApi, type Report } from '@/services/supabase'

export default function ReportsList() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await supabaseApi.getUserReports()
        setReports(data)
      } catch (error) {
        console.error('Error fetching reports:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  if (loading) return <div>Loading reports...</div>

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-4">
      <h2 className="text-lg font-bold mb-4">Your Reports</h2>
      <div className="space-y-4">
        {reports.length === 0 ? (
          <p className="text-gray-500">No reports yet</p>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="border rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{report.pet_type} - {report.report_type}</h3>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  report.status === 'on_the_way' ? 'bg-blue-100 text-blue-800' :
                  report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {report.status}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <p>Location: {report.township}</p>
                <p>Urgency: {report.urgency_level}</p>
                <p>Reported: {new Date(report.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 