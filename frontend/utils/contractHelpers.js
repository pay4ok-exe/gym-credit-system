// frontend/src/utils/contractHelpers.js
import { ethers } from 'ethers';

// Import contract ABIs
// These will be dynamically loaded after compilation
let userProfileABI;
let gymCoinABI;
let contractAddresses;

try {
  // Load the contract ABIs and addresses
  userProfileABI = require('../artifacts/contracts/UserProfile.sol/UserProfile.json').abi;
  gymCoinABI = require('../artifacts/contracts/GymCoin.sol/GymCoin.json').abi;
  contractAddresses = require('./contractAddresses.json');
} catch (error) {
  console.error("Error loading contract artifacts:", error);
  // Fallback to empty values if not found
  userProfileABI = [];
  gymCoinABI = [];
  contractAddresses = { userProfile: '', gymCoin: '' };
}

let provider;
let signer;
let userProfileContract;
let gymCoinContract;

export const initializeWeb3 = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error("MetaMask not installed");
  }
  
  try {
    // Initialize provider and request accounts
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    
    // Check if we're on Sepolia network (chainId 11155111)
    const network = await provider.getNetwork();
    if (network.chainId !== 11155111) {
      console.warn("Not connected to Sepolia testnet");
    }
    
    // Initialize contracts if addresses are available
    if (contractAddresses.userProfile && contractAddresses.gymCoin) {
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
    } else {
      console.warn("Contract addresses not found");
    }
    
    return { provider, signer, userProfileContract, gymCoinContract };
  } catch (error) {
    console.error("Error initializing Web3:", error);
    throw new Error(error.message || "Failed to initialize Web3");
  }
};

// Get the connected user's account
export const getUserAccount = async () => {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  
  if (!signer) {
    try {
      const web3 = await initializeWeb3();
      if (!web3) return null;
    } catch (error) {
      console.error("Error in getUserAccount:", error);
      return null;
    }
  }
  
  try {
    return await signer.getAddress();
  } catch (error) {
    console.error("Error getting user account:", error);
    return null;
  }
};

// Register a new user
export const registerUser = async (username, email) => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error("MetaMask not installed");
  }
  
  if (!userProfileContract) {
    try {
      await initializeWeb3();
    } catch (error) {
      throw new Error("Failed to initialize Web3");
    }
  }
  
  try {
    // Check if contract is properly initialized
    if (!userProfileContract || !userProfileContract.registerUser) {
      throw new Error("User profile contract not properly initialized");
    }
    
    // Call the register function
    const tx = await userProfileContract.registerUser(username, email);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    return {
      hash: tx.hash,
      receipt: receipt
    };
  } catch (error) {
    console.error("Error registering user:", error);
    
    // Format error message for better user understanding
    if (error.code === 'ACTION_REJECTED') {
      throw new Error("Transaction rejected by user");
    } else if (error.message.includes("User already registered")) {
      throw new Error("This wallet address is already registered");
    } else {
      throw new Error(error.message || "Registration failed");
    }
  }
};

// Get user information
export const getUserInfo = async (address) => {
  if (typeof window === 'undefined' || !window.ethereum) {
    return [null, null, false];
  }
  
  if (!userProfileContract) {
    try {
      await initializeWeb3();
    } catch (error) {
      return [null, null, false];
    }
  }
  
  try {
    // Check if contract is properly initialized
    if (!userProfileContract || !userProfileContract.getUserInfo) {
      throw new Error("User profile contract not properly initialized");
    }
    
    return await userProfileContract.getUserInfo(address);
  } catch (error) {
    console.error("Error getting user info:", error);
    return [null, null, false];
  }
};

// Get user's GymCoin balance
export const getGymCoinBalance = async (address) => {
  if (typeof window === 'undefined' || !window.ethereum) return '0';
  
  if (!gymCoinContract) {
    try {
      await initializeWeb3();
    } catch (error) {
      return '0';
    }
  }
  
  try {
    // Check if contract is properly initialized
    if (!gymCoinContract || !gymCoinContract.balanceOf) {
      throw new Error("GymCoin contract not properly initialized");
    }
    
    const balance = await gymCoinContract.balanceOf(address);
    return ethers.utils.formatUnits(balance, 18);
  } catch (error) {
    console.error("Error getting token balance:", error);
    return '0';
  }
};

