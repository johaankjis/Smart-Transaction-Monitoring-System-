// Z-Score based anomaly detector

import { BaseAnomalyDetector } from "./base-anomaly-detector"
import type { Transaction, AnomalyFactor } from "@/lib/types/transaction"
import type { ZScoreModelParams } from "@/lib/types/model"

export class ZScoreDetector extends BaseAnomalyDetector {
  private params: ZScoreModelParams | null = null
  private threshold: number

  constructor(threshold = 3.0) {
    super("Z-Score Detector", "1.0.0")
    this.threshold = threshold
  }

  async train(transactions: Transaction[]): Promise<void> {
    if (transactions.length === 0) {
      throw new Error("Cannot train on empty dataset")
    }

    const amounts = transactions.map((t) => t.amount)
    const mean = this.calculateMean(amounts)
    const std = this.calculateStd(amounts, mean)

    // Calculate feature-specific statistics
    const featureMeans: Record<string, number> = {}
    const featureStds: Record<string, number> = {}

    // Amount by channel
    const channels = [...new Set(transactions.map((t) => t.channel))]
    for (const channel of channels) {
      const channelAmounts = transactions.filter((t) => t.channel === channel).map((t) => t.amount)
      if (channelAmounts.length > 0) {
        featureMeans[`amount_${channel}`] = this.calculateMean(channelAmounts)
        featureStds[`amount_${channel}`] = this.calculateStd(channelAmounts, featureMeans[`amount_${channel}`])
      }
    }

    // Amount by country
    const countries = [...new Set(transactions.map((t) => t.country))]
    for (const country of countries) {
      const countryAmounts = transactions.filter((t) => t.country === country).map((t) => t.amount)
      if (countryAmounts.length > 0) {
        featureMeans[`amount_${country}`] = this.calculateMean(countryAmounts)
        featureStds[`amount_${country}`] = this.calculateStd(countryAmounts, featureMeans[`amount_${country}`])
      }
    }

    this.params = {
      mean,
      std: std || 1,
      threshold: this.threshold,
      featureMeans,
      featureStds,
    }

    this.isTrained = true
    this.trainedAt = new Date()
    this.samplesUsed = transactions.length
  }

  async score(transaction: Transaction): Promise<number> {
    if (!this.params) {
      throw new Error("Model not trained")
    }

    const zScore = Math.abs((transaction.amount - this.params.mean) / this.params.std)

    // Normalize z-score to 0-1 range using sigmoid-like function
    const normalizedScore = 1 / (1 + Math.exp(-0.5 * (zScore - this.threshold)))

    // Add contextual scoring
    let contextScore = 0

    // Channel-specific z-score
    const channelKey = `amount_${transaction.channel}`
    if (this.params.featureMeans[channelKey] && this.params.featureStds[channelKey]) {
      const channelZ = Math.abs(
        (transaction.amount - this.params.featureMeans[channelKey]) / (this.params.featureStds[channelKey] || 1),
      )
      contextScore += channelZ > this.threshold ? 0.15 : 0
    }

    // Country-specific z-score
    const countryKey = `amount_${transaction.country}`
    if (this.params.featureMeans[countryKey] && this.params.featureStds[countryKey]) {
      const countryZ = Math.abs(
        (transaction.amount - this.params.featureMeans[countryKey]) / (this.params.featureStds[countryKey] || 1),
      )
      contextScore += countryZ > this.threshold ? 0.1 : 0
    }

    return Math.min(normalizedScore + contextScore, 1)
  }

  async getAnomalyFactors(transaction: Transaction): Promise<AnomalyFactor[]> {
    if (!this.params) return []

    const factors: AnomalyFactor[] = []
    const zScore = Math.abs((transaction.amount - this.params.mean) / this.params.std)

    if (zScore > this.threshold) {
      factors.push({
        factor: "AMOUNT_ZSCORE",
        weight: Math.min(zScore / 10, 1),
        description: `Transaction amount is ${zScore.toFixed(2)} standard deviations from mean`,
      })
    }

    if (transaction.amount > this.params.mean * 5) {
      factors.push({
        factor: "HIGH_AMOUNT",
        weight: 0.8,
        description: `Amount is ${(transaction.amount / this.params.mean).toFixed(1)}x higher than average`,
      })
    }

    return factors
  }

  private calculateMean(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  private calculateStd(values: number[], mean: number): number {
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
    return Math.sqrt(avgSquaredDiff)
  }

  getParams(): ZScoreModelParams | null {
    return this.params
  }
}
