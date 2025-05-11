'use client'

import { useState, useEffect } from 'react'
import { Toaster } from "sonner"
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Activity, Dumbbell, TrendingUp, ArrowDown, ArrowRight, Wallet, ShieldCheck, Share2 } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [connected, setConnected] = useState(false)
  const [showBanner, setShowBanner] = useState(true)

  // Effect to check if window.ethereum exists
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!window.ethereum) {
        setShowBanner(true)
      } else {
        setShowBanner(false)
      }
    }
  }, [])

  const navigateToDashboard = () => {
    router.push('/dashboard')
  }

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
      
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center mb-12 pt-8">
          <Badge variant="outline" className="mb-4 px-3 py-1 bg-chart-1/5 text-chart-1 rounded-full">
            Sepolia Testnet
          </Badge>
          <div className="text-center max-w-3xl">
            <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent gym-gradient md:text-6xl">
              Gym Credit Token System
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              A decentralized blockchain solution for gym membership credits - access any gym in the network with secure, tamper-proof tokens
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={navigateToDashboard}
                className="h-12 px-8 rounded-full text-base font-medium bg-chart-1 hover:bg-chart-1/90 text-white"
                size="lg"
              >
                <Wallet className="mr-2 h-5 w-5" />
                Launch Dashboard
              </Button>
              {!connected && (
                <Button 
                  variant="outline" 
                  className="h-12 px-8 rounded-full text-base font-medium"
                  size="lg"
                  onClick={() => {
                    const navbarConnectButton = document.querySelector('[data-navbar-connect]')
                    if (navbarConnectButton) {
                      navbarConnectButton.click()
                    }
                  }}
                >
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-white dark:bg-card rounded-xl shadow-md border-border/40">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-chart-1/10 mb-4">
                <Dumbbell className="h-6 w-6 text-chart-1" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gym Anywhere Access</h3>
              <p className="text-muted-foreground">
                Use your credits at any gym location within our network without restrictions. Perfect for frequent travelers.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-card rounded-xl shadow-md border-border/40">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-chart-3/10 mb-4">
                <TrendingUp className="h-6 w-6 text-chart-3" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Manage Credits</h3>
              <p className="text-muted-foreground">
                Buy, sell, and transfer GC tokens to manage your gym membership credits with full control and flexibility.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-card rounded-xl shadow-md border-border/40">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-chart-4/10 mb-4">
                <ShieldCheck className="h-6 w-6 text-chart-4" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transparent & Secure</h3>
              <p className="text-muted-foreground">
                Blockchain-based system ensures your credits are tamper-proof and transparent, with all transactions recorded immutably.
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* How It Works Section */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our blockchain-based system makes managing gym credits simple and secure
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-chart-1/10 flex items-center justify-center mb-4">
                <Wallet className="h-8 w-8 text-chart-1" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Connect Wallet</h3>
              <p className="text-muted-foreground">
                Register with your Ethereum wallet and create your gym profile
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-chart-3/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-chart-3" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Buy GC Tokens</h3>
              <p className="text-muted-foreground">
                Purchase GymCoin tokens using ETH at the current exchange rate
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-chart-4/10 flex items-center justify-center mb-4">
                <Share2 className="h-8 w-8 text-chart-4" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Use Anywhere</h3>
              <p className="text-muted-foreground">
                Use your tokens at any gym in the network or transfer to friends
              </p>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-chart-1/5 rounded-xl p-8 md:p-12 mb-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-muted-foreground max-w-xl">
                Join our network today and experience the convenience of blockchain-powered gym credits
              </p>
            </div>
            <Button 
              onClick={navigateToDashboard} 
              className="h-12 px-8 rounded-full text-base font-medium bg-chart-1 hover:bg-chart-1/90 text-white"
              size="lg"
            >
              Launch Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="text-center text-muted-foreground mt-20 pt-8 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-left">
            <div>
              <h3 className="font-bold mb-4">Gym Credit Token System</h3>
              <p className="text-sm">
                A blockchain-based solution for decentralized management of gym memberships and usage credits
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-chart-1 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-chart-1 transition-colors">GitHub Repository</a></li>
                <li><a href="#" className="hover:text-chart-1 transition-colors">Smart Contract</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Connect</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-chart-1 transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-chart-1 transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-chart-1 transition-colors">Telegram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8">
            <p>© {new Date().getFullYear()} Gym Credit Token System - Powered by Ethereum</p>
            <p className="mt-1 text-sm">Built on Sepolia Testnet | ERC-20 Token</p>
          </div>
        </footer>
      </main>
      
      {/* Sonner Toast Container */}
      <Toaster position="top-right" closeButton />
    </div>
  )
}