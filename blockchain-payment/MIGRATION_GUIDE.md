# Migration Guide: Recipient Feature Update

## Overview
The TimeLock Vault contract has been updated to support sending locked ETH to specific recipients. This is a **breaking change** that requires redeployment.

## What Changed

### Smart Contract Changes
- **Added `sender` field**: Tracks who locked the ETH
- **Added `recipient` field**: Specifies who can withdraw the ETH
- **Updated `deposit()` function**: Now requires a recipient address parameter
  - Old: `deposit(uint256 _unlockTime)`
  - New: `deposit(address _recipient, uint256 _unlockTime)`
- **Updated events**: `Deposited` event now includes both sender and recipient

### Frontend Changes
- **New recipient input field**: Optional field to specify who can withdraw the locked ETH
- **Sender/Recipient display**: Lock cards now show:
  - 📤 From: Address that locked the ETH
  - 📥 To: Address that can withdraw the ETH
  - "You" badge appears next to your address
- **Enhanced notifications**: Shows recipient information in success messages

## Migration Steps

### 1. Stop Existing Services
```bash
# Stop the frontend dev server (Ctrl+C)
# Stop the Hardhat node (Ctrl+C)
```

### 2. Recompile Contract
```bash
npx hardhat compile
```

### 3. Start New Hardhat Node
```bash
npx hardhat node
```

### 4. Deploy Updated Contract
In a new terminal:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 5. Update Frontend Configuration
Copy the deployed contract address and update `frontend/.env`:
```
VITE_LOCK_ADDRESS=<new_contract_address>
```

### 6. Copy Updated ABI
```bash
# Windows PowerShell
Copy-Item -Path "artifacts\contracts\Lock.sol\Lock.json" -Destination "frontend\src\contracts\Lock.json" -Force

# Linux/Mac
cp artifacts/contracts/Lock.sol/Lock.json frontend/src/contracts/Lock.json
```

### 7. Restart Frontend
```bash
cd frontend
npm run dev
```

## New Features

### Locking ETH for Yourself
Leave the "Recipient Address" field empty, and the ETH will be locked for your own address.

### Locking ETH for Others
Enter any valid Ethereum address in the "Recipient Address" field to lock ETH that only they can withdraw.

### Example Use Cases
1. **Gift**: Lock ETH for a friend's birthday (set unlock time to their birthday)
2. **Allowance**: Parents can lock ETH for children with future unlock dates
3. **Escrow**: Lock funds for a specific recipient with time-based release
4. **Savings**: Lock your own ETH to prevent impulse spending

## Testing

Run the updated tests:
```bash
npm test
```

All 6 tests should pass, including the new test for sending ETH to another user.

## Breaking Changes

⚠️ **Important**: Old locks from the previous contract version will NOT be accessible with the new contract. This is because:
1. The contract address has changed
2. The data structure has changed (added sender/recipient fields)

If you have important locks on the old contract, you must:
1. Keep the old Hardhat node running
2. Withdraw all funds before migrating
3. Then deploy the new contract

## Rollback

If you need to rollback to the old version:
```bash
git checkout HEAD~1 contracts/Lock.sol
npx hardhat compile
# Redeploy and update .env
```

