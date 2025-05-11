const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Gym Token System", function () {
  let UserProfile;
  let userProfile;
  let GymCoin;
  let gymCoin;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Разворачиваем контракты перед каждым тестом
    [owner, addr1, addr2] = await ethers.getSigners();

    // Разворачиваем UserProfile
    UserProfile = await ethers.getContractFactory("UserProfile");
    userProfile = await UserProfile.deploy();
    await userProfile.deployed();

    // Разворачиваем GymCoin, передавая адрес UserProfile
    GymCoin = await ethers.getContractFactory("GymCoin");
    gymCoin = await GymCoin.deploy(userProfile.address);
    await gymCoin.deployed();
  });

  describe("Развертывание", function () {
    it("Должно установить правильного владельца", async function () {
      expect(await userProfile.owner()).to.equal(owner.address);
      expect(await gymCoin.owner()).to.equal(owner.address);
    });

    it("Владелец должен получить начальные токены", async function () {
      const ownerBalance = await gymCoin.balanceOf(owner.address);
      expect(ownerBalance).to.equal(ethers.utils.parseEther("1000000"));
    });
  });

  describe("Регистрация пользователей", function () {
    it("Должно регистрировать нового пользователя", async function () {
      await userProfile.connect(addr1).registerUser("testuser", "test@example.com");
      const [username, email, isRegistered] = await userProfile.getUserInfo(addr1.address);
      
      expect(username).to.equal("testuser");
      expect(email).to.equal("test@example.com");
      expect(isRegistered).to.equal(true);
    });

    it("Не должно регистрировать уже зарегистрированного пользователя", async function () {
      await userProfile.connect(addr1).registerUser("testuser", "test@example.com");
      
      await expect(
        userProfile.connect(addr1).registerUser("newuser", "new@example.com")
      ).to.be.revertedWith("User already registered");
    });
  });

  describe("Покупка и продажа токенов", function () {
    beforeEach(async function () {
      // Регистрируем пользователя перед тестами
      await userProfile.connect(addr1).registerUser("testuser", "test@example.com");
    });

    it("Пользователь должен иметь возможность покупать токены", async function () {
      // Покупка 100 токенов
      const gcAmount = ethers.utils.parseEther("100");
      const ethAmount = ethers.utils.parseEther("1"); // 1 ETH
      
      await gymCoin.connect(addr1).buy(gcAmount, { value: ethAmount });
      
      const balance = await gymCoin.balanceOf(addr1.address);
      expect(balance).to.equal(gcAmount);
    });

    it("Пользователь должен иметь возможность продавать токены", async function () {
      // Сначала покупаем токены
      const gcAmount = ethers.utils.parseEther("100");
      const ethAmount = ethers.utils.parseEther("1"); // 1 ETH
      
      await gymCoin.connect(addr1).buy(gcAmount, { value: ethAmount });
      
      // Затем владелец контракта добавляет ETH для покупки обратно
      await owner.sendTransaction({
        to: gymCoin.address,
        value: ethers.utils.parseEther("0.5")
      });
      
      // Продаем половину токенов
      const sellAmount = ethers.utils.parseEther("50");
      await gymCoin.connect(addr1).sell(sellAmount);
      
      const balance = await gymCoin.balanceOf(addr1.address);
      expect(balance).to.equal(ethers.utils.parseEther("50"));
    });
  });
});