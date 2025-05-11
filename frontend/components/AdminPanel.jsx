'use client'

import { useState, useEffect } from 'react'
import { getUserAccount, getSellRate, getBuyRate, isContractOwner, setExchangeRates, getContractAddresses } from '../utils/contractHelpers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, Settings, RefreshCw, ShieldCheck, Copy } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { formatAddress } from "@/lib/utils"

export default function AdminPanel({ connected }) {
  const [account, setAccount] = useState('')
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(false)
  const [addresses, setAddresses] = useState({
    userProfile: '',
    gymCoin: ''
  })
  
  const [rates, setRates] = useState({
    sellRate: '',
    buyRate: ''
  })
  
  const [currentRates, setCurrentRates] = useState({
    sellRate: '0',
    buyRate: '0'
  })

  useEffect(() => {
    const fetchData = async () => {
      if (connected) {
        try {
          const account = await getUserAccount()
          setAccount(account)
          
          // Check if connected account is contract owner
          const ownerStatus = await isContractOwner(account)
          setIsOwner(ownerStatus)
          
          // Get contract addresses
          const addresses = getContractAddresses()
          setAddresses(addresses)
          
          // Get current rates
          const sellRate = await getSellRate()
          const buyRate = await getBuyRate()
          setCurrentRates({
            sellRate,
            buyRate
          })
          
        } catch (error) {
          console.error("Error fetching admin data:", error)
          toast.error("Failed to fetch contract data")
        }
      }
    }
    
    fetchData()
  }, [connected])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setRates({
      ...rates,
      [name]: value
    })
  }

  const handleUpdateRates = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Validate rates
      if (parseFloat(rates.sellRate) <= 0 || parseFloat(rates.buyRate) <= 0) {
        toast.error("Rates must be greater than zero")
        setLoading(false)
        return
      }
      
      // Ensure sell rate is higher than buy rate (users get more GC when buying than when selling)
      if (parseFloat(rates.sellRate) <= parseFloat(rates.buyRate)) {
        toast.error("Sell rate must be higher than buy rate")
        setLoading(false)
        return
      }
      
      const tx = await setExchangeRates(rates.sellRate, rates.buyRate)
      
      toast.success("Rates updated successfully", {
        description: `Sell: ${rates.sellRate} GC/ETH, Buy: ${rates.buyRate} GC/ETH`,
        action: {
          label: "View Transaction",
          onClick: () => window.open(`https://sepolia.etherscan.io/tx/${tx.hash}`, '_blank')
        }
      })
      
      // Update current rates
      setCurrentRates({
        sellRate: rates.sellRate,
        buyRate: rates.buyRate
      })
      
      // Clear input form
      setRates({
        sellRate: '',
        buyRate: ''
      })
      
    } catch (error) {
      console.error("Rate update error:", error)
      toast.error("Failed to update rates", {
        description: error.message || "There was an error updating exchange rates"
      })
    } finally {
      setLoading(false)
    }
  }
  
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success(`${label} copied to clipboard`);
      })
      .catch(() => {
        toast.error("Failed to copy to clipboard");
      });
  };

  if (!connected) {
    return (
      <Card className="w-full shadow-md border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">Admin Panel</CardTitle>
          <CardDescription>
            Connect your wallet to access admin functions
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Settings className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-center text-muted-foreground max-w-sm">
            Please connect your wallet to access admin functionality
          </p>
        </CardContent>
      </Card>
    )
  }
  
  if (!isOwner) {
    return (
      <Card className="w-full shadow-md border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">Admin Panel</CardTitle>
          <CardDescription>
            Admin functionality restricted
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="py-6">
          <Alert variant="destructive" className="rounded-lg border-destructive/30 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only the contract owner can access the admin panel
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-md border-border/40">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Admin Panel</CardTitle>
          <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-sm font-medium">Owner Access</span>
          </div>
        </div>
        <CardDescription>
          Manage exchange rates and view contract details
        </CardDescription>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contract Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Contract Information</h3>
            
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4 bg-muted/10">
                <Label className="text-sm text-muted-foreground mb-1 block">User Profile Contract</Label>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">{formatAddress(addresses.userProfile)}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => copyToClipboard(addresses.userProfile, "User Profile address")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="rounded-lg border border-border p-4 bg-muted/10">
                <Label className="text-sm text-muted-foreground mb-1 block">GymCoin Contract</Label>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">{formatAddress(addresses.gymCoin)}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => copyToClipboard(addresses.gymCoin, "GymCoin address")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="rounded-lg border border-border p-4 bg-muted/10">
                <Label className="text-sm text-muted-foreground mb-1 block">Contract Owner</Label>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">{formatAddress(account)}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => copyToClipboard(account, "Owner address")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <h4 className="text-base font-medium">Current Exchange Rates</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-blue-500/10 p-4">
                  <span className="text-sm text-blue-500 font-medium">Buy Rate (GC/ETH)</span>
                  <p className="text-xl font-bold mt-2">{parseFloat(currentRates.sellRate).toFixed(2)}</p>
                </div>
                
                <div className="rounded-lg bg-red-500/10 p-4">
                  <span className="text-sm text-red-500 font-medium">Sell Rate (GC/ETH)</span>
                  <p className="text-xl font-bold mt-2">{parseFloat(currentRates.buyRate).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Manage Exchange Rates */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Manage Exchange Rates</h3>
            
            <Alert className="rounded-lg border-amber-500/30 bg-amber-500/10">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-500">
                  Set how many GC tokens users get for 1 ETH (Buy) and how many tokens they need to sell to get 1 ETH (Sell). 
                  The Buy rate should be higher than the Sell rate.
                </AlertDescription>
              </div>
            </Alert>
            
            <form onSubmit={handleUpdateRates} className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="sellRate" className="text-base">Buy Rate (GC/ETH)</Label>
                <div className="relative">
                  <Input
                    id="sellRate"
                    name="sellRate"
                    type="number"
                    value={rates.sellRate}
                    onChange={handleInputChange}
                    placeholder="e.g. 100"
                    min="1"
                    step="1"
                    className="h-12 text-base"
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  How many GC tokens users get when they buy with 1 ETH
                </p>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="buyRate" className="text-base">Sell Rate (GC/ETH)</Label>
                <div className="relative">
                  <Input
                    id="buyRate"
                    name="buyRate"
                    type="number"
                    value={rates.buyRate}
                    onChange={handleInputChange}
                    placeholder="e.g. 200"
                    min="1"
                    step="1"
                    className="h-12 text-base"
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  How many GC tokens users need to sell to get 1 ETH
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base rounded-full bg-primary" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Update Exchange Rates
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}