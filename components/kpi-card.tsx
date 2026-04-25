'use client'

import { Card, CardContent } from '@/components/ui/card'
import { AnimatedCounter } from '@/components/animated-counter'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardProps {
  title: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  iconBg?: string
}

export function KPICard({
  title,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  change,
  changeLabel = 'vs last month',
  icon,
  iconBg = 'bg-emerald-500/10',
}: KPICardProps) {
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0
  const isNeutral = change === undefined || change === 0

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">
              <AnimatedCounter 
                value={value} 
                prefix={prefix} 
                suffix={suffix} 
                decimals={decimals} 
              />
            </p>
            {change !== undefined && (
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'flex items-center gap-0.5 text-sm font-medium',
                    isPositive && 'text-emerald-600',
                    isNegative && 'text-red-500',
                    isNeutral && 'text-muted-foreground'
                  )}
                >
                  {isPositive && <TrendingUp className="h-4 w-4" />}
                  {isNegative && <TrendingDown className="h-4 w-4" />}
                  {isNeutral && <Minus className="h-4 w-4" />}
                  {Math.abs(change).toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">{changeLabel}</span>
              </div>
            )}
          </div>
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', iconBg)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
