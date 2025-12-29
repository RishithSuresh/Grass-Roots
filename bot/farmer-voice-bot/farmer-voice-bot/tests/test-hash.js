/**
 * test-hash.js - Test deterministic hashing
 */

const { createCanonicalJson, computeDataHash } = require('../backend/utils');

function testHashing() {
    console.log('🧪 Testing Deterministic Hashing...\n');
    
    try {
        // Test data
        const recordJson1 = {
            farmer_id: 'farmer_abc123',
            timestamp: '2025-01-15T10:30:00Z',
            language: 'en',
            crop_type: 'rice',
            acreage: 5,
            current_stage: 'flowering',
            observed_issues: ['pest', 'disease'],
            chemicals_used: [
                { name: 'neem oil', dosage: '5L' },
                { name: 'fungicide', dosage: '2kg' },
            ],
            expected_yield: '50 quintals',
            price_expectation: '2000 INR',
            audio_ipfs_cid: 'QmTestCID123',
        };
        
        // Create canonical form
        console.log('Original JSON:');
        console.log(JSON.stringify(recordJson1, null, 2));
        
        const canonical1 = createCanonicalJson(recordJson1);
        console.log('\nCanonical Form (sorted keys):');
        console.log(canonical1);
        
        // Compute hash
        const hash1 = computeDataHash(canonical1);
        console.log('\n✅ SHA256 Hash 1:');
        console.log(`   ${hash1}`);
        
        // Test determinism - same data should produce same hash
        const canonical1Again = createCanonicalJson(recordJson1);
        const hash1Again = computeDataHash(canonical1Again);
        
        console.log('\n✅ SHA256 Hash 1 (again):');
        console.log(`   ${hash1Again}`);
        
        if (hash1 === hash1Again) {
            console.log('\n✅ ✓ Determinism verified - same data produces same hash!\n');
        } else {
            throw new Error('Hash mismatch - not deterministic!');
        }
        
        // Test different data produces different hash
        const recordJson2 = { ...recordJson1, crop_type: 'wheat' };
        const canonical2 = createCanonicalJson(recordJson2);
        const hash2 = computeDataHash(canonical2);
        
        console.log('✅ SHA256 Hash 2 (different data):');
        console.log(`   ${hash2}`);
        
        if (hash1 !== hash2) {
            console.log('\n✅ ✓ Uniqueness verified - different data produces different hash!\n');
        } else {
            throw new Error('Hash collision detected!');
        }
        
        // Stability test - ordering should not affect hash
        const recordJsonReordered = {
            price_expectation: recordJson1.price_expectation,
            crop_type: recordJson1.crop_type,
            farmer_id: recordJson1.farmer_id,
            timestamp: recordJson1.timestamp,
            acreage: recordJson1.acreage,
            language: recordJson1.language,
            current_stage: recordJson1.current_stage,
            observed_issues: recordJson1.observed_issues,
            chemicals_used: recordJson1.chemicals_used,
            expected_yield: recordJson1.expected_yield,
            audio_ipfs_cid: recordJson1.audio_ipfs_cid,
        };
        
        const canonicalReordered = createCanonicalJson(recordJsonReordered);
        const hashReordered = computeDataHash(canonicalReordered);
        
        console.log('✅ SHA256 Hash (reordered input):');
        console.log(`   ${hashReordered}`);
        
        if (hash1 === hashReordered) {
            console.log('\n✅ ✓ Ordering invariance verified - key order doesn\'t affect hash!\n');
        } else {
            throw new Error('Hash depends on key order!');
        }
        
        console.log('✅ All hashing tests passed!\n');
    } catch (error) {
        console.error('❌ Hashing test failed:', error.message);
        process.exit(1);
    }
}

testHashing();
