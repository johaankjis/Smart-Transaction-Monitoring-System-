"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Clock } from "lucide-react"
import type { Transaction } from "@/lib/types/transaction"

interface RecentAlertsProps {
  transactions: Transaction[]
}

export function RecentAlerts({ transactions }: RecentAlertsProps) {
  const alerts = transactions.filter((t) => t.isFlagged && (t.riskScore || 0) >= 0.8).slice(0, 5)

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium text-card-foreground">Recent High-Risk Alerts</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-10 w-10 text-success mb-2" />
            <p className="text-sm text-muted-foreground">No high-risk alerts</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-3">
              <div className="rounded-full bg-destructive/20 p-1.5">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">High Risk Transaction</p>
                  <span className="text-xs text-destructive font-medium">
                    {((alert.riskScore || 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {alert.transactionId.slice(0, 12)}... · ${alert.amount.toLocaleString()} · {alert.country}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
