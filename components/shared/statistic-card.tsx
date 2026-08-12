"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatisticCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  iconClassName?: string
  trend?: {
    label: string
    positive?: boolean
  }
}

export default function StatisticCard({
  title,
  value,
  subtitle,
  icon,
  iconClassName,
  trend,
}: StatisticCardProps) {
  return (
    <Card className="rounded-xl border shadow-xs hover:shadow-md transition-shadow group">
      <CardContent className="p-5 flex items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
            {title}
          </p>
          <div className="text-3xl font-extrabold tracking-tight">{value}</div>
          {(subtitle || trend) && (
            <p
              className={cn(
                "text-xs flex items-center gap-1 font-medium",
                trend?.positive === false
                  ? "text-rose-600"
                  : trend?.positive === true
                  ? "text-emerald-600"
                  : "text-muted-foreground"
              )}
            >
              {trend?.label ?? subtitle}
            </p>
          )}
        </div>

        {icon && (
          <div
            className={cn(
              "shrink-0 p-3.5 rounded-xl transition-transform group-hover:scale-110",
              iconClassName ?? "bg-primary/10 text-primary"
            )}
          >
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

