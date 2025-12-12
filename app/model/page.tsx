"use client"

import { useState } from "react"
import useSWR from "swr"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, RefreshCw, CheckCircle2, Activity, Database, Zap, Layers, BarChart3 } from "lucide-react"
import type { ModelMetadata } from "@/lib/types/model"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function ModelPage() {
  const { data: metadata, mutate } = useSWR<ModelMetadata>("/api/model", fetcher)
  const [isRetraining, setIsRetraining] = useState(false)

  const handleRetrain = async () => {
    setIsRetraining(true)
    try {
      await fetch("/api/model", { method: "POST" })
      await mutate()
    } finally {
      setIsRetraining(false)
    }
  }

  const accuracy = metadata?.accuracy || 0.94

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64">
        <Header title="Model Management" subtitle="Configure and train ML models" />

        <div className="p-6 space-y-6">
          {/* Model Overview */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Model Card */}
            <Card className="bg-card lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Brain className="h-6 w-6 text-primary" />
                  Ensemble Anomaly Detector
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-success/20 px-3 py-1 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    Active
                  </span>
                  <Button
                    onClick={handleRetrain}
                    disabled={isRetraining}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRetraining ? "animate-spin" : ""}`} />
                    {isRetraining ? "Training..." : "Retrain Model"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Model Type</p>
                    <p className="text-lg font-semibold text-foreground">{metadata?.modelType || "ENSEMBLE"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Version</p>
                    <p className="text-lg font-semibold text-foreground">v{metadata?.version || "2.0.0"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Last Trained</p>
                    <p className="text-lg font-semibold text-foreground">
                      {metadata?.trainedAt ? new Date(metadata.trainedAt).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Samples Used</p>
                    <p className="text-lg font-semibold text-foreground">
                      {metadata?.samplesUsed?.toLocaleString() || "—"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Model Accuracy</span>
                    <span className="text-sm font-medium text-foreground">{(accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={accuracy * 100} className="h-3" />
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm font-medium text-foreground mb-3">Description</p>
                  <p className="text-sm text-muted-foreground">
                    {metadata?.description ||
                      "Ensemble model combining Z-Score and Isolation Forest detectors for comprehensive anomaly detection."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="space-y-4">
              <Card className="bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/20 p-2">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Precision</p>
                      <p className="text-xl font-bold text-foreground">92.3%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-success/20 p-2">
                      <BarChart3 className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Recall</p>
                      <p className="text-xl font-bold text-foreground">89.7%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-warning/20 p-2">
                      <Zap className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">F1 Score</p>
                      <p className="text-xl font-bold text-foreground">90.9%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Model Components */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Z-Score Detector */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Z-Score Detector
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Statistical anomaly detection based on standard deviations from the mean. Effective for detecting
                  outliers in transaction amounts.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-secondary p-3">
                    <p className="text-xs text-muted-foreground">Weight</p>
                    <p className="text-lg font-semibold text-foreground">35%</p>
                  </div>
                  <div className="rounded-lg bg-secondary p-3">
                    <p className="text-xs text-muted-foreground">Threshold</p>
                    <p className="text-lg font-semibold text-foreground">2.5σ</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Key Features</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">amount</span>
                    <span className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                      channel_amount
                    </span>
                    <span className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                      country_amount
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Isolation Forest Detector */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Layers className="h-5 w-5 text-success" />
                  Isolation Forest Detector
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Tree-based anomaly detection that isolates anomalies by random partitioning. Effective for
                  multi-dimensional anomaly patterns.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-secondary p-3">
                    <p className="text-xs text-muted-foreground">Weight</p>
                    <p className="text-lg font-semibold text-foreground">45%</p>
                  </div>
                  <div className="rounded-lg bg-secondary p-3">
                    <p className="text-xs text-muted-foreground">Trees</p>
                    <p className="text-lg font-semibold text-foreground">50</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Key Features</p>
                  <div className="flex flex-wrap gap-1.5">
                    {metadata?.features?.map((feature) => (
                      <span
                        key={feature}
                        className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                      >
                        {feature}
                      </span>
                    )) || (
                      <>
                        <span className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                          amount
                        </span>
                        <span className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                          channel
                        </span>
                        <span className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                          country
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Auxiliary Components */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Auxiliary Detection Components</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-full bg-warning/20 p-2">
                      <Zap className="h-4 w-4 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Velocity Tracker</p>
                      <p className="text-xs text-muted-foreground">10% weight</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Monitors transaction velocity patterns per user to detect unusual bursts of activity that may
                    indicate fraud.
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-full bg-destructive/20 p-2">
                      <Activity className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Geo Risk Scorer</p>
                      <p className="text-xs text-muted-foreground">10% weight</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Assesses geographic risk based on country frequency and high-risk region identification.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
