const hre = require("hardhat");

async function main() {
    const Lock = await hre.ethers.getContractFactory("Lock");
    const lock = await Lock.deploy();
    // ethers v6: waitForDeployment replaces deployed()
    if (typeof lock.waitForDeployment === "function") {
        await lock.waitForDeployment();
    }

    // Resolve address across ethers versions
    let addr = null;
    if (typeof lock.getAddress === "function") {
        addr = await lock.getAddress();
    } else if (lock.address) {
        addr = lock.address;
    } else if (lock.target) {
        addr = lock.target;
    }

    console.log("Lock deployed at:", addr);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
      console.error(err);
      process.exit(1);
  });
