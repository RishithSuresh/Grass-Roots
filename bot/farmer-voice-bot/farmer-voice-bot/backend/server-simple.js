const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const fileUpload = require('express-fileupload');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    useTempFiles: true,
    tempFileDir: os.tmpdir()
}));
app.use(express.static(path.join(__dirname, '../frontend')));

// Session store
const sessions = {};

// Crops store (in-memory for now)
const crops = [];

/**
 * POST /api/start-session
 */
app.post('/api/start-session', (req, res) => {
    const sessionId = uuidv4();
    sessions[sessionId] = {
        sessionId,
        language: req.body.language || 'en',
        createdAt: new Date(),
    };
    console.log(`✅ Session started: ${sessionId}`);
    res.json({ sessionId, message: 'Ready' });
});

/**
 * POST /api/upload-audio
 */
app.post('/api/upload-audio', (req, res) => {
    // Get from FormData fields or JSON body
    const sessionId = req.body?.sessionId;
    const language = req.body?.language;
    const transcription = req.body?.transcription;

    console.log(`\n📥 Upload received:`);
    console.log(`   Session: ${sessionId}`);
    console.log(`   Language: ${language}`);
    console.log(`   Transcription: ${transcription}`);
    console.log(`   Files:`, req.files ? Object.keys(req.files) : 'none');

    if (!sessionId || !language) {
        return res.status(400).json({ error: 'Missing sessionId or language' });
    }

    // Use provided transcription or mock
    const mockTranscriptions = {
        en: 'I am growing wheat on 3 acres in flowering stage. Noticed some pest damage.',
        hi: 'Main 5 bigha par makka ugra raha hoon.',
        kn: 'Naan 4 acres par sugarcane karandi kondu irukkireen.'
    };

    const finalTranscription = transcription || mockTranscriptions[language] || mockTranscriptions.en;
    
    // Extract data
    const recordJson = {
        farmer_id: `farmer_${sessionId.slice(0, 8)}`,
        language,
        crop_type: 'wheat',
        acreage: 3,
        current_stage: 'flowering',
        observed_issues: ['pest damage'],
        chemicals_used: [],
        expected_yield: '50 quintals',
        price_expectation: '2000 INR',
        timestamp: new Date().toISOString()
    };
    
    if (sessions[sessionId]) {
        sessions[sessionId].recordJson = recordJson;
        sessions[sessionId].transcription = finalTranscription;
    }
    
    res.json({
        sessionId,
        transcription: finalTranscription,
        recordJson,
        botMessage: `I heard you say: "${finalTranscription.slice(0, 60)}..." Is this correct?`,
        status: 'ready_for_confirmation'
    });
});

/**
 * POST /api/confirm-store
 */
app.post('/api/confirm-store', (req, res) => {
    const { sessionId, consent } = req.body;
    
    if (!consent) {
        return res.status(400).json({ error: 'Consent not given' });
    }
    
    const ipfsCid = `QmMock${Date.now().toString(36).toUpperCase()}`;
    const dataHash = `0x${Math.random().toString(16).slice(2, 66)}`;
    const txHash = `0x${Math.random().toString(16).slice(2, 66)}`;
    
    console.log(`✅ Record stored!`);
    console.log(`   IPFS CID: ${ipfsCid}`);
    console.log(`   TX Hash: ${txHash}`);
    
    res.json({
        sessionId,
        ipfsCid,
        dataHash,
        txHash,
        message: `Record saved! Transaction: ${txHash.slice(0, 8)}...`,
        audioUrl: `/audio/confirmation.wav`
    });
});

/**
 * GET /api/crops - Get all saved crops
 */
app.get('/api/crops', (req, res) => {
    console.log(`📋 GET /api/crops - Returning ${crops.length} crops`);
    res.json(crops);
});

/**
 * POST /api/crops - Save a new crop
 */
app.post('/api/crops', (req, res) => {
    const crop = {
        id: uuidv4(),
        ...req.body,
        createdAt: new Date().toISOString()
    };
    crops.push(crop);
    console.log(`✅ Crop saved: ${crop.cropType} - ${crop.area} acres`);
    res.json({ success: true, crop });
});

/**
 * GET /health
 */
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║   🌾 FARMER VOICE CALL-BOT BACKEND RUNNING! 🚜        ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`✅ Server: http://localhost:${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🏥 Health: http://localhost:${PORT}/health`);
    console.log('');
    console.log('Ready to receive voice calls from farmers!');
    console.log('');
});

