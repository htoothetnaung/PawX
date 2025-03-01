'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, Line } from 'react-chartjs-2'
import { useEffect, useState } from "react"
import { supabaseApi } from "@/services/supabase"
import { Users } from "lucide-react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    totalShelters: 0,
    totalDeliveries: 0
  })

  const [userActivityData, setUserActivityData] = useState({
    labels: [],
    datasets: []
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
      ]
    }]
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch statistics from Supabase
      const [users, reports, shelters, deliveries] = await Promise.all([
        supabaseApi.getTotalUsers(),
        supabaseApi.getTotalReports(),
        supabaseApi.getTotalShelters(),
        supabaseApi.getTotalDeliveries()
      ])

      setStats({
        totalUsers: users,
        totalReports: reports,
        totalShelters: shelters,
        totalDeliveries: deliveries
      })
    }

    fetchStats()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold">Dashboard Overview</h2>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        {/* Similar cards for reports, shelters, and deliveries */}
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={userActivityData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={reportsData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 