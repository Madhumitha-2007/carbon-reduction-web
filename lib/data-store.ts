import { useSyncExternalStore, useCallback } from 'react'

// Types
export type TransportMode = 'road' | 'rail' | 'sea' | 'air'
export type WasteCategory = 'plastic' | 'paper' | 'metal' | 'organic' | 'hazardous' | 'other'
export type DisposalMethod = 'recycled' | 'composted' | 'landfill' | 'incinerated'

export interface ShipmentLog {
  id: string
  mode: TransportMode
  distance: number
  weight: number
  co2: number
  timestamp: Date
}

export interface WasteEvent {
  id: string
  category: WasteCategory
  quantity: number
  disposal: DisposalMethod
  timestamp: Date
}

export interface Supplier {
  id: string
  name: string
  category: string
  carbonRating: 'A' | 'B' | 'C' | 'D' | 'E'
  carbonScore: number
  wasteScore: number
  leadTime: number
  compositeScore: number
  isActive: boolean
}

export interface ActivityItem {
  id: string
  type: 'shipment' | 'waste' | 'supplier' | 'optimization'
  message: string
  timestamp: Date
}

interface DataStore {
  shipments: ShipmentLog[]
  wasteEvents: WasteEvent[]
  suppliers: Supplier[]
  activities: ActivityItem[]
  activeSupplier: string | null
}

// CO2 emission factors (kg CO2 per ton-km)
export const CO2_FACTORS: Record<TransportMode, number> = {
  road: 0.062,
  rail: 0.022,
  sea: 0.008,
  air: 0.602,
}

// Transport costs ($ per ton-km)
export const COST_FACTORS: Record<TransportMode, number> = {
  road: 0.15,
  rail: 0.04,
  sea: 0.02,
  air: 1.20,
}

// Average speeds (km/h)
export const SPEED_FACTORS: Record<TransportMode, number> = {
  road: 60,
  rail: 80,
  sea: 30,
  air: 800,
}

// Initial mock data
const initialSuppliers: Supplier[] = [
  { id: '1', name: 'EcoLogistics Pro', category: 'Packaging', carbonRating: 'A', carbonScore: 92, wasteScore: 88, leadTime: 3, compositeScore: 90.2, isActive: false },
  { id: '2', name: 'GreenShip International', category: 'Raw Materials', carbonRating: 'A', carbonScore: 89, wasteScore: 91, leadTime: 5, compositeScore: 88.6, isActive: false },
  { id: '3', name: 'SustainaCorp', category: 'Components', carbonRating: 'B', carbonScore: 78, wasteScore: 82, leadTime: 2, compositeScore: 80.8, isActive: false },
  { id: '4', name: 'ClearPath Logistics', category: 'Packaging', carbonRating: 'B', carbonScore: 75, wasteScore: 70, leadTime: 4, compositeScore: 73.5, isActive: false },
  { id: '5', name: 'BlueSky Materials', category: 'Raw Materials', carbonRating: 'C', carbonScore: 65, wasteScore: 72, leadTime: 6, compositeScore: 67.1, isActive: false },
  { id: '6', name: 'FastFreight Co', category: 'Components', carbonRating: 'C', carbonScore: 58, wasteScore: 55, leadTime: 1, compositeScore: 60.2, isActive: false },
  { id: '7', name: 'GlobalTrade Ltd', category: 'Packaging', carbonRating: 'D', carbonScore: 45, wasteScore: 48, leadTime: 7, compositeScore: 46.8, isActive: false },
  { id: '8', name: 'QuickShip Express', category: 'Raw Materials', carbonRating: 'D', carbonScore: 42, wasteScore: 40, leadTime: 2, compositeScore: 44.4, isActive: false },
]

// Generate historical data
function generateHistoricalShipments(): ShipmentLog[] {
  const shipments: ShipmentLog[] = []
  const modes: TransportMode[] = ['road', 'rail', 'sea', 'air']
  const now = new Date()
  
  for (let i = 365; i >= 0; i--) {
    const numShipments = Math.floor(Math.random() * 3) + 1
    for (let j = 0; j < numShipments; j++) {
      const mode = modes[Math.floor(Math.random() * modes.length)]
      const distance = Math.floor(Math.random() * 2000) + 100
      const weight = Math.floor(Math.random() * 50) + 5
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      shipments.push({
        id: `ship-${i}-${j}`,
        mode,
        distance,
        weight,
        co2: calculateCO2(mode, distance, weight),
        timestamp: date,
      })
    }
  }
  return shipments
}

