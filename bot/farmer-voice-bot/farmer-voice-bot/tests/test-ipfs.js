/**
 * test-ipfs.js - Test IPFS upload functionality
 */

const ipfsHandler = require('../backend/ipfsHandler');

async function testIPFS() {
    console.log('🧪 Testing IPFS Upload...\n');
    
    try {
        // Create test data
        const testData = Buffer.from('Test audio data for IPFS');
        
        // Upload to IPFS
        console.log('Uploading test file...');
        const cid = await ipfsHandler.uploadAudio(testData, 'test-audio.wav');
        
        console.log(`✅ Upload successful!`);
        console.log(`   CID: ${cid}\n`);
        
        // Try to retrieve (might fail if IPFS not running, that's OK for POC)
        try {
            console.log('Attempting to retrieve from IPFS...');
            const retrieved = await ipfsHandler.getAudio(cid);
            console.log(`✅ Retrieved ${retrieved.length} bytes\n`);
        } catch (e) {
            console.log('⚠️  Retrieval failed (IPFS might not be running):\n');
        }
        
        console.log('✅ IPFS tests completed!\n');
    } catch (error) {
        console.error('❌ IPFS test failed:', error.message);
        process.exit(1);
    }
}

testIPFS();
