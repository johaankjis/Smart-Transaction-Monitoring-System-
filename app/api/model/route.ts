// API route for model operations

import { NextResponse } from "next/server"
import { fraudDetectionStore } from "@/lib/store/fraud-detection-store"

export async function GET() {
  await fraudDetectionStore.initialize()

  const metadata = fraudDetectionStore.getModelMetadata()

  return NextResponse.json(metadata)
}

export async function POST() {
  await fraudDetectionStore.initialize()

  const metadata = await fraudDetectionStore.retrainModel()

  return NextResponse.json({
    modelType: metadata.modelType,
    trainedOnSamples: metadata.samplesUsed,
    trainedAt: metadata.trainedAt,
  })
}
