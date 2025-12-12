// Alert management system

import type { Transaction } from "@/lib/types/transaction"
import type { AlertConfig, Alert, AlertCondition } from "@/lib/types/analytics"

export class AlertManager {
  private configs: AlertConfig[] = []
  private alerts: Alert[] = []
  private listeners: AlertListener[] = []

  constructor() {
    // Initialize with default alert configs
    this.configs = [
      {
        id: "alert-1",
        name: "High Risk Score",
        condition: { type: "RISK_SCORE", operator: "GTE", value: 0.8 },
        threshold: 0.8,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "alert-2",
        name: "Large Transaction",
        condition: { type: "AMOUNT", operator: "GT", value: 10000 },
        threshold: 10000,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "alert-3",
        name: "Critical Risk",
        condition: { type: "RISK_SCORE", operator: "GTE", value: 0.95 },
        threshold: 0.95,
        isActive: true,
        createdAt: new Date(),
      },
    ]
  }

  addConfig(config: Omit<AlertConfig, "id" | "createdAt">): AlertConfig {
    const newConfig: AlertConfig = {
      ...config,
      id: `alert-${Date.now()}`,
      createdAt: new Date(),
    }
    this.configs.push(newConfig)
    return newConfig
  }

  removeConfig(configId: string): boolean {
    const index = this.configs.findIndex((c) => c.id === configId)
    if (index !== -1) {
      this.configs.splice(index, 1)
      return true
    }
    return false
  }

  toggleConfig(configId: string): boolean {
    const config = this.configs.find((c) => c.id === configId)
    if (config) {
      config.isActive = !config.isActive
      return true
    }
    return false
  }

  checkTransaction(transaction: Transaction): Alert[] {
    const triggeredAlerts: Alert[] = []

    for (const config of this.configs) {
      if (!config.isActive) continue

      if (this.evaluateCondition(config.condition, transaction)) {
        const alert: Alert = {
          id: `alert-instance-${Date.now()}-${Math.random()}`,
          configId: config.id,
          transactionId: transaction.transactionId,
          triggeredAt: new Date(),
          acknowledged: false,
        }

        triggeredAlerts.push(alert)
        this.alerts.push(alert)
        this.notifyListeners(alert, config, transaction)
      }
    }

    return triggeredAlerts
  }

  private evaluateCondition(condition: AlertCondition, transaction: Transaction): boolean {
    let value: number

    switch (condition.type) {
      case "RISK_SCORE":
        value = transaction.riskScore || 0
        break
      case "AMOUNT":
        value = transaction.amount
        break
      case "VELOCITY":
        value = 0 // Would need velocity tracking
        break
      default:
        return false
    }

    const threshold = typeof condition.value === "number" ? condition.value : 0

    switch (condition.operator) {
      case "GT":
        return value > threshold
      case "GTE":
        return value >= threshold
      case "LT":
        return value < threshold
      case "LTE":
        return value <= threshold
      case "EQ":
        return value === threshold
      default:
        return false
    }
  }

  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId)
    if (alert && !alert.acknowledged) {
      alert.acknowledged = true
      alert.acknowledgedBy = acknowledgedBy
      alert.acknowledgedAt = new Date()
      return true
    }
    return false
  }

  getUnacknowledgedAlerts(): Alert[] {
    return this.alerts.filter((a) => !a.acknowledged)
  }

  getAllAlerts(): Alert[] {
    return [...this.alerts]
  }

  getConfigs(): AlertConfig[] {
    return [...this.configs]
  }

  addListener(listener: AlertListener): void {
    this.listeners.push(listener)
  }

  removeListener(listener: AlertListener): void {
    const index = this.listeners.indexOf(listener)
    if (index !== -1) {
      this.listeners.splice(index, 1)
    }
  }

  private notifyListeners(alert: Alert, config: AlertConfig, transaction: Transaction): void {
    for (const listener of this.listeners) {
      listener.onAlert(alert, config, transaction)
    }
  }
}

export interface AlertListener {
  onAlert(alert: Alert, config: AlertConfig, transaction: Transaction): void
}
