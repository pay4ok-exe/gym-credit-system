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
import { useTheme } from "next-themes"
import { SunIcon, MoonIcon } from "lucide-react"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  // Добавляем состояние для отслеживания монтирования компонента
  const [mounted, setMounted] = useState(false)

  // После монтирования компонента, отмечаем это в состоянии
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-8 w-8"
      >
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }


  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-full h-8 w-8"
    >
      {theme === "dark" ? (
        <SunIcon className="h-4 w-4" />
      ) : (
        <MoonIcon className="h-4 w-4" />
      )}
    </Button>
  )
}


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
        window.ethereum.on('chainChanged', async (chainId) => {
          updateNetworkName(chainId);
          
          // Если пользователь переключается с локальной сети
          if (chainId !== '0x7a69') { // 31337 в hex
            toast.warning("Неподдерживаемая сеть", {
              description: "Приложение работает только с локальной сетью Hardhat"
            });
            setConnected(false);
          } else if (account) {
            // Если переключились на Hardhat и уже был подключен аккаунт
            try {
              await initializeWeb3();
              setConnected(true);
              toast.success("Подключено к локальной сети", {
                description: "Теперь вы можете использовать приложение"
              });
            } catch (error) {
              console.error("Ошибка реинициализации:", error);
            }
          }
        });
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
      case '0x7a69':
        return 'Localhost'
      default:
        return 'Unknown Network'
    }
  }  

  const connectWallet = async () => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        toast.error("MetaMask не обнаружен", {
          description: "Пожалуйста, установите MetaMask для использования этого приложения",
          action: {
            label: "Установить",
            onClick: () => window.open("https://metamask.io/download/", "_blank")
          }
        });
        setLoading(false);
        return;
      }
      
      // Переключаемся на локальную сеть Hardhat
      try {
        // Сначала проверяем текущую сеть
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log("Текущая сеть в MetaMask:", chainId);
        
        // Если не Hardhat (локальная сеть) - переключаем
        if (chainId !== '0x7a69') { // 31337 в hex
          console.log("Переключение на локальную сеть Hardhat");
          
          try {
            // Пытаемся переключиться на Hardhat
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x7a69' }], // 31337 в hex
            });
            console.log("Успешно переключились на Hardhat сеть");
          } catch (switchError) {
            // Если сети нет - добавляем ее
            if (switchError.code === 4902) {
              console.log("Добавляем сеть Hardhat в MetaMask");
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0x7a69', // 31337 в hex
                    chainName: 'Hardhat Local',
                    nativeCurrency: {
                      name: 'Ethereum',
                      symbol: 'ETH',
                      decimals: 18
                    },
                    rpcUrls: ['http://127.0.0.1:8545/'],
                  },
                ],
              });
              console.log("Сеть Hardhat добавлена");
            } else {
              throw switchError;
            }
          }
        } else {
          console.log("Уже подключены к сети Hardhat");
        }
        
        // Теперь инициализируем Web3 после переключения сети
        await initializeWeb3();
        const account = await getUserAccount();
        setAccount(account);
        setConnected(true);
        
        // Проверяем владельца контракта
        const ownerStatus = await isContractOwner(account);
        setIsOwner(ownerStatus);
        
        // Получаем имя сети
        updateNetworkName(await window.ethereum.request({ method: 'eth_chainId' }));
        
        toast.success("Кошелек подключен", {
          description: `Подключено к ${formatAddress(account)}`,
        });
      } catch (error) {
        console.error("Ошибка при переключении сети:", error);
        toast.error("Не удалось переключиться на локальную сеть", {
          description: "Пожалуйста, вручную переключитесь на Localhost 8545 в MetaMask"
        });
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Ошибка подключения кошелька:", error);
      toast.error("Не удалось подключить кошелек", {
        description: error.message || "Пожалуйста, попробуйте снова"
      });
    } finally {
      setLoading(false);
    }
  };

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
          <ThemeToggle />
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