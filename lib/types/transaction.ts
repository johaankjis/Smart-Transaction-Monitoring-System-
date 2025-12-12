// Transaction-related type definitions

export type TransactionChannel = "ONLINE" | "POS" | "ATM" | "MOBILE" | "WIRE"

export type MerchantCategory =
  | "Electronics"
  | "Groceries"
  | "Travel"
  | "Entertainment"
  | "Utilities"
  | "Healthcare"
  | "Restaurants"
  | "Retail"
  | "Services"
  | "Other"

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

export interface Transaction {
  id: string
  transactionId: string
  userId: string
  amount: number
  merchantCategory: MerchantCategory
  country: string
  channel: TransactionChannel
  timestamp: Date
  isFraud: boolean | null
  riskScore: number | null
  isFlagged: boolean
  merchantName?: string
  ipAddress?: string
  deviceId?: string
}

export interface TransactionInput {
  transactionId: string
  userId: string
  amount: number
  merchantCategory: MerchantCategory
  country: string
  channel: TransactionChannel
  timestamp: string
  merchantName?: string
  ipAddress?: string
  deviceId?: string
}

export interface TransactionScoreResult {
  transactionId: string
  riskScore: number
  isFlagged: boolean
  riskLevel: RiskLevel
  anomalyFactors: AnomalyFactor[]
}

export interface AnomalyFactor {
  factor: string
  weight: number
  description: string
}
