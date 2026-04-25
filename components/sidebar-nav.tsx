'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Calculator, 
  Users, 
  Route, 
  Trash2,
  Leaf
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calculator', label: 'Carbon Calculator', icon: Calculator },
  { href: '/suppliers', label: 'Supplier Selection', icon: Users },
  { href: '/optimizer', label: 'Logistics Optimizer', icon: Route },
  { href: '/waste', label: 'Waste Tracker', icon: Trash2 },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">EcoTrack</span>
        </div>
        
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive && 'text-emerald-500')} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        
        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-emerald-500/10 p-4">
            <p className="text-xs font-medium text-emerald-600">Sustainability Score</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">87.4</p>
            <p className="mt-1 text-xs text-muted-foreground">Above industry average</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
