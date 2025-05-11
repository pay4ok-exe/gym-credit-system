'use client'

import { useState, useEffect } from 'react'
import { getUserAccount, getGymCoinBalance, transferGymCoins } from '../utils/contractHelpers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, SendHorizontal, AlertCircle, User, CoinsIcon } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function TransferTokens({ connected }) {
  const [account, setAccount] = useState('')
  const [balance, setBalance] = useState('0')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      if (connected) {
        try {
          const account = await getUserAccount()
          setAccount(account)
          
          // Get balance
          const balance = await getGymCoinBalance(account)
          setBalance(balance)
        } catch (error) {
          console.error("Error fetching data:", error)
          toast.error("Failed to fetch account data")
        }
      }
    }
    
    fetchData()
  }, [connected])

  const validateEthereumAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  const handleTransfer = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validate address format
    if (!validateEthereumAddress(recipientAddress)) {
      setError('Invalid Ethereum address format')
      toast.error("Invalid address", {
        description: "Please enter a valid Ethereum wallet address"
      })
      return
    }
    
    // Validate amount
    if (parseFloat(transferAmount) > parseFloat(balance)) {
      setError('Insufficient balance for this transfer')
      toast.error("Insufficient balance", {
        description: "You don't have enough tokens for this transfer"
      })
      return
    }
    
    setLoading(true)
    
    try {
      const tx = await transferGymCoins(recipientAddress, transferAmount)
      
      // Show success toast
      toast.success("Transfer Successful", {
        description: `${transferAmount} GC sent to ${recipientAddress.substring(0, 6)}...${recipientAddress.substring(recipientAddress.length - 4)}`,
        action: {
          label: "View Transaction",
          onClick: () => window.open(`https://sepolia.etherscan.io/tx/${tx.hash}`, '_blank')
        }
      })
      
      // Refresh balance
      const balance = await getGymCoinBalance(account)
      setBalance(balance)
      
      setRecipientAddress('')
      setTransferAmount('')
    } catch (error) {
      console.error("Transfer error:", error)
      setError('Transaction failed. Please try again.')
      
      // Show error toast
      toast.error("Transfer Failed", {
        description: error.message || "There was an error processing your transfer"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!connected) {
    return (
      <Card className="w-full shadow-md border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">Transfer Tokens</CardTitle>
          <CardDescription>
            Connect your wallet to transfer GC tokens
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <SendHorizontal className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-center text-muted-foreground max-w-sm">
            Please connect your wallet to transfer GC tokens
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-md border-border/40">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold">Transfer Tokens</CardTitle>
        <CardDescription>
          Send GC tokens to another wallet address
        </CardDescription>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="py-6">
        <div className="rounded-lg bg-chart-3/5 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-chart-3/20 flex items-center justify-center">
              <CoinsIcon className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-xl font-bold font-mono">{parseFloat(balance).toFixed(2)} <span className="text-sm font-normal">GC</span></p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleTransfer} className="space-y-5">
          <div className="space-y-3">
            <Label htmlFor="recipientAddress" className="text-base">Recipient Address</Label>
            <div className="relative">
              <Input
                id="recipientAddress"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="0x..."
                className="h-12 text-base pl-12"
                required
              />
              <div className="absolute left-3 top-3 text-muted-foreground">
                <User className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="transferAmount" className="text-base">Amount (GC)</Label>
            <div className="relative">
              <Input
                id="transferAmount"
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
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
          
          {error && (
            <Alert variant="destructive" className="rounded-lg border-destructive/30 bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button 
            type="submit" 
            className="w-full h-12 text-base rounded-full bg-chart-3 hover:bg-chart-3/90" 
            disabled={loading || parseFloat(transferAmount) > parseFloat(balance)}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <SendHorizontal className="mr-2 h-5 w-5" />
                Transfer Tokens
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}