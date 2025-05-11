// frontend/components/BuySellTokens.jsx
import { useState, useEffect } from 'react';
import { getUserAccount, getSellRate, getBuyRate, buyGymCoins, sellGymCoins, getGymCoinBalance } from '../utils/contractHelpers';

export default function BuySellTokens({ connected }) {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [sellRate, setSellRate] = useState('0');
  const [buyRate, setBuyRate] = useState('0');
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactionType, setTransactionType] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (connected) {
        try {
          const account = await getUserAccount();
          setAccount(account);
          
          // Get balance
          const balance = await getGymCoinBalance(account);
          setBalance(balance);
          
          // Get rates
          const sellRate = await getSellRate();
          const buyRate = await getBuyRate();
          setSellRate(sellRate);
          setBuyRate(buyRate);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };
    
    fetchData();
  }, [connected]);

  const handleBuy = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTransactionType('buy');
    
    try {
      await buyGymCoins(buyAmount);
      
      // Refresh balance
      const balance = await getGymCoinBalance(account);
      setBalance(balance);
      
      setBuyAmount('');
    } catch (error) {
      console.error("Buy error:", error);
    } finally {
      setLoading(false);
      setTransactionType(null);
    }
  };

  const handleSell = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTransactionType('sell');
    
    try {
      await sellGymCoins(sellAmount);
      
      // Refresh balance
      const balance = await getGymCoinBalance(account);
      setBalance(balance);
      
      setSellAmount('');
    } catch (error) {
      console.error("Sell error:", error);
    } finally {
      setLoading(false);
      setTransactionType(null);
    }
  };

  if (!connected) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md mt-10">
        <h2 className="text-xl font-bold mb-4">Buy/Sell Gym Coins</h2>
        <p>Please connect your wallet to buy or sell GC tokens.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md mt-10">
      <h2 className="text-xl font-bold mb-4">Buy/Sell Gym Coins</h2>
      
      <div className="mb-4">
        <p><strong>Current Balance:</strong> {balance} GC</p>
        <p><strong>Buy Rate:</strong> {sellRate} GC per ETH</p>
        <p><strong>Sell Rate:</strong> {buyRate} GC per ETH</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buy Form */}
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">Buy Tokens</h3>
          <form onSubmit={handleBuy}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="buyAmount">
                Amount (GC)
              </label>
              <input
                type="number"
                id="buyAmount"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                min="0"
                step="0.01"
                required
              />
              <p className="text-sm text-gray-600 mt-1">
                ETH Cost: {buyAmount ? (parseFloat(buyAmount) / parseFloat(sellRate)).toFixed(6) : '0'} ETH
              </p>
            </div>
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={loading && transactionType === 'buy'}
            >
              {loading && transactionType === 'buy' ? 'Processing...' : 'Buy GC'}
            </button>
          </form>
        </div>
        
        {/* Sell Form */}
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">Sell Tokens</h3>
          <form onSubmit={handleSell}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sellAmount">
                Amount (GC)
              </label>
              <input
                type="number"
                id="sellAmount"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                min="0"
                max={balance}
                step="0.01"
                required
              />
              <p className="text-sm text-gray-600 mt-1">
                ETH Return: {sellAmount ? (parseFloat(sellAmount) / parseFloat(buyRate)).toFixed(6) : '0'} ETH
              </p>
            </div>
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={loading && transactionType === 'sell'}
            >
              {loading && transactionType === 'sell' ? 'Processing...' : 'Sell GC'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}