'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  PawPrint,
  Home,
  Truck,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react'

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/adm-dsh',
    color: "text-sky-500"
  },
  {
    label: 'Reports',
    icon: PawPrint,
    href: '/adm-dsh/reports',
    color: "text-violet-500",
  },
  {
    label: 'Shelters',
    icon: Home,
    href: '/adm-dsh/shelters',
    color: "text-pink-700",
  },
  {
    label: 'Drivers & Deliveries',
    icon: Truck,
    href: '/adm-dsh/drivers',
    color: "text-orange-700",
  },
  {
    label: 'Users',
    icon: Users,
    href: '/adm-dsh/users',
    color: "text-green-700",
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/adm-dsh/settings',
  },
];

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  
  const toggleSidebar = () => setCollapsed(!collapsed)

  return (
    <div className={cn(
      "relative flex flex-col h-screen bg-gray-900 text-white transition-all duration-300 ease-in-out",
      collapsed ? "w-20" : "w-64"
    )}>
      <button 
        onClick={toggleSidebar}
        className="absolute top-4 right-[-12px] bg-gray-900 text-white p-1 rounded-full border border-gray-700"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
      
      <div className="px-3 py-4 flex-1">
        <Link href="/adm-dsh" className={cn(
          "flex items-center mb-10 transition-all", 
          collapsed ? "justify-center pl-0" : "pl-3"
        )}>
          {collapsed ? (
            <Menu className="h-8 w-8" />
          ) : (
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          )}
        </Link>
        
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "group flex p-3 rounded-lg transition-all hover:text-white hover:bg-white/10",
                collapsed ? "justify-center" : "w-full justify-start",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
              )}
              title={collapsed ? route.label : undefined}
            >
              <route.icon className={cn("h-6 w-6", collapsed ? "" : "mr-3", route.color)} />
              {!collapsed && <span className="text-sm font-medium">{route.label}</span>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
