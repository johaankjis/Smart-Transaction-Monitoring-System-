// API route for transactions

import { NextResponse } from "next/server"
import { fraudDetectionStore } from "@/lib/store/fraud-detection-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "recent"
  const limit = Number.parseInt(searchParams.get("limit") || "100")

  await fraudDetectionStore.initialize()

  if (type === "flagged") {
    const transactions = fraudDetectionStore.getFlaggedTransactions(limit)
    return NextResponse.json({
      count: transactions.length,
      transactions,
    })
  }

  const transactions = fraudDetectionStore.getRecentTransactions(limit)
  return NextResponse.json({
    count: transactions.length,
    transactions,
  })
}
