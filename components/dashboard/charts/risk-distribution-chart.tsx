"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RiskDistribution } from "@/lib/types/analytics"

interface RiskDistributionChartProps {
  data: RiskDistribution
}

export function RiskDistributionChart({ data }: RiskDistributionChartProps) {
  const chartData = [
    { name: "Low", value: data.low, color: "hsl(145, 60%, 50%)" },
    { name: "Medium", value: data.medium, color: "hsl(45, 90%, 50%)" },
    { name: "High", value: data.high, color: "hsl(25, 90%, 55%)" },
    { name: "Critical", value: data.critical, color: "hsl(0, 80%, 55%)" },
  ]

  const total = data.low + data.medium + data.high + data.critical

  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-card-foreground">Risk Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--card-foreground))" }}
                formatter={(value: number) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, "Count"]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
