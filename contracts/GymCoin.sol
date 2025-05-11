// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./UserProfile.sol";

contract GymCoin is ERC20, Ownable {
    UserProfile private userProfile;
    uint256 public sellRate; // How many GC you get for 1 ETH
    uint256 public buyRate;  // How much ETH you get for 1 GC
    
    event RatesUpdated(uint256 newSellRate, uint256 newBuyRate);
    event TokensPurchased(address indexed buyer, uint256 ethAmount, uint256 tokenAmount);
    event TokensSold(address indexed seller, uint256 tokenAmount, uint256 ethAmount);
    
    constructor(address _userProfileAddress) ERC20("Gym Coin", "GC") Ownable(msg.sender) {
        userProfile = UserProfile(_userProfileAddress);
        sellRate = 100; // 100 GC per 1 ETH
        buyRate = 200;  // 1 ETH per 200 GC (lesser value for selling back)
        
        // Mint initial tokens to the contract owner
        _mint(msg.sender, 1000000 * 10**decimals());
    }
    
    function buy(uint256 gcAmount) public payable {
        require(gcAmount > 0, "Amount must be greater than 0");
        require(userProfile.isUserRegistered(msg.sender), "User not registered");
        
        uint256 ethRequired = (gcAmount * 10**18) / sellRate;
        require(msg.value >= ethRequired, "Insufficient ETH sent");
        
        address owner = owner();
        require(balanceOf(owner) >= gcAmount, "Owner has insufficient tokens");
        
        // Transfer tokens from owner to buyer
        _transfer(owner, msg.sender, gcAmount);
        
        // Refund excess ETH if any
        if (msg.value > ethRequired) {
            payable(msg.sender).transfer(msg.value - ethRequired);
        }
        
        emit TokensPurchased(msg.sender, ethRequired, gcAmount);
    }
    
    function sell(uint256 gcAmount) public {
        require(gcAmount > 0, "Amount must be greater than 0");
        require(userProfile.isUserRegistered(msg.sender), "User not registered");
        require(balanceOf(msg.sender) >= gcAmount, "Insufficient token balance");
        
        uint256 ethAmount = (gcAmount * 10**18) / buyRate;
        require(address(this).balance >= ethAmount, "Contract has insufficient ETH");
        
        // Transfer tokens from seller to owner
        _transfer(msg.sender, owner(), gcAmount);
        
        // Transfer ETH to seller
        payable(msg.sender).transfer(ethAmount);
        
        emit TokensSold(msg.sender, gcAmount, ethAmount);
    }
    
    function setRates(uint256 _sellRate, uint256 _buyRate) public onlyOwner {
        require(_sellRate > 0 && _buyRate > 0, "Rates must be greater than 0");
        sellRate = _sellRate;
        buyRate = _buyRate;
        
        emit RatesUpdated(_sellRate, _buyRate);
    }
    
    // Allow the contract to receive ETH
    receive() external payable {}
}