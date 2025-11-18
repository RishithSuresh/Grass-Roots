const hre = require("hardhat");

async function main() {
  const Payment = await hre.ethers.getContractFactory("Payment");
  const payment = await Payment.deploy();
  await payment.deployed();
  console.log("Payment contract deployed to:", payment.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
