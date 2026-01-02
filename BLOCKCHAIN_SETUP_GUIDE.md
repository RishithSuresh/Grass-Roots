# 🔗 Blockchain Payment Setup Guide

## Quick Start (5 Minutes)

### Option 1: Demo Mode (No Setup Required)
The blockchain payment page now includes a **demo mode** that simulates blockchain payments without requiring any setup. This is perfect for testing the UI and payment flow.

When you click "Connect Wallet" and the blockchain is not available, you'll be prompted to use demo mode.

---

### Option 2: Full Blockchain Setup

Follow these steps to enable real blockchain payments:

## Step 1: Install MetaMask

1. Go to https://metamask.io/download/
2. Install the MetaMask browser extension
3. Create a new wallet or import an existing one
4. **Important:** Save your seed phrase securely!

## Step 2: Start Local Blockchain

Open a terminal in the `blockchain` folder:

```powershell
cd blockchain
npx hardhat node
```

You should see output like:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

**Keep this terminal running!**

## Step 3: Deploy Smart Contract

Open a **new terminal** in the `blockchain` folder:

```powershell
cd blockchain
npx hardhat run deploy.js --network localhost
```

You should see:
```
🚀 Deploying Payment contract...
✅ Payment contract deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**Copy the contract address!**

## Step 4: Update Frontend Configuration

1. Open `frontend/blockchain-payment.html`
2. Find line ~273: `const CONTRACT_ADDRESS = "0x5FbDB...";`
3. Replace with your deployed contract address
4. Save the file

## Step 5: Configure MetaMask

### Add Localhost Network:
1. Open MetaMask
2. Click the network dropdown (top center)
3. Click "Add Network" → "Add a network manually"
4. Enter these details:
   - **Network Name:** Localhost 8545
   - **RPC URL:** http://127.0.0.1:8545
   - **Chain ID:** 31337
   - **Currency Symbol:** ETH
5. Click "Save"

### Import Test Account:
1. In MetaMask, click the account icon (top right)
2. Click "Import Account"
3. Paste this private key:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
4. Click "Import"

You should now see **10000 ETH** in your test account! 🎉

## Step 6: Test Payment

1. Go to http://localhost:4000/retailer-payments.html
2. Click "Pay with Blockchain" on any unpaid order
3. Click "Connect Wallet"
4. MetaMask will pop up - click "Connect"
5. Click "Pay with Blockchain"
6. MetaMask will ask you to confirm - click "Confirm"
7. Wait for the transaction to complete
8. You'll be redirected back with a success message!

---

## Troubleshooting

### Error: "Cannot connect to blockchain"
- Make sure Hardhat node is running (`npx hardhat node`)
- Check that MetaMask is connected to "Localhost 8545"
- Verify the RPC URL is http://127.0.0.1:8545

### Error: "Transaction failed"
- Make sure you have enough ETH (test accounts start with 10000 ETH)
- Check that the contract address is correct
- Try refreshing the page and reconnecting

### Error: "MetaMask not detected"
- Install MetaMask browser extension
- Refresh the page after installation
- Or use demo mode for testing

### Hardhat node stopped working
- Stop the node (Ctrl+C)
- Restart: `npx hardhat node`
- Redeploy contract: `npx hardhat run deploy.js --network localhost`
- Update contract address in frontend

---

## Understanding the Payment Flow

1. **User clicks "Pay with Blockchain"** → Redirected to blockchain-payment.html
2. **Page checks blockchain availability** → Shows demo mode if not available
3. **User connects MetaMask** → Wallet address and balance displayed
4. **User confirms payment** → Smart contract transaction initiated
5. **Transaction mined** → Payment recorded on blockchain
6. **Order updated** → Database marked as paid
7. **User redirected** → Back to payments page with success message

---

## Smart Contract Details

**Contract:** Payment.sol
**Location:** `blockchain/Payment.sol`

```solidity
function pay(string calldata orderId) external payable {
    require(msg.value > 0, "Payment must be greater than 0");
    emit PaymentReceived(msg.sender, msg.value, orderId);
}
```

The contract:
- Accepts ETH payments
- Records the payer address
- Emits an event with order ID
- Stores payment on blockchain permanently

---

## Demo Mode vs Real Blockchain

| Feature | Demo Mode | Real Blockchain |
|---------|-----------|-----------------|
| Setup Required | ❌ None | ✅ Yes |
| MetaMask Needed | ❌ No | ✅ Yes |
| Real Transactions | ❌ No | ✅ Yes |
| Blockchain Record | ❌ No | ✅ Yes |
| Good for Testing UI | ✅ Yes | ✅ Yes |
| Good for Production | ❌ No | ✅ Yes |

---

## Next Steps

- ✅ Test payments in demo mode
- ✅ Set up local blockchain for development
- 🔄 Deploy to testnet (Sepolia) for staging
- 🔄 Deploy to mainnet for production

For production deployment, see `BLOCKCHAIN_PRODUCTION_DEPLOYMENT.md`