function generateHistoricalWaste(): WasteEvent[] {
  const events: WasteEvent[] = []
  const categories: WasteCategory[] = ['plastic', 'paper', 'metal', 'organic', 'hazardous', 'other']
  const disposals: DisposalMethod[] = ['recycled', 'composted', 'landfill', 'incinerated']
  const now = new Date()
  
  for (let i = 180; i >= 0; i--) {
    const numEvents = Math.floor(Math.random() * 2) + 1
    for (let j = 0; j < numEvents; j++) {
      const category = categories[Math.floor(Math.random() * categories.length)]
      const disposal = category === 'organic' 
        ? (Math.random() > 0.3 ? 'composted' : 'landfill')
        : disposals[Math.floor(Math.random() * disposals.length)]
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      events.push({
        id: `waste-${i}-${j}`,
        category,
        quantity: Math.floor(Math.random() * 500) + 50,
        disposal,
        timestamp: date,
      })
    }
  }
  return events
}

export function calculateCO2(mode: TransportMode, distance: number, weight: number): number {
  return CO2_FACTORS[mode] * distance * (weight / 1000)
}

// Store implementation
let store: DataStore = {
  shipments: generateHistoricalShipments(),
  wasteEvents: generateHistoricalWaste(),
  suppliers: initialSuppliers,
  activities: [],
  activeSupplier: null,
}

const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach(listener => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return store
}

function getServerSnapshot() {
  return store
}

// Actions
export function addShipment(mode: TransportMode, distance: number, weight: number) {
  const co2 = calculateCO2(mode, distance, weight)
  const shipment: ShipmentLog = {
    id: `ship-${Date.now()}`,
    mode,
    distance,
    weight,
    co2,
    timestamp: new Date(),
  }
  
  const activity: ActivityItem = {
    id: `act-${Date.now()}`,
    type: 'shipment',
    message: `Logged ${mode} shipment: ${distance}km, ${weight}kg cargo, ${co2.toFixed(1)}kg CO2`,
    timestamp: new Date(),
  }
  
  store = {
    ...store,
    shipments: [...store.shipments, shipment],
    activities: [activity, ...store.activities].slice(0, 50),
  }
  emitChange()
  return shipment
}

export function addWasteEvent(category: WasteCategory, quantity: number, disposal: DisposalMethod) {
  const event: WasteEvent = {
    id: `waste-${Date.now()}`,
    category,
    quantity,
    disposal,
    timestamp: new Date(),
  }
  
  const activity: ActivityItem = {
    id: `act-${Date.now()}`,
    type: 'waste',
    message: `Logged ${quantity}kg ${category} waste (${disposal})`,
    timestamp: new Date(),
  }
  
  store = {
    ...store,
    wasteEvents: [...store.wasteEvents, event],
    activities: [activity, ...store.activities].slice(0, 50),
  }
  emitChange()
  return event
}

export function setActiveSupplier(supplierId: string | null) {
  const supplier = store.suppliers.find(s => s.id === supplierId)
  
  const activity: ActivityItem = {
    id: `act-${Date.now()}`,
    type: 'supplier',
    message: supplier ? `Selected ${supplier.name} as active supplier` : 'Cleared active supplier',
    timestamp: new Date(),
  }
  
  store = {
    ...store,
    suppliers: store.suppliers.map(s => ({
      ...s,
      isActive: s.id === supplierId,
    })),
    activeSupplier: supplierId,
    activities: [activity, ...store.activities].slice(0, 50),
  }
  emitChange()
}

export function logOptimization(origin: string, destination: string, mode: TransportMode) {
  const activity: ActivityItem = {
    id: `act-${Date.now()}`,
    type: 'optimization',
    message: `Optimized route: ${origin} to ${destination} via ${mode}`,
    timestamp: new Date(),
  }
  
  store = {
    ...store,
    activities: [activity, ...store.activities].slice(0, 50),
  }
  emitChange()
}

// Custom hook for subscribing to the store
export function useDataStore() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return data
}

