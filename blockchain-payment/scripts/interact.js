const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    // Try to read the contract address from frontend/.env
    let lockAddress = process.env.LOCK_ADDRESS || process.env.VITE_LOCK_ADDRESS;

    if (!lockAddress) {
        try {
            const envPath = path.join(__dirname, "..", "frontend", ".env");
            const envContent = fs.readFileSync(envPath, "utf8");
            const match = envContent.match(/VITE_LOCK_ADDRESS=(.+)/);
            if (match) {
                lockAddress = match[1].trim();
                console.log(`Using contract address from frontend/.env: ${lockAddress}`);
            }
        } catch (err) {
            console.log("Could not read frontend/.env, using default address");
            lockAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        }
    }

    console.log(`Connecting to Lock contract at: ${lockAddress}`);
    // Verify there's contract bytecode at the provided address before calling functions
    const code = await hre.ethers.provider.getCode(lockAddress);
    if (!code || code === "0x" || code === "0x0") {
        console.error(`No contract deployed at address ${lockAddress}. Make sure the contract is deployed to the configured network and frontend/.env has the correct address.`);
        process.exit(1);
    }

    const Lock = await hre.ethers.getContractAt("Lock", lockAddress);

    const [user] = await hre.ethers.getSigners();
    const userAddress = await user.getAddress();
    console.log(`Using account: ${userAddress}`);

    // Deposit 1 ETH for self, unlock in 1 minute
    const unlockTime = Math.floor(Date.now() / 1000) + 60;
    console.log(`Depositing 1 ETH, unlock time: ${new Date(unlockTime * 1000).toLocaleString()}`);

    let tx = await Lock.connect(user).deposit(userAddress, unlockTime, { value: hre.ethers.parseEther("1") });
    await tx.wait();
    console.log("✅ Deposited 1 ETH for 1 minute");

    // Show current locks
    console.log("\nFetching locks...");
    const locks = await Lock.getLocks(userAddress);
    console.log(`\nTotal locks: ${locks.length}`);

    locks.forEach((lock, index) => {
        console.log(`\nLock #${index + 1}:`);
        console.log(`  From: ${lock.sender}`);
        console.log(`  To: ${lock.recipient}`);
        console.log(`  Amount: ${hre.ethers.formatEther(lock.amount)} ETH`);
        console.log(`  Unlock Time: ${new Date(Number(lock.unlockTime) * 1000).toLocaleString()}`);
        console.log(`  Withdrawn: ${lock.withdrawn}`);
    });
}

main()
  .then(() => process.exit(0))
  .catch(err => {
      console.error(err);
      process.exit(1);
  });
