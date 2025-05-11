const { ethers } = require("hardhat");

async function main() {
  // Получаем адрес контракта GymCoin из contractAddresses.json
  const fs = require("fs");
  const contractAddresses = JSON.parse(
    fs.readFileSync("./frontend/utils/contractAddresses.json", "utf8")
  );

  // Подключаемся к контракту
  const gymCoinAddress = contractAddresses.gymCoin;
  console.log("Подключение к GymCoin по адресу:", gymCoinAddress);
  
  const GymCoin = await ethers.getContractFactory("GymCoin");
  const gymCoin = await GymCoin.attach(gymCoinAddress);

  // Определение функций parseUnits и formatUnits в зависимости от версии ethers
  const parseUnitsFunc = ethers.utils ? ethers.utils.parseUnits : ethers.parseUnits;
  const formatUnitsFunc = ethers.utils ? ethers.utils.formatUnits : ethers.formatUnits;
  
  // Устанавливаем курсы обмена
  const sellRate = parseUnitsFunc("100", 18); // 100 GC за 1 ETH
  const buyRate = parseUnitsFunc("200", 18);  // 200 GC за 1 ETH
  
  console.log("Установка курсов обмена: продажа GC =", sellRate.toString(), ", покупка GC =", buyRate.toString());
  const tx = await gymCoin.setRates(sellRate, buyRate);
  await tx.wait();
  
  console.log("Транзакция подтверждена:", tx.hash);
  console.log("Курсы обмена успешно установлены!");
  console.log("Продажа GC (Buy Rate): 100 GC/ETH");
  console.log("Покупка GC (Sell Rate): 200 GC/ETH");
  
  // Проверка установленных курсов
  const newSellRate = await gymCoin.sellRate();
  const newBuyRate = await gymCoin.buyRate();
  console.log("Проверка курсов: продажа GC =", formatUnitsFunc(newSellRate, 18), "GC/ETH, покупка GC =", formatUnitsFunc(newBuyRate, 18), "GC/ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Ошибка:", error);
    process.exit(1);
  });