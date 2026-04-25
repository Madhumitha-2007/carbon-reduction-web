'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  TransportMode, 
  CO2_FACTORS, 
  COST_FACTORS, 
  SPEED_FACTORS,
  calculateCO2,
  logOptimization 
} from '@/lib/data-store'
import { Route, Truck, Train, Ship, Plane, Zap, Clock, DollarSign, Leaf, AlertTriangle, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RouteOption {
  mode: TransportMode
  co2: number
  cost: number
  hours: number
  feasible: boolean
  isGreenest: boolean
}

const TRANSPORT_ICONS: Record<TransportMode, typeof Truck> = {
  road: Truck,
  rail: Train,
  sea: Ship,
  air: Plane,
}

const TRANSPORT_LABELS: Record<TransportMode, string> = {
  road: 'Road Transport',
  rail: 'Rail Transport',
  sea: 'Sea Transport',
  air: 'Air Transport',
}

// Mock cities with approximate coordinates (normalized 0-100 for SVG)
const CITIES: Record<string, { x: number; y: number }> = {
  'New York': { x: 85, y: 30 },
  'Los Angeles': { x: 15, y: 45 },
  'Chicago': { x: 60, y: 28 },
  'Houston': { x: 45, y: 65 },
  'Miami': { x: 82, y: 75 },
  'Seattle': { x: 12, y: 12 },
  'Denver': { x: 35, y: 35 },
  'Phoenix': { x: 22, y: 52 },
  'Atlanta': { x: 72, y: 55 },
  'Boston': { x: 92, y: 22 },
}

const CITY_NAMES = Object.keys(CITIES)

// Estimate distance based on city coordinates (rough approximation in km)
function estimateDistance(origin: string, destination: string): number {
  const o = CITIES[origin]
  const d = CITIES[destination]
  if (!o || !d) return 1000 // default
  
  const dx = Math.abs(o.x - d.x)
  const dy = Math.abs(o.y - d.y)
  // Scale to approximate real distances (1 unit ~ 50km)
  return Math.sqrt(dx * dx + dy * dy) * 50
}

export default function LogisticsOptimizer() {
  const [origin, setOrigin] = useState('New York')
  const [destination, setDestination] = useState('Los Angeles')
  const [weight, setWeight] = useState('5000')
  const [deadline, setDeadline] = useState('72')
  const [results, setResults] = useState<RouteOption[] | null>(null)
  const [selectedMode, setSelectedMode] = useState<TransportMode | null>(null)
  const [animationProgress, setAnimationProgress] = useState(0)
  const animationRef = useRef<number | null>(null)

  const handleOptimize = () => {
    const w = parseFloat(weight) || 1000
    const deadlineHours = parseFloat(deadline) || 72
    const distance = estimateDistance(origin, destination)

    const options: RouteOption[] = (['road', 'rail', 'sea', 'air'] as TransportMode[]).map(mode => {
      const co2 = calculateCO2(mode, distance, w)
      const cost = COST_FACTORS[mode] * distance * (w / 1000)
      const hours = distance / SPEED_FACTORS[mode]
      const feasible = hours <= deadlineHours

      return {
        mode,
        co2,
        cost,
        hours,
        feasible,
        isGreenest: false,
      }
    })

    // Find greenest feasible option
    const feasibleOptions = options.filter(o => o.feasible)
    if (feasibleOptions.length > 0) {
      const greenest = feasibleOptions.reduce((a, b) => a.co2 < b.co2 ? a : b)
      const idx = options.findIndex(o => o.mode === greenest.mode)
      options[idx].isGreenest = true
      setSelectedMode(greenest.mode)
    } else {
      setSelectedMode(null)
    }

    // Sort by CO2 (lowest first)
    options.sort((a, b) => a.co2 - b.co2)
    setResults(options)
    
    // Start animation
    setAnimationProgress(0)
  }

  useEffect(() => {
    if (selectedMode && animationProgress < 100) {
      animationRef.current = requestAnimationFrame(() => {
        setAnimationProgress(prev => Math.min(prev + 2, 100))
      })
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [selectedMode, animationProgress])

  const handleSelectRoute = (mode: TransportMode) => {
    setSelectedMode(mode)
    setAnimationProgress(0)
    logOptimization(origin, destination, mode)
  }

  const originCoords = CITIES[origin]
  const destCoords = CITIES[destination]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Logistics Optimizer</h1>
        <p className="text-muted-foreground">Find the most sustainable route for your shipments</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5 text-emerald-500" />
              Route Parameters
            </CardTitle>
            <CardDescription>
              Enter shipment details and deadline to optimize
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <select
                  id="origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {CITY_NAMES.filter(c => c !== destination).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <select
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {CITY_NAMES.filter(c => c !== origin).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="weight">Cargo Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="e.g., 5000"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline (hours)</Label>
                <Input
                  id="deadline"
                  type="number"
                  placeholder="e.g., 72"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>

            <Button 
              onClick={handleOptimize} 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Zap className="mr-2 h-4 w-4" />
              Optimize Route
            </Button>
          </CardContent>
        </Card>

        {/* Route Map */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              Route Visualization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100">
              <svg viewBox="0 0 100 100" className="h-full w-full">
                {/* Background grid */}
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
                
                {/* City markers */}
                {Object.entries(CITIES).map(([name, coords]) => {
                  const isOrigin = name === origin
                  const isDestination = name === destination
                  const isRelevant = isOrigin || isDestination
                  
                  return (
                    <g key={name}>
                      <circle 
                        cx={coords.x} 
                        cy={coords.y} 
                        r={isRelevant ? 3 : 1.5}
                        fill={isOrigin ? '#10b981' : isDestination ? '#3b82f6' : '#94a3b8'}
                        className={isRelevant ? 'animate-pulse' : ''}
                      />
                      {isRelevant && (
                        <text 
                          x={coords.x} 
                          y={coords.y - 5} 
                          textAnchor="middle" 
                          className="fill-foreground text-[4px] font-medium"
                        >
                          {name}
                        </text>
                      )}
                    </g>
                  )
                })}

                {/* Route line */}
                {originCoords && destCoords && selectedMode && (
                  <>
                    {/* Full path (faded) */}
                    <line
                      x1={originCoords.x}
                      y1={originCoords.y}
                      x2={destCoords.x}
                      y2={destCoords.y}
                      stroke="#94a3b8"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    {/* Animated path */}
                    <line
                      x1={originCoords.x}
                      y1={originCoords.y}
                      x2={originCoords.x + (destCoords.x - originCoords.x) * (animationProgress / 100)}
                      y2={originCoords.y + (destCoords.y - originCoords.y) * (animationProgress / 100)}
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    {/* Moving indicator */}
                    <circle
                      cx={originCoords.x + (destCoords.x - originCoords.x) * (animationProgress / 100)}
                      cy={originCoords.y + (destCoords.y - originCoords.y) * (animationProgress / 100)}
                      r="2"
                      fill="#10b981"
                      className="drop-shadow-lg"
                    />
                  </>
                )}
              </svg>
              
              {/* Legend */}
              <div className="absolute bottom-2 left-2 flex gap-3 rounded-md bg-background/80 px-2 py-1 text-xs backdrop-blur-sm">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">Origin</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">Destination</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {results && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-emerald-500" />
              Route Options (Ranked by CO2)
            </CardTitle>
            <CardDescription>
              Estimated distance: {Math.round(estimateDistance(origin, destination)).toLocaleString()} km | 
              Deadline: {deadline} hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {results.map((option, index) => {
                const Icon = TRANSPORT_ICONS[option.mode]
                const isSelected = option.mode === selectedMode
                
                return (
                  <div
                    key={option.mode}
                    className={cn(
                      'relative rounded-lg border p-4 transition-all',
                      !option.feasible && 'opacity-60',
                      isSelected && 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500',
                      option.isGreenest && !isSelected && 'border-emerald-300'
                    )}
                  >
                    {/* Badges */}
                    <div className="absolute -top-2 right-2 flex gap-1">
                      {option.isGreenest && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
                          <Leaf className="h-3 w-3" /> GREENEST FEASIBLE
                        </span>
                      )}
                      {!option.feasible && (
                        <span className="flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                          <AlertTriangle className="h-3 w-3" /> EXCEEDS DEADLINE
                        </span>
                      )}
                    </div>

                    <div className="mb-4 flex items-center gap-3">
                      <div className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        option.feasible ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{TRANSPORT_LABELS[option.mode]}</p>
                        <p className="text-xs text-muted-foreground">Rank #{index + 1}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Leaf className="h-4 w-4" />
                          CO2
                        </div>
                        <span className="font-bold text-foreground">{option.co2.toFixed(0)} kg</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          Cost
                        </div>
                        <span className="font-medium text-foreground">${option.cost.toFixed(0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Transit
                        </div>
                        <span className={cn(
                          'font-medium',
                          option.feasible ? 'text-foreground' : 'text-red-500'
                        )}>
                          {option.hours.toFixed(0)}h
                        </span>
                      </div>
                    </div>

                    <Button
                      className={cn(
                        'mt-4 w-full',
                        isSelected ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                      )}
                      variant={isSelected ? 'default' : 'outline'}
                      disabled={!option.feasible}
                      onClick={() => handleSelectRoute(option.mode)}
                    >
                      {isSelected ? 'Selected' : 'Select Route'}
                    </Button>
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
