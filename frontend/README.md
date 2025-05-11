# Gym Credit Token System

A blockchain-based solution for managing gym memberships and usage credits across multiple locations. This project implements a decentralized system using Ethereum smart contracts and a modern web interface.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Smart Contracts](#smart-contracts)
- [Frontend Application](#frontend-application)
- [Setup and Installation](#setup-and-installation)
- [Usage Guide](#usage-guide)
- [Common Issues & Troubleshooting](#common-issues--troubleshooting)
- [Development Notes](#development-notes)

## Project Overview

The Gym Credit Token System allows gym networks to offer a "Gym Anywhere" experience, where members can use their credits at any branch in the network. The system uses blockchain technology to ensure transparency, security, and fair usage of gym credits.

Key goals of the system:
- Give users freedom to access any gym in the network
- Ensure transparency and prevent misuse of credits
- Allow users to earn, buy, or transfer gym credits securely
- Create a tamper-proof system that can't be manipulated, even by gym owners

## Features

- **User Registration**: Register with username and email to use the system
- **Wallet Integration**: Connect with MetaMask wallet for secure transactions
- **Buy/Sell Tokens**: Exchange ETH for GC tokens at configurable rates
- **Transfer Tokens**: Send GC tokens to other registered users
- **User Profiles**: View and manage user information and token balances
- **Admin Panel**: Special controls for the contract owner (set exchange rates)

## Technology Stack

### Blockchain
- **Network**: Ethereum (Hardhat Local/Sepolia Testnet)
- **Smart Contracts**: Solidity (v0.8.20)
- **Contract Framework**: OpenZeppelin
- **Development Environment**: Hardhat

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Web3 Integration**: ethers.js (v5.7.2)
- **State Management**: React Hooks
- **Notifications**: Sonner

## Smart Contracts

The project consists of two main smart contracts:

### UserProfile.sol
Handles user registration and profile management:

```solidity
// Key functions:
function registerUser(string memory _username, string memory _email) public
function getUserInfo(address userAddress) public view returns (string memory username, string memory email, bool isRegistered)
function isUserRegistered(address userAddress) public view returns (bool)
```

### GymCoin.sol
ERC-20 token implementation with buy/sell functionality:

```solidity
// Key functions:
function buy(uint256 gcAmount) public payable
function sell(uint256 gcAmount) public
function transfer(address to, uint256 amount) public returns (bool)
function setRates(uint256 sellRate, uint256 buyRate) public onlyOwner
```

## Frontend Application

The frontend consists of several key components:

1. **Home Page**: Introduction to the system and its features
2. **Dashboard**: Main interface for users to interact with the system
3. **User Profile**: Display and manage user information
4. **Buy/Sell Tokens**: Interface for token transactions
5. **Transfer Tokens**: Send tokens to other users
6. **Transaction History**: View past transactions
7. **Admin Panel**: Management interface for the contract owner

## Setup and Installation

### Prerequisites

- Node.js (v16+)
- MetaMask browser extension
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/pay4ok-exe/gym-credit-token-system.git
   cd gym-credit-token-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start a local Hardhat node**
   ```bash
   npx hardhat node
   ```

4. **Deploy contracts to local network**
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

5. **Set initial exchange rates**
   ```bash
   npx hardhat run scripts/set-rates.js --network localhost
   ```

6. **Start the frontend application**
   ```bash
   cd frontend
   npm run dev
   ```

7. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

### MetaMask Configuration

1. Add Hardhat Local Network to MetaMask:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545/
   - Chain ID: 31337
   - Currency Symbol: ETH

2. Import a test account using the private key from your Hardhat node output

## Usage Guide

### Connecting Your Wallet

1. Click "Connect Wallet" in the navigation bar
2. Approve the MetaMask connection
3. Ensure you're connected to the Hardhat Local network

### User Registration

1. Navigate to the Dashboard
2. Fill in your username and email
3. Click "Register Account"

### Getting Test Tokens

For testing purposes, you can get tokens in two ways:

1. **Using the "Get Test Tokens" button**:
   - Go to your user profile
   - Click the "Get 1000 GC" button
   - Approve the transaction in MetaMask

2. **Buying tokens with ETH**:
   - Go to the Buy/Sell tab
   - Enter the amount of GC you want to buy
   - Click "Buy GC Tokens"
   - Approve the transaction in MetaMask

### Transferring Tokens

1. Go to the Transfer section
2. Enter the recipient's Ethereum address
3. Enter the amount to transfer
4. Click "Transfer Tokens"
5. Approve the transaction in MetaMask

### Admin Functions

If you're the contract owner:

1. Navigate to the Admin panel
2. Update exchange rates as needed
3. View contract information

## Common Issues & Troubleshooting

### Wallet Connection Issues

**Problem**: Wallet disconnects between page navigations
**Solution**: The application uses localStorage to remember connection state. Clear browser cache or reload if issues persist.

### Token Balance Shows 0

**Problem**: GC token balance shows 0 after registration
**Solution**: Use the "Get 1000 GC" button to request test tokens, or buy tokens using the Buy/Sell interface.

### Network Error

**Problem**: "Wrong network" warning
**Solution**: Switch to Hardhat Local network in MetaMask (Chain ID: 31337)

### Transaction Errors

**Problem**: Transactions fail with "User not registered" error
**Solution**: Make sure to register a user profile before attempting transactions

### Common MetaMask Errors

**Problem**: "Insufficient funds for gas"
**Solution**: Make sure your MetaMask account has enough ETH for gas fees

## Development Notes

### Smart Contract Modifications

When modifying smart contracts:

1. Update the contract code
2. Recompile and deploy:
   ```bash
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network localhost
   ```
3. Update ABI if you've changed function signatures

### Frontend Development

The frontend uses Next.js with app router:

- `frontend/app/page.jsx`: Home page
- `frontend/app/dashboard/page.jsx`: Dashboard
- `frontend/components/`: UI components

### Testing

Run contract tests:
```bash
npx hardhat test
```

### Deployment to Testnet

To deploy to Sepolia testnet:
1. Configure `.env` with your Sepolia RPC URL and private key
2. Run deployment script:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```
3. Update frontend to use Sepolia network

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.