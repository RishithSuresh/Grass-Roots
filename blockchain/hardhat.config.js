require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    hardhat: {
      chainId: 31337
    }
    // Sepolia testnet configuration (commented out - add your own private key)
    // sepolia: {
    //   url: "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID",
    //   accounts: ["YOUR_PRIVATE_KEY_HERE"]
    // }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
