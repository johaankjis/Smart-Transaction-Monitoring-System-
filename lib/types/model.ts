// Model-related type definitions

export type ModelType = "Z_SCORE" | "ISOLATION_FOREST" | "ENSEMBLE"

export interface ModelMetadata {
  id: string
  modelType: ModelType
  trainedAt: Date
  description: string
  version: string
  accuracy?: number
  samplesUsed: number
  features: string[]
  hyperparameters: Record<string, number | string>
}

export interface ModelTrainingResult {
  modelType: ModelType
  trainedOnSamples: number
  trainedAt: Date
  metrics: ModelMetrics
}

export interface ModelMetrics {
  precision?: number
  recall?: number
  f1Score?: number
  auc?: number
  falsePositiveRate?: number
  truePositiveRate?: number
}

export interface ZScoreModelParams {
  mean: number
  std: number
  threshold: number
  featureMeans: Record<string, number>
  featureStds: Record<string, number>
}

export interface IsolationForestParams {
  numTrees: number
  sampleSize: number
  threshold: number
  featureImportance: Record<string, number>
}
