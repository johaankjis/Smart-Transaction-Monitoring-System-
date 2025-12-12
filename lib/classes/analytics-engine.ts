// Analytics engine for generating metrics and insights

import type { Transaction } from "@/lib/types/transaction"
import type {
  DashboardMetrics,
  ChannelMetrics,
  CountryMetrics,
  CategoryMetrics,
  RiskDistribution,
  TimeSeriesDataPoint,
} from "@/lib/types/analytics"

export class AnalyticsEngine {
  private transactions: Transaction[] = []

  setTransactions(transactions: Transaction[]): void {
    this.transactions = transactions
  }

  generateDashboardMetrics(): DashboardMetrics {
    const flaggedTransactions = this.transactions.filter((t) => t.isFlagged)
    const totalVolume = this.transactions.reduce((sum, t) => sum + t.amount, 0)
    const avgRiskScore = this.calculateAverageRiskScore()

    return {
      totalTransactions: this.transactions.length,
      flaggedTransactions: flaggedTransactions.length,
      totalVolume,
      averageRiskScore: avgRiskScore,
      transactionsByChannel: this.getChannelMetrics(),
      transactionsByCountry: this.getCountryMetrics(),
      transactionsByCategory: this.getCategoryMetrics(),
      riskDistribution: this.getRiskDistribution(),
      timeSeriesData: this.getTimeSeriesData(),
    }
  }

  private calculateAverageRiskScore(): number {
    const scoredTransactions = this.transactions.filter((t) => t.riskScore !== null)
    if (scoredTransactions.length === 0) return 0

    const sum = scoredTransactions.reduce((s, t) => s + (t.riskScore || 0), 0)
    return sum / scoredTransactions.length
  }

  private getChannelMetrics(): ChannelMetrics[] {
    const channelMap = new Map<string, Transaction[]>()

    for (const t of this.transactions) {
      const existing = channelMap.get(t.channel) || []
      existing.push(t)
      channelMap.set(t.channel, existing)
    }

    return Array.from(channelMap.entries()).map(([channel, txns]) => ({
      channel,
      count: txns.length,
      flaggedCount: txns.filter((t) => t.isFlagged).length,
      volume: txns.reduce((sum, t) => sum + t.amount, 0),
      avgRiskScore: this.avgRiskForTxns(txns),
    }))
  }

  private getCountryMetrics(): CountryMetrics[] {
    const countryMap = new Map<string, Transaction[]>()

    for (const t of this.transactions) {
      const existing = countryMap.get(t.country) || []
      existing.push(t)
      countryMap.set(t.country, existing)
    }

    return Array.from(countryMap.entries())
      .map(([country, txns]) => ({
        country,
        code: country,
        count: txns.length,
        flaggedCount: txns.filter((t) => t.isFlagged).length,
        volume: txns.reduce((sum, t) => sum + t.amount, 0),
        avgRiskScore: this.avgRiskForTxns(txns),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  private getCategoryMetrics(): CategoryMetrics[] {
    const categoryMap = new Map<string, Transaction[]>()

    for (const t of this.transactions) {
      const existing = categoryMap.get(t.merchantCategory) || []
      existing.push(t)
      categoryMap.set(t.merchantCategory, existing)
    }

    return Array.from(categoryMap.entries()).map(([category, txns]) => ({
      category,
      count: txns.length,
      flaggedCount: txns.filter((t) => t.isFlagged).length,
      volume: txns.reduce((sum, t) => sum + t.amount, 0),
      avgRiskScore: this.avgRiskForTxns(txns),
    }))
  }

  private getRiskDistribution(): RiskDistribution {
    const distribution = { low: 0, medium: 0, high: 0, critical: 0 }

    for (const t of this.transactions) {
      const score = t.riskScore || 0
      if (score >= 0.9) distribution.critical++
      else if (score >= 0.7) distribution.high++
      else if (score >= 0.4) distribution.medium++
      else distribution.low++
    }

    return distribution
  }

  private getTimeSeriesData(): TimeSeriesDataPoint[] {
    // Group by hour for last 24 hours
    const now = new Date()
    const points: TimeSeriesDataPoint[] = []

    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(now)
      hourStart.setHours(now.getHours() - i, 0, 0, 0)

      const hourEnd = new Date(hourStart)
      hourEnd.setHours(hourStart.getHours() + 1)

      const hourTxns = this.transactions.filter((t) => {
        const txTime = new Date(t.timestamp)
        return txTime >= hourStart && txTime < hourEnd
      })

      points.push({
        timestamp: hourStart,
        transactionCount: hourTxns.length,
        flaggedCount: hourTxns.filter((t) => t.isFlagged).length,
        volume: hourTxns.reduce((sum, t) => sum + t.amount, 0),
        avgRiskScore: this.avgRiskForTxns(hourTxns),
      })
    }

    return points
  }

  private avgRiskForTxns(txns: Transaction[]): number {
    const scored = txns.filter((t) => t.riskScore !== null)
    if (scored.length === 0) return 0
    return scored.reduce((s, t) => s + (t.riskScore || 0), 0) / scored.length
  }

  getUserRiskSummary(userId: string) {
    const userTxns = this.transactions.filter((t) => t.userId === userId)

    if (userTxns.length === 0) {
      return null
    }

    const flagged = userTxns.filter((t) => t.isFlagged)
    const riskScores = userTxns.filter((t) => t.riskScore !== null).map((t) => t.riskScore!)

    return {
      userId,
      totalTransactions: userTxns.length,
      numberFlagged: flagged.length,
      percentFlagged: (flagged.length / userTxns.length) * 100,
      maxRiskScore: riskScores.length > 0 ? Math.max(...riskScores) : 0,
      avgRiskScore: riskScores.length > 0 ? riskScores.reduce((a, b) => a + b, 0) / riskScores.length : 0,
    }
  }
}
