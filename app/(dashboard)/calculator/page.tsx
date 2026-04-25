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
  TransportMode, 
  CO2_FACTORS, 
  calculateCO2, 
  addShipment 
} from '@/lib/data-store'
import { Calculator, Truck, Train, Ship, Plane, Leaf, AlertTriangle, Flame, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const TRANSPORT_MODES: { value: TransportMode; label: string; icon: typeof Truck }[] = [
  { value: 'road', label: 'Road (Truck)', icon: Truck },
  { value: 'rail', label: 'Rail (Train)', icon: Train },
  { value: 'sea', label: 'Sea (Ship)', icon: Ship },
  { value: 'air', label: 'Air (Plane)', icon: Plane },
]

function getCO2Rating(co2: number, distance: number, weight: number): 'green' | 'amber' | 'red' {
  // Calculate baseline (rail is most efficient)
  const baseline = CO2_FACTORS.rail * distance * (weight / 1000)
  const ratio = co2 / baseline
  
  if (ratio <= 1.5) return 'green'
  if (ratio <= 5) return 'amber'
  return 'red'
}

const RATING_CONFIG = {
  green: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-600',
    label: 'Excellent',
    icon: CheckCircle,
    description: 'Low carbon footprint',
  },
  amber: {
    bg: 'bg-amber-500',
    text: 'text-amber-600',
    label: 'Moderate',
    icon: AlertTriangle,
    description: 'Consider alternatives',
  },
  red: {
    bg: 'bg-red-500',
    text: 'text-red-600',
    label: 'High Impact',
    icon: Flame,
    description: 'High carbon footprint',
  },
}

export default function CarbonCalculator() {
  const [mode, setMode] = useState<TransportMode>('road')
  const [distance, setDistance] = useState('')
  const [weight, setWeight] = useState('')
  const [result, setResult] = useState<{ co2: number; rating: 'green' | 'amber' | 'red' } | null>(null)
  const [logged, setLogged] = useState(false)

  const handleCalculate = () => {
    const d = parseFloat(distance)
    const w = parseFloat(weight)
    
    if (isNaN(d) || isNaN(w) || d <= 0 || w <= 0) return
    
    const co2 = calculateCO2(mode, d, w)
    const rating = getCO2Rating(co2, d, w)
    setResult({ co2, rating })
    setLogged(false)
  }

  const handleLogShipment = () => {
    const d = parseFloat(distance)
    const w = parseFloat(weight)
    
    if (isNaN(d) || isNaN(w) || d <= 0 || w <= 0) return
    
    addShipment(mode, d, w)
    setLogged(true)
  }

  const d = parseFloat(distance) || 0
  const w = parseFloat(weight) || 0

  // Calculate comparison for all modes
  const comparison = TRANSPORT_MODES.map(m => {
    const co2 = calculateCO2(m.value, d, w)
    return {
      ...m,
      co2,
      rating: getCO2Rating(co2, d, w),
    }
  }).sort((a, b) => a.co2 - b.co2)

  const maxCO2 = Math.max(...comparison.map(c => c.co2))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Carbon Calculator</h1>
        <p className="text-muted-foreground">Calculate CO2 emissions for any shipment</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calculator Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-emerald-500" />
              Calculate Emissions
            </CardTitle>
            <CardDescription>
              Enter shipment details to calculate CO2 output
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="mode">Transport Mode</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as TransportMode)}>
                <SelectTrigger id="mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSPORT_MODES.map(m => (
                    <SelectItem key={m.value} value={m.value}>
                      <div className="flex items-center gap-2">
                        <m.icon className="h-4 w-4" />
                        {m.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance">Distance (km)</Label>
              <Input
                id="distance"
                type="number"
                placeholder="e.g., 500"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Cargo Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="e.g., 1000"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleCalculate} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate
              </Button>
              {result && (
                <Button 
                  onClick={handleLogShipment} 
                  variant="outline"
                  disabled={logged}
                  className="flex-1"
                >
                  {logged ? 'Logged!' : 'Log Shipment'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Result Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-emerald-500" />
              CO2 Output
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6">
                {/* CO2 Value */}
                <div className="text-center">
                  <p className="text-5xl font-bold text-foreground">
                    {result.co2.toFixed(1)}
                  </p>
                  <p className="mt-1 text-lg text-muted-foreground">kg CO2</p>
                </div>

                {/* Color-coded Meter */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Impact Level</span>
                    <span className={cn('font-medium', RATING_CONFIG[result.rating].text)}>
                      {RATING_CONFIG[result.rating].label}
                    </span>
                  </div>
                  <div className="relative h-4 overflow-hidden rounded-full bg-muted">
                    <div className="absolute inset-y-0 left-0 w-1/3 bg-emerald-500" />
                    <div className="absolute inset-y-0 left-1/3 w-1/3 bg-amber-500" />
                    <div className="absolute inset-y-0 left-2/3 w-1/3 bg-red-500" />
                    {/* Indicator */}
                    <div 
                      className="absolute top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-foreground shadow-lg transition-all duration-500"
                      style={{ 
                        left: result.rating === 'green' ? '16.5%' : result.rating === 'amber' ? '50%' : '83.5%'
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low</span>
                    <span>Moderate</span>
                    <span>High</span>
                  </div>
                </div>

                {/* Rating Card */}
                <div className={cn(
                  'flex items-center gap-4 rounded-lg p-4',
                  result.rating === 'green' && 'bg-emerald-500/10',
                  result.rating === 'amber' && 'bg-amber-500/10',
                  result.rating === 'red' && 'bg-red-500/10'
                )}>
                  {(() => {
                    const Icon = RATING_CONFIG[result.rating].icon
                    return <Icon className={cn('h-6 w-6', RATING_CONFIG[result.rating].text)} />
                  })()}
                  <div>
                    <p className={cn('font-medium', RATING_CONFIG[result.rating].text)}>
                      {RATING_CONFIG[result.rating].label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {RATING_CONFIG[result.rating].description}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-muted p-4">
                  <Calculator className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Enter shipment details and click Calculate
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      {d > 0 && w > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mode Comparison</CardTitle>
            <CardDescription>
              Compare CO2 emissions across all transport modes for {d.toLocaleString()} km with {w.toLocaleString()} kg cargo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comparison.map((c, index) => {
                const percentage = maxCO2 > 0 ? (c.co2 / maxCO2) * 100 : 0
                const Icon = c.icon
                const isSelected = c.value === mode
                
                return (
                  <div 
                    key={c.value}
                    className={cn(
                      'flex items-center gap-4 rounded-lg border p-4 transition-colors',
                      isSelected && 'border-emerald-500 bg-emerald-500/5'
                    )}
                  >
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      c.rating === 'green' && 'bg-emerald-500/10 text-emerald-500',
                      c.rating === 'amber' && 'bg-amber-500/10 text-amber-500',
                      c.rating === 'red' && 'bg-red-500/10 text-red-500'
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{c.label}</p>
                        {index === 0 && (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                            GREENEST
                          </span>
                        )}
                        {isSelected && (
                          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600">
                            SELECTED
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div 
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              c.rating === 'green' && 'bg-emerald-500',
                              c.rating === 'amber' && 'bg-amber-500',
                              c.rating === 'red' && 'bg-red-500'
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-16 text-right text-sm font-medium text-muted-foreground">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{c.co2.toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground">kg CO2</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
