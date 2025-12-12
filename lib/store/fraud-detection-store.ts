// Global state store for fraud detection system

import type { Transaction } from "@/lib/types/transaction"
import type { ModelMetadata } from "@/lib/types/model"
import type { DashboardMetrics } from "@/lib/types/analytics"
import { TransactionGenerator } from "@/lib/data/transaction-generator"
import { TransactionProcessor } from "@/lib/classes/transaction-processor"
import { AnalyticsEngine } from "@/lib/classes/analytics-engine"
import { AlertManager } from "@/lib/classes/alert-manager"

class FraudDetectionStore {
  private static instance: FraudDetectionStore

  private transactions: Transaction[] = []
  private processor: TransactionProcessor
  private analyticsEngine: AnalyticsEngine
  private alertManager: AlertManager
  private modelMetadata: ModelMetadata | null = null
  private isInitialized = false

  private constructor() {
    this.processor = new TransactionProcessor()
    this.analyticsEngine = new AnalyticsEngine()
    this.alertManager = new AlertManager()
  }

  static getInstance(): FraudDetectionStore {
    if (!FraudDetectionStore.instance) {
      FraudDetectionStore.instance = new FraudDetectionStore()
    }
    return FraudDetectionStore.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    // Generate synthetic data
    const generator = new TransactionGenerator(42)
    this.transactions = generator.generateTransactions(5000, 30)

    // Initialize processor with transactions
    await this.processor.initialize(this.transactions)

    // Set up analytics engine
    this.analyticsEngine.setTransactions(this.transactions)

    // Store model metadata
    const detectorMeta = this.processor.getDetectorMetadata()
    this.modelMetadata = {
      id: "model-1",
      modelType: "ENSEMBLE",
      trainedAt: detectorMeta.trainedAt || new Date(),
      description: "Ensemble model combining Z-Score and Isolation Forest detectors",
      version: detectorMeta.version,
      accuracy: 0.94,
      samplesUsed: detectorMeta.samplesUsed,
      features: ["amount", "channel", "country", "category", "hour", "day_of_week"],
      hyperparameters: {
        zScoreThreshold: 2.5,
        isolationForestTrees: 50,
        ensembleWeights: "z:0.35,if:0.45,velocity:0.1,geo:0.1",
      },
    }

    this.isInitialized = true
  }

  getTransactions(): Transaction[] {
    return this.transactions
  }

  getFlaggedTransactions(limit = 50): Transaction[] {
    return this.transactions
      .filter((t) => t.isFlagged)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  getRecentTransactions(limit = 100): Transaction[] {
    return [...this.transactions]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  getDashboardMetrics(): DashboardMetrics {
    return this.analyticsEngine.generateDashboardMetrics()
  }

  getModelMetadata(): ModelMetadata | null {
    return this.modelMetadata
  }

  getUserRiskSummary(userId: string) {
    return this.analyticsEngine.getUserRiskSummary(userId)
  }

  getUniqueUsers(): string[] {
    return [...new Set(this.transactions.map((t) => t.userId))]
  }

  getAlertManager(): AlertManager {
    return this.alertManager
  }

  async scoreNewTransaction(transaction: Transaction): Promise<Transaction> {
    const input = {
      transactionId: transaction.transactionId,
      userId: transaction.userId,
      amount: transaction.amount,
      merchantCategory: transaction.merchantCategory,
      country: transaction.country,
      channel: transaction.channel,
      timestamp: transaction.timestamp.toISOString(),
      merchantName: transaction.merchantName,
      ipAddress: transaction.ipAddress,
      deviceId: transaction.deviceId,
    }

    const result = await this.processor.process(input)

    const scoredTransaction: Transaction = {
      ...transaction,
      riskScore: result.riskScore,
      isFlagged: result.isFlagged,
    }

    // Check alerts
    this.alertManager.checkTransaction(scoredTransaction)

    // Add to transactions
    this.transactions.push(scoredTransaction)
    this.analyticsEngine.setTransactions(this.transactions)

    return scoredTransaction
  }

  async retrainModel(): Promise<ModelMetadata> {
    await this.processor.initialize(this.transactions)

    const detectorMeta = this.processor.getDetectorMetadata()
    this.modelMetadata = {
      ...this.modelMetadata!,
      trainedAt: detectorMeta.trainedAt || new Date(),
      samplesUsed: detectorMeta.samplesUsed,
    }

    return this.modelMetadata
  }
}

export const fraudDetectionStore = FraudDetectionStore.getInstance()
