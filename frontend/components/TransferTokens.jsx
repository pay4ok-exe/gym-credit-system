// frontend/components/TransferTokens.jsx
import { useState, useEffect } from 'react';
import { getUserAccount, getGymCoinBalance, transferGymCoins } from '../utils/contractHelpers';

export default function TransferTokens({ connected }) {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (connected) {
        try {
          const account = await getUserAccount();
          setAccount(account);
          
          // Get balance
          const balance = await getGymCoinBalance(account);
          setBalance(balance);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };
    
    fetchData();
  }, [connected]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await transferGymCoins(recipientAddress, transferAmount);
      
      // Refresh balance
      const balance = await getGymCoinBalance(account);
      setBalance(balance);
      
      setRecipientAddress('');
      setTransferAmount('');
    } catch (error) {
      console.error("Transfer error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md mt-10">
        <h2 className="text-xl font-bold mb-4">Transfer Tokens</h2>
        <p>Please connect your wallet to transfer GC tokens.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md mt-10">
      <h2 className="text-xl font-bold mb-4">Transfer Tokens</h2>
      
      <div className="mb-4">
        <p><strong>Current Balance:</strong> {balance} GC</p>
      </div>
      
      <form onSubmit={handleTransfer}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="recipientAddress">
            Recipient Address
          </label>
          <input
            type="text"
            id="recipientAddress"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="transferAmount">
            Amount (GC)
          </label>
          <input
            type="number"
            id="transferAmount"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            min="0"
            max={balance}
            step="0.01"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Transfer'}
        </button>
      </form>
    </div>
  );
}