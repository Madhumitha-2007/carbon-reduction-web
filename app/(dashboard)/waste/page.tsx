'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  WasteCategory, 
  DisposalMethod,
  addWasteEvent,
  useWasteMetrics
} from '@/lib/data-store'
import { AnimatedCounter } from '@/components/animated-counter'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import { Trash2, Recycle, Leaf, Plus, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const WASTE_CATEGORIES: { value: WasteCategory; label: string; color: string }[] = [
  { value: 'plastic', label: 'Plastic', color: '#3b82f6' },
  { value: 'paper', label: 'Paper', color: '#10b981' },
  { value: 'metal', label: 'Metal', color: '#6366f1' },
  { value: 'organic', label: 'Organic', color: '#f59e0b' },
  { value: 'hazardous', label: 'Hazardous', color: '#ef4444' },
  { value: 'other', label: 'Other', color: '#8b5cf6' },
]

const DISPOSAL_METHODS: { value: DisposalMethod; label: string; diverted: boolean }[] = [
  { value: 'recycled', label: 'Recycled', diverted: true },
  { value: 'composted', label: 'Composted', diverted: true },
  { value: 'landfill', label: 'Landfill', diverted: false },
  { value: 'incinerated', label: 'Incinerated', diverted: false },
]

export default function WasteTracker() {
  const [category, setCategory] = useState<WasteCategory>('plastic')
  const [quantity, setQuantity] = useState('')
  const [disposal, setDisposal] = useState<DisposalMethod>('recycled')
  const [logged, setLogged] = useState(false)
  
  const metrics = useWasteMetrics()

  const handleLogWaste = () => {
    const q = parseFloat(quantity)
    if (isNaN(q) || q <= 0) return
    
    addWasteEvent(category, q, disposal)
    setQuantity('')
    setLogged(true)
    setTimeout(() => setLogged(false), 2000)
  }

  const isDiverted = DISPOSAL_METHODS.find(d => d.value === disposal)?.diverted ?? false

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Waste Tracker</h1>
        <p className="text-muted-foreground">Log and monitor waste disposal for sustainability reporting</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Diversion Rate</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  <AnimatedCounter value={metrics.diversionRate} decimals={1} suffix="%" />
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Last 6 months</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                <Recycle className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div 
                  className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                  style={{ width: `${metrics.diversionRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CO2 Avoided</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  <AnimatedCounter value={metrics.co2Avoided / 1000} decimals={1} suffix=" t" />
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Estimated savings</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <Leaf className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Diverted</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  <AnimatedCounter value={metrics.divertedTotal / 1000} decimals={1} suffix=" t" />
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Recycled + Composted</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                <TrendingUp className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Log Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-500" />
              Log Waste Event
            </CardTitle>
            <CardDescription>
              Record new waste disposal for tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="category">Waste Type</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as WasteCategory)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WASTE_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: c.color }}
                        />
                        {c.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (kg)</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="e.g., 250"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="disposal">Disposal Method</Label>
              <Select value={disposal} onValueChange={(v) => setDisposal(v as DisposalMethod)}>
                <SelectTrigger id="disposal">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISPOSAL_METHODS.map(d => (
                    <SelectItem key={d.value} value={d.value}>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'h-2 w-2 rounded-full',
                          d.diverted ? 'bg-emerald-500' : 'bg-red-500'
                        )} />
                        {d.label}
                        {d.diverted && (
                          <span className="text-xs text-emerald-600">(Diverted)</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Impact Preview */}
            <div className={cn(
              'rounded-lg p-4',
              isDiverted ? 'bg-emerald-500/10' : 'bg-amber-500/10'
            )}>
              <p className={cn(
                'text-sm font-medium',
                isDiverted ? 'text-emerald-600' : 'text-amber-600'
              )}>
                {isDiverted ? 'This will count as diverted waste' : 'This will not count as diverted'}
              </p>
              {isDiverted && quantity && parseFloat(quantity) > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Estimated CO2 avoided: ~{(parseFloat(quantity) * 2.5).toFixed(0)} kg
                </p>
              )}
            </div>

            <Button 
              onClick={handleLogWaste} 
              className={cn(
                'w-full transition-all',
                logged 
                  ? 'bg-emerald-600 hover:bg-emerald-600' 
                  : 'bg-emerald-600 hover:bg-emerald-700'
              )}
              disabled={!quantity || parseFloat(quantity) <= 0}
            >
              {logged ? (
                <>
                  <Recycle className="mr-2 h-4 w-4 animate-spin" />
                  Logged!
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Log Waste Event
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Stacked Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-amber-500" />
              6-Month Waste by Category
            </CardTitle>
            <CardDescription>
              Monthly breakdown of waste types in kg
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={metrics.monthlyByCategory} 
                  margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                >
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
                    formatter={(value: number, name: string) => [
                      `${value.toLocaleString()} kg`, 
                      name.charAt(0).toUpperCase() + name.slice(1)
                    ]}
                  />
                  <Legend 
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => (
                      <span className="text-sm text-foreground capitalize">{value}</span>
                    )}
                  />
                  {WASTE_CATEGORIES.map(c => (
                    <Bar 
                      key={c.value}
                      dataKey={c.value} 
                      stackId="a" 
                      fill={c.color}
                      radius={[0, 0, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Waste Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WASTE_CATEGORIES.map(c => (
              <div key={c.value} className="flex items-center gap-3 rounded-lg border p-3">
                <div 
                  className="h-4 w-4 rounded-full" 
                  style={{ backgroundColor: c.color }}
                />
                <div>
                  <p className="font-medium text-foreground">{c.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.value === 'plastic' && 'Bottles, packaging, films'}
                    {c.value === 'paper' && 'Cardboard, office paper'}
                    {c.value === 'metal' && 'Cans, scrap metal, foils'}
                    {c.value === 'organic' && 'Food waste, yard waste'}
                    {c.value === 'hazardous' && 'Batteries, chemicals, oils'}
                    {c.value === 'other' && 'Mixed or unclassified waste'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
