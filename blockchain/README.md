# 🔗 GrassRoots Blockchain Payment System

This folder contains the smart contracts and deployment scripts for the GrassRoots blockchain payment system.

## 📁 Contents

- **Payment.sol** - Smart contract for processing payments
- **deploy.js** - Deployment script
- **hardhat.config.js** - Hardhat configuration
- **start-blockchain.ps1** - Quick start script (Windows)
- **deploy-contract.ps1** - Deployment script (Windows)

## 🚀 Quick Start (Windows)

### Step 1: Start Blockchain

Open PowerShell in this folder and run:

```powershell
.\start-blockchain.ps1
```

Keep this terminal open!

### Step 2: Deploy Contract

Open a **NEW** PowerShell window in this folder and run:

```powershell
.\deploy-contract.ps1
```

Copy the contract address from the output.

### Step 3: Update Frontend

1. Open `frontend/blockchain-payment.html`
2. Find line ~273: `const CONTRACT_ADDRESS = "0x5FbDB...";`
3. Replace with your contract address
4. Save the file

## 🚀 Quick Start (Mac/Linux)

### Step 1: Start Blockchain

```bash
npx hardhat node
```

Keep this terminal open!

### Step 2: Deploy Contract

In a new terminal:

```bash
npx hardhat run deploy.js --network localhost
```

## 📜 Smart Contract

The Payment contract is simple and secure:

```solidity
contract Payment {
    event PaymentReceived(address indexed payer, uint256 amount, string orderId);

    function pay(string calldata orderId) external payable {
        require(msg.value > 0, "Payment must be greater than 0");
        emit PaymentReceived(msg.sender, msg.value, orderId);
    }
}
```

### Features:
- ✅ Accepts ETH payments
- ✅ Records payer address
- ✅ Emits events for tracking
- ✅ Validates payment amount
- ✅ Links payment to order ID

## 🧪 Testing

### Manual Testing

1. Start blockchain: `npx hardhat node`
2. Deploy contract: `npx hardhat run deploy.js --network localhost`
3. Open http://localhost:4000/retailer-payments.html
4. Click "Pay with Blockchain" on any order
5. Connect MetaMask and confirm payment

### Test Accounts

Hardhat provides 20 test accounts with 10000 ETH each:

**Account #0:**
- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

## 🦊 MetaMask Setup

### Add Localhost Network

1. Open MetaMask
2. Click network dropdown
3. Add network manually:
   - **Network Name:** Localhost 8545
   - **RPC URL:** http://127.0.0.1:8545
   - **Chain ID:** 31337
   - **Currency Symbol:** ETH

### Import Test Account

1. Click account icon → Import Account
2. Paste private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
3. You'll see 10000 ETH!

## 🔧 Commands

```powershell
# Install dependencies
npm install

# Start local blockchain
npx hardhat node

# Compile contracts
npx hardhat compile

# Deploy to localhost
npx hardhat run deploy.js --network localhost

# Deploy to Sepolia testnet
npx hardhat run deploy.js --network sepolia

# Clean artifacts
npx hardhat clean
```

## 📊 Network Configuration

### Localhost (Development)
- RPC URL: http://127.0.0.1:8545
- Chain ID: 31337
- Currency: ETH
- Block Time: Instant

### Sepolia (Testnet)
- RPC URL: https://sepolia.infura.io/v3/...
- Chain ID: 11155111
- Currency: SepoliaETH
- Faucet: https://sepoliafaucet.com/

## 🐛 Troubleshooting

### "Cannot connect to blockchain"
- Make sure `npx hardhat node` is running
- Check that MetaMask is on "Localhost 8545"
- Verify RPC URL is http://127.0.0.1:8545

### "Transaction failed"
- Ensure you have enough ETH
- Check contract address is correct
- Try restarting Hardhat node

### "Port 8545 already in use"
- Stop existing Hardhat node
- Or kill process: `Get-Process -Id (Get-NetTCPConnection -LocalPort 8545).OwningProcess | Stop-Process`

## 📚 Learn More

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [MetaMask Documentation](https://docs.metamask.io/)

## 🔐 Security Notes

⚠️ **IMPORTANT:**
- Never commit private keys to Git
- Test accounts are for development only
- Use environment variables for production
- Audit contracts before mainnet deployment

## 📝 License

MIT

