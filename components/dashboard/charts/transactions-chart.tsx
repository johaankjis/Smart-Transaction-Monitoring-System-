"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TimeSeriesDataPoint } from "@/lib/types/analytics"

interface TransactionsChartProps {
  data: TimeSeriesDataPoint[]
}

export function TransactionsChart({ data }: TransactionsChartProps) {
  const chartData = data.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    transactions: point.transactionCount,
    flagged: point.flaggedCount,
  }))

  return (
    <Card className="bg-card col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-card-foreground">Transaction Activity (24h)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="transactions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(200, 60%, 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(200, 60%, 55%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="flagged" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 80%, 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0, 80%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--card-foreground))" }}
              />
              <Area
                type="monotone"
                dataKey="transactions"
                stroke="hsl(200, 60%, 55%)"
                fill="url(#transactions)"
                strokeWidth={2}
              />
              <Area type="monotone" dataKey="flagged" stroke="hsl(0, 80%, 55%)" fill="url(#flagged)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">All Transactions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Flagged</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
