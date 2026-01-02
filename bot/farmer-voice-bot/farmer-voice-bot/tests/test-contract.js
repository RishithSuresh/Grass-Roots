/**
 * test-contract.js - Test smart contract interaction
 */

const Web3 = require('web3');

async function testContract() {
    console.log('🧪 Testing Smart Contract (Ganache)...\n');
    
    try {
        const web3 = new Web3('http://127.0.0.1:8545');
        
        // Check connection
        const isConnected = await web3.eth.net.isListening();
        if (!isConnected) {
            console.log('⚠️  Ganache not running at http://127.0.0.1:8545');
            console.log('Start Ganache with: ganache-cli\n');
            console.log('Then re-run this test.\n');
            return;
        }
        
        console.log('✅ Connected to Ganache');
        
        // Get accounts
        const accounts = await web3.eth.getAccounts();
        console.log(`✅ Available accounts: ${accounts.length}`);
        console.log(`   Account 0: ${accounts[0]}\n`);
        
        // Get balance
        const balance = await web3.eth.getBalance(accounts[0]);
        const balanceInEth = web3.utils.fromWei(balance, 'ether');
        console.log(`✅ Account 0 balance: ${balanceInEth} ETH\n`);
        
        // Get network info
        const chainId = await web3.eth.getChainId();
        const gasPrice = await web3.eth.getGasPrice();
        const blockNumber = await web3.eth.getBlockNumber();
        
        console.log(`✅ Network Info:`);
        console.log(`   Chain ID: ${chainId}`);
        console.log(`   Gas Price: ${gasPrice} wei`);
        console.log(`   Current Block: ${blockNumber}\n`);
        
        console.log('✅ Contract tests passed!\n');
        console.log('📝 Next steps:');
        console.log('   1. Deploy contract: npm run deploy (from blockchain/)\n');
    } catch (error) {
        console.error('❌ Contract test failed:', error.message);
        process.exit(1);
    }
}

testContract();
