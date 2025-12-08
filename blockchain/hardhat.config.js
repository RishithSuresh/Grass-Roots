require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/517956bbe21b46928f30138a28ab9373",
      accounts: ["fsQYJ2AMI+Gr88AbUP41zMMqGviXAbsU0vJ+S5pMX7LEowHS8bREgw"]
    }
  }
};
