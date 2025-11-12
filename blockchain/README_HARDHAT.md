# Hardhat Local Testing (GrassRoots)

This folder contains a minimal Hardhat setup to run a local Ethereum-compatible node, deploy a simple `TransactionRegistry` contract, and simulate a purchase transaction entirely locally.

Prerequisites
- Node.js (16+ recommended)
- PowerShell (you're on Windows)

Install dependencies
Open a PowerShell terminal in this folder (`d:\Programming\Grass Roots\blockchain`) and run:

```powershell
npm install
```

Start a local Hardhat node (terminal #1)

```powershell
# starts a local node on http://127.0.0.1:8545 with pre-funded accounts
npx hardhat node
```

Deploy the contract to the local node (terminal #2)

```powershell
# deploys TransactionRegistry and writes deployed_address.json
npx hardhat run --network localhost scripts/deploy.js
```

Simulate a purchase (terminal #2)

```powershell
# Runs a script which registers a transaction using account[1] (buyer)
node scripts/simulatePurchase.js
```

Using a custom private key
If you want to use your own private key (for testing), set the PRIVATE_KEY env var in PowerShell before running `simulate`:

```powershell
$env:PRIVATE_KEY = '0xYOUR_PRIVATE_KEY_HERE'
node scripts/simulatePurchase.js
```

Artifacts
- `deployed_address.json` - address of the deployed contract (created by `deploy.js`)
- `last_transaction.json` - output written by `simulatePurchase.js` with event data and receipt

Notes & Next steps
- This is for local testing only. For production you'd deploy to a proper network and add signing/verification.
- If you want the frontend to pick up the transaction and generate QR codes, we can add a small server or have the frontend poll/consume `last_transaction.json`.
