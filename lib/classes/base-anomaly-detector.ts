// Abstract base class for anomaly detection

import type { Transaction, TransactionScoreResult, AnomalyFactor, RiskLevel } from "@/lib/types/transaction"

export abstract class BaseAnomalyDetector {
  protected name: string
  protected version: string
  protected isTrained = false
  protected trainedAt: Date | null = null
  protected samplesUsed = 0

  constructor(name: string, version = "1.0.0") {
    this.name = name
    this.version = version
  }

  abstract train(transactions: Transaction[]): Promise<void>
  abstract score(transaction: Transaction): Promise<number>
  abstract getAnomalyFactors(transaction: Transaction): Promise<AnomalyFactor[]>

  protected getRiskLevel(score: number): RiskLevel {
    if (score >= 0.9) return "CRITICAL"
    if (score >= 0.7) return "HIGH"
    if (score >= 0.4) return "MEDIUM"
    return "LOW"
  }

  async scoreTransaction(transaction: Transaction): Promise<TransactionScoreResult> {
    if (!this.isTrained) {
      throw new Error(`${this.name} model has not been trained yet`)
    }

    const riskScore = await this.score(transaction)
    const anomalyFactors = await this.getAnomalyFactors(transaction)
    const riskLevel = this.getRiskLevel(riskScore)

    return {
      transactionId: transaction.transactionId,
      riskScore,
      isFlagged: riskScore >= 0.7,
      riskLevel,
      anomalyFactors,
    }
  }

  getMetadata() {
    return {
      name: this.name,
      version: this.version,
      isTrained: this.isTrained,
      trainedAt: this.trainedAt,
      samplesUsed: this.samplesUsed,
    }
  }
}
