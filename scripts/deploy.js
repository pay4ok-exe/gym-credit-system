// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  // Deploy UserProfile contract
  const UserProfile = await hre.ethers.getContractFactory("UserProfile");
  const userProfile = await UserProfile.deploy();
  await userProfile.deployed();
  console.log("UserProfile deployed to:", userProfile.address);

  // Deploy GymCoin contract
  const GymCoin = await hre.ethers.getContractFactory("GymCoin");
  const gymCoin = await GymCoin.deploy(userProfile.address);
  await gymCoin.deployed();
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