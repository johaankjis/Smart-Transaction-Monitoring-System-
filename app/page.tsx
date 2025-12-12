"use client"

import { useState } from "react"
import useSWR from "swr"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { TransactionTable } from "@/components/dashboard/transaction-table"
import { RiskDistributionChart } from "@/components/dashboard/charts/risk-distribution-chart"
import { TransactionsChart } from "@/components/dashboard/charts/transactions-chart"
import { ChannelChart } from "@/components/dashboard/charts/channel-chart"
import { CountryChart } from "@/components/dashboard/charts/country-chart"
import { RecentAlerts } from "@/components/dashboard/recent-alerts"
import { ModelStatus } from "@/components/dashboard/model-status"
import { CreditCard, AlertTriangle, DollarSign, Activity } from "lucide-react"
import type { DashboardMetrics } from "@/lib/types/analytics"
import type { Transaction } from "@/lib/types/transaction"
import type { ModelMetadata } from "@/lib/types/model"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DashboardPage() {
  const { data: metrics, mutate: mutateMetrics } = useSWR<DashboardMetrics>("/api/metrics", fetcher)
  const { data: transactionsData, mutate: mutateTransactions } = useSWR<{
    transactions: Transaction[]
  }>("/api/transactions?type=recent&limit=50", fetcher)
  const { data: modelMetadata, mutate: mutateModel } = useSWR<ModelMetadata>("/api/model", fetcher)

  const [isRetraining, setIsRetraining] = useState(false)

  const handleRefresh = () => {
    mutateMetrics()
    mutateTransactions()
  }

  const handleRetrain = async () => {
    setIsRetraining(true)
    try {
      await fetch("/api/model", { method: "POST" })
      await mutateModel()
    } finally {
      setIsRetraining(false)
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`
    }
    return `$${amount.toFixed(0)}`
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64">
        <Header title="Overview" subtitle="Real-time fraud detection dashboard" onRefresh={handleRefresh} />

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Transactions"
              value={metrics?.totalTransactions.toLocaleString() || "—"}
              change="+12.5% from last period"
              changeType="positive"
              icon={CreditCard}
              iconColor="text-primary"
            />
            <StatsCard
              title="Flagged Transactions"
              value={metrics?.flaggedTransactions.toLocaleString() || "—"}
              change={`${(((metrics?.flaggedTransactions || 0) / (metrics?.totalTransactions || 1)) * 100).toFixed(
                1,
              )}% of total`}
              changeType="negative"
              icon={AlertTriangle}
              iconColor="text-destructive"
            />
            <StatsCard
              title="Total Volume"
              value={formatCurrency(metrics?.totalVolume || 0)}
              change="+8.2% from last period"
              changeType="positive"
              icon={DollarSign}
              iconColor="text-success"
            />
            <StatsCard
              title="Avg Risk Score"
              value={metrics?.averageRiskScore ? `${(metrics.averageRiskScore * 100).toFixed(1)}%` : "—"}
              change="-2.1% from last period"
              changeType="positive"
              icon={Activity}
              iconColor="text-warning"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {metrics?.timeSeriesData && <TransactionsChart data={metrics.timeSeriesData} />}
            {metrics?.riskDistribution && <RiskDistributionChart data={metrics.riskDistribution} />}
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {metrics?.transactionsByChannel && <ChannelChart data={metrics.transactionsByChannel} />}
            {metrics?.transactionsByCountry && <CountryChart data={metrics.transactionsByCountry} />}
            <ModelStatus metadata={modelMetadata || null} onRetrain={handleRetrain} isRetraining={isRetraining} />
          </div>

          {/* Recent Alerts & Transactions */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-4 text-base font-medium text-card-foreground">Recent Transactions</h3>
                {transactionsData?.transactions && (
                  <TransactionTable transactions={transactionsData.transactions} pageSize={8} />
                )}
              </div>
            </div>
            {transactionsData?.transactions && <RecentAlerts transactions={transactionsData.transactions} />}
          </div>
        </div>
      </main>
    </div>
  )
}
