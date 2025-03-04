"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabaseApi } from '@/services/supabase'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import { Loader2 } from "lucide-react"

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

  // Update the sheltersData state definition with explicit typing
const [sheltersData, setSheltersData] = useState<{
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}>({
  labels: [],
  datasets: [{
    label: 'Current Capacity',
    data: [],
    backgroundColor: 'rgba(54, 162, 235, 0.5)',
    borderColor: 'rgba(54, 162, 235, 1)',
    borderWidth: 1
  }, {
    label: 'Total Capacity',
    data: [],
    backgroundColor: 'rgba(153, 102, 255, 0.5)',
    borderColor: 'rgba(153, 102, 255, 1)',
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
          statusCounts,
          allShelters
        ] = await Promise.all([
          supabaseApi.getTotalUsers(),
          supabaseApi.getTotalReports(),
          supabaseApi.getTotalShelters(),
          supabaseApi.getTotalDeliveries(),
          supabaseApi.getReportsByStatus(),
          supabaseApi.getAllShelters()
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
        
        // Update shelters chart - horizontal bar chart with ALL shelters
        if (allShelters && allShelters.length > 0) {
          // Sort shelters by capacity (descending)
          const sortedShelters = [...allShelters].sort((a, b) => 
            b.total_capacity - a.total_capacity
          );
          
          setSheltersData({
            // For horizontal bar chart, these become the y-axis labels
            labels: sortedShelters.map(shelter => shelter.shelter_name),
            datasets: [
              {
                label: 'Current Capacity',
                data: sortedShelters.map(shelter => shelter.current_capacity),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
              },
              {
                label: 'Total Capacity',
                data: sortedShelters.map(shelter => shelter.total_capacity),
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
              }
            ]
          });
        }
        
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
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-700">Loading dashboard data...</span>
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
          
          {/* Reports Status Chart */}
          <Card className="bg-white shadow-md border-2 border-gray-200 rounded-lg overflow-hidden">
            <CardHeader className="pb-2 border-b border-gray-200">
              <CardTitle className="text-lg font-medium text-gray-900">Reports by Status</CardTitle>
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
                        labels: {
                          color: '#374151', // text-gray-700
                          font: {
                            size: 12
                          }
                        }
                      }
                    }
                  }} 
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Shelters Chart - Horizontal Bar showing ALL shelters */}
          <Card className="bg-white shadow-md border-2 border-gray-200 rounded-lg overflow-hidden">
            <CardHeader className="pb-2 border-b border-gray-200">
              <CardTitle className="text-lg font-medium text-gray-900">Shelter Capacities</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]"> {/* Taller to accommodate all shelters */}
              {sheltersData.labels.length > 0 ? (
                <Bar 
                data={sheltersData} 
                options={{ 
                  // Remove indexAxis: 'y' to make the chart vertical
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Capacity',
                        color: '#374151', // text-gray-700
                      },
                      ticks: {
                        color: '#374151', // text-gray-700
                      },
                      grid: {
                        color: '#E5E7EB', // border-gray-200
                      }
                    },
                    x: {
                      title: {
                        display: false
                      },
                      ticks: {
                        color: '#374151', // text-gray-700
                        // Rotate labels to better fit
                        maxRotation: 45,
                        minRotation: 45
                      },
                      grid: {
                        color: '#E5E7EB', // border-gray-200
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: '#374151', // text-gray-700
                        font: {
                          size: 12
                        }
                      }
                    },
                    tooltip: {
                      callbacks: {
                        title: (items) => {
                          if (!items.length) return '';
                          const index = items[0].dataIndex;
                          return sheltersData.labels[index];
                        }
                      }
                    }
                  }
                }} 
              />
              ) : (
                <div className="h-full flex justify-center items-center text-gray-500">
                  No shelter data available
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card className="bg-white shadow-md border-2 border-gray-200 rounded-lg overflow-hidden">
      <CardHeader className="pb-2 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </CardContent>
    </Card>
  )
}