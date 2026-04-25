import { SidebarNav } from '@/components/sidebar-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <main className="ml-64 min-h-screen p-6">
        {children}
      </main>
    </div>
  )
}
