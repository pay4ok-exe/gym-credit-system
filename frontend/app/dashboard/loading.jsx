'use client'

import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-16 w-16 animate-spin text-chart-1" />
        <h2 className="text-2xl font-bold">Loading Dashboard</h2>
        <p className="text-muted-foreground">Please wait while we load your data...</p>
      </div>
    </div>
  )
}