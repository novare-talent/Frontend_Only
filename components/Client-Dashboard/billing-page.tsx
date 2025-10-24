"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, Package, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { useState } from "react"

interface PaymentTransaction {
  id: string
  date: string
  description: string
  amount: number
  type: "credit" | "debit"
  status: "completed" | "pending"
}

export function BillingPage() {
  const [transactions] = useState<PaymentTransaction[]>([])
  const creditsRemaining = 2
  const evaluationsUsed = 4

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/10 dark:to-purple-950/10 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Billing</h1>
          <p className="text-muted-foreground">Manage your credits and payment history</p>
        </div>

        {/* Payment Overview Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Payment Overview</h2>
              <div className="h-1 w-52 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mt-2"></div>
            </div>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6"
              onClick={() => alert("Add more credits functionality")}
            >
              Add more credits
            </Button>
          </div>

          {/* Credit Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-">
            {/* Credits Card */}
            <Card className="border-2 border-purple-500 from-purple-50/50 to-purple-100/30 dark:from-purple-950/30 dark:to-purple-900/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="px-6 py-2">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-md text-muted-foreground mb-1">Job Creation Remaining</p>
                    <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                      {creditsRemaining.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <CreditCard className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evaluations Card */}
            <Card className="border-2 border-purple-500 from-purple-50/50 to-purple-100/30 dark:from-purple-950/30 dark:to-purple-900/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="px-6 py-2">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-md text-muted-foreground mb-1">Evaluations Remaining</p>
                    <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{evaluationsUsed}</p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <Package className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Banner */}
          {/* <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <span className="font-semibold">Please note:</span> If you are part of pro and business plans, the
              reflection of bonus credits and rate limits may take time (usually it will not be more than a day).
            </p>
          </div> */}
        </div>

        {/* Payment History Section */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-6">Payment History</h2>

          {transactions.length === 0 ? (
            <Card className="border border-border bg-card">
              <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                <div className="mb-4">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg flex items-center justify-center">
                    <Package className="w-12 h-12 text-purple-400 dark:text-purple-500" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No Payment History</h3>
                <p className="text-muted-foreground max-w-sm">
                  You have not made any purchases yet. Start by adding credits to your account.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-border bg-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Description</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Amount</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-foreground">{transaction.date}</td>
                          <td className="px-6 py-4 text-sm text-foreground">{transaction.description}</td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              {transaction.type === "credit" ? (
                                <ArrowDownLeft className="w-4 h-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                              )}
                              <span
                                className={
                                  transaction.type === "credit"
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }
                              >
                                {transaction.type === "credit" ? "+" : "-"}${transaction.amount}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                transaction.status === "completed"
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                              }`}
                            >
                              {transaction.status === "completed" ? "Completed" : "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
