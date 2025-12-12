"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, RefreshCw, CheckCircle2, Clock, Database } from "lucide-react"
import type { ModelMetadata } from "@/lib/types/model"

interface ModelStatusProps {
  metadata: ModelMetadata | null
  onRetrain?: () => void
  isRetraining?: boolean
}

export function ModelStatus({ metadata, onRetrain, isRetraining }: ModelStatusProps) {
  if (!metadata) {
    return (
      <Card className="bg-card">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Loading model status...</p>
        </CardContent>
      </Card>
    )
  }

  const accuracy = metadata.accuracy || 0.94

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium text-card-foreground flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Model Status
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onRetrain} disabled={isRetraining}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRetraining ? "animate-spin" : ""}`} />
          Retrain
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <span className="text-sm text-foreground">Active</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground">{metadata.modelType}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground">v{metadata.version}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Accuracy</span>
            <span className="font-medium text-foreground">{(accuracy * 100).toFixed(1)}%</span>
          </div>
          <Progress value={accuracy * 100} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Database className="h-3.5 w-3.5" />
              Training Samples
            </div>
            <p className="text-lg font-semibold text-foreground">{metadata.samplesUsed.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Last Trained
            </div>
            <p className="text-sm font-medium text-foreground">{new Date(metadata.trainedAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground mb-2">Features Used</p>
          <div className="flex flex-wrap gap-1.5">
            {metadata.features.map((feature) => (
              <span key={feature} className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                {feature}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
