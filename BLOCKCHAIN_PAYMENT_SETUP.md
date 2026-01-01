# Blockchain Payment Integration Setup Guide

This guide explains how to set up and use the blockchain payment feature integrated into the GrassRoots platform.

## Overview

The blockchain payment system allows retailers to pay for orders using Ethereum blockchain technology. The payment flow is:

1. Retailer views unpaid orders in the Payments page
2. Clicks "Pay" button for an order
3. Redirected to blockchain payment page
4. Connects MetaMask wallet
5. Confirms payment transaction
6. After successful payment, redirected back to Payments page with order marked as paid

## Prerequisites

- Node.js (v16 or higher)
- MetaMask browser extension
- Hardhat (for local blockchain)

## Setup Instructions

### Step 1: Install Dependencies

Navigate to the blockchain-payment directory:

```bash
cd "Grass Roots/blockchain-payment"
npm install
```

### Step 2: Start Local Hardhat Node

In a terminal, start the Hardhat local blockchain:

```bash
npx hardhat node
```

This will start a local Ethereum node at `http://127.0.0.1:8545` and provide you with test accounts.

**Important:** Keep this terminal running!

### Step 3: Deploy the Smart Contract

In a new terminal, deploy the Lock contract:

```bash
cd "Grass Roots/blockchain-payment"
npx hardhat run scripts/deploy.js --network localhost
```

You will see output like:

```
Lock deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**Copy this contract address!**

### Step 4: Update Contract Address

Open `Grass Roots/frontend/blockchain-payment.html` and update the CONTRACT_ADDRESS:

```javascript
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your deployed address
```

### Step 5: Configure MetaMask

1. Open MetaMask extension
2. Click on the network dropdown (usually shows "Ethereum Mainnet")
3. Click "Add Network" → "Add a network manually"
4. Enter the following details:
   - **Network Name:** Hardhat Local
   - **RPC URL:** http://127.0.0.1:8545
   - **Chain ID:** 31337
   - **Currency Symbol:** ETH
5. Click "Save"

### Step 6: Import Test Account

From the Hardhat node terminal output, copy one of the private keys (e.g., Account #0).

In MetaMask:
1. Click on the account icon
2. Select "Import Account"
3. Paste the private key
4. Click "Import"

You should now see a balance of 10000 ETH (test ETH).

### Step 7: Open the Application

Open `Grass Roots/frontend/retailer-payments.html` in your browser.

## Usage

### Making a Payment

1. Navigate to the Payments page
2. Find an unpaid order
3. Click the "Pay" button
4. You'll be redirected to the blockchain payment page
5. Click "Connect Wallet"
6. Approve the MetaMask connection
7. Review the order details and amount
8. Click "Pay with Blockchain"
9. Confirm the transaction in MetaMask
10. Wait for transaction confirmation
11. You'll be redirected back to the Payments page with the order marked as paid

### Conversion Rate

The demo uses a fixed conversion rate:
- **1 ETH = 200,000 INR**

You can modify this in `blockchain-payment.html`:

```javascript
const ETH_TO_INR = 200000; // Change this value
```

## Technical Details

### Smart Contract

The Lock contract (`blockchain-payment/contracts/Lock.sol`) provides:
- `deposit(address _recipient, uint256 _unlockTime)`: Locks ETH for a recipient
- `withdraw(uint256 lockIndex)`: Allows recipient to withdraw after unlock time
- `getLocks(address user)`: Returns all locks for a user

### Payment Flow

1. Order amount in INR is converted to ETH
2. User connects MetaMask wallet
3. Transaction is sent to the Lock contract's `deposit` function
4. Payment is locked for 1 minute (demo purposes)
5. After confirmation, order status is updated in localStorage
6. User is redirected back to payments page

### Files Modified

- `frontend/blockchain-payment.html` - New blockchain payment page
- `frontend/retailer-payments.html` - Updated to redirect to blockchain payment
- `blockchain-payment/` - Complete blockchain project (copied from dummy-blockchain-project)

## Troubleshooting

### MetaMask Not Connecting

- Ensure MetaMask is installed and unlocked
- Check that you're on the Hardhat Local network
- Refresh the page and try again

### Transaction Failing

- Ensure Hardhat node is running
- Verify contract address is correct
- Check that you have enough ETH in your wallet
- Look at the browser console for error messages

### Contract Not Found

- Verify the contract was deployed successfully
- Check that the CONTRACT_ADDRESS in blockchain-payment.html matches the deployed address
- Ensure you're connected to the correct network (Chain ID: 31337)

## Production Considerations

For production deployment:

1. **Use Real Blockchain:** Deploy to Ethereum mainnet or a testnet (Sepolia, Goerli)
2. **Update RPC URL:** Change from localhost to a real RPC provider (Infura, Alchemy)
3. **Dynamic Conversion Rate:** Fetch real-time ETH/INR exchange rates from an oracle
4. **Backend Integration:** Store payment transactions in database
5. **Security:** Add proper access controls and validation
6. **Gas Optimization:** Optimize contract for lower gas fees

## Support

For issues or questions, refer to:
- Hardhat Documentation: https://hardhat.org/docs
- Ethers.js Documentation: https://docs.ethers.org/
- MetaMask Documentation: https://docs.metamask.io/

