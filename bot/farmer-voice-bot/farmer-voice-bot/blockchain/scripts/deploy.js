const hre = require("hardhat");

async function main() {
  console.log("Deploying FarmerRecords contract...");

  const FarmerRecords = await hre.ethers.getContractFactory("FarmerRecords");
  const contract = await FarmerRecords.deploy();
  await contract.deployed();

  console.log(`✅ Contract deployed to: ${contract.address}`);
  console.log(`\nAdd this to your .env file:`);
  console.log(`CONTRACT_ADDRESS=${contract.address}`);

  // Wait for confirmations
  await contract.deployTransaction.wait(5);
  console.log("Deployment confirmed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
