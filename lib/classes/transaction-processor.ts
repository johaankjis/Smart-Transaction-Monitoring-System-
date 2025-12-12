// Transaction processing pipeline

import type { Transaction, TransactionInput, TransactionScoreResult } from "@/lib/types/transaction"
import { EnsembleDetector } from "./ensemble-detector"

export class TransactionProcessor {
  private detector: EnsembleDetector
  private validationRules: ValidationRule[]
  private enrichers: TransactionEnricher[]

  constructor() {
    this.detector = new EnsembleDetector()
    this.validationRules = [new AmountValidationRule(), new TimestampValidationRule(), new RequiredFieldsRule()]
    this.enrichers = [new TimestampEnricher(), new DefaultValueEnricher()]
  }

  async initialize(transactions: Transaction[]): Promise<void> {
    await this.detector.train(transactions)
  }

  async process(input: TransactionInput): Promise<TransactionScoreResult> {
    // Validate
    for (const rule of this.validationRules) {
      const result = rule.validate(input)
      if (!result.isValid) {
        throw new ValidationError(result.errors)
      }
    }

    // Convert to Transaction
    let transaction = this.convertToTransaction(input)

    // Enrich
    for (const enricher of this.enrichers) {
      transaction = enricher.enrich(transaction)
    }

    // Score
    const scoreResult = await this.detector.scoreTransaction(transaction)

    return scoreResult
  }

  private convertToTransaction(input: TransactionInput): Transaction {
    return {
      id: crypto.randomUUID(),
      transactionId: input.transactionId,
      userId: input.userId,
      amount: input.amount,
      merchantCategory: input.merchantCategory,
      country: input.country,
      channel: input.channel,
      timestamp: new Date(input.timestamp),
      isFraud: null,
      riskScore: null,
      isFlagged: false,
      merchantName: input.merchantName,
      ipAddress: input.ipAddress,
      deviceId: input.deviceId,
    }
  }

  isInitialized(): boolean {
    return this.detector.getMetadata().isTrained
  }

  getDetectorMetadata() {
    return this.detector.getMetadata()
  }
}

// Validation classes
interface ValidationResult {
  isValid: boolean
  errors: string[]
}

abstract class ValidationRule {
  abstract validate(input: TransactionInput): ValidationResult
}

class AmountValidationRule extends ValidationRule {
  validate(input: TransactionInput): ValidationResult {
    const errors: string[] = []

    if (input.amount <= 0) {
      errors.push("Amount must be positive")
    }
    if (input.amount > 1000000) {
      errors.push("Amount exceeds maximum allowed value")
    }

    return { isValid: errors.length === 0, errors }
  }
}

class TimestampValidationRule extends ValidationRule {
  validate(input: TransactionInput): ValidationResult {
    const errors: string[] = []

    const date = new Date(input.timestamp)
    if (isNaN(date.getTime())) {
      errors.push("Invalid timestamp format")
    }

    const now = new Date()
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

    if (date > now) {
      errors.push("Timestamp cannot be in the future")
    }
    if (date < oneYearAgo) {
      errors.push("Timestamp is too old")
    }

    return { isValid: errors.length === 0, errors }
  }
}

class RequiredFieldsRule extends ValidationRule {
  private requiredFields = ["transactionId", "userId", "amount", "merchantCategory", "country", "channel", "timestamp"]

  validate(input: TransactionInput): ValidationResult {
    const errors: string[] = []

    for (const field of this.requiredFields) {
      if (!(field in input) || input[field as keyof TransactionInput] === undefined) {
        errors.push(`Missing required field: ${field}`)
      }
    }

    return { isValid: errors.length === 0, errors }
  }
}

class ValidationError extends Error {
  errors: string[]

  constructor(errors: string[]) {
    super(`Validation failed: ${errors.join(", ")}`)
    this.name = "ValidationError"
    this.errors = errors
  }
}

// Enricher classes
abstract class TransactionEnricher {
  abstract enrich(transaction: Transaction): Transaction
}

class TimestampEnricher extends TransactionEnricher {
  enrich(transaction: Transaction): Transaction {
    // Ensure timestamp is a proper Date object
    if (typeof transaction.timestamp === "string") {
      return {
        ...transaction,
        timestamp: new Date(transaction.timestamp),
      }
    }
    return transaction
  }
}

class DefaultValueEnricher extends TransactionEnricher {
  enrich(transaction: Transaction): Transaction {
    return {
      ...transaction,
      merchantName: transaction.merchantName || "Unknown Merchant",
      ipAddress: transaction.ipAddress || "0.0.0.0",
      deviceId: transaction.deviceId || "unknown",
    }
  }
}
