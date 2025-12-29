const Web3 = require('web3');

// Ganache configuration
const GANACHE_RPC_URL = process.env.GANACHE_RPC_URL || 'http://127.0.0.1:8545';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

const web3 = new Web3(GANACHE_RPC_URL);

// Simple contract ABI for FarmerRecords
const CONTRACT_ABI = [
    {
        inputs: [
            { internalType: 'string', name: '_farmerId', type: 'string' },
            { internalType: 'uint256', name: '_timestamp', type: 'uint256' },
            { internalType: 'bytes32', name: '_dataHash', type: 'bytes32' },
            { internalType: 'string', name: '_ipfsCid', type: 'string' },
        ],
        name: 'addRecord',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'recordCount',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'records',
        outputs: [
            { internalType: 'string', name: 'farmerId', type: 'string' },
            { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
            { internalType: 'bytes32', name: 'dataHash', type: 'bytes32' },
            { internalType: 'string', name: 'ipfsCid', type: 'string' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
];

/**
 * Store farmer record on blockchain
 */
async function addRecord(farmerId, timestamp, dataHash, ipfsCid) {
    try {
        console.log('[Blockchain] Connecting to Ganache...');
        
        // For POC, return mock transaction if not configured
        if (!PRIVATE_KEY || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
            console.warn('[Blockchain] Ganache not configured, using mock transaction');
            return `0xmocktx${Date.now().toString(36).toUpperCase()}`;
        }
        
        const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        
        // Prepare transaction
        const account = web3.eth.accounts.privateKeyToAccount(`0x${PRIVATE_KEY}`);
        const nonce = await web3.eth.getTransactionCount(account.address);
        
        // Create function call
        const data = contract.methods.addRecord(farmerId, timestamp, `0x${dataHash}`, ipfsCid).encodeABI();
        
        // Build transaction
        const tx = {
            from: account.address,
            to: CONTRACT_ADDRESS,
            data,
            gas: 300000,
            gasPrice: await web3.eth.getGasPrice(),
            nonce,
        };
        
        // Sign and send
        const signedTx = account.signTransaction(tx);
        const txHash = await new Promise((resolve, reject) => {
            web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                .on('transactionHash', resolve)
                .on('error', reject);
        });
        
        console.log(`[Blockchain] Record stored. TX: ${txHash}`);
        return txHash;
    } catch (error) {
        console.error('[Blockchain] Error:', error.message);
        // Return mock transaction for POC
        return `0xmocktx${Date.now().toString(36).toUpperCase()}`;
    }
}

/**
 * Get record count from blockchain
 */
async function getRecordCount() {
    try {
        const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        const count = await contract.methods.recordCount().call();
        return parseInt(count);
    } catch (error) {
        console.error('[Blockchain] Error getting record count:', error.message);
        return 0;
    }
}

/**
 * Get specific record from blockchain
 */
async function getRecord(index) {
    try {
        const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        const record = await contract.methods.records(index).call();
        return record;
    } catch (error) {
        console.error('[Blockchain] Error getting record:', error.message);
        return null;
    }
}

module.exports = {
    addRecord,
    getRecordCount,
    getRecord,
    web3,
};
