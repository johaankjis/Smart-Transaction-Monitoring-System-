// API route for scoring new transactions

import { NextResponse } from "next/server"
import { fraudDetectionStore } from "@/lib/store/fraud-detection-store"
import type { TransactionInput } from "@/lib/types/transaction"

export async function POST(request: Request) {
  try {
    const body: TransactionInput = await request.json()

    await fraudDetectionStore.initialize()

    const transaction = {
      id: crypto.randomUUID(),
      transactionId: body.transactionId,
      userId: body.userId,
      amount: body.amount,
      merchantCategory: body.merchantCategory,
      country: body.country,
      channel: body.channel,
      timestamp: new Date(body.timestamp),
      isFraud: null,
      riskScore: null,
      isFlagged: false,
      merchantName: body.merchantName,
      ipAddress: body.ipAddress,
      deviceId: body.deviceId,
    }

    const scoredTransaction = await fraudDetectionStore.scoreNewTransaction(transaction)

    return NextResponse.json({
      transactionId: scoredTransaction.transactionId,
      riskScore: scoredTransaction.riskScore,
      isFlagged: scoredTransaction.isFlagged,
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 })
  }
}
