'use client'

import { useState, useEffect } from 'react'
import { getUserAccount } from '../utils/contractHelpers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, History, ArrowUpRight, Circle, RefreshCw } from 'lucide-react'
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { formatAddress } from '@/lib/utils'

export default function TransactionHistory({ connected }) {
  const [account, setAccount] = useState('')
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (connected) {
        try {
          const account = await getUserAccount()
          setAccount(account)
          
          // Load past transactions
          await fetchTransactions(account)
        } catch (error) {
          console.error("Error fetching data:", error)
        }
      }
    }
    
    fetchData()
  }, [connected])
  
  const fetchTransactions = async (address) => {
    if (!address) return
    
    setLoading(true)
    
    try {
      // For demo purposes, using static sample data
      // In a real app, you would fetch this from an API or blockchain scanner
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const sampleTransactions = [
        {
          hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          type: 'buy',
          amount: '10.00',
          ethAmount: '0.1',
          timestamp: Date.now() - 3600000, // 1 hour ago
          status: 'success'
        },
        {
          hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          type: 'transfer',
          to: '0x1234567890123456789012345678901234567890',
          amount: '5.00',
          timestamp: Date.now() - 86400000, // 1 day ago
          status: 'success'
        },
        {
          hash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
          type: 'sell',
          amount: '3.00',
          ethAmount: '0.01',
          timestamp: Date.now() - 259200000, // 3 days ago
          status: 'success'
        },
        {
          hash: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc',
          type: 'register',
          timestamp: Date.now() - 432000000, // 5 days ago
          status: 'success'
        }
      ]
      
      setTransactions(sampleTransactions)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }
  
  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'buy':
        return 'Purchased GC'
      case 'sell':
        return 'Sold GC'
      case 'transfer':
        return 'Transferred GC'
      case 'register':
        return 'Registered Account'
      default:
        return 'Transaction'
    }
  }
  
  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'buy':
        return 'bg-green-500/10 text-green-500'
      case 'sell':
        return 'bg-red-500/10 text-red-500'
      case 'transfer':
        return 'bg-blue-500/10 text-blue-500'
      case 'register':
        return 'bg-purple-500/10 text-purple-500'
      default:
        return 'bg-muted/30 text-muted-foreground'
    }
  }
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return date.toLocaleDateString('en-US', options)
  }
  
  const handleRefresh = () => {
    fetchTransactions(account)
  }
  
  const viewOnEtherscan = (hash) => {
    window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank')
  }

  if (!connected) {
    return (
      <Card className="w-full shadow-md border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">Transaction History</CardTitle>
          <CardDescription>
            Connect your wallet to view transaction history
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <History className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-center text-muted-foreground max-w-sm">
            Please connect your wallet to view your transaction history
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-md border-border/40">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Transaction History</CardTitle>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-full"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription>
          View your recent GymCoin transactions
        </CardDescription>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              Loading transaction history...
            </p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <History className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-center text-muted-foreground max-w-sm">
              No transactions found for this account
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx, index) => (
              <div 
                key={index} 
                className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTransactionTypeColor(tx.type)}`}>
                      {tx.type === 'buy' && <ArrowUpRight className="h-5 w-5" />}
                      {tx.type === 'sell' && <ArrowUpRight className="h-5 w-5 rotate-180" />}
                      {tx.type === 'transfer' && <ArrowUpRight className="h-5 w-5 -rotate-45" />}
                      {tx.type === 'register' && <Circle className="h-5 w-5" />}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getTransactionTypeLabel(tx.type)}</span>
                        <Badge variant="outline" className="text-xs font-normal capitalize">
                          {tx.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="font-mono">{formatAddress(tx.hash)}</span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {formatTimestamp(tx.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-2">
                    {tx.amount && (
                      <span className="font-mono font-semibold">
                        {tx.type === 'buy' ? '+' : tx.type === 'sell' || tx.type === 'transfer' ? '-' : ''}{tx.amount} GC
                      </span>
                    )}
                    
                    {tx.ethAmount && (
                      <span className="text-sm text-muted-foreground font-mono">
                        {tx.type === 'sell' ? '+' : tx.type === 'buy' ? '-' : ''}{tx.ethAmount} ETH
                      </span>
                    )}
                    
                    {tx.to && (
                      <span className="text-sm text-muted-foreground">
                        To: {formatAddress(tx.to)}
                      </span>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 md:self-end"
                      onClick={() => viewOnEtherscan(tx.hash)}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                      View on Etherscan
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}