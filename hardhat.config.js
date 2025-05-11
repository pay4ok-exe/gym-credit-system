require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/0q3z9nta2kADdsXZBcxQ-8egVBnJd3GF";

// Этот скрипт будет копировать артефакты в папку frontend
const copyArtifacts = () => {
  const fs = require("fs");
  const path = require("path");
  
  // Проверка наличия директории
  if (!fs.existsSync("./artifacts")) {
    console.log("Директория артефактов не найдена!");
    return;
  }
  
  // Создаем папку frontend/artifacts если необходимо
  if (!fs.existsSync("./frontend/artifacts")) {
    fs.mkdirSync("./frontend/artifacts", { recursive: true });
  }
  
  // Копируем артефакты
  fs.cpSync("./artifacts", "./frontend/artifacts", { recursive: true });
  console.log("Артефакты скопированы в frontend/artifacts");
};

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
  },
  paths: {
    artifacts: "./artifacts",
  },
  // Хук, который вызывается после компиляции
  hooks: {
    // Копируем артефакты в папку frontend после компиляции
    afterCompile: copyArtifacts
  }
};