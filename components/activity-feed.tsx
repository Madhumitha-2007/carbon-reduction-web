'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDataStore, ActivityItem } from '@/lib/data-store'
import { cn } from '@/lib/utils'
import { Truck, Trash2, Users, Route, Activity } from 'lucide-react'

const iconMap = {
  shipment: Truck,
  waste: Trash2,
  supplier: Users,
  optimization: Route,
}

const colorMap = {
  shipment: 'text-blue-500 bg-blue-500/10',
  waste: 'text-amber-500 bg-amber-500/10',
  supplier: 'text-emerald-500 bg-emerald-500/10',
  optimization: 'text-purple-500 bg-purple-500/10',
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function ActivityFeed() {
  const { activities } = useDataStore()

  const recentActivities = activities.slice(0, 10)

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-5 w-5 text-muted-foreground" />
          Live Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 rounded-full bg-muted p-3">
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No recent activity</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Log shipments, waste, or optimize routes to see activity here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = iconMap[activity.type]
              const colors = colorMap[activity.type]
              
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', colors)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground line-clamp-2">{activity.message}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
