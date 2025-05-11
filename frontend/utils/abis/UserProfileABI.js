export const UserProfileABI = [
    "function registerUser(string memory _username, string memory _email) public",
    "function getUserInfo(address userAddress) public view returns (string memory username, string memory email, bool isRegistered)",
    "function isUserRegistered(address userAddress) public view returns (bool)",
    "function owner() public view returns (address)"
  ];
  