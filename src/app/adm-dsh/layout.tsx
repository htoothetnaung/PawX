import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Sidebar } from './components/sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await (await supabase).auth.getUser()

  if (!user || user.role !== 'admin') {
    redirect('/auth/restricted')
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  )
} 