# 🔧 Troubleshooting Guide

## Common Errors and Solutions

### ❌ Error: "could not decode result data"

**Full Error:**
```
could not decode result data (value="0x", info={ "method": "getLocks", "signature": "getLocks(address)" }, code=BAD_DATA, version=6.16.0)
```

**Cause:** This error occurs when the smart contract is not deployed or not found at the specified address.

**Solutions:**

1. **Ensure Hardhat Node is Running**
   ```bash
   # In a separate terminal, run:
   npx hardhat node
   ```
   Keep this terminal running!

2. **Deploy the Contract**
   ```bash
   # In another terminal:
   npm run deploy
   ```
   You should see output like:
   ```
   Lock deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
   ```

3. **Update Contract Address**
   - Copy the deployed contract address
   - Open `frontend/.env`
   - Update `VITE_LOCK_ADDRESS` with the new address:
   ```env
   VITE_LOCK_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
   ```

4. **Restart Frontend**
   ```bash
   # Stop the frontend (Ctrl+C)
   # Then restart:
   cd frontend
   npm run dev
   ```

5. **Hard Refresh Browser**
   - Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - This clears the cache and reloads

---

### ❌ Error: "Please connect to Hardhat Local network"

**Cause:** MetaMask is connected to the wrong network.

**Solution:**

1. **Open MetaMask**
2. **Click the network dropdown** (top of MetaMask)
3. **Select "Hardhat Local"**
   - If you don't see it, add it manually:
     - Network Name: `Hardhat Local`
     - RPC URL: `http://127.0.0.1:8545`
     - Chain ID: `31337`
     - Currency Symbol: `ETH`

---

### ❌ Error: "Please install MetaMask"

**Cause:** MetaMask browser extension is not installed or not enabled.

**Solution:**

1. Install MetaMask from [metamask.io](https://metamask.io/)
2. Enable the extension in your browser
3. Refresh the page

---

### ❌ Error: "Contract address not configured"

**Cause:** The `.env` file is missing or `VITE_LOCK_ADDRESS` is not set.

**Solution:**

1. Create or edit `frontend/.env`:
   ```env
   VITE_LOCK_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
   VITE_RPC_URL=http://127.0.0.1:8545
   ```

2. Replace the address with your deployed contract address

3. Restart the frontend

---

### ❌ Error: "Insufficient funds"

**Cause:** The connected account doesn't have enough ETH.

**Solution:**

1. **Import a Test Account from Hardhat**
   - When you run `npx hardhat node`, it shows test accounts with 10000 ETH
   - Copy a private key from the output
   - In MetaMask: Click account icon → Import Account → Paste private key

2. **Example Private Key** (from Hardhat default accounts):
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```

---

### ❌ Frontend Won't Load

**Symptoms:** Blank page or loading forever

**Solutions:**

1. **Check Console for Errors**
   - Press `F12` to open Developer Tools
   - Check the Console tab for errors

2. **Verify Frontend is Running**
   ```bash
   cd frontend
   npm run dev
   ```
   Should show: `Local: http://localhost:5173/`

3. **Clear Browser Cache**
   - Hard refresh: `Ctrl+Shift+R`
   - Or clear all browser data

4. **Reinstall Dependencies**
   ```bash
   cd frontend
   rm -rf node_modules
   npm install
   npm run dev
   ```

---

### ❌ Transaction Fails

**Symptoms:** Transaction rejected or fails after submission

**Solutions:**

1. **Check Network**
   - Ensure you're on Hardhat Local (Chain ID: 31337)

2. **Check Balance**
   - Make sure you have enough ETH for the transaction + gas

3. **Check Unlock Time**
   - Must be in the future
   - Try a longer duration (e.g., 60 seconds)

4. **Reset MetaMask**
   - Settings → Advanced → Clear activity tab data

---

## 🔄 Complete Reset Procedure

If nothing works, try this complete reset:

1. **Stop All Processes**
   - Stop Hardhat node (Ctrl+C)
   - Stop frontend (Ctrl+C)

2. **Restart Hardhat Node**
   ```bash
   npx hardhat node
   ```

3. **Deploy Contract (New Terminal)**
   ```bash
   npm run deploy
   ```
   Copy the new contract address!

4. **Update .env**
   ```bash
   # Edit frontend/.env
   VITE_LOCK_ADDRESS=<new-contract-address>
   ```

5. **Restart Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Reset MetaMask**
   - Settings → Advanced → Clear activity tab data
   - Switch to a different network, then back to Hardhat Local

7. **Hard Refresh Browser**
   - `Ctrl+Shift+R`

---

## 📞 Still Having Issues?

Check these:

- ✅ Node.js version 16 or higher: `node --version`
- ✅ All dependencies installed: `npm install` in both root and frontend
- ✅ No firewall blocking localhost:8545 or localhost:5173
- ✅ MetaMask unlocked and connected
- ✅ Correct network selected in MetaMask
- ✅ Browser console shows no errors

---

## 🎯 Quick Checklist

Before using the app, ensure:

- [ ] Hardhat node is running (`npx hardhat node`)
- [ ] Contract is deployed (`npm run deploy`)
- [ ] Contract address is in `frontend/.env`
- [ ] Frontend is running (`npm run dev`)
- [ ] MetaMask is installed and unlocked
- [ ] MetaMask is on Hardhat Local network (Chain ID: 31337)
- [ ] Test account is imported with ETH
- [ ] Browser is on `http://localhost:5173`

If all checked, you should be good to go! 🚀