// Buy GymCoins with ETH
export const buyGymCoins = async (gcAmount) => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error("MetaMask not installed");
  }
  
  if (!gymCoinContract) {
    try {
      await initializeWeb3();
    } catch (error) {
      throw new Error("Failed to initialize Web3");
    }
  }
  
  try {
    // Check if contract is properly initialized
    if (!gymCoinContract || !gymCoinContract.buy || !gymCoinContract.sellRate) {
      throw new Error("GymCoin contract not properly initialized");
    }
    
    // Validate input
    if (!gcAmount || parseFloat(gcAmount) <= 0) {
      throw new Error("Please enter a valid amount");
    }
    
    // Convert token amount to wei (18 decimals)
    const tokenAmount = ethers.utils.parseUnits(gcAmount.toString(), 18);
    
    // Get sell rate to calculate ETH needed
    const sellRate = await gymCoinContract.sellRate();
    
    // Calculate required ETH amount (tokenAmount * 10^18 / sellRate)
    const ethAmount = tokenAmount.mul(ethers.utils.parseEther("1")).div(sellRate);
    
    // Call the buy function with calculated ETH value
    const tx = await gymCoinContract.buy(tokenAmount, { value: ethAmount });
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    return {
      hash: tx.hash,
      receipt: receipt,
      tokenAmount: gcAmount,
      ethAmount: ethers.utils.formatEther(ethAmount)
    };
  } catch (error) {
    console.error("Error buying tokens:", error);
    
    // Format error message for better user understanding
    if (error.code === 'ACTION_REJECTED') {
      throw new Error("Transaction rejected by user");
    } else if (error.message.includes("User not registered")) {
      throw new Error("You need to register an account first");
    } else if (error.message.includes("insufficient funds")) {
      throw new Error("Insufficient ETH balance for this purchase");
    } else if (error.message.includes("Owner has insufficient tokens")) {
      throw new Error("The contract owner doesn't have enough tokens to sell");
    } else {
      throw new Error(error.message || "Purchase failed");
    }
  }
};

// Sell GymCoins for ETH
export const sellGymCoins = async (gcAmount) => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error("MetaMask not installed");
  }
  
  if (!gymCoinContract) {
    try {
      await initializeWeb3();
    } catch (error) {
      throw new Error("Failed to initialize Web3");
    }
  }
  
  try {
    // Check if contract is properly initialized
    if (!gymCoinContract || !gymCoinContract.sell || !gymCoinContract.buyRate) {
      throw new Error("GymCoin contract not properly initialized");
    }
    
    // Validate input
    if (!gcAmount || parseFloat(gcAmount) <= 0) {
      throw new Error("Please enter a valid amount");
    }
    
    // Convert token amount to wei (18 decimals)
    const tokenAmount = ethers.utils.parseUnits(gcAmount.toString(), 18);
    
    // Get buy rate to calculate expected ETH return
    const buyRate = await gymCoinContract.buyRate();
    const expectedEthReturn = tokenAmount.mul(ethers.utils.parseEther("1")).div(buyRate);
    
    // Call the sell function
    const tx = await gymCoinContract.sell(tokenAmount);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    return {
      hash: tx.hash,
      receipt: receipt,
      tokenAmount: gcAmount,
      ethAmount: ethers.utils.formatEther(expectedEthReturn)
    };
  } catch (error) {
    console.error("Error selling tokens:", error);
    
    // Format error message for better user understanding
    if (error.code === 'ACTION_REJECTED') {
      throw new Error("Transaction rejected by user");
    } else if (error.message.includes("User not registered")) {
      throw new Error("You need to register an account first");
    } else if (error.message.includes("Insufficient token balance")) {
      throw new Error("You don't have enough tokens for this sale");
    } else if (error.message.includes("Contract has insufficient ETH")) {
      throw new Error("The contract doesn't have enough ETH to process this sale");
    } else {
      throw new Error(error.message || "Sale failed");
    }
  }
};

// Transfer GymCoins to another address
export const transferGymCoins = async (to, gcAmount) => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error("MetaMask not installed");
  }
  
  if (!gymCoinContract) {
    try {
      await initializeWeb3();
    } catch (error) {
      throw new Error("Failed to initialize Web3");
    }
  }
  
  try {
    // Check if contract is properly initialized
    if (!gymCoinContract || !gymCoinContract.transfer) {
      throw new Error("GymCoin contract not properly initialized");
    }
    
    // Validate input
    if (!to || !ethers.utils.isAddress(to)) {
      throw new Error("Invalid recipient address");
    }
    
    if (!gcAmount || parseFloat(gcAmount) <= 0) {
      throw new Error("Please enter a valid amount");
    }
    
    // Check if trying to send to own address
    const sender = await signer.getAddress();
    if (to.toLowerCase() === sender.toLowerCase()) {
      throw new Error("You cannot transfer tokens to yourself");
    }
    
    // Convert token amount to wei (18 decimals)
    const tokenAmount = ethers.utils.parseUnits(gcAmount.toString(), 18);
    
    // Call the transfer function
    const tx = await gymCoinContract.transfer(to, tokenAmount);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    return {
      hash: tx.hash,
      receipt: receipt,
      to: to,
      tokenAmount: gcAmount
    };
  } catch (error) {
    console.error("Error transferring tokens:", error);
    
    // Format error message for better user understanding
    if (error.code === 'ACTION_REJECTED') {
      throw new Error("Transaction rejected by user");
    } else if (error.message.includes("ERC20: insufficient allowance")) {
      throw new Error("Insufficient allowance for transfer");
    } else if (error.message.includes("ERC20: transfer amount exceeds balance")) {
      throw new Error("Insufficient token balance for this transfer");
    } else {
      throw new Error(error.message || "Transfer failed");
    }
  }
};

