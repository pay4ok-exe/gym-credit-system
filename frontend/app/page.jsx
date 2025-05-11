// frontend/app/page.jsx
'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import UserProfile from '../components/UserProfile';
import BuySellTokens from '../components/BuySellTokens';
import TransferTokens from '../components/TransferTokens';

export default function Home() {
  const [connected, setConnected] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar connected={connected} setConnected={setConnected} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Gym Credit Token System</h1>
        
        <UserProfile connected={connected} />
        
        {connected && (
          <>
            <BuySellTokens connected={connected} />
            <TransferTokens connected={connected} />
          </>
        )}
      </div>
    </div>
  );
}