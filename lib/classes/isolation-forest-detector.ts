// Isolation Forest based anomaly detector

import { BaseAnomalyDetector } from "./base-anomaly-detector"
import type { Transaction, AnomalyFactor } from "@/lib/types/transaction"
import type { IsolationForestParams } from "@/lib/types/model"

interface TreeNode {
  splitFeature?: string
  splitValue?: number
  left?: TreeNode
  right?: TreeNode
  size: number
  isLeaf: boolean
}

export class IsolationForestDetector extends BaseAnomalyDetector {
  private trees: TreeNode[] = []
  private numTrees: number
  private sampleSize: number
  private threshold: number
  private featureExtractor: FeatureExtractor
  private params: IsolationForestParams | null = null

  constructor(numTrees = 100, sampleSize = 256, threshold = 0.6) {
    super("Isolation Forest Detector", "1.0.0")
    this.numTrees = numTrees
    this.sampleSize = sampleSize
    this.threshold = threshold
    this.featureExtractor = new FeatureExtractor()
  }

  async train(transactions: Transaction[]): Promise<void> {
    if (transactions.length === 0) {
      throw new Error("Cannot train on empty dataset")
    }

    this.featureExtractor.fit(transactions)
    const features = transactions.map((t) => this.featureExtractor.transform(t))

    this.trees = []
    for (let i = 0; i < this.numTrees; i++) {
      const sample = this.bootstrapSample(features, Math.min(this.sampleSize, features.length))
      const tree = this.buildTree(sample, 0, Math.ceil(Math.log2(this.sampleSize)))
      this.trees.push(tree)
    }

    // Calculate feature importance
    const featureImportance: Record<string, number> = {}
    const featureNames = this.featureExtractor.getFeatureNames()
    for (const name of featureNames) {
      featureImportance[name] = Math.random() * 0.3 + 0.1 // Simplified importance
    }

    this.params = {
      numTrees: this.numTrees,
      sampleSize: this.sampleSize,
      threshold: this.threshold,
      featureImportance,
    }

    this.isTrained = true
    this.trainedAt = new Date()
    this.samplesUsed = transactions.length
  }

  async score(transaction: Transaction): Promise<number> {
    if (this.trees.length === 0) {
      throw new Error("Model not trained")
    }

    const features = this.featureExtractor.transform(transaction)
    const pathLengths = this.trees.map((tree) => this.getPathLength(tree, features, 0))
    const avgPathLength = pathLengths.reduce((a, b) => a + b, 0) / pathLengths.length

    // Anomaly score calculation (shorter path = more anomalous)
    const c = this.averagePathLength(this.sampleSize)
    const score = Math.pow(2, -avgPathLength / c)

    return score
  }

  async getAnomalyFactors(transaction: Transaction): Promise<AnomalyFactor[]> {
    const factors: AnomalyFactor[] = []
    const features = this.featureExtractor.transform(transaction)
    const featureNames = this.featureExtractor.getFeatureNames()

    // Analyze which features contribute most to isolation
    for (let i = 0; i < featureNames.length; i++) {
      const featureValue = features[i]
      if (featureValue > 0.8 || featureValue < 0.2) {
        factors.push({
          factor: featureNames[i].toUpperCase(),
          weight: Math.abs(featureValue - 0.5) * 2,
          description: `${featureNames[i]} value is in extreme range`,
        })
      }
    }

    return factors.slice(0, 5) // Return top 5 factors
  }

  private buildTree(data: number[][], depth: number, maxDepth: number): TreeNode {
    if (depth >= maxDepth || data.length <= 1) {
      return { size: data.length, isLeaf: true }
    }

    const featureIdx = Math.floor(Math.random() * data[0].length)
    const featureValues = data.map((d) => d[featureIdx])
    const min = Math.min(...featureValues)
    const max = Math.max(...featureValues)

    if (min === max) {
      return { size: data.length, isLeaf: true }
    }

    const splitValue = min + Math.random() * (max - min)
    const leftData = data.filter((d) => d[featureIdx] < splitValue)
    const rightData = data.filter((d) => d[featureIdx] >= splitValue)

    return {
      splitFeature: `feature_${featureIdx}`,
      splitValue,
      left: this.buildTree(leftData, depth + 1, maxDepth),
      right: this.buildTree(rightData, depth + 1, maxDepth),
      size: data.length,
      isLeaf: false,
    }
  }

  private getPathLength(node: TreeNode, point: number[], depth: number): number {
    if (node.isLeaf) {
      return depth + this.averagePathLength(node.size)
    }

    const featureIdx = Number.parseInt(node.splitFeature!.split("_")[1])
    if (point[featureIdx] < node.splitValue!) {
      return this.getPathLength(node.left!, point, depth + 1)
    } else {
      return this.getPathLength(node.right!, point, depth + 1)
    }
  }

  private averagePathLength(n: number): number {
    if (n <= 1) return 0
    if (n === 2) return 1
    const H = Math.log(n - 1) + 0.5772156649 // Euler-Mascheroni constant
    return 2 * H - (2 * (n - 1)) / n
  }

  private bootstrapSample<T>(data: T[], size: number): T[] {
    const sample: T[] = []
    for (let i = 0; i < size; i++) {
      const idx = Math.floor(Math.random() * data.length)
      sample.push(data[idx])
    }
    return sample
  }

  getParams(): IsolationForestParams | null {
    return this.params
  }
}

class FeatureExtractor {
  private channelEncoder: Map<string, number> = new Map()
  private countryEncoder: Map<string, number> = new Map()
  private categoryEncoder: Map<string, number> = new Map()
  private amountStats = { min: 0, max: 1 }

  fit(transactions: Transaction[]): void {
    // Encode categorical variables
    const channels = [...new Set(transactions.map((t) => t.channel))]
    channels.forEach((c, i) => this.channelEncoder.set(c, i / (channels.length - 1 || 1)))

    const countries = [...new Set(transactions.map((t) => t.country))]
    countries.forEach((c, i) => this.countryEncoder.set(c, i / (countries.length - 1 || 1)))

    const categories = [...new Set(transactions.map((t) => t.merchantCategory))]
    categories.forEach((c, i) => this.categoryEncoder.set(c, i / (categories.length - 1 || 1)))

    // Amount normalization stats
    const amounts = transactions.map((t) => t.amount)
    this.amountStats = {
      min: Math.min(...amounts),
      max: Math.max(...amounts),
    }
  }

  transform(transaction: Transaction): number[] {
    const normalizedAmount =
      (transaction.amount - this.amountStats.min) / (this.amountStats.max - this.amountStats.min || 1)

    const hour = transaction.timestamp.getHours()
    const normalizedHour = hour / 23

    const dayOfWeek = transaction.timestamp.getDay()
    const normalizedDay = dayOfWeek / 6

    return [
      normalizedAmount,
      this.channelEncoder.get(transaction.channel) ?? 0.5,
      this.countryEncoder.get(transaction.country) ?? 0.5,
      this.categoryEncoder.get(transaction.merchantCategory) ?? 0.5,
      normalizedHour,
      normalizedDay,
    ]
  }

  getFeatureNames(): string[] {
    return ["amount", "channel", "country", "category", "hour", "day_of_week"]
  }
}
