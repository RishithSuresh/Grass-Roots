const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const TxReg = await hre.ethers.getContractFactory("TransactionRegistry");
  const deployed = await TxReg.deploy();
  await deployed.deployed();

  console.log("TransactionRegistry deployed to:", deployed.address);

  // Save address to file for the simulate script
  fs.writeFileSync("deployed_address.json", JSON.stringify({ address: deployed.address }, null, 2));
  console.log('Saved deployed_address.json');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
