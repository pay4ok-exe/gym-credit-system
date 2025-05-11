'use client'

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

export default function NetworkWarning() {
  const [mounted, setMounted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [currentChainId, setCurrentChainId] = useState(null);

  useEffect(() => {
    setMounted(true);
    
    const checkNetwork = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          setCurrentChainId(chainId);
          
          // Показываем предупреждение только если не на локальной сети
          if (chainId !== '0x7a69') { // 31337 в hex
            setShowWarning(true);
          } else {
            setShowWarning(false);
          }
        } catch (error) {
          console.error("Ошибка проверки сети:", error);
        }
      }
    };

    if (mounted) {
      checkNetwork();
      
      // Слушаем изменения сети
      if (window.ethereum) {
        window.ethereum.on('chainChanged', checkNetwork);
      }
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', checkNetwork);
      }
    };
  }, [mounted]);

  const switchToLocalNetwork = async () => {
    if (!window.ethereum) return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7a69' }], // 31337 в hex
      });
    } catch (switchError) {
      // Если сети нет, добавляем ее
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x7a69',
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
        } catch (addError) {
          console.error("Ошибка добавления сети:", addError);
        }
      } else {
        console.error("Ошибка переключения сети:", switchError);
      }
    }
  };

  // Получаем название сети для отображения
  const getNetworkName = (chainId) => {
    const networks = {
      '0x1': 'Ethereum Mainnet',
      '0xaa36a7': 'Sepolia Testnet',
      '0x7a69': 'Hardhat Local',
    };
    
    return networks[chainId] || `Неизвестная сеть (${chainId})`;
  };

  // Не рендерим ничего на сервере или до монтирования
  if (!mounted) return null;

  return (
    <Dialog open={showWarning} onOpenChange={setShowWarning}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Обнаружена несовместимая сеть
          </DialogTitle>
          <DialogDescription>
            Для использования приложения требуется подключение к локальной сети Hardhat.
            Текущая сеть: <span className="font-medium">{getNetworkName(currentChainId)}</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button 
            type="button" 
            variant="default" 
            onClick={switchToLocalNetwork}
            className="bg-chart-1 hover:bg-chart-1/90"
          >
            Переключиться на Hardhat Local
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}