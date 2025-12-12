// API route for user risk summary

import { NextResponse } from "next/server"
import { fraudDetectionStore } from "@/lib/store/fraud-detection-store"

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params

  await fraudDetectionStore.initialize()

  const summary = fraudDetectionStore.getUserRiskSummary(userId)

  if (!summary) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json(summary)
}
