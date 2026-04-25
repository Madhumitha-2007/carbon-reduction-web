'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDataStore, setActiveSupplier, Supplier } from '@/lib/data-store'
import { Users, Search, ArrowUpDown, Star, Check, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

type SortField = 'name' | 'category' | 'carbonRating' | 'compositeScore' | 'leadTime'
type SortDirection = 'asc' | 'desc'

const RATING_COLORS = {
  A: 'bg-emerald-500',
  B: 'bg-emerald-400',
  C: 'bg-amber-400',
  D: 'bg-orange-400',
  E: 'bg-red-500',
}

const SCORE_COLORS = {
  carbon: 'bg-emerald-500',
  waste: 'bg-amber-500',
  leadTime: 'bg-blue-500',
}

export default function SupplierSelection() {
  const { suppliers } = useDataStore()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [leadTimeFilter, setLeadTimeFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('compositeScore')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const categories = useMemo(() => {
    const cats = new Set(suppliers.map(s => s.category))
    return Array.from(cats).sort()
  }, [suppliers])

  const filteredAndSorted = useMemo(() => {
    let result = [...suppliers]

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(s => 
        s.name.toLowerCase().includes(searchLower) ||
        s.category.toLowerCase().includes(searchLower)
      )
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(s => s.category === categoryFilter)
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      result = result.filter(s => s.carbonRating === ratingFilter)
    }

    // Lead time filter
    if (leadTimeFilter !== 'all') {
      const maxDays = parseInt(leadTimeFilter)
      result = result.filter(s => s.leadTime <= maxDays)
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'category':
          comparison = a.category.localeCompare(b.category)
          break
        case 'carbonRating':
          comparison = a.carbonRating.localeCompare(b.carbonRating)
          break
        case 'compositeScore':
          comparison = a.compositeScore - b.compositeScore
          break
        case 'leadTime':
          comparison = a.leadTime - b.leadTime
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [suppliers, search, categoryFilter, ratingFilter, leadTimeFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection(field === 'compositeScore' ? 'desc' : 'asc')
    }
  }

  const optimalSupplier = useMemo(() => {
    return [...suppliers].sort((a, b) => b.compositeScore - a.compositeScore)[0]
  }, [suppliers])

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className={cn(
        'flex items-center gap-1 text-left text-sm font-medium transition-colors hover:text-foreground',
        sortField === field ? 'text-foreground' : 'text-muted-foreground'
      )}
    >
      {children}
      <ArrowUpDown className={cn(
        'h-3.5 w-3.5 transition-opacity',
        sortField === field ? 'opacity-100' : 'opacity-50'
      )} />
    </button>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Supplier Selection</h1>
        <p className="text-muted-foreground">Evaluate and select suppliers based on sustainability metrics</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Carbon Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="A">A - Excellent</SelectItem>
                  <SelectItem value="B">B - Good</SelectItem>
                  <SelectItem value="C">C - Average</SelectItem>
                  <SelectItem value="D">D - Below Avg</SelectItem>
                  <SelectItem value="E">E - Poor</SelectItem>
                </SelectContent>
              </Select>

              <Select value={leadTimeFilter} onValueChange={setLeadTimeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Lead Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Lead Time</SelectItem>
                  <SelectItem value="3">3 days or less</SelectItem>
                  <SelectItem value="5">5 days or less</SelectItem>
                  <SelectItem value="7">7 days or less</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-500" />
            Suppliers ({filteredAndSorted.length})
          </CardTitle>
          <CardDescription>
            Composite Score = 40% Carbon + 30% Waste + 30% Lead Time (inverted)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 pr-4 text-left">
                    <SortButton field="name">Supplier</SortButton>
                  </th>
                  <th className="pb-3 px-4 text-left">
                    <SortButton field="category">Category</SortButton>
                  </th>
                  <th className="pb-3 px-4 text-left">
                    <SortButton field="carbonRating">Carbon Rating</SortButton>
                  </th>
                  <th className="pb-3 px-4 text-left">
                    <span className="text-sm font-medium text-muted-foreground">Score Breakdown</span>
                  </th>
                  <th className="pb-3 px-4 text-left">
                    <SortButton field="leadTime">Lead Time</SortButton>
                  </th>
                  <th className="pb-3 px-4 text-left">
                    <SortButton field="compositeScore">Composite Score</SortButton>
                  </th>
                  <th className="pb-3 pl-4 text-right">
                    <span className="text-sm font-medium text-muted-foreground">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map((supplier) => {
                  const isOptimal = supplier.id === optimalSupplier?.id
                  
                  return (
                    <tr 
                      key={supplier.id}
                      className={cn(
                        'border-b border-border last:border-0 transition-colors',
                        supplier.isActive && 'bg-emerald-500/5'
                      )}
                    >
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{supplier.name}</span>
                          {isOptimal && (
                            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
                              <Star className="h-3 w-3" /> OPTIMAL
                            </span>
                          )}
                          {supplier.isActive && (
                            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                              <Check className="h-3 w-3" /> ACTIVE
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {supplier.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white',
                          RATING_COLORS[supplier.carbonRating]
                        )}>
                          {supplier.carbonRating}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1.5 w-40">
                          <div className="flex items-center gap-2">
                            <span className="w-14 text-xs text-muted-foreground">Carbon</span>
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                              <div 
                                className={cn('h-full rounded-full', SCORE_COLORS.carbon)}
                                style={{ width: `${supplier.carbonScore}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-xs font-medium text-muted-foreground">
                              {supplier.carbonScore}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-14 text-xs text-muted-foreground">Waste</span>
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                              <div 
                                className={cn('h-full rounded-full', SCORE_COLORS.waste)}
                                style={{ width: `${supplier.wasteScore}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-xs font-medium text-muted-foreground">
                              {supplier.wasteScore}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-14 text-xs text-muted-foreground">Lead</span>
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                              <div 
                                className={cn('h-full rounded-full', SCORE_COLORS.leadTime)}
                                style={{ width: `${Math.max(0, 100 - supplier.leadTime * 10)}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-xs font-medium text-muted-foreground">
                              {supplier.leadTime}d
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-foreground">{supplier.leadTime} days</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                            <div 
                              className="h-full rounded-full bg-emerald-500 transition-all"
                              style={{ width: `${supplier.compositeScore}%` }}
                            />
                          </div>
                          <span className="font-bold text-foreground">{supplier.compositeScore.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="py-4 pl-4 text-right">
                        <Button
                          size="sm"
                          variant={supplier.isActive ? 'default' : 'outline'}
                          className={cn(
                            supplier.isActive && 'bg-emerald-600 hover:bg-emerald-700'
                          )}
                          onClick={() => setActiveSupplier(supplier.isActive ? null : supplier.id)}
                        >
                          {supplier.isActive ? 'Selected' : 'Select'}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredAndSorted.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium text-foreground">No suppliers found</p>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
