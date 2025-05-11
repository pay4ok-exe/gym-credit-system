// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  console.log("Начинаем развертывание контрактов...");

  // Deploy UserProfile contract
  const UserProfile = await ethers.getContractFactory("UserProfile");
  const userProfile = await UserProfile.deploy();
  
  // Ждем, пока контракт будет действительно развернут
  await userProfile.waitForDeployment();
  console.log("UserProfile deployed to:", await userProfile.getAddress());

  // Deploy GymCoin contract
  const GymCoin = await ethers.getContractFactory("GymCoin");
  const gymCoin = await GymCoin.deploy(await userProfile.getAddress());
  
  // Ждем, пока контракт будет действительно развернут
  await gymCoin.waitForDeployment();
  console.log("GymCoin deployed to:", await gymCoin.getAddress());

  // Save the contract addresses
  const fs = require("fs");
  const contractAddresses = {
    userProfile: await userProfile.getAddress(),
    gymCoin: await gymCoin.getAddress(),
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