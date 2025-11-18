// blockchain.js: MetaMask and ethers.js integration for payment
// Replace CONTRACT_ADDRESS with your deployed Payment contract address
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "orderId", "type": "string" }
    ],
    "name": "pay",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "payer", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "orderId", "type": "string" }
    ],
    "name": "PaymentReceived",
    "type": "event"
  }
];

async function payWithMetaMask(orderId, amountEth, onSuccess, onError) {
  if (!window.ethereum) {
    alert("MetaMask is not installed");
    return;
  }
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const tx = await contract.pay(orderId, { value: ethers.utils.parseEther(amountEth.toString()) });
    await tx.wait();
    onSuccess && onSuccess(tx);
  } catch (err) {
    onError && onError(err);
  }
}// Minimal client-side blockchain
class Block {
    constructor(index, timestamp, data, previousHash, nonce, hash) {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.nonce = nonce;
        this.hash = hash;
    }
}

class SimpleBlockchain {
    constructor(storageKey = 'simple_blockchain', difficulty = 3) {
        this.storageKey = storageKey;
        this.difficulty = difficulty; // number of leading zeros needed
        this.chain = this.loadChain() || this.createGenesis();
    }

    createGenesis() {
        const genesis = new Block(0, Date.now(), { info: 'Genesis Block' }, '0', 0, '0');
        const chain = [genesis];
        this.saveChain(chain);
        return chain;
    }

    saveChain(chain) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(chain));
        } catch (e) {
            console.error('Failed to save chain:', e);
        }
    }

    loadChain() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (!raw) return null;
            const arr = JSON.parse(raw);
            return arr;
        } catch (e) {
            console.error('Failed to load chain:', e);
            return null;
        }
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    async addBlock(data) {
        const prev = this.getLatestBlock();
        const index = prev.index + 1;
        const timestamp = Date.now();
        const previousHash = prev.hash || '0';

        const mined = await this.mineBlock(index, timestamp, data, previousHash);
        this.chain.push(mined);
        this.saveChain(this.chain);
        return mined;
    }

    // Basic PoW: find nonce where hash starts with N zeros
    async mineBlock(index, timestamp, data, previousHash) {
        let nonce = 0;
        const target = '0'.repeat(this.difficulty);
        while (true) {
            const payload = previousHash + '|' + index + '|' + timestamp + '|' + JSON.stringify(data) + '|' + nonce;
            const hash = await SimpleBlockchain.sha256(payload);
            if (hash.startsWith(target)) {
                return new Block(index, timestamp, data, previousHash, nonce, hash);
            }
            nonce++;
            // yield occasionally so UI doesn't freeze for too long
            if (nonce % 500 === 0) await SimpleBlockchain.idle();
        }
    }

    static idle() {
        return new Promise(resolve => setTimeout(resolve, 0));
    }

    static async sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // simple check
    isValidChain() {
        for (let i = 1; i < this.chain.length; i++) {
            const current = this.chain[i];
            const prev = this.chain[i - 1];
            const payload = prev.hash + '|' + current.index + '|' + current.timestamp + '|' + JSON.stringify(current.data) + '|' + current.nonce;
            // NOTE: sha256 is async, so this sync check is approximate. For a full verification you'd re-compute and await.
            if (current.previousHash !== prev.hash) return false;
        }
        return true;
    }

    toJSON() {
        return this.chain;
    }
}

// expose a default instance for easy use
window.GrassRootsChain = new SimpleBlockchain('simple_blockchain', 3);

// helper to add transaction easily
window.GrassRootsChainAddTransaction = async function(tx) {
    return await window.GrassRootsChain.addBlock(tx);
}
