'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KPICard } from '@/components/kpi-card'
import { ActivityFeed } from '@/components/activity-feed'
import { 
  useDashboardMetrics, 
  useMonthlyTrend, 
  useTransportModeBreakdown,
  useTopSuppliers 
} from '@/lib/data-store'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { CloudCog, Truck, Recycle, Star, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const TRANSPORT_COLORS = {
  road: '#3b82f6',
  rail: '#10b981',
  sea: '#06b6d4',
  air: '#f59e0b',
}

const TRANSPORT_LABELS = {
  road: 'Road',
  rail: 'Rail',
  sea: 'Sea',
  air: 'Air',
}

const RATING_COLORS = {
  A: 'bg-emerald-500',
  B: 'bg-emerald-400',
  C: 'bg-amber-400',
  D: 'bg-orange-400',
  E: 'bg-red-500',
}

export default function Dashboard() {
  const metrics = useDashboardMetrics()
  const monthlyTrend = useMonthlyTrend()
  const transportBreakdown = useTransportModeBreakdown()
  const topSuppliers = useTopSuppliers(3)

  const pieData = transportBreakdown.map(item => ({
    name: TRANSPORT_LABELS[item.mode],
    value: item.co2,
    color: TRANSPORT_COLORS[item.mode],
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Monitor your supply chain sustainability metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Monthly CO2 Emissions"
          value={metrics.totalCO2}
          suffix=" kg"
          decimals={0}
          change={metrics.co2Change}
          icon={<CloudCog className="h-6 w-6 text-emerald-500" />}
          iconBg="bg-emerald-500/10"
        />
        <KPICard
          title="Total Shipments"
          value={metrics.totalShipments}
          change={metrics.shipmentsChange}
          icon={<Truck className="h-6 w-6 text-blue-500" />}
          iconBg="bg-blue-500/10"
        />
        <KPICard
          title="Waste Diversion Rate"
          value={metrics.diversionRate}
          suffix="%"
          decimals={1}
          icon={<Recycle className="h-6 w-6 text-amber-500" />}
          iconBg="bg-amber-500/10"
        />
        <KPICard
          title="Avg Supplier Score"
          value={metrics.avgSupplierScore}
          decimals={1}
          icon={<Star className="h-6 w-6 text-purple-500" />}
          iconBg="bg-purple-500/10"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* CO2 Trend Line */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingDown className="h-5 w-5 text-emerald-500" />
              12-Month CO2 Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    className="fill-muted-foreground"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => [`${value.toLocaleString()} kg CO2`, 'Emissions']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="co2" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Transport Mode Donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="h-5 w-5 text-blue-500" />
              Transport Mode Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} kg`, 'CO2']}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Suppliers */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="h-5 w-5 text-amber-500" />
              Top 3 Suppliers by Composite Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSuppliers.map((supplier, index) => (
                <div 
                  key={supplier.id} 
                  className={cn(
                    'flex items-center gap-4 rounded-lg border p-4',
                    supplier.isActive && 'border-emerald-500 bg-emerald-500/5'
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-bold text-muted-foreground">
                    #{index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{supplier.name}</p>
                      {index === 0 && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
                          <Star className="h-3 w-3" /> OPTIMAL
                        </span>
                      )}
                      {supplier.isActive && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{supplier.category}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className={cn('mx-auto h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white', RATING_COLORS[supplier.carbonRating])}>
                        {supplier.carbonRating}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Carbon</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{supplier.compositeScore.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                    <div className="w-24">
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div 
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${supplier.compositeScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <ActivityFeed />
      </div>
    </div>
  )
}
