'use client'

import { useState, useEffect } from 'react'
import { getUserAccount, getUserInfo, registerUser, getGymCoinBalance, getEthBalance, getContractAddresses } from '../utils/contractHelpers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { formatAddress } from '@/lib/utils'
import { Badge } from "@/components/ui/badge"
import { Loader2, User, Mail, Wallet, Coins, CheckCircle } from 'lucide-react'
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { ethers } from 'ethers';
import { GymCoinABI } from '../utils/abis/GymCoinABI';


export default function UserProfile({ connected }) {
  const [account, setAccount] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [isRegistered, setIsRegistered] = useState(false)
  const [balance, setBalance] = useState('0')
  const [ethBalance, setEthBalance] = useState('0');
  const [registrationForm, setRegistrationForm] = useState({
    username: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)

  // Обновленная функция для UserProfile.jsx
const getTestTokens = async () => {
  try {
    toast.info("Получение тестовых токенов...");
    
    // Получаем текущий аккаунт
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const currentAccount = await signer.getAddress();
    
    // Подключаемся к локальной сети как владелец
    const localProvider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
    const ownerWallet = localProvider.getSigner(0); // Первый аккаунт Hardhat - владелец
    
    // Получаем адрес контракта
    const gymCoinAddress = getContractAddresses().gymCoin;
    
    // Создаем экземпляр контракта от имени владельца
    const gymCoinContract = new ethers.Contract(
      gymCoinAddress,
      [
        "function transfer(address to, uint256 amount) returns (bool)",
        "function balanceOf(address account) view returns (uint256)"
      ],
      ownerWallet
    );
    
    // Проверяем баланс до перевода для отладки
    const balanceBefore = await gymCoinContract.balanceOf(currentAccount);
    console.log("Баланс до перевода:", ethers.utils.formatUnits(balanceBefore, 18));
    
    // Отправляем токены - используем parseUnits для правильной конвертации с 18 десятичными знаками
    const amount = ethers.utils.parseUnits("1000", 18);
    console.log("Отправляем сумму:", ethers.utils.formatUnits(amount, 18));
    
    const tx = await gymCoinContract.transfer(currentAccount, amount);
    console.log("Транзакция отправлена:", tx.hash);
    
    await tx.wait();
    console.log("Транзакция подтверждена");
    
    // Проверяем баланс после перевода
    const balanceAfter = await gymCoinContract.balanceOf(currentAccount);
    console.log("Баланс после перевода:", ethers.utils.formatUnits(balanceAfter, 18));
    
    toast.success("Получено 1000 GC токенов! Баланс скоро обновится.");
    
    // Принудительно обновляем баланс на экране с небольшой задержкой
    setTimeout(async () => {
      const newBalance = await getGymCoinBalance(currentAccount);
      setBalance(newBalance);
      console.log("Баланс установлен:", newBalance);
      
      // Также принудительно обновляем отображение
      toast.success("Баланс обновлен до: " + parseFloat(newBalance).toFixed(2) + " GC");
    }, 1000);
    
  } catch (error) {
    console.error("Ошибка при получении тестовых токенов:", error);
    toast.error("Не удалось получить токены: " + error.message);
  }
};

  useEffect(() => {
    const fetchUserData = async () => {
      if (connected) {
        try {
          const account = await getUserAccount()
          setAccount(account)
          
          // Get user info
          const [fetchedUsername, fetchedEmail, fetchedIsRegistered] = await getUserInfo(account)
          setUsername(fetchedUsername)
          setEmail(fetchedEmail)
          setIsRegistered(fetchedIsRegistered)
          
          // Get balance
          if (fetchedIsRegistered) {
            const balance = await getGymCoinBalance(account)
            setBalance(balance)
            const ethBalance = await getEthBalance(account);
            setEthBalance(ethBalance);
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          toast.error("Failed to load user profile")
        }
      }
    }
    
    fetchUserData()
  }, [connected])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setRegistrationForm({
      ...registrationForm,
      [name]: value
    })
  }

  const handleRegistration = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(registrationForm.email)) {
        toast.error("Invalid email address")
        setLoading(false)
        return
      }
      
      // Validate username (not empty and at least 3 characters)
      if (registrationForm.username.trim().length < 3) {
        toast.error("Username must be at least 3 characters")
        setLoading(false)
        return
      }
      
      const tx = await registerUser(registrationForm.username, registrationForm.email)
      
      toast.success("Registration successful!", {
        description: "Your GymCoin account has been created",
        action: {
          label: "View Transaction",
          onClick: () => window.open(`https://sepolia.etherscan.io/tx/${tx.hash}`, '_blank')
        }
      })
      
      // Refresh user data
      const [fetchedUsername, fetchedEmail, fetchedIsRegistered] = await getUserInfo(account)
      setUsername(fetchedUsername)
      setEmail(fetchedEmail)
      setIsRegistered(fetchedIsRegistered)
      
      setRegistrationForm({
        username: '',
        email: ''
      })
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("Registration failed", {
        description: error.message || "There was an error processing your registration"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!connected) {
    return (
      <Card className="w-full shadow-md border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
          <CardDescription>
            Connect your wallet to view your profile information
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Wallet className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-center text-muted-foreground max-w-sm">
            Please connect your wallet using the button in the navigation bar to access your profile
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-md border-border/40">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
          {isRegistered && (
            <Badge className="bg-chart-2/10 hover:bg-chart-2/20 text-chart-2 px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Registered</span>
            </Badge>
          )}
        </div>
        <CardDescription>
          {isRegistered 
            ? "Your Gym Credit account information" 
            : "Register to use the Gym Credit system"}
        </CardDescription>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="py-6">
        {isRegistered ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-chart-1/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Wallet Address</Label>
                  <p className="font-medium">{formatAddress(account)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-chart-2/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Username</Label>
                  <p className="font-medium">{username}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-chart-3/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="font-medium">{email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-chart-4/10 flex items-center justify-center">
                  <Coins className="h-5 w-5 text-chart-4" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Balance</Label>
                  <p className="font-mono text-xl font-bold">{balance} <span className="text-sm font-normal">GC</span></p>
                  <p className="font-mono text-md">{parseFloat(ethBalance).toFixed(2)} <span className="text-sm font-normal">ETH</span></p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={getTestTokens}
                className="h-7 px-2 py-0 text-xs"
              >
                Get 1000 GC
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto py-4">
            <form onSubmit={handleRegistration} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-base">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={registrationForm.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  className="h-11 text-base"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={registrationForm.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="h-11 text-base"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 text-base rounded-full bg-chart-1 hover:bg-chart-1/90" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register Account"
                )}
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  )
}