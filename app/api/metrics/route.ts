// API route for dashboard metrics

import { NextResponse } from "next/server"
import { fraudDetectionStore } from "@/lib/store/fraud-detection-store"

export async function GET() {
  await fraudDetectionStore.initialize()

  const metrics = fraudDetectionStore.getDashboardMetrics()

  return NextResponse.json(metrics)
}
