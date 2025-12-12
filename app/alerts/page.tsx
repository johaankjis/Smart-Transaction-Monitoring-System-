"use client"

import { useState } from "react"
import useSWR from "swr"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Plus, AlertTriangle, CheckCircle, Clock, Trash2 } from "lucide-react"
import type { Transaction } from "@/lib/types/transaction"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface AlertRule {
  id: string
  name: string
  type: string
  operator: string
  value: number
  isActive: boolean
}

export default function AlertsPage() {
  const { data: flaggedData } = useSWR<{ transactions: Transaction[] }>(
    "/api/transactions?type=flagged&limit=100",
    fetcher,
  )

  const [rules, setRules] = useState<AlertRule[]>([
    {
      id: "1",
      name: "High Risk Score",
      type: "RISK_SCORE",
      operator: "GTE",
      value: 0.8,
      isActive: true,
    },
    {
      id: "2",
      name: "Large Transaction",
      type: "AMOUNT",
      operator: "GT",
      value: 10000,
      isActive: true,
    },
    {
      id: "3",
      name: "Critical Risk",
      type: "RISK_SCORE",
      operator: "GTE",
      value: 0.95,
      isActive: true,
    },
  ])

  const [newRule, setNewRule] = useState({
    name: "",
    type: "RISK_SCORE",
    operator: "GTE",
    value: 0.8,
  })

  const alerts = flaggedData?.transactions.filter((t) => (t.riskScore || 0) >= 0.8).slice(0, 20) || []

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((rule) => (rule.id === id ? { ...rule, isActive: !rule.isActive } : rule)))
  }

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((rule) => rule.id !== id))
  }

  const addRule = () => {
    if (!newRule.name) return
    setRules((prev) => [
      ...prev,
      {
        ...newRule,
        id: Date.now().toString(),
        isActive: true,
      },
    ])
    setNewRule({ name: "", type: "RISK_SCORE", operator: "GTE", value: 0.8 })
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64">
        <Header title="Alert Configuration" subtitle="Configure and manage fraud alerts" />

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Alert Rules */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alert Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-4">
                      <Switch checked={rule.isActive} onCheckedChange={() => toggleRule(rule.id)} />
                      <div>
                        <p className="font-medium text-foreground">{rule.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {rule.type} {rule.operator}{" "}
                          {rule.type === "AMOUNT"
                            ? `$${rule.value.toLocaleString()}`
                            : `${(rule.value * 100).toFixed(0)}%`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRule(rule.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* Add New Rule */}
                <div className="border-t border-border pt-4 space-y-4">
                  <p className="text-sm font-medium text-foreground">Add New Rule</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">Rule Name</Label>
                      <Input
                        value={newRule.name}
                        onChange={(e) => setNewRule((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Very Large Transaction"
                        className="bg-secondary mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Type</Label>
                      <Select
                        value={newRule.type}
                        onValueChange={(value) => setNewRule((prev) => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="bg-secondary mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RISK_SCORE">Risk Score</SelectItem>
                          <SelectItem value="AMOUNT">Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Value</Label>
                      <Input
                        type="number"
                        step={newRule.type === "RISK_SCORE" ? 0.1 : 100}
                        value={newRule.value}
                        onChange={(e) =>
                          setNewRule((prev) => ({
                            ...prev,
                            value: Number.parseFloat(e.target.value),
                          }))
                        }
                        className="bg-secondary mt-1"
                      />
                    </div>
                  </div>
                  <Button onClick={addRule} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Recent Alerts ({alerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle className="h-12 w-12 text-success mb-3" />
                    <p className="text-sm text-muted-foreground">No recent alerts</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="rounded-lg border border-border bg-secondary/30 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-destructive/20 p-1.5 mt-0.5">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">High Risk Transaction</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {alert.transactionId.slice(0, 16)}...
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-destructive">
                          {((alert.riskScore || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>${alert.amount.toLocaleString()}</span>
                        <span>{alert.country}</span>
                        <span>{alert.channel}</span>
                        <div className="flex items-center gap-1 ml-auto">
                          <Clock className="h-3 w-3" />
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs bg-transparent">
                          Investigate
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
