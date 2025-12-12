"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { RiskBadge } from "./risk-badge"
import type { Transaction, RiskLevel } from "@/lib/types/transaction"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"

interface TransactionTableProps {
  transactions: Transaction[]
  pageSize?: number
}

export function TransactionTable({ transactions, pageSize = 10 }: TransactionTableProps) {
  const [page, setPage] = useState(0)

  const totalPages = Math.ceil(transactions.length / pageSize)
  const startIndex = page * pageSize
  const paginatedTransactions = transactions.slice(startIndex, startIndex + pageSize)

  const getRiskLevel = (score: number | null): RiskLevel => {
    if (score === null) return "LOW"
    if (score >= 0.9) return "CRITICAL"
    if (score >= 0.7) return "HIGH"
    if (score >= 0.4) return "MEDIUM"
    return "LOW"
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-muted-foreground">Transaction ID</TableHead>
              <TableHead className="text-muted-foreground">User</TableHead>
              <TableHead className="text-muted-foreground">Amount</TableHead>
              <TableHead className="text-muted-foreground">Category</TableHead>
              <TableHead className="text-muted-foreground">Channel</TableHead>
              <TableHead className="text-muted-foreground">Country</TableHead>
              <TableHead className="text-muted-foreground">Risk</TableHead>
              <TableHead className="text-muted-foreground">Time</TableHead>
              <TableHead className="text-muted-foreground w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.map((tx) => (
              <TableRow key={tx.id} className="hover:bg-secondary/50">
                <TableCell className="font-mono text-xs text-foreground">{tx.transactionId.slice(0, 12)}...</TableCell>
                <TableCell className="font-medium text-foreground">{tx.userId}</TableCell>
                <TableCell className="font-medium text-foreground">{formatCurrency(tx.amount)}</TableCell>
                <TableCell className="text-muted-foreground">{tx.merchantCategory}</TableCell>
                <TableCell>
                  <span className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    {tx.channel}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{tx.country}</TableCell>
                <TableCell>
                  <RiskBadge level={getRiskLevel(tx.riskScore)} score={tx.riskScore || undefined} showScore />
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{formatDate(tx.timestamp)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(startIndex + pageSize, transactions.length)} of {transactions.length}{" "}
          transactions
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = page < 3 ? i : Math.min(page - 2 + i, totalPages - 1)
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum + 1}
                </Button>
              )
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
