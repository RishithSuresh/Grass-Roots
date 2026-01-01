# Quick Test Guide - Blockchain Payment Integration

## Quick Start (5 Minutes)

### Prerequisites Check
- [ ] Node.js installed (`node --version`)
- [ ] MetaMask browser extension installed
- [ ] Terminal/Command Prompt access

### Step 1: Start Blockchain (Terminal 1)

```bash
cd "Grass Roots/blockchain-payment"
npm install
npx hardhat node
```

**Expected Output:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

⚠️ **Keep this terminal running!**

### Step 2: Deploy Contract (Terminal 2)

```bash
cd "Grass Roots/blockchain-payment"
npx hardhat run scripts/deploy.js --network localhost
```

**Expected Output:**
```
Lock deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

📋 **Copy the contract address!**

### Step 3: Update Contract Address

Open `Grass Roots/frontend/blockchain-payment.html` in a text editor.

Find line ~290:
```javascript
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
```

Replace with your deployed contract address from Step 2.

### Step 4: Configure MetaMask

1. **Add Network:**
   - Open MetaMask
   - Click network dropdown → "Add network" → "Add a network manually"
   - Fill in:
     - Network Name: `Hardhat Local`
     - RPC URL: `http://127.0.0.1:8545`
     - Chain ID: `31337`
     - Currency Symbol: `ETH`
   - Click "Save"

2. **Import Test Account:**
   - Click account icon → "Import Account"
   - Paste private key from Step 1 (Account #0)
   - Click "Import"
   - You should see 10000 ETH balance

3. **Switch to Hardhat Local network**

### Step 5: Test Payment Flow

1. **Open Payments Page:**
   - Open `Grass Roots/frontend/retailer-payments.html` in browser
   - You should see a list of orders

2. **Initiate Payment:**
   - Find an unpaid order
   - Click the "Pay" button
   - You'll be redirected to blockchain payment page

3. **Connect Wallet:**
   - Click "Connect Wallet" button
   - MetaMask popup appears
   - Click "Next" → "Connect"
   - Wallet info should appear

4. **Make Payment:**
   - Review order details
   - Click "Pay with Blockchain"
   - MetaMask confirmation popup appears
   - Click "Confirm"
   - Wait for transaction (few seconds)

5. **Verify Success:**
   - Success notification appears
   - Automatically redirected to payments page
   - Order now shows "Paid: Yes"
   - Success alert appears

## Troubleshooting

### Issue: "MetaMask is not installed"
**Solution:** Install MetaMask browser extension from https://metamask.io/

### Issue: "Please connect to Hardhat Local network"
**Solution:** 
- Check MetaMask is on "Hardhat Local" network
- Verify Chain ID is 31337
- Ensure Hardhat node is running

### Issue: "Contract not found"
**Solution:**
- Verify contract was deployed (Step 2)
- Check CONTRACT_ADDRESS in blockchain-payment.html matches deployed address
- Restart Hardhat node and redeploy

### Issue: "Transaction failed"
**Solution:**
- Check you have enough ETH (should have 10000 ETH)
- Verify you're on the correct network
- Check browser console for errors
- Try refreshing the page

### Issue: "Insufficient funds"
**Solution:**
- Make sure you imported the test account with 10000 ETH
- Check MetaMask is showing the correct account
- Verify balance in MetaMask

## Expected Behavior

### ✅ Successful Payment Flow:
1. Click "Pay" → Redirects to blockchain-payment.html
2. Connect Wallet → Shows wallet address and balance
3. Pay with Blockchain → MetaMask popup
4. Confirm → Transaction processing
5. Success → Redirects back to payments page
6. Order marked as "Paid: Yes"

### ❌ Common Errors:
- "MetaMask is not installed" → Install MetaMask
- "Please connect to Hardhat Local network" → Switch network in MetaMask
- "Contract not found" → Update CONTRACT_ADDRESS
- "Transaction failed" → Check console for details

## Verification Checklist

After successful payment:
- [ ] Order shows "Paid: Yes" in payments table
- [ ] Success message displayed
- [ ] MetaMask shows transaction in activity
- [ ] ETH deducted from wallet balance
- [ ] Can see transaction on Hardhat node terminal

## Demo Data

If you need to create test orders:

1. Open browser console on `retailer-orders.html`
2. Run:
```javascript
const orders = [
  { id: 'ORD001', total: 5000, paid: false, items: [] },
  { id: 'ORD002', total: 10000, paid: false, items: [] },
  { id: 'ORD003', total: 2500, paid: false, items: [] }
];
localStorage.setItem('retailer_orders', JSON.stringify(orders));
location.reload();
```

## Next Steps

Once basic flow works:
1. Test with different order amounts
2. Try canceling a payment
3. Test with multiple orders
4. Verify transaction details in Hardhat terminal
5. Check MetaMask transaction history

## Support

If you encounter issues:
1. Check browser console (F12) for errors
2. Check Hardhat terminal for transaction logs
3. Verify all steps were followed in order
4. Refer to BLOCKCHAIN_PAYMENT_SETUP.md for detailed setup

