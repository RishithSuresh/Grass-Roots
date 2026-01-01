const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Payment contract...\n");

  const Payment = await hre.ethers.getContractFactory("Payment");
  const payment = await Payment.deploy();

  // Wait for deployment
  await payment.deployed();

  console.log("✅ Payment contract deployed to:", payment.address);
  console.log("\n📋 Next steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Update CONTRACT_ADDRESS in frontend/blockchain-payment.html");
  console.log("3. Install MetaMask and connect to localhost:8545");
  console.log("4. Import a test account from Hardhat node output");
  console.log("\n💡 Test account private key (from Hardhat):");
  console.log("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
