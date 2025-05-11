'use client'

import { useState, useEffect } from 'react'
import { getUserAccount, getSellRate, getBuyRate, buyGymCoins, sellGymCoins, getGymCoinBalance } from '../utils/contractHelpers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDownUp, Loader2, AlertCircle, TrendingUp, TrendingDown, DollarSign, CoinsIcon } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function BuySellTokens({ connected }) {
  const [account, setAccount] = useState('')
  const [balance, setBalance] = useState('0')
  const [sellRate, setSellRate] = useState('0')
  const [buyRate, setBuyRate] = useState('0')
  const [buyAmount, setBuyAmount] = useState('')
  const [sellAmount, setSellAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [transactionType, setTransactionType] = useState(null)
  const [activeTab, setActiveTab] = useState('buy')

  useEffect(() => {
    const fetchData = async () => {
      if (connected) {
        try {
          const account = await getUserAccount()
          setAccount(account)
          
          // Get balance
          const balance = await getGymCoinBalance(account)
          setBalance(balance)
          
          // Get rates
          const sellRate = await getSellRate()
          const buyRate = await getBuyRate()
          setSellRate(sellRate)
          setBuyRate(buyRate)
        } catch (error) {
          console.error("Error fetching data:", error)
          toast.error("Failed to fetch account data")
        }
      }
    }
    
    fetchData()
  }, [connected])

  const handleBuy = async (e) => {
    e.preventDefault()
    setLoading(true)
    setTransactionType('buy')
    
    try {
      const tx = await buyGymCoins(buyAmount)
      
      // Show transaction hash
      toast.success("Purchase successful!", {
        description: `Transaction: ${tx.hash.substring(0, 10)}...`,
        action: {
          label: "View",
          onClick: () => window.open(`https://sepolia.etherscan.io/tx/${tx.hash}`, '_blank')
        }
      })
      
      // Refresh balance
      const balance = await getGymCoinBalance(account)
      setBalance(balance)
      
      setBuyAmount('')
    } catch (error) {
      console.error("Buy error:", error)
      toast.error("Transaction failed", {
        description: error.message || "There was an error processing your purchase"
      })
    } finally {
      setLoading(false)
      setTransactionType(null)
    }
  }

  const handleSell = async (e) => {
    e.preventDefault()
    setLoading(true)
    setTransactionType('sell')
    
    try {
      const tx = await sellGymCoins(sellAmount)
      
      // Show transaction hash
      toast.success("Sale successful!", {
        description: `Transaction: ${tx.hash.substring(0, 10)}...`,
        action: {
          label: "View",
          onClick: () => window.open(`https://sepolia.etherscan.io/tx/${tx.hash}`, '_blank')
        }
      })
      
      // Refresh balance
      const balance = await getGymCoinBalance(account)
      setBalance(balance)
      
      setSellAmount('')
    } catch (error) {
      console.error("Sell error:", error)
      toast.error("Transaction failed", {
        description: error.message || "There was an error processing your sale"
      })
    } finally {
      setLoading(false)
      setTransactionType(null)
    }
  }

  const calculateEthCost = (gcAmount) => {
    if (!gcAmount || !sellRate || parseFloat(sellRate) === 0) return "0.00"
    return (parseFloat(gcAmount) / parseFloat(sellRate)).toFixed(6)
  }

  const calculateEthReturn = (gcAmount) => {
    if (!gcAmount || !buyRate || parseFloat(buyRate) === 0) return "0.00"
    return (parseFloat(gcAmount) / parseFloat(buyRate)).toFixed(6)
  }

  if (!connected) {
    return (
      <Card className="w-full shadow-md border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">Buy/Sell Gym Coins</CardTitle>
          <CardDescription>
            Connect your wallet to trade GC tokens
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <ArrowDownUp className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-center text-muted-foreground max-w-sm">
            Please connect your wallet to buy or sell GC tokens
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-md border-border/40">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold">Buy/Sell Gym Coins</CardTitle>
        <CardDescription>
          Trade GC tokens using your ETH balance
        </CardDescription>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="py-6">
        <div className="flex flex-col space-y-6">
          <div className="rounded-lg bg-chart-1/5 p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-chart-1/20 flex items-center justify-center">
                  <CoinsIcon className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-xl font-bold font-mono">{parseFloat(balance).toFixed(2)} <span className="text-sm font-normal">GC</span></p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-card rounded-lg p-4 shadow-sm w-full md:w-auto">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                      <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">Buy Rate:</span>
                      <span className="font-medium">{parseFloat(sellRate).toFixed(2)} GC/ETH</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center">
                      <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">Sell Rate:</span>
                      <span className="font-medium">{parseFloat(buyRate).toFixed(2)} GC/ETH</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 rounded-full p-1 bg-muted/30">
              <TabsTrigger 
                value="buy" 
                className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-muted data-[state=active]:text-chart-1 data-[state=active]:shadow-sm"
              >
                Buy Tokens
              </TabsTrigger>
              <TabsTrigger 
                value="sell"
                className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-muted data-[state=active]:text-destructive data-[state=active]:shadow-sm"
              >
                Sell Tokens
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="buy" className="mt-6">
              <form onSubmit={handleBuy} className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="buyAmount" className="text-base">Amount (GC)</Label>
                  <div className="relative">
                    <Input
                      id="buyAmount"
                      type="number"
                      value={buyAmount}
                      onChange={(e) => setBuyAmount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="h-12 text-base pl-12"
                      required
                    />
                    <div className="absolute left-3 top-3 text-muted-foreground">
                      <CoinsIcon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border border-border p-4 bg-muted/10">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">ETH Cost:</span>
                    </div>
                    <span className="font-mono font-medium">{calculateEthCost(buyAmount)} ETH</span>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base rounded-full bg-chart-1 hover:bg-chart-1/90" 
                  disabled={loading && transactionType === 'buy'}
                >
                  {loading && transactionType === 'buy' ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Buy GC Tokens"
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="sell" className="mt-6">
              <form onSubmit={handleSell} className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="sellAmount" className="text-base">Amount (GC)</Label>
                  <div className="relative">
                    <Input
                      id="sellAmount"
                      type="number"
                      value={sellAmount}
                      onChange={(e) => setSellAmount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      max={balance}
                      step="0.01"
                      className="h-12 text-base pl-12"
                      required
                    />
                    <div className="absolute left-3 top-3 text-muted-foreground">
                      <CoinsIcon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border border-border p-4 bg-muted/10">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">ETH Return:</span>
                    </div>
                    <span className="font-mono font-medium">{calculateEthReturn(sellAmount)} ETH</span>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base rounded-full bg-destructive hover:bg-destructive/90" 
                  disabled={loading && transactionType === 'sell' || parseFloat(sellAmount) > parseFloat(balance)}
                >
                  {loading && transactionType === 'sell' ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Sell GC Tokens"
                  )}
                </Button>
                
                {parseFloat(sellAmount) > parseFloat(balance) && (
                  <Alert variant="destructive" className="rounded-lg mt-2 border-destructive/30 bg-destructive/10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You don't have enough GC tokens for this transaction
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}