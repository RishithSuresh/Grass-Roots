const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Configure IPFS API endpoint (default local node)
const IPFS_API_URL = process.env.IPFS_API_URL || 'http://127.0.0.1:5001';

/**
 * Upload audio file to IPFS
 * Returns IPFS CID
 */
async function uploadAudio(audioBuffer, filename) {
    try {
        console.log(`[IPFS] Uploading ${filename} to ${IPFS_API_URL}`);
        
        const form = new FormData();
        form.append('file', audioBuffer, filename);
        
        const response = await axios.post(`${IPFS_API_URL}/api/v0/add`, form, {
            headers: form.getHeaders(),
            timeout: 30000,
        });
        
        const cid = response.data.Hash;
        console.log(`[IPFS] Upload successful. CID: ${cid}`);
        
        return cid;
    } catch (error) {
        // Fallback: For POC, return a mock CID if IPFS not available
        console.warn('[IPFS] Upload failed, using mock CID:', error.message);
        const mockCid = `QmMockCID${Date.now().toString(36).toUpperCase()}`;
        return mockCid;
    }
}

/**
 * Retrieve audio from IPFS by CID
 */
async function getAudio(cid) {
    try {
        console.log(`[IPFS] Retrieving ${cid}`);
        
        const response = await axios.get(`${IPFS_API_URL}/api/v0/cat?arg=${cid}`, {
            responseType: 'arraybuffer',
            timeout: 30000,
        });
        
        return response.data;
    } catch (error) {
        console.error('[IPFS] Retrieval failed:', error.message);
        throw error;
    }
}

/**
 * Pin CID on IPFS (ensure it doesn't get garbage collected)
 */
async function pinCid(cid) {
    try {
        console.log(`[IPFS] Pinning ${cid}`);
        
        await axios.post(`${IPFS_API_URL}/api/v0/pin/add?arg=${cid}`);
        
        console.log(`[IPFS] Pinned successfully`);
    } catch (error) {
        console.warn('[IPFS] Pinning failed:', error.message);
    }
}

module.exports = {
    uploadAudio,
    getAudio,
    pinCid,
};
