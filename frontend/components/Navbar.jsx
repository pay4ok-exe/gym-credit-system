// frontend/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { getUserAccount, initializeWeb3 } from '../utils/contractHelpers';

export default function Navbar({ connected, setConnected }) {
  const [account, setAccount] = useState('');
  
  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      if (window.ethereum) {
        try {
          await initializeWeb3();
          const account = await getUserAccount();
          setAccount(account);
          setConnected(true);
        } catch (error) {
          console.error(error);
        }
      }
    };
    
    checkIfWalletIsConnected();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0]);
      });
    }
  }, [setConnected]);

  const connectWallet = async () => {
    try {
      await initializeWeb3();
      const account = await getUserAccount();
      setAccount(account);
      setConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setConnected(false);
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">Gym Credit Token System</h1>
        <div>
          {connected ? (
            <div className="flex items-center">
              <span className="text-white mr-4">{`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}</span>
              <button 
                onClick={disconnectWallet}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}