"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CountryMetrics } from "@/lib/types/analytics"

interface CountryChartProps {
  data: CountryMetrics[]
}

export function CountryChart({ data }: CountryChartProps) {
  const chartData = data.slice(0, 8).map((item) => ({
    country: item.country,
    count: item.count,
    flaggedPct: ((item.flaggedCount / item.count) * 100).toFixed(1),
  }))

  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-card-foreground">Top Countries by Volume</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="country"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--card-foreground))" }}
                formatter={(value: number, name: string) => [
                  name === "count" ? value : `${value}%`,
                  name === "count" ? "Transactions" : "Flagged %",
                ]}
              />
              <Bar dataKey="count" fill="hsl(145, 60%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
