const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Resolve files relative to this script so the script can be executed from repo root or other cwd
const BASE = __dirname; // scripts/ folder
const DEPLOYED_ADDR_PATH = path.resolve(BASE, '..', 'deployed_address.json');
const OUT_PATH = path.resolve(BASE, '..', 'last_transaction.json');

const RPC = process.env.RPC_URL || 'http://127.0.0.1:8545';
const provider = new ethers.providers.JsonRpcProvider(RPC);

async function main() {
  // Read deployed address
  if (!fs.existsSync(DEPLOYED_ADDR_PATH)) {
    console.error(`${path.basename(DEPLOYED_ADDR_PATH)} not found. Run the deploy script first (npx hardhat run --network localhost scripts/deploy.js)`);
    process.exit(1);
  }

  const { address } = JSON.parse(fs.readFileSync(DEPLOYED_ADDR_PATH, 'utf8'));

  // Minimal ABI for our contract
  const abi = [
    'function registerTransaction(string,address,address,uint256,string) returns (uint256)',
    'event TransactionRegistered(uint256 indexed id, string txId, address indexed buyer, address indexed seller, uint256 amount, string metadata, uint256 timestamp)'
  ];

  // Determine signer: use PRIVATE_KEY env if present, otherwise use provider signer[1]
  let signer;
  if (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length > 0) {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    signer = wallet;
    console.log('Using PRIVATE_KEY wallet:', await signer.getAddress());
  } else {
    const accounts = await provider.listAccounts();
    if (accounts.length < 2) {
      console.error('Hardhat node should provide accounts. Start it with `npx hardhat node`');
      process.exit(1);
    }
    // Use account[1] as the signer for the purchase (buyer)
    signer = provider.getSigner(accounts[1]);
    console.log('Using provider signer:', await signer.getAddress());
  }

  const contract = new ethers.Contract(address, abi, signer);

  // Compose a demo transaction
  const txPayload = {
    txId: 'tx-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
    buyer: await signer.getAddress(),
    seller: (await provider.listAccounts())[0],
    amount: ethers.utils.parseUnits('1.25', 18), // e.g., 1.25 units (use wei-like units for demo)
    metadata: JSON.stringify({ productId: 'demo-prod-001', productName: 'Demo Product' })
  };

  console.log('Registering transaction:', txPayload.txId);

  const tx = await contract.registerTransaction(
    txPayload.txId,
    txPayload.buyer,
    txPayload.seller,
    txPayload.amount,
    txPayload.metadata
  );

  console.log('Tx submitted. Waiting for confirmation...');
  const receipt = await tx.wait();
  console.log('Transaction mined in block', receipt.blockNumber);

  // Try to find the event args
  const iface = new ethers.utils.Interface(abi);
  let parsed = null;
  for (const log of receipt.logs) {
    try {
      const ev = iface.parseLog(log);
      if (ev && ev.name === 'TransactionRegistered') {
        parsed = ev.args;
        break;
      }
    } catch (e) {
      // not our log
    }
  }

  const out = {
    receipt: {
      blockNumber: receipt.blockNumber,
      transactionHash: receipt.transactionHash
    },
    event: parsed ? {
      id: parsed.id.toString(),
      txId: parsed.txId,
      buyer: parsed.buyer,
      seller: parsed.seller,
      amount: parsed.amount.toString(),
      metadata: parsed.metadata,
      timestamp: parsed.timestamp.toString()
    } : null
  };

  // Write payload to file for your frontend to pick up if desired
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log('Wrote', path.basename(OUT_PATH), 'with event data.');
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