// Get sellRate (how many GC you get for 1 ETH)
export const getSellRate = async () => {
  if (typeof window === 'undefined' || !window.ethereum) return '0';
  
  if (!gymCoinContract) {
    try {
      await initializeWeb3();
    } catch (error) {
      return '0';
    }
  }
  
  try {
    // Check if contract is properly initialized
    if (!gymCoinContract || !gymCoinContract.sellRate) {
      throw new Error("GymCoin contract not properly initialized");
    }
    
    const rate = await gymCoinContract.sellRate();
    return ethers.utils.formatUnits(rate, 18);
  } catch (error) {
    console.error("Error getting sell rate:", error);
    return '0';
  }
};

// Get buyRate (how much ETH you get for 1 GC)
export const getBuyRate = async () => {
  if (typeof window === 'undefined' || !window.ethereum) return '0';
  
  if (!gymCoinContract) {
    try {
      await initializeWeb3();
    } catch (error) {
      return '0';
    }
  }
  
  try {
    // Check if contract is properly initialized
    if (!gymCoinContract || !gymCoinContract.buyRate) {
      throw new Error("GymCoin contract not properly initialized");
    }
    
    const rate = await gymCoinContract.buyRate();
    return ethers.utils.formatUnits(rate, 18);
  } catch (error) {
    console.error("Error getting buy rate:", error);
    return '0';
  }
};

// Check if a wallet is the contract owner
export const isContractOwner = async (address) => {
  if (typeof window === 'undefined' || !window.ethereum) return false;
  
  if (!gymCoinContract) {
    try {
      await initializeWeb3();
    } catch (error) {
      return false;
    }
  }
  
  try {
    // Check if contract is properly initialized
    if (!gymCoinContract || !gymCoinContract.owner) {
      throw new Error("GymCoin contract not properly initialized");
    }
    
    const owner = await gymCoinContract.owner();
    return owner.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error("Error checking contract owner:", error);
    return false;
  }
};

// Set exchange rates (only callable by owner)
export const setExchangeRates = async (sellRate, buyRate) => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error("MetaMask not installed");
  }
  
  if (!gymCoinContract) {
    try {
      await initializeWeb3();
    } catch (error) {
      throw new Error("Failed to initialize Web3");
    }
  }
  
  try {
    // Check if contract is properly initialized
    if (!gymCoinContract || !gymCoinContract.setRates) {
      throw new Error("GymCoin contract not properly initialized");
    }
    
    // Validate input
    if (!sellRate || parseFloat(sellRate) <= 0 || !buyRate || parseFloat(buyRate) <= 0) {
      throw new Error("Please enter valid rates");
    }
    
    // Convert rates to wei format
    const sellRateWei = ethers.utils.parseUnits(sellRate.toString(), 18);
    const buyRateWei = ethers.utils.parseUnits(buyRate.toString(), 18);
    
    // Call the setRates function
    const tx = await gymCoinContract.setRates(sellRateWei, buyRateWei);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    return {
      hash: tx.hash,
      receipt: receipt,
      sellRate: sellRate,
      buyRate: buyRate
    };
  } catch (error) {
    console.error("Error setting rates:", error);
    
    // Format error message for better user understanding
    if (error.code === 'ACTION_REJECTED') {
      throw new Error("Transaction rejected by user");
    } else if (error.message.includes("Ownable: caller is not the owner")) {
      throw new Error("Only the contract owner can update exchange rates");
    } else {
      throw new Error(error.message || "Failed to update rates");
    }
  }
};

// Get contract addresses
export const getContractAddresses = () => {
  return {
    userProfile: contractAddresses.userProfile || '',
    gymCoin: contractAddresses.gymCoin || ''
  };
};

// Utility function to check if MetaMask is installed
export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && window.ethereum !== undefined;
};

// Utility function to format large numbers with commas
export const formatLargeNumber = (num) => {
  if (!num) return '0';
  return parseFloat(num).toLocaleString('en-US', {
    maximumFractionDigits: 2
  });
};