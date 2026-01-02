# 🔧 Blockchain Troubleshooting Guide

## Common Issues and Solutions

### ❌ "Hardhat only supports ESM projects" or "Class extends value undefined"

**Error Messages:**
```
Hardhat only supports ESM projects.
Please make sure you have `"type": "module"` in your package.json.
```
OR
```
TypeError: Class extends value undefined is not a constructor or null
```

**Solution:**
These errors occur with Hardhat 3.x which has ESM compatibility issues. We've downgraded to the stable Hardhat 2.x version.

**Reinstall dependencies:**
```powershell
cd blockchain
.\reinstall-dependencies.ps1
```

OR manually:
```powershell
# Remove old dependencies
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Install correct versions
npm install
```

**Already fixed:**
- ✅ package.json uses Hardhat 2.19.0 (stable)
- ✅ hardhat.config.js uses CommonJS (require/module.exports)
- ✅ deploy.js uses CommonJS
- ✅ All compatibility issues resolved

---

### ❌ "Cannot connect to blockchain"

**Symptoms:**
- Frontend shows "blockchain not available"
- MetaMask can't connect
- RPC errors in console

**Solutions:**

1. **Check if Hardhat is running:**
   - Look for a terminal with `npx hardhat node` running
   - You should see "Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/"

2. **Start Hardhat if not running:**
   ```powershell
   cd blockchain
   npx hardhat node
   ```

3. **Check MetaMask network:**
   - Open MetaMask
   - Click network dropdown
   - Select "Localhost 8545"
   - If not available, add it manually (see setup guide)

4. **Use Demo Mode:**
   - Click "Connect Wallet"
   - Choose "Demo Mode" when prompted
   - No blockchain setup required!

---

### ❌ "Port 8545 already in use"

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::8545
```

**Solution 1: Find and kill the process (PowerShell)**
```powershell
# Find the process using port 8545
Get-Process -Id (Get-NetTCPConnection -LocalPort 8545).OwningProcess

# Kill it
Get-Process -Id (Get-NetTCPConnection -LocalPort 8545).OwningProcess | Stop-Process
```

**Solution 2: Restart your computer**
This will close all processes and free up the port.

---

### ❌ "Transaction failed"

**Possible Causes:**

1. **Insufficient funds:**
   - Check wallet balance in MetaMask
   - Import a test account with funds (see setup guide)

2. **Wrong network:**
   - Make sure MetaMask is on "Localhost 8545"
   - Chain ID should be 31337

3. **Contract not deployed:**
   - Deploy the contract: `npx hardhat run deploy.js --network localhost`
   - Update contract address in blockchain-payment.html

4. **Hardhat node restarted:**
   - If you restart Hardhat, you need to redeploy the contract
   - Contract addresses change each time you restart

---

### ❌ "MetaMask not connecting"

**Solutions:**

1. **Check if MetaMask is installed:**
   - Go to https://metamask.io/download/
   - Install the browser extension

2. **Add localhost network:**
   - Open MetaMask
   - Click network dropdown
   - Click "Add network" → "Add network manually"
   - Fill in:
     - Network Name: Localhost 8545
     - RPC URL: http://127.0.0.1:8545
     - Chain ID: 31337
     - Currency Symbol: ETH

3. **Import test account:**
   - Click account icon → "Import Account"
   - Paste private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - You should see 10000 ETH

---

### ❌ "Contract address not found"

**Error Message:**
```
Error: Contract not deployed at address 0x...
```

**Solution:**

1. **Deploy the contract:**
   ```powershell
   cd blockchain
   npx hardhat run deploy.js --network localhost
   ```

2. **Copy the contract address from output:**
   ```
   ✅ Payment contract deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
   ```

3. **Update frontend/blockchain-payment.html:**
   - Open the file
   - Find line ~273: `const CONTRACT_ADDRESS = "0x...";`
   - Replace with your new address
   - Save the file

---

### ❌ "npm install fails"

**Solution:**

1. **Clear npm cache:**
   ```powershell
   npm cache clean --force
   ```

2. **Delete node_modules and package-lock.json:**
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   ```

3. **Reinstall:**
   ```powershell
   npm install
   ```

---

## Quick Checklist

Before testing blockchain payments, make sure:

- [ ] Node.js is installed (v18 or higher)
- [ ] Dependencies installed: `npm install` in blockchain folder
- [ ] Package.json has `"type": "module"`
- [ ] Hardhat node is running: `npx hardhat node`
- [ ] Contract is deployed: `npx hardhat run deploy.js --network localhost`
- [ ] Contract address updated in blockchain-payment.html
- [ ] MetaMask is installed
- [ ] Localhost network added to MetaMask
- [ ] Test account imported to MetaMask

---

## Still Having Issues?

### Use Demo Mode
The easiest solution is to use demo mode:
1. Go to blockchain payment page
2. Click "Connect Wallet"
3. Choose "Demo Mode"
4. Test the payment flow without any setup!

### Check Documentation
- `BLOCKCHAIN_SETUP_GUIDE.md` - Complete setup instructions
- `README.md` - Overview and quick start
- `CONSOLE_WARNINGS_EXPLAINED.md` - Understanding console messages

### Common Mistakes
1. ❌ Forgetting to keep Hardhat node running
2. ❌ Not updating contract address after deployment
3. ❌ Using wrong MetaMask network
4. ❌ Not importing test account with funds
5. ❌ Restarting Hardhat without redeploying contract

---

## Need Help?

If you're still stuck:
1. Check all the items in the Quick Checklist above
2. Read the error message carefully
3. Search for the error in this guide
4. Use demo mode to test the UI while troubleshooting

