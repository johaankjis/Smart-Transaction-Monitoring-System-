// Ensemble detector combining multiple models

import { BaseAnomalyDetector } from "./base-anomaly-detector"
import { ZScoreDetector } from "./z-score-detector"
import { IsolationForestDetector } from "./isolation-forest-detector"
import type { Transaction, AnomalyFactor } from "@/lib/types/transaction"

interface DetectorWeight {
  detector: BaseAnomalyDetector
  weight: number
}

export class EnsembleDetector extends BaseAnomalyDetector {
  private detectors: DetectorWeight[] = []
  private velocityTracker: VelocityTracker
  private geoRiskScorer: GeoRiskScorer

  constructor() {
    super("Ensemble Detector", "2.0.0")
    this.velocityTracker = new VelocityTracker()
    this.geoRiskScorer = new GeoRiskScorer()

    this.detectors = [
      { detector: new ZScoreDetector(2.5), weight: 0.35 },
      { detector: new IsolationForestDetector(50, 128, 0.6), weight: 0.45 },
    ]
  }

  async train(transactions: Transaction[]): Promise<void> {
    // Train all detectors
    await Promise.all(this.detectors.map((d) => d.detector.train(transactions)))

    // Train auxiliary components
    this.velocityTracker.train(transactions)
    this.geoRiskScorer.train(transactions)

    this.isTrained = true
    this.trainedAt = new Date()
    this.samplesUsed = transactions.length
  }

  async score(transaction: Transaction): Promise<number> {
    // Get scores from all detectors
    const detectorScores = await Promise.all(
      this.detectors.map(async (d) => ({
        score: await d.detector.score(transaction),
        weight: d.weight,
      })),
    )

    // Weighted average of detector scores
    let totalWeight = this.detectors.reduce((sum, d) => sum + d.weight, 0)
    let weightedSum = detectorScores.reduce((sum, s) => sum + s.score * s.weight, 0)

    // Add velocity risk
    const velocityRisk = this.velocityTracker.getVelocityRisk(transaction)
    weightedSum += velocityRisk * 0.1
    totalWeight += 0.1

    // Add geo risk
    const geoRisk = this.geoRiskScorer.getGeoRisk(transaction)
    weightedSum += geoRisk * 0.1
    totalWeight += 0.1

    return Math.min(weightedSum / totalWeight, 1)
  }

  async getAnomalyFactors(transaction: Transaction): Promise<AnomalyFactor[]> {
    const allFactors: AnomalyFactor[] = []

    // Get factors from all detectors
    for (const d of this.detectors) {
      const factors = await d.detector.getAnomalyFactors(transaction)
      allFactors.push(
        ...factors.map((f) => ({
          ...f,
          weight: f.weight * d.weight,
        })),
      )
    }

    // Add velocity factors
    const velocityFactors = this.velocityTracker.getVelocityFactors(transaction)
    allFactors.push(...velocityFactors)

    // Add geo factors
    const geoFactors = this.geoRiskScorer.getGeoFactors(transaction)
    allFactors.push(...geoFactors)

    // Sort by weight and return top factors
    return allFactors.sort((a, b) => b.weight - a.weight).slice(0, 8)
  }
}

class VelocityTracker {
  private userVelocities: Map<string, number[]> = new Map()
  private avgVelocity = 0
  private stdVelocity = 1

  train(transactions: Transaction[]): void {
    // Group transactions by user and calculate velocities
    const userTransactions = new Map<string, Transaction[]>()

    for (const t of transactions) {
      const existing = userTransactions.get(t.userId) || []
      existing.push(t)
      userTransactions.set(t.userId, existing)
    }

    const velocities: number[] = []

    for (const [userId, txns] of userTransactions) {
      if (txns.length < 2) continue

      const sorted = txns.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

      const userVels: number[] = []
      for (let i = 1; i < sorted.length; i++) {
        const timeDiff = new Date(sorted[i].timestamp).getTime() - new Date(sorted[i - 1].timestamp).getTime()
        const hours = timeDiff / (1000 * 60 * 60)
        if (hours > 0) {
          userVels.push(1 / hours) // transactions per hour
        }
      }

      this.userVelocities.set(userId, userVels)
      velocities.push(...userVels)
    }

    if (velocities.length > 0) {
      this.avgVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length
      const sqDiffs = velocities.map((v) => Math.pow(v - this.avgVelocity, 2))
      this.stdVelocity = Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / velocities.length) || 1
    }
  }

  getVelocityRisk(transaction: Transaction): number {
    const userVels = this.userVelocities.get(transaction.userId)
    if (!userVels || userVels.length === 0) return 0.3 // Unknown user

    const avgUserVel = userVels.reduce((a, b) => a + b, 0) / userVels.length
    const zScore = Math.abs((avgUserVel - this.avgVelocity) / this.stdVelocity)

    return Math.min(zScore / 5, 1)
  }

  getVelocityFactors(transaction: Transaction): AnomalyFactor[] {
    const risk = this.getVelocityRisk(transaction)

    if (risk > 0.5) {
      return [
        {
          factor: "HIGH_VELOCITY",
          weight: risk,
          description: "User transaction velocity is unusually high",
        },
      ]
    }

    return []
  }
}

class GeoRiskScorer {
  private highRiskCountries: Set<string> = new Set()
  private countryFrequency: Map<string, number> = new Map()

  train(transactions: Transaction[]): void {
    // Calculate country frequencies
    for (const t of transactions) {
      const count = this.countryFrequency.get(t.country) || 0
      this.countryFrequency.set(t.country, count + 1)
    }

    // Identify high-risk countries (simulated)
    this.highRiskCountries = new Set(["XX", "YY", "ZZ"]) // Placeholder high-risk codes
  }

  getGeoRisk(transaction: Transaction): number {
    if (this.highRiskCountries.has(transaction.country)) {
      return 0.8
    }

    const frequency = this.countryFrequency.get(transaction.country) || 0
    const total = Array.from(this.countryFrequency.values()).reduce((a, b) => a + b, 0)

    // Rare countries are higher risk
    const rarity = 1 - frequency / total
    return rarity * 0.4
  }

  getGeoFactors(transaction: Transaction): AnomalyFactor[] {
    const factors: AnomalyFactor[] = []

    if (this.highRiskCountries.has(transaction.country)) {
      factors.push({
        factor: "HIGH_RISK_COUNTRY",
        weight: 0.8,
        description: "Transaction originated from a high-risk country",
      })
    }

    const frequency = this.countryFrequency.get(transaction.country) || 0
    const total = Array.from(this.countryFrequency.values()).reduce((a, b) => a + b, 0)

    if (frequency / total < 0.01) {
      factors.push({
        factor: "RARE_COUNTRY",
        weight: 0.4,
        description: "Transaction from rarely seen country",
      })
    }

    return factors
  }
}
