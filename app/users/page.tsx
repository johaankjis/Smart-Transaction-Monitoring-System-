"use client"

import { useState } from "react"
import useSWR from "swr"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RiskBadge } from "@/components/dashboard/risk-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, User, AlertTriangle } from "lucide-react"
import type { Transaction, RiskLevel } from "@/lib/types/transaction"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface UserSummary {
  userId: string
  totalTransactions: number
  flaggedTransactions: number
  totalVolume: number
  avgRiskScore: number
  maxRiskScore: number
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const { data: transactionsData } = useSWR<{ transactions: Transaction[] }>(
    "/api/transactions?type=recent&limit=5000",
    fetcher,
  )

  const { data: userDetails } = useSWR(selectedUser ? `/api/users/${selectedUser}` : null, fetcher)

  // Calculate user summaries from transactions
  const userSummaries: UserSummary[] = (() => {
    if (!transactionsData?.transactions) return []

    const userMap = new Map<string, Transaction[]>()
    for (const tx of transactionsData.transactions) {
      const existing = userMap.get(tx.userId) || []
      existing.push(tx)
      userMap.set(tx.userId, existing)
    }

    return Array.from(userMap.entries())
      .map(([userId, txns]) => ({
        userId,
        totalTransactions: txns.length,
        flaggedTransactions: txns.filter((t) => t.isFlagged).length,
        totalVolume: txns.reduce((sum, t) => sum + t.amount, 0),
        avgRiskScore: txns.reduce((sum, t) => sum + (t.riskScore || 0), 0) / txns.length,
        maxRiskScore: Math.max(...txns.map((t) => t.riskScore || 0)),
      }))
      .filter((user) => searchQuery === "" || user.userId.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b.flaggedTransactions - a.flaggedTransactions)
      .slice(0, 100)
  })()

  const getRiskLevel = (score: number): RiskLevel => {
    if (score >= 0.9) return "CRITICAL"
    if (score >= 0.7) return "HIGH"
    if (score >= 0.4) return "MEDIUM"
    return "LOW"
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64">
        <Header title="User Risk Profiles" subtitle="Monitor user activity and risk levels" />

        <div className="p-6 space-y-6">
          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by user ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Users Table */}
            <div className="lg:col-span-2">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <User className="h-5 w-5" />
                    User Risk Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-muted-foreground">User ID</TableHead>
                          <TableHead className="text-muted-foreground">Transactions</TableHead>
                          <TableHead className="text-muted-foreground">Flagged</TableHead>
                          <TableHead className="text-muted-foreground">Volume</TableHead>
                          <TableHead className="text-muted-foreground">Risk Level</TableHead>
                          <TableHead className="text-muted-foreground w-20"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userSummaries.map((user) => (
                          <TableRow
                            key={user.userId}
                            className={`hover:bg-secondary/50 cursor-pointer ${
                              selectedUser === user.userId ? "bg-secondary/70" : ""
                            }`}
                            onClick={() => setSelectedUser(user.userId)}
                          >
                            <TableCell className="font-medium text-foreground">{user.userId}</TableCell>
                            <TableCell className="text-foreground">{user.totalTransactions}</TableCell>
                            <TableCell>
                              <span
                                className={`font-medium ${
                                  user.flaggedTransactions > 0 ? "text-destructive" : "text-foreground"
                                }`}
                              >
                                {user.flaggedTransactions}
                              </span>
                            </TableCell>
                            <TableCell className="text-foreground">
                              $
                              {user.totalVolume.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </TableCell>
                            <TableCell>
                              <RiskBadge level={getRiskLevel(user.maxRiskScore)} />
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Details */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">User Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedUser && userDetails ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-secondary p-3">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{userDetails.userId}</p>
                        <p className="text-sm text-muted-foreground">{userDetails.totalTransactions} transactions</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Flagged Rate</span>
                        <span className="font-medium text-foreground">{userDetails.percentFlagged.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Max Risk Score</span>
                        <RiskBadge
                          level={getRiskLevel(userDetails.maxRiskScore)}
                          score={userDetails.maxRiskScore}
                          showScore
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg Risk Score</span>
                        <span className="font-medium text-foreground">
                          {(userDetails.avgRiskScore * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {userDetails.numberFlagged > 0 && (
                      <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 mt-4">
                        <div className="flex items-center gap-2 text-destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">{userDetails.numberFlagged} flagged transactions</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <User className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">Select a user to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
