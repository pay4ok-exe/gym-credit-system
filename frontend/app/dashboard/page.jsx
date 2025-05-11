'use client'

import { useState, useEffect } from 'react'
import { Toaster } from "sonner"
import Navbar from '../../components/Navbar'
import UserProfile from '../../components/UserProfile'
import BuySellTokens from '../../components/BuySellTokens'
import TransferTokens from '../../components/TransferTokens'
import TransactionHistory from '../../components/TransactionHistory'
import AdminPanel from '../../components/AdminPanel'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, CreditCard, History, Settings, ArrowDown } from "lucide-react"
import { getUserAccount, isContractOwner } from '../../utils/contractHelpers'

export default function Dashboard() {
  const [connected, setConnected] = useState(false)
  const [showBanner, setShowBanner] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!window.ethereum) {
        setShowBanner(true)
      } else {
        setShowBanner(false)
      }
    }
    
    const checkOwnerStatus = async () => {
      if (connected) {
        try {
          const account = await getUserAccount()
          const ownerStatus = await isContractOwner(account)
          setIsOwner(ownerStatus)
        } catch (error) {
          console.error("Error checking owner status:", error)
        }
      }
    }
    
    checkOwnerStatus()
  }, [connected])

  return (
    <div className="min-h-screen bg-background">
      <Navbar connected={connected} setConnected={setConnected} />
      
      <main className="max-w-screen-xl mx-auto px-4 pt-24 pb-16 md:px-6">
        {showBanner && (
          <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <ArrowDown className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-medium">MetaMask is required</h3>
                <p className="text-sm text-muted-foreground">Please install MetaMask to interact with this application</p>
              </div>
            </div>
            <Button 
              onClick={() => window.open("https://metamask.io/download/", "_blank")}
              className="rounded-full bg-amber-500 hover:bg-amber-500/90 text-white"
            >
              Install MetaMask
            </Button>
          </div>
        )}
        
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent gym-gradient md:text-5xl">
              Dashboard
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Manage your GymCoin tokens and profile
            </p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex h-12 p-1 bg-muted/30 rounded-lg">
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 data-[state=active]:bg-background dark:data-[state=active]:bg-muted data-[state=active]:shadow-sm rounded-md"
            >
              <Wallet className="h-4 w-4" />
              <span className="hidden md:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="tokens"
              className="flex items-center gap-2 data-[state=active]:bg-background dark:data-[state=active]:bg-muted data-[state=active]:shadow-sm rounded-md"
            >
              <CreditCard className="h-4 w-4" />
              <span className="hidden md:inline">Buy/Sell</span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex items-center gap-2 data-[state=active]:bg-background dark:data-[state=active]:bg-muted data-[state=active]:shadow-sm rounded-md"
            >
              <History className="h-4 w-4" />
              <span className="hidden md:inline">History</span>
            </TabsTrigger>
            {isOwner && (
              <TabsTrigger
                value="admin"
                className="flex items-center gap-2 data-[state=active]:bg-background dark:data-[state=active]:bg-muted data-[state=active]:shadow-sm rounded-md"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden md:inline">Admin</span>
              </TabsTrigger>
            )}
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="profile" className="space-y-6 mt-0">
              <UserProfile connected={connected} />
              
              {connected && (
                <TransferTokens connected={connected} />
              )}
            </TabsContent>
            
            <TabsContent value="tokens" className="mt-0">
              <BuySellTokens connected={connected} />
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <TransactionHistory connected={connected} />
            </TabsContent>
            
            {isOwner && (
              <TabsContent value="admin" className="mt-0">
                <AdminPanel connected={connected} />
              </TabsContent>
            )}
          </div>
        </Tabs>
        
        {/* Footer */}
        <footer className="text-center text-muted-foreground mt-20 pt-8 border-t border-border text-sm">
          <p>© {new Date().getFullYear()} Gym Credit Token System - Powered by Ethereum</p>
          <p className="mt-1">Built on Sepolia Testnet | ERC-20 Token</p>
        </footer>
      </main>
      
      {/* Sonner Toast Container */}
      <Toaster position="top-right" closeButton />
    </div>
  )
}