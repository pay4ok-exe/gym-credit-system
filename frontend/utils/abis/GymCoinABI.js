// frontend/utils/abis/GymCoinABI.js
export const GymCoinABI = [
    "function buy(uint256 gcAmount) public payable",
    "function sell(uint256 gcAmount) public",
    "function setRates(uint256 _sellRate, uint256 _buyRate) public",
    "function balanceOf(address account) public view returns (uint256)",
    "function sellRate() public view returns (uint256)",
    "function buyRate() public view returns (uint256)",
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function owner() public view returns (address)"
  ];