// User-related type definitions

export interface User {
  id: string
  userId: string
  email?: string
  createdAt: Date
  lastActivityAt: Date
  riskProfile: UserRiskProfile
}

export interface UserRiskProfile {
  totalTransactions: number
  flaggedTransactions: number
  percentageFlagged: number
  maxRiskScore: number
  averageRiskScore: number
  averageTransactionAmount: number
  commonCountries: string[]
  commonChannels: string[]
  riskTrend: "INCREASING" | "DECREASING" | "STABLE"
}

export interface UserRiskSummary {
  userId: string
  totalTransactions: number
  numberFlagged: number
  percentFlagged: number
  maxRiskScore: number
  avgRiskScore: number
  recentActivity: RecentActivity[]
}

export interface RecentActivity {
  date: Date
  transactionCount: number
  flaggedCount: number
  totalAmount: number
}
