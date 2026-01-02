# 🚀 Complete Setup Guide - TimeLock Vault

This guide will walk you through setting up and running the TimeLock Vault application from scratch.

## 📋 Prerequisites Checklist

Before you begin, ensure you have:

- ✅ Node.js v16 or higher installed ([Download](https://nodejs.org/))
- ✅ MetaMask browser extension installed ([Download](https://metamask.io/))
- ✅ A code editor (VS Code recommended)
- ✅ Terminal/Command Prompt access

## 🔧 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
# Install root project dependencies
npm install

# Navigate to frontend and install its dependencies
cd frontend
npm install
cd ..
```

### Step 2: Start Local Blockchain

Open a **new terminal window** and run:

```bash
npx hardhat node
```

**Important**: Keep this terminal running! It's your local blockchain.

You should see output like:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

**Save one of these private keys** - you'll need it for MetaMask!

### Step 3: Deploy Smart Contract

Open a **second terminal window** and run:

```bash
npm run deploy
```

You should see:
```
Lock deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**Copy this contract address!**

### Step 4: Configure Frontend

1. Open `frontend/.env` file
2. Update the contract address:

```env
VITE_LOCK_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_RPC_URL=http://127.0.0.1:8545
```

Replace `0x5FbDB2315678afecb367f032d93F642f64180aa3` with your deployed contract address.

### Step 5: Configure MetaMask

1. **Open MetaMask** in your browser
2. **Click the network dropdown** (usually shows "Ethereum Mainnet")
3. **Click "Add Network"** → **"Add a network manually"**
4. **Enter the following details**:
   - Network Name: `Hardhat Local`
   - New RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`
5. **Click "Save"**
6. **Switch to the Hardhat Local network**

### Step 6: Import Test Account

1. **Click the account icon** in MetaMask
2. **Select "Import Account"**
3. **Paste the private key** from Step 2 (e.g., `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`)
4. **Click "Import"**

You should now see 10000 ETH in your account!

### Step 7: Start Frontend

In a **third terminal window**, run:

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 8: Open Application

1. **Open your browser** and go to `http://localhost:5173`
2. **Click "Connect Wallet"**
3. **Approve the connection** in MetaMask
4. **You're ready to use the app!**

## 🎯 Using the Application

### Creating a Lock

1. Enter the amount of ETH you want to lock (e.g., `1`)
2. Enter the lock duration (e.g., `60`)
3. Select the time unit (Seconds, Minutes, Hours, or Days)
4. Click **"🔒 Lock ETH"**
5. Confirm the transaction in MetaMask
6. Wait for confirmation

### Viewing Your Locks

- Your locks appear in the "Your Locks" section
- Each lock shows:
  - Amount locked
  - Unlock time
  - Countdown timer
  - Current status (Locked/Unlocked/Withdrawn)

### Withdrawing Funds

1. Wait for the countdown to reach "Unlocked"
2. Click the **"💸 Withdraw"** button
3. Confirm the transaction in MetaMask
4. Your ETH will be returned to your wallet!

## 🧪 Running Tests

To verify everything works correctly:

```bash
npm test
```

All 6 tests should pass ✅

## 🐛 Troubleshooting

### "Please install MetaMask" error
- Make sure MetaMask extension is installed and enabled
- Refresh the page

### "Transaction failed" error
- Ensure you're connected to the Hardhat Local network
- Check that the contract address in `.env` is correct
- Make sure the Hardhat node is still running

### "Insufficient funds" error
- Make sure you imported the test account with 10000 ETH
- Check you're using the correct network in MetaMask

### Frontend won't load
- Check that `npm run dev` is running
- Try clearing browser cache
- Check browser console for errors

### Contract not found
- Verify the contract address in `frontend/.env`
- Redeploy the contract with `npm run deploy`
- Restart the frontend

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [ethers.js Documentation](https://docs.ethers.org/)
- [React Documentation](https://react.dev/)
- [MetaMask Documentation](https://docs.metamask.io/)

## 🎉 Success!

If you've followed all steps, you should now have:
- ✅ A running local blockchain
- ✅ A deployed smart contract
- ✅ A beautiful frontend application
- ✅ MetaMask configured and connected
- ✅ Test ETH to experiment with

Enjoy using TimeLock Vault! 🔒

