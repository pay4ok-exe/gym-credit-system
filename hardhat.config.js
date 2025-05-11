require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// Функция для копирования артефактов в frontend
const copyArtifacts = () => {
  const fs = require("fs");
  const path = require("path");
  
  if (!fs.existsSync("./artifacts")) {
    console.log("Директория артефактов не найдена!");
    return;
  }
  
  if (!fs.existsSync("./frontend/artifacts")) {
    fs.mkdirSync("./frontend/artifacts", { recursive: true });
  }
  
  fs.cpSync("./artifacts", "./frontend/artifacts", { recursive: true });
  console.log("Артефакты скопированы в frontend/artifacts");
};

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/your-api-key",
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
  },
  defaultNetwork: "localhost", // Указываем локальную сеть по умолчанию
  paths: {
    artifacts: "./artifacts",
  },
  hooks: {
    afterCompile: copyArtifacts
  }
};