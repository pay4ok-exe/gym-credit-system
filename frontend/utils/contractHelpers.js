// frontend/src/utils/contractHelpers.js
import { ethers } from 'ethers';

// Import your contract ABIs and addresses
// You'll need to update these paths based on where your build artifacts are located
let userProfileABI;
let gymCoinABI;
let contractAddresses;

try {
  // In a Next.js environment, we need to handle dynamic imports differently
  // These will be available after you compile and deploy your contracts
  userProfileABI = require('../../artifacts/contracts/UserProfile.sol/UserProfile.json').abi;
  gymCoinABI = require('../../artifacts/contracts/GymCoin.sol/GymCoin.json').abi;
  
  // This file will be created by your deployment script
  contractAddresses = require('./contractAddresses.json');
} catch (error) {
  console.error("Error loading contract artifacts:", error);
  // Provide empty placeholders to prevent crashes
  userProfileABI = [];
  gymCoinABI = [];
  contractAddresses = { userProfile: '', gymCoin: '' };
}

let provider;
let signer;
let userProfileContract;
let gymCoinContract;

export const initializeWeb3 = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    // A Web3Provider wraps a standard Web3 provider, which is
    // what MetaMask injects as window.ethereum into each page
    provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Request account access
    await provider.send("eth_requestAccounts", []);
    
    // The Metamask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    signer = provider.getSigner();
    
    try {
      userProfileContract = new ethers.Contract(
        contractAddresses.userProfile,
        userProfileABI,
        signer
      );
      
      gymCoinContract = new ethers.Contract(
        contractAddresses.gymCoin,
        gymCoinABI,
        signer
      );
      
      return { provider, signer, userProfileContract, gymCoinContract };
    } catch (error) {
      console.error("Error initializing contracts:", error);
      return null;
    }
  } else {
    console.error("Please install MetaMask!");
    return null;
  }
};

export const getUserAccount = async () => {
  if (typeof window === 'undefined') return null;
  
  if (!signer) {
    const web3 = await initializeWeb3();
    if (!web3) return null;
  }
  
  try {
    return await signer.getAddress();
  } catch (error) {
    console.error("Error getting user account:", error);
    return null;
  }
};

export const registerUser = async (username, email) => {
  if (typeof window === 'undefined') return null;
  
  if (!userProfileContract) {
    const web3 = await initializeWeb3();
    if (!web3) return null;
  }
  
  try {
    const tx = await userProfileContract.registerUser(username, email);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const getUserInfo = async (address) => {
  if (typeof window === 'undefined') return [null, null, false];
  
  if (!userProfileContract) {
    const web3 = await initializeWeb3();
    if (!web3) return [null, null, false];
  }
  
  try {
    return await userProfileContract.getUserInfo(address);
  } catch (error) {
    console.error("Error getting user info:", error);
    return [null, null, false];
  }
};

export const getGymCoinBalance = async (address) => {
  if (typeof window === 'undefined') return '0';
  
  if (!gymCoinContract) {
    const web3 = await initializeWeb3();
    if (!web3) return '0';
  }
  
  try {
    const balance = await gymCoinContract.balanceOf(address);
    return ethers.utils.formatUnits(balance, 18);
  } catch (error) {
    console.error("Error getting token balance:", error);
    return '0';
  }
};

export const buyGymCoins = async (gcAmount) => {
  if (typeof window === 'undefined') return null;
  
  if (!gymCoinContract) {
    const web3 = await initializeWeb3();
    if (!web3) return null;
  }
  
  try {
    // Convert amount to wei (assuming 18 decimals for the token)
    const tokenAmount = ethers.utils.parseUnits(gcAmount.toString(), 18);
    
    // Get sell rate to calculate ETH needed
    const sellRate = await gymCoinContract.sellRate();
    const ethAmount = tokenAmount.mul(ethers.utils.parseEther("1")).div(sellRate);
    
    const tx = await gymCoinContract.buy(tokenAmount, { value: ethAmount });
    await tx.wait();
    return tx;
  } catch (error) {
    console.error("Error buying tokens:", error);
    throw error;
  }
};

export const sellGymCoins = async (gcAmount) => {
  if (typeof window === 'undefined') return null;
  
  if (!gymCoinContract) {
    const web3 = await initializeWeb3();
    if (!web3) return null;
  }
  
  try {
    const tokenAmount = ethers.utils.parseUnits(gcAmount.toString(), 18);
    const tx = await gymCoinContract.sell(tokenAmount);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error("Error selling tokens:", error);
    throw error;
  }
};

export const transferGymCoins = async (to, gcAmount) => {
  if (typeof window === 'undefined') return null;
  
  if (!gymCoinContract) {
    const web3 = await initializeWeb3();
    if (!web3) return null;
  }
  
  try {
    const tokenAmount = ethers.utils.parseUnits(gcAmount.toString(), 18);
    const tx = await gymCoinContract.transfer(to, tokenAmount);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error("Error transferring tokens:", error);
    throw error;
  }
};

export const getSellRate = async () => {
  if (typeof window === 'undefined') return '0';
  
  if (!gymCoinContract) {
    const web3 = await initializeWeb3();
    if (!web3) return '0';
  }
  
  try {
    const rate = await gymCoinContract.sellRate();
    return ethers.utils.formatUnits(rate, 18);
  } catch (error) {
    console.error("Error getting sell rate:", error);
    return '0';
  }
};

export const getBuyRate = async () => {
  if (typeof window === 'undefined') return '0';
  
  if (!gymCoinContract) {
    const web3 = await initializeWeb3();
    if (!web3) return '0';
  }
  
  try {
    const rate = await gymCoinContract.buyRate();
    return ethers.utils.formatUnits(rate, 18);
  } catch (error) {
    console.error("Error getting buy rate:", error);
    return '0';
  }
};