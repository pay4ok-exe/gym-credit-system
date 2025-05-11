// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract UserProfile is Ownable {
    struct User {
        string username;
        string email;
        bool isRegistered;
    }
    
    mapping(address => User) private users;
    
    event UserRegistered(address indexed userAddress, string username, string email);
    
    constructor() Ownable(msg.sender) {}
    
    function registerUser(string memory _username, string memory _email) public {
        require(!users[msg.sender].isRegistered, "User already registered");
        
        users[msg.sender] = User({
            username: _username,
            email: _email,
            isRegistered: true
        });
        
        emit UserRegistered(msg.sender, _username, _email);
    }
    
    function getUserInfo(address userAddress) public view returns (string memory username, string memory email, bool isRegistered) {
        User memory user = users[userAddress];
        return (user.username, user.email, user.isRegistered);
    }
    
    function isUserRegistered(address userAddress) public view returns (bool) {
        return users[userAddress].isRegistered;
    }
}