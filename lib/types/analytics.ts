// Analytics-related type definitions

export interface DashboardMetrics {
  totalTransactions: number
  flaggedTransactions: number
  totalVolume: number
  averageRiskScore: number
  transactionsByChannel: ChannelMetrics[]
  transactionsByCountry: CountryMetrics[]
  transactionsByCategory: CategoryMetrics[]
  riskDistribution: RiskDistribution
  timeSeriesData: TimeSeriesDataPoint[]
}

export interface ChannelMetrics {
  channel: string
  count: number
  flaggedCount: number
  volume: number
  avgRiskScore: number
}

export interface CountryMetrics {
  country: string
  code: string
  count: number
  flaggedCount: number
  volume: number
  avgRiskScore: number
}

export interface CategoryMetrics {
  category: string
  count: number
  flaggedCount: number
  volume: number
  avgRiskScore: number
}

export interface RiskDistribution {
  low: number
  medium: number
  high: number
  critical: number
}

export interface TimeSeriesDataPoint {
  timestamp: Date
  transactionCount: number
  flaggedCount: number
  volume: number
  avgRiskScore: number
}

export interface AlertConfig {
  id: string
  name: string
  condition: AlertCondition
  threshold: number
  isActive: boolean
  createdAt: Date
}

export interface AlertCondition {
  type: "RISK_SCORE" | "AMOUNT" | "VELOCITY" | "COUNTRY" | "CHANNEL"
  operator: "GT" | "LT" | "EQ" | "GTE" | "LTE"
  value: number | string
}

export interface Alert {
  id: string
  configId: string
  transactionId: string
  triggeredAt: Date
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
}
