# Gym Credit Token System

A decentralized blockchain solution for gym membership credits management. Built with Solidity smart contracts and a modern Next.js frontend.

## Project Overview

This project implements a decentralized system for managing gym credits across multiple gym locations. It consists of:

1. **Smart Contracts**:
   - `UserProfile.sol`: Handles user registration and profile management
   - `GymCoin.sol`: ERC-20 token implementation with buy/sell/transfer functionality

2. **Frontend Application**:
   - Modern UI built with Next.js and Tailwind CSS
   - Responsive design using shadcn/ui components
   - MetaMask integration for wallet connection
   - Comprehensive dashboard for managing tokens

## Features

- **User Registration**: Register with username and email to use the system
- **Buy/Sell Tokens**: Exchange ETH for GC tokens at configurable rates
- **Transfer Tokens**: Send GC tokens to other registered users
- **Transaction History**: View past transactions in a clean UI
- **Admin Panel**: Special controls for the contract owner (set exchange rates)
- **Real-time Notifications**: Toast notifications for transaction updates

## Technology Stack

- **Blockchain**: Ethereum (Sepolia Testnet)
- **Smart Contracts**: Solidity, OpenZeppelin
- **Frontend**: Next.js, React, Tailwind CSS
- **UI Components**: shadcn/ui
- **Web3 Integration**: ethers.js
- **Development**: Hardhat

## Getting Started

### Prerequisites

- Node.js (v16+)
- MetaMask browser extension
- Sepolia testnet ETH (from faucets)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/gym-credit-token-system.git
   cd gym-credit-token-system
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Setup environment variables:
   - Copy `.env.example` to `.env`
   - Add your Sepolia RPC URL and private key

4. Deploy contracts:
   ```
   npx hardhat run scripts/deploy.js --network sepolia
   ```

5. Start the frontend:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage Flow

1. **Connect Wallet**: Connect your MetaMask wallet to the application
2. **Register Profile**: Create a user profile with username and email
3. **Buy GC Tokens**: Purchase tokens using ETH
4. **Use Tokens**: Transfer tokens to other users or sell them back for ETH

## Smart Contract Details

### UserProfile Contract

- `registerUser(string memory _username, string memory _email)`: Register a new user
- `getUserInfo(address userAddress)`: Get user profile information
- `isUserRegistered(address userAddress)`: Check if a user is registered

### GymCoin Contract (ERC-20)

- `buy(uint256 gcAmount)`: Buy GC tokens with ETH
- `sell(uint256 gcAmount)`: Sell GC tokens for ETH
- `transfer(address to, uint256 gcAmount)`: Transfer GC tokens to another user
- `setRates(uint256 sellRate, uint256 buyRate)`: Set exchange rates (owner only)

## Frontend Components

- **Navbar**: Wallet connection and navigation
- **UserProfile**: User registration and profile display
- **BuySellTokens**: Interface for buying and selling tokens
- **TransferTokens**: Interface for transferring tokens to other users
- **TransactionHistory**: Display of past transactions
- **AdminPanel**: Management interface for contract owner

## Security Considerations

- Smart contracts include checks to prevent common vulnerabilities
- Users can only transfer tokens they own
- Only the contract owner can update exchange rates
- Client-side validation for all inputs

## Testing

```
npx hardhat test
```

## Deployment

The contracts are deployed on the Sepolia testnet. The contract addresses are:

- UserProfile: [Address to be updated after deployment]
- GymCoin: [Address to be updated after deployment]

## License

This project is licensed under the MIT License - see the LICENSE file for details.