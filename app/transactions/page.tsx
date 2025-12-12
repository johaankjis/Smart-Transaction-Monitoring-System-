"use client"

import useSWR from "swr"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { TransactionTable } from "@/components/dashboard/transaction-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Transaction } from "@/lib/types/transaction"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function TransactionsPage() {
  const { data: allData, mutate: mutateAll } = useSWR<{
    transactions: Transaction[]
  }>("/api/transactions?type=recent&limit=500", fetcher)

  const { data: flaggedData, mutate: mutateFlagged } = useSWR<{
    transactions: Transaction[]
  }>("/api/transactions?type=flagged&limit=500", fetcher)

  const handleRefresh = () => {
    mutateAll()
    mutateFlagged()
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64">
        <Header title="Transactions" subtitle="View and analyze all transactions" onRefresh={handleRefresh} />

        <div className="p-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Transactions ({allData?.transactions?.length || 0})</TabsTrigger>
                  <TabsTrigger value="flagged">Flagged ({flaggedData?.transactions?.length || 0})</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  {allData?.transactions && <TransactionTable transactions={allData.transactions} pageSize={15} />}
                </TabsContent>
                <TabsContent value="flagged">
                  {flaggedData?.transactions && (
                    <TransactionTable transactions={flaggedData.transactions} pageSize={15} />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
