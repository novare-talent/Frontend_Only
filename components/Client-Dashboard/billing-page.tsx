"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Package, ArrowUpRight, ArrowDownLeft, Loader2, CheckCircle2, XCircle, Info } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"

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
  const [creditsRemaining, setCreditsRemaining] = useState(0)
  const [evaluationsRemaining, setEvaluationsRemaining] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [jobsCount, setJobsCount] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info'
    title: string
    message: string
  } | null>(null)
  
  const supabase = createClient()

  const AMOUNT_PER_JOB = 99 // ₹99 per job

  // Show notification helper
  const showNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setNotification({ type, title, message })
    setNotificationOpen(true)
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      setNotificationOpen(false)
    }, 5000)
  }

  // Fetch user ID and subscription data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setUserId(user.id)
          
          // Fetch subscription data
          const { data: subscription, error } = await supabase
            .from('subscriptions')
            .select('jobs_remaining, evaluations_remaining')
            .eq('profile_id', user.id)
            .single()

          if (!error && subscription) {
            setCreditsRemaining(subscription.jobs_remaining || 0)
            setEvaluationsRemaining(subscription.evaluations_remaining || 0)
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err)
      }
    }

    fetchUserData()
  }, [supabase])

  const handleAddCredits = async () => {
    if (!userId) {
      showNotification('error', 'Error', 'You must be logged in to add credits')
      return
    }

    if (jobsCount < 1 || jobsCount > 10) {
      showNotification('error', 'Invalid Input', 'Please enter a number between 1 and 10')
      return
    }

    setIsProcessing(true)

    try {
      console.log('Making payment request:', {
        url: `https://api.novaretalent.com/payment/start-payment/${userId}?jobs=${jobsCount}`,
        userId,
        jobsCount
      })

      const response = await fetch(
        `https://api.novaretalent.com/payment/start-payment/${userId}?jobs=${jobsCount}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors', // Explicitly set CORS mode
        }
      ).catch(fetchError => {
        console.error('Fetch error:', fetchError)
        throw new Error('Network error: Unable to connect to payment server. Please check your internet connection.')
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        let errorMessage = 'Failed to create payment link'
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
          console.error('API error:', errorData)
        } catch (e) {
          console.error('Could not parse error response')
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Payment response:', data)
      
      showNotification(
        'success',
        'Payment Link Created',
        `Opening payment page for ${jobsCount} job${jobsCount > 1 ? 's' : ''} (₹${data.total_amount})`
      )

      // Open payment link in new tab
      if (data.payment_link) {
        window.open(data.payment_link, '_blank')
      } else {
        throw new Error('No payment link received from server')
      }
      
      setIsDialogOpen(false)
      setJobsCount(1)

      // Refresh subscription data after a delay (to allow payment processing)
      setTimeout(async () => {
        try {
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('jobs_remaining, evaluations_remaining')
            .eq('profile_id', userId)
            .single()

          if (subscription) {
            setCreditsRemaining(subscription.jobs_remaining || 0)
            setEvaluationsRemaining(subscription.evaluations_remaining || 0)
          }
        } catch (err) {
          console.error('Error refreshing subscription:', err)
        }
      }, 3000)

    } catch (error: any) {
      console.error('Payment error:', error)
      showNotification(
        'error',
        'Payment Failed',
        error.message || 'Failed to create payment link. Please try again.'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const totalAmount = jobsCount * AMOUNT_PER_JOB

  const getNotificationIcon = () => {
    if (!notification) return null
    
    switch (notification.type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getNotificationStyles = () => {
    if (!notification) return ''
    
    switch (notification.type) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30'
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30'
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/10 dark:to-purple-950/10 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Notification Popover */}
        <div className="fixed top-4 right-4 z-50">
          <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
            <PopoverTrigger asChild>
              <div />
            </PopoverTrigger>
            <PopoverContent className={`w-full max-w-md ${getNotificationStyles()}`}>
              <div className="flex gap-3">
                {getNotificationIcon()}
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{notification?.title}</h4>
                  <p className="text-sm text-muted-foreground">{notification?.message}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setNotificationOpen(false)}
                >
                  ×
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

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
              onClick={() => setIsDialogOpen(true)}
            >
              Add more credits
            </Button>
          </div>

          {/* Credit Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                      {evaluationsRemaining}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <Package className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
                                {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount}
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

      {/* Add Credits Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Job Credits</DialogTitle>
            <DialogDescription>
              Purchase job posting credits. Each job credit costs ₹{AMOUNT_PER_JOB}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="jobs">Number of Jobs</Label>
              <Input
                id="jobs"
                type="number"
                min="1"
                max="10"
                value={jobsCount}
                onChange={(e) => setJobsCount(parseInt(e.target.value) || 1)}
                placeholder="Enter number of jobs"
              />
              <p className="text-sm text-muted-foreground">
                Min: 1 job • Max: 10 jobs
              </p>
            </div>

            <Card className="bg-muted/50 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Jobs:</span>
                    <span className="font-medium">{jobsCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price per job:</span>
                    <span className="font-medium">₹{AMOUNT_PER_JOB}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        ₹{totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCredits}
              disabled={isProcessing || jobsCount < 1 || jobsCount > 10}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Proceed to Payment`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}