'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getUserAccount, initializeWeb3, isContractOwner } from '../utils/contractHelpers'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { formatAddress } from '@/lib/utils'
import { Wallet, LogOut, ChevronDown, ExternalLink, Home, LayoutDashboard, Settings, User, Coins } from 'lucide-react'
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export default function Navbar({ connected, setConnected }) {
  const pathname = usePathname()
  const router = useRouter()
  const [account, setAccount] = useState('')
  const [loading, setLoading] = useState(false)
  const [networkName, setNetworkName] = useState('')
  const [isOwner, setIsOwner] = useState(false)
  
  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      if (window.ethereum) {
        try {
          await initializeWeb3()
          const account = await getUserAccount()
          
          // Check if we got a valid account
          if (account) {
            setAccount(account)
            setConnected(true)
            
            // Check if account is owner
            const ownerStatus = await isContractOwner(account)
            setIsOwner(ownerStatus)
            
            // Get the network name
            const chainId = await window.ethereum.request({ method: 'eth_chainId' })
            updateNetworkName(chainId)
            
            toast.success("Wallet connected", {
              description: `Connected to ${formatAddress(account)}`,
              duration: 3000
            })
          }
        } catch (error) {
          console.error(error)
        }
      }
    }
    
    checkIfWalletIsConnected()
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          toast.info("Account changed", {
            description: `Now using ${formatAddress(accounts[0])}`,
            duration: 3000
          })
          
          // Check if new account is owner
          isContractOwner(accounts[0]).then(ownerStatus => {
            setIsOwner(ownerStatus)
          })
        } else {
          setAccount('')
          setConnected(false)
          toast.error("Wallet disconnected", {
            duration: 3000
          })
        }
      })
      
      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainId) => {
        updateNetworkName(chainId)
        toast.info("Network changed", {
          description: `Now connected to ${getNetworkName(chainId)}`,
          duration: 3000
        })
        window.location.reload() // Recommended by MetaMask
      })
    }
    
    return () => {
      // Cleanup event listeners
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged')
        window.ethereum.removeAllListeners('chainChanged')
      }
    }
  }, [setConnected])
  
  const updateNetworkName = (chainId) => {
    setNetworkName(getNetworkName(chainId))
  }
  
  const getNetworkName = (chainId) => {
    switch (chainId) {
      case '0x1':
        return 'Ethereum Mainnet'
      case '0xaa36a7':
        return 'Sepolia Testnet'
      case '0x539':
        return 'Localhost'
      default:
        return 'Unknown Network'
    }
  }

  const connectWallet = async () => {
    setLoading(true)
    try {
      if (!window.ethereum) {
        toast.error("MetaMask not detected", {
          description: "Please install MetaMask to use this application",
          action: {
            label: "Install",
            onClick: () => window.open("https://metamask.io/download/", "_blank")
          }
        })
        return
      }
      
      // Check if we're on Sepolia network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      if (chainId !== '0xaa36a7') { // Sepolia chainId
        try {
          // Try to switch to Sepolia
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
          })
        } catch (switchError) {
          // If Sepolia isn't added to MetaMask, add it
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0xaa36a7',
                    chainName: 'Sepolia Testnet',
                    nativeCurrency: {
                      name: 'Sepolia ETH',
                      symbol: 'SEP',
                      decimals: 18
                    },
                    rpcUrls: ['https://sepolia.infura.io/v3/'],
                    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                  },
                ],
              })
            } catch (addError) {
              toast.error("Failed to add Sepolia network")
              setLoading(false)
              return
            }
          } else {
            toast.error("Failed to switch to Sepolia network")
            setLoading(false)
            return
          }
        }
      }
      
      await initializeWeb3()
      const account = await getUserAccount()
      setAccount(account)
      setConnected(true)
      
      // Check if account is owner
      const ownerStatus = await isContractOwner(account)
      setIsOwner(ownerStatus)
      
      // Get the network name
      updateNetworkName(await window.ethereum.request({ method: 'eth_chainId' }))
      
      toast.success("Wallet connected", {
        description: `Connected to ${formatAddress(account)}`,
      })
    } catch (error) {
      console.error(error)
      toast.error("Failed to connect wallet", {
        description: error.message || "Please try again"
      })
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = () => {
    setAccount('')
    setConnected(false)
    setIsOwner(false)
    toast.info("Wallet disconnected")
  }
  
  const openEtherscan = () => {
    window.open(`https://sepolia.etherscan.io/address/${account}`, '_blank')
  }
  
  const navigateToHome = () => {
    router.push('/')
  }
  
  const navigateToDashboard = () => {
    router.push('/dashboard')
  }
  
  const navigateToProfile = () => {
    router.push('/dashboard')
  }
  
  const isHomePage = pathname === '/'
  const isDashboardPage = pathname === '/dashboard'

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <header className="max-w-screen-xl mx-auto py-4 px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-chart-1/10 cursor-pointer">
                <Wallet className="h-5 w-5 text-chart-1" />
              </div>
            </Link>
            <div className="flex flex-col">
              <Link href="/">
                <span className="text-xl font-bold">Gym Credit Token</span>
              </Link>
              <div className="hidden sm:flex items-center gap-4 mt-1">
                <Link href="/" className={`text-sm ${isHomePage ? 'text-chart-1 font-medium' : 'text-muted-foreground'} hover:text-chart-1 transition-colors`}>
                  Home
                </Link>
                <Link href="/dashboard" className={`text-sm ${isDashboardPage ? 'text-chart-1 font-medium' : 'text-muted-foreground'} hover:text-chart-1 transition-colors`}>
                  Dashboard
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {connected && (
              <div className="hidden md:flex items-center px-3 py-1.5 rounded-full bg-muted/30 text-muted-foreground text-sm">
                <span>{networkName}</span>
              </div>
            )}
            
            {connected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" data-navbar-connect className="flex items-center gap-2 rounded-full h-10 px-4">
                    <Avatar className="h-6 w-6 bg-chart-3/10 text-chart-3">
                      <AvatarFallback>{account.substring(2, 4)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{formatAddress(account)}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-lg p-1">
                  <DropdownMenuItem
                    onClick={navigateToHome}
                    className="flex items-center gap-2 rounded-md cursor-pointer font-medium focus:bg-muted"
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem
                    onClick={navigateToDashboard}
                    className="flex items-center gap-2 rounded-md cursor-pointer font-medium focus:bg-muted"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem
                    onClick={navigateToProfile}
                    className="flex items-center gap-2 rounded-md cursor-pointer font-medium focus:bg-muted"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  
                  {isOwner && (
                    <DropdownMenuItem
                      onClick={() => router.push('/dashboard?tab=admin')}
                      className="flex items-center gap-2 rounded-md cursor-pointer font-medium focus:bg-muted"
                    >
                      <Settings className="h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem
                    onClick={openEtherscan}
                    className="flex items-center gap-2 rounded-md cursor-pointer font-medium focus:bg-muted"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on Etherscan
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={disconnectWallet} 
                    className="flex items-center gap-2 rounded-md cursor-pointer text-destructive font-medium focus:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Disconnect Wallet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={connectWallet} 
                disabled={loading} 
                className="gap-2 rounded-full bg-chart-1 hover:bg-chart-1/90 text-white h-10 px-5"
                data-navbar-connect
              >
                <Wallet className="h-4 w-4" />
                {loading ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </div>
        </div>
      </header>
    </div>
  )
}