const crypto = require('crypto');

/**
 * Extract structured JSON from farmer's transcribed speech
 * Uses simple pattern matching for POC
 */
async function extractJsonFromTranscription(transcription, language = 'en') {
    const text = transcription.toLowerCase();
    
    // Simple pattern-based extraction (POC version)
    const recordJson = {
        crop_type: extractCrop(text),
        acreage: extractAcreage(text),
        current_stage: extractStage(text),
        observed_issues: extractIssues(text),
        chemicals_used: extractChemicals(text),
        expected_yield: extractYield(text),
        price_expectation: extractPrice(text),
    };
    
    return recordJson;
}

function extractCrop(text) {
    const crops = ['rice', 'wheat', 'corn', 'cotton', 'sugarcane', 'pulse', 'lentil', 'maize'];
    for (const crop of crops) {
        if (text.includes(crop)) return crop;
    }
    return 'unknown';
}

function extractAcreage(text) {
    const match = text.match(/(\d+)\s*(acre|hectare)/i);
    return match ? parseFloat(match[1]) : 0;
}

function extractStage(text) {
    if (text.includes('seedling') || text.includes('planting')) return 'seedling';
    if (text.includes('growth') || text.includes('growing')) return 'growth';
    if (text.includes('flowering') || text.includes('bloom')) return 'flowering';
    if (text.includes('fruit') || text.includes('fruiting')) return 'fruiting';
    if (text.includes('harvest') || text.includes('ripe')) return 'harvest';
    return 'unknown';
}

function extractIssues(text) {
    const issues = [];
    const keywords = {
        pest: ['pest', 'insect', 'bug', 'worm'],
        disease: ['disease', 'blight', 'fungal', 'rot'],
        drought: ['drought', 'dry', 'water'],
        flooding: ['flood', 'water', 'excess'],
        weed: ['weed', 'grass', 'unwanted'],
    };
    
    for (const [issue, words] of Object.entries(keywords)) {
        for (const word of words) {
            if (text.includes(word)) {
                issues.push(issue);
                break;
            }
        }
    }
    
    return issues.length > 0 ? issues : ['none'];
}

function extractChemicals(text) {
    const chemicals = [];
    const chemicalKeywords = {
        'neem oil': ['neem'],
        'insecticide': ['insecticide', 'spray'],
        'fungicide': ['fungicide', 'powder'],
        'fertilizer': ['fertilizer', 'urea', 'npk'],
    };
    
    for (const [chem, keywords] of Object.entries(chemicalKeywords)) {
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                chemicals.push({ name: chem, dosage: 'standard' });
                break;
            }
        }
    }
    
    return chemicals;
}

function extractYield(text) {
    const match = text.match(/(\d+)\s*(ton|kg|quintal)/i);
    return match ? `${match[1]} ${match[2]}` : 'not specified';
}

function extractPrice(text) {
    const match = text.match(/₹?\s*(\d+)\s*(per|each)/i);
    return match ? `${match[1]} INR` : 'not specified';
}

/**
 * Create canonical JSON for deterministic hashing
 * Keys must be in alphabetical order
 */
function createCanonicalJson(recordJson) {
    const canonical = {
        acreage: recordJson.acreage,
        audio_ipfs_cid: recordJson.audio_ipfs_cid || '',
        chemicals_used: (recordJson.chemicals_used || []).map(c => ({
            dosage: c.dosage || '',
            name: c.name || '',
        })),
        crop_type: recordJson.crop_type || '',
        current_stage: recordJson.current_stage || '',
        expected_yield: recordJson.expected_yield || '',
        farmer_id: recordJson.farmer_id || '',
        language: recordJson.language || '',
        observed_issues: recordJson.observed_issues || [],
        price_expectation: recordJson.price_expectation || '',
        timestamp: recordJson.timestamp || '',
    };
    
    return JSON.stringify(canonical, Object.keys(canonical).sort());
}

/**
 * Compute SHA256 hash of canonical JSON
 */
function computeDataHash(canonicalJson) {
    return crypto
        .createHash('sha256')
        .update(canonicalJson)
        .digest('hex');
}

module.exports = {
    extractJsonFromTranscription,
    createCanonicalJson,
    computeDataHash,
};