// Computed values
export function useDashboardMetrics() {
  const { shipments, wasteEvents, suppliers } = useDataStore()
  
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  
  const thisMonthShipments = shipments.filter(s => s.timestamp >= thisMonth)
  const lastMonthShipments = shipments.filter(s => s.timestamp >= lastMonth && s.timestamp < thisMonth)
  
  const totalCO2ThisMonth = thisMonthShipments.reduce((acc, s) => acc + s.co2, 0)
  const totalCO2LastMonth = lastMonthShipments.reduce((acc, s) => acc + s.co2, 0)
  const co2Change = totalCO2LastMonth > 0 ? ((totalCO2ThisMonth - totalCO2LastMonth) / totalCO2LastMonth) * 100 : 0
  
  const totalShipments = thisMonthShipments.length
  const shipmentsChange = lastMonthShipments.length > 0 
    ? ((thisMonthShipments.length - lastMonthShipments.length) / lastMonthShipments.length) * 100 
    : 0
  
  const thisMonthWaste = wasteEvents.filter(w => w.timestamp >= thisMonth)
  const diverted = thisMonthWaste.filter(w => w.disposal === 'recycled' || w.disposal === 'composted')
  const divertedTotal = diverted.reduce((acc, w) => acc + w.quantity, 0)
  const totalWaste = thisMonthWaste.reduce((acc, w) => acc + w.quantity, 0)
  const diversionRate = totalWaste > 0 ? (divertedTotal / totalWaste) * 100 : 0
  
  const activeSupplier = suppliers.find(s => s.isActive)
  const avgSupplierScore = suppliers.reduce((acc, s) => acc + s.compositeScore, 0) / suppliers.length
  
  return {
    totalCO2: totalCO2ThisMonth,
    co2Change,
    totalShipments,
    shipmentsChange,
    diversionRate,
    avgSupplierScore,
    activeSupplier,
  }
}

export function useMonthlyTrend() {
  const { shipments } = useDataStore()
  
  const monthlyData: { month: string; co2: number }[] = []
  const now = new Date()
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const monthShipments = shipments.filter(s => s.timestamp >= date && s.timestamp < nextDate)
    const co2 = monthShipments.reduce((acc, s) => acc + s.co2, 0)
    
    monthlyData.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      co2: Math.round(co2),
    })
  }
  
  return monthlyData
}

export function useTransportModeBreakdown() {
  const { shipments } = useDataStore()
  
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonthShipments = shipments.filter(s => s.timestamp >= thisMonth)
  
  const breakdown = thisMonthShipments.reduce((acc, s) => {
    acc[s.mode] = (acc[s.mode] || 0) + s.co2
    return acc
  }, {} as Record<TransportMode, number>)
  
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0)
  
  return Object.entries(breakdown).map(([mode, co2]) => ({
    mode: mode as TransportMode,
    co2: Math.round(co2),
    percentage: total > 0 ? Math.round((co2 / total) * 100) : 0,
  }))
}

export function useTopSuppliers(count = 3) {
  const { suppliers } = useDataStore()
  return [...suppliers].sort((a, b) => b.compositeScore - a.compositeScore).slice(0, count)
}

export function useWasteMetrics() {
  const { wasteEvents } = useDataStore()
  
  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)
  const recentEvents = wasteEvents.filter(w => w.timestamp >= sixMonthsAgo)
  
  const diverted = recentEvents.filter(w => w.disposal === 'recycled' || w.disposal === 'composted')
  const divertedTotal = diverted.reduce((acc, w) => acc + w.quantity, 0)
  const totalWaste = recentEvents.reduce((acc, w) => acc + w.quantity, 0)
  const diversionRate = totalWaste > 0 ? (divertedTotal / totalWaste) * 100 : 0
  
  // Estimated CO2 avoided: ~2.5kg CO2 per kg diverted (rough estimate)
  const co2Avoided = divertedTotal * 2.5
  
  // Monthly breakdown by category
  const monthlyByCategory: { month: string; plastic: number; paper: number; metal: number; organic: number; hazardous: number; other: number }[] = []
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const monthEvents = recentEvents.filter(w => w.timestamp >= date && w.timestamp < nextDate)
    
    const byCategory = monthEvents.reduce((acc, w) => {
      acc[w.category] = (acc[w.category] || 0) + w.quantity
      return acc
    }, {} as Record<WasteCategory, number>)
    
    monthlyByCategory.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      plastic: byCategory.plastic || 0,
      paper: byCategory.paper || 0,
      metal: byCategory.metal || 0,
      organic: byCategory.organic || 0,
      hazardous: byCategory.hazardous || 0,
      other: byCategory.other || 0,
    })
  }
  
  return {
    diversionRate,
    co2Avoided,
    totalWaste,
    divertedTotal,
    monthlyByCategory,
  }
}
