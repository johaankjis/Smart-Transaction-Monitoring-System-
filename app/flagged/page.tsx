"use client"

import useSWR from "swr"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { TransactionTable } from "@/components/dashboard/transaction-table"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, TrendingUp, DollarSign, MapPin } from "lucide-react"
import type { Transaction } from "@/lib/types/transaction"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function FlaggedPage() {
  const { data, mutate } = useSWR<{ transactions: Transaction[] }>("/api/transactions?type=flagged&limit=500", fetcher)

  const flaggedTransactions = data?.transactions || []

  const criticalCount = flaggedTransactions.filter((t) => (t.riskScore || 0) >= 0.9).length

  const totalFlaggedVolume = flaggedTransactions.reduce((sum, t) => sum + t.amount, 0)

  const avgRiskScore =
    flaggedTransactions.length > 0
      ? flaggedTransactions.reduce((sum, t) => sum + (t.riskScore || 0), 0) / flaggedTransactions.length
      : 0

  const topCountries = Object.entries(
    flaggedTransactions.reduce(
      (acc, t) => {
        acc[t.country] = (acc[t.country] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([country]) => country)
    .join(", ")

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64">
        <Header
          title="Flagged Transactions"
          subtitle="High-risk transactions requiring review"
          onRefresh={() => mutate()}
        />

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Flagged"
              value={flaggedTransactions.length}
              change="Requires review"
              changeType="negative"
              icon={AlertTriangle}
              iconColor="text-destructive"
            />
            <StatsCard
              title="Critical Risk"
              value={criticalCount}
              change={`${((criticalCount / flaggedTransactions.length) * 100 || 0).toFixed(1)}% of flagged`}
              changeType="negative"
              icon={TrendingUp}
              iconColor="text-orange-400"
            />
            <StatsCard
              title="Flagged Volume"
              value={`$${(totalFlaggedVolume / 1000).toFixed(1)}K`}
              change="Total at-risk amount"
              changeType="neutral"
              icon={DollarSign}
              iconColor="text-warning"
            />
            <StatsCard
              title="Top Countries"
              value={topCountries || "—"}
              change={`Avg risk: ${(avgRiskScore * 100).toFixed(0)}%`}
              changeType="neutral"
              icon={MapPin}
              iconColor="text-primary"
            />
          </div>

          {/* Table */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Flagged Transaction Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionTable transactions={flaggedTransactions} pageSize={15} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
