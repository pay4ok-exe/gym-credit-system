// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  console.log("Начинаем развертывание контрактов...");

  // Deploy UserProfile contract
  const UserProfile = await ethers.getContractFactory("UserProfile");
  const userProfile = await UserProfile.deploy();
  
  // Ждем, пока контракт будет действительно развернут
  await userProfile.deployTransaction.wait();
  console.log("UserProfile deployed to:", userProfile.address);

  // Deploy GymCoin contract
  const GymCoin = await ethers.getContractFactory("GymCoin");
  const gymCoin = await GymCoin.deploy(userProfile.address);
  
  // Ждем, пока контракт будет действительно развернут
  await gymCoin.deployTransaction.wait();
  console.log("GymCoin deployed to:", gymCoin.address);

  // Save the contract addresses
  const fs = require("fs");
  const contractAddresses = {
    userProfile: userProfile.address,
    gymCoin: gymCoin.address,
  };

  // Ensure the directory exists
  if (!fs.existsSync("./frontend/utils")) {
    fs.mkdirSync("./frontend/utils", { recursive: true });
  }

  fs.writeFileSync(
    "./frontend/utils/contractAddresses.json",
    JSON.stringify(contractAddresses, null, 2)
  );
  console.log("Contract addresses saved to frontend/utils/contractAddresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });