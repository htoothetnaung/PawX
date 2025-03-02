"use client"

import { useEffect, useState } from "react"
import { supabaseApi, Report } from '@/services/supabase'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function ReportPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [activeReport, setActiveReport] = useState<Report | null>(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionStatus, setActionStatus] = useState<string>('pending')
  const [driverAction, setDriverAction] = useState<string>('send_driver')
  const [actionNotes, setActionNotes] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        const data = await supabaseApi.getAllReports()
        setReports(data)
      } catch (error) {
        console.error('Error fetching reports:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  // Open action modal
  const handleAction = (report: Report) => {
    setActiveReport(report)
    setActionStatus(report.status)
    setActionNotes('')
    setShowActionModal(true)
  }

  // Replace the handleSubmitAction function in page.tsx with this:

const handleSubmitAction = async () => {
    if (!activeReport) return
    
    try {
      setSubmitting(true)
      
      // Call the Supabase API to update the report
      await supabaseApi.updateReportStatus(
        activeReport.id, 
        actionStatus, 
        actionNotes, 
        driverAction
      )
      
      // Refresh the reports data
      const updatedData = await supabaseApi.getAllReports()
      setReports(updatedData)
      
      setShowActionModal(false)
      // Show success toast notification if you have that set up
      // Success toast
toast.success(`Report #${activeReport.id} status updated to ${actionStatus}`, {
    dismissible: true,
    duration: 4000,
    action: {
      label: 'Dismiss',
      onClick: () => toast.dismiss()
    }
  });
    } catch (error) {
      console.error('Error updating report:', error)
      // Show error toast notification if you have that set up
      // Error toast
toast.error("There was an error updating the report status", {
    dismissible: true, 
    duration: 4000,
    action: {
      label: 'Dismiss',
      onClick: () => toast.dismiss()
    }
  });
    }
  }

  // Filter reports by status
  const pendingReports = reports.filter(report => report.status === 'pending')
  const onTheWayReports = reports.filter(report => report.status === 'on_the_way')
  const resolvedReports = reports.filter(report => report.status === 'resolved')
  const rejectedReports = reports.filter(report => report.status === 'rejected')

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'moderate': return 'bg-yellow-100 text-yellow-800'
      case 'stable': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports Management</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all animal rescue reports by status
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading reports...</span>
        </div>
      ) : (
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="pending" className="relative">
              Pending
              <Badge className="ml-1 bg-yellow-500 absolute -top-2 -right-2">{pendingReports.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="onTheWay" className="relative">
              On The Way
              <Badge className="ml-1 bg-blue-500 absolute -top-2 -right-2">{onTheWayReports.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="resolved" className="relative">
              Resolved
              <Badge className="ml-1 bg-green-500 absolute -top-2 -right-2">{resolvedReports.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="relative">
              Rejected
              <Badge className="ml-1 bg-red-500 absolute -top-2 -right-2">{rejectedReports.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <ReportsTable 
              reports={pendingReports} 
              getUrgencyColor={getUrgencyColor} 
              onAction={handleAction}
            />
          </TabsContent>
          
          <TabsContent value="onTheWay">
            <ReportsTable 
              reports={onTheWayReports} 
              getUrgencyColor={getUrgencyColor} 
              onAction={handleAction}
            />
          </TabsContent>
          
          <TabsContent value="resolved">
            <ReportsTable 
              reports={resolvedReports} 
              getUrgencyColor={getUrgencyColor} 
              onAction={handleAction}
            />
          </TabsContent>
          
          <TabsContent value="rejected">
            <ReportsTable 
              reports={rejectedReports} 
              getUrgencyColor={getUrgencyColor} 
              onAction={handleAction}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Action Modal */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>Take Action on Report #{activeReport?.id}</DialogTitle>
            <DialogDescription>
              Update the status of this report and assign actions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4 bg-white">
            <div className="grid gap-2">
              <Label htmlFor="status">Update Status</Label>
              <Select 
                value={actionStatus} 
                onValueChange={setActionStatus}

              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="on_the_way">On The Way</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="driver">Driver Action</Label>
              <Select 
                value={driverAction} 
                onValueChange={setDriverAction}
              >
                <SelectTrigger id="driver">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                
<SelectContent>
  <SelectItem value="send_driver">Send driver to report location</SelectItem>
  <SelectItem value="nearest_shelter">Redirect to nearest shelter (drivers busy)</SelectItem>
  <SelectItem value="no_action">No driver action needed</SelectItem>
</SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional information here..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowActionModal(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitAction} 
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ReportsTableProps {
  reports: Report[]
  getUrgencyColor: (urgency: string) => string
  onAction: (report: Report) => void
}

function ReportsTable({ reports, getUrgencyColor, onAction }: ReportsTableProps) {
  if (reports.length === 0) {
    return (
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardContent className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">No reports found in this category</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="hover:bg-gray-50 border-gray-100">
              <TableHead className="text-gray-600 font-medium">ID</TableHead>
              <TableHead className="text-gray-600 font-medium">Location</TableHead>
              <TableHead className="text-gray-600 font-medium">Pet Type</TableHead>
              <TableHead className="text-gray-600 font-medium">Report Type</TableHead>
              <TableHead className="text-gray-600 font-medium">Urgency</TableHead>
              <TableHead className="text-gray-600 font-medium">Contact</TableHead>
              <TableHead className="text-gray-600 font-medium">Date</TableHead>
              <TableHead className="text-gray-600 font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow 
                key={report.id} 
                className="hover:bg-gray-50 border-gray-100 transition-colors"
              >
                <TableCell className="font-medium text-gray-900">#{report.id}</TableCell>
                <TableCell className="text-gray-700">{report.township}</TableCell>
                <TableCell className="capitalize text-gray-700">{report.pet_type}</TableCell>
                <TableCell className="capitalize text-gray-700">{report.report_type}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(report.urgency_level)}`}>
                    {report.urgency_level}
                  </span>
                </TableCell>
                <TableCell className="text-gray-700">{report.reporter_contact}</TableCell>
                <TableCell className="text-gray-700">{format(new Date(report.created_at), 'MMM d, yyyy')}</TableCell>
                <TableCell className="">
                  <Button
                    onClick={() => onAction(report)}
                    variant="outline"
                    size="sm"
                  >
                    Take Action
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}