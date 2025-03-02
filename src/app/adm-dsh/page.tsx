'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabaseApi } from '@/services/supabase'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    totalShelters: 0,
    totalDeliveries: 0
  })

  const [reportsData, setReportsData] = useState({
    labels: ['Pending', 'On The Way', 'Resolved', 'Rejected'],
    datasets: [{
      label: 'Reports by Status',
      data: [0, 0, 0, 0],
      backgroundColor: [
        'rgba(255, 206, 86, 0.5)',  // yellow for pending
        'rgba(54, 162, 235, 0.5)',  // blue for on the way
        'rgba(75, 192, 192, 0.5)',  // green for resolved
        'rgba(255, 99, 132, 0.5)',  // red for rejected
      ],
      borderColor: [
        'rgba(255, 206, 86, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(255, 99, 132, 1)',
      ],
      borderWidth: 1
    }]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch all stats in parallel
        const [
          totalUsers, 
          totalReports, 
          totalShelters, 
          totalDeliveries,
          statusCounts
        ] = await Promise.all([
          supabaseApi.getTotalUsers(),
          supabaseApi.getTotalReports(),
          supabaseApi.getTotalShelters(),
          supabaseApi.getTotalDeliveries(),
          supabaseApi.getReportsByStatus()
        ])
        
        // Update stats
        setStats({
          totalUsers,
          totalReports,
          totalShelters,
          totalDeliveries
        })
        
        // Update reports by status chart
        setReportsData(prev => ({
          ...prev,
          datasets: [{
            ...prev.datasets[0],
            data: [
              statusCounts.pending,
              statusCounts.on_the_way,
              statusCounts.resolved,
              statusCounts.rejected
            ]
          }]
        }))
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Users" value={stats.totalUsers} />
            <StatCard title="Total Reports" value={stats.totalReports} />
            <StatCard title="Total Shelters" value={stats.totalShelters} />
            <StatCard title="Total Deliveries" value={stats.totalDeliveries} />
          </div>
          
          {/* Reports Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Reports by Status</CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex justify-center items-center">
              <div className="w-full max-w-md">
                <Doughnut 
                  data={reportsData} 
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      }
                    }
                  }} 
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}