const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import handlers
const asrHandler = require('./asrHandler');
const ipfsHandler = require('./ipfsHandler');
const blockchainHandler = require('./blockchainHandler');
const ttsHandler = require('./ttsHandler');
const { extractJsonFromTranscription, computeDataHash, createCanonicalJson } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, '../frontend')));

// In-memory session store
const sessions = {};

/**
 * POST /api/start-session
 * Initialize a new session
 */
app.post('/api/start-session', (req, res) => {
    try {
        const { language = 'en' } = req.body;
        const sessionId = uuidv4();
        
        sessions[sessionId] = {
            sessionId,
            language,
            createdAt: new Date(),
            audioPath: null,
            transcription: null,
            recordJson: null,
            ipfsCid: null,
            dataHash: null,
            txHash: null,
        };
        
        console.log(`[Session] New session created: ${sessionId} (${language})`);
        
        res.json({
            sessionId,
            message: 'Session started. Please record your message.',
            languages: ['en', 'hi', 'ta'],
        });
    } catch (error) {
        console.error('[Error] start-session:', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/upload-audio
 * Receive audio, transcribe, and extract JSON
 */
app.post('/api/upload-audio', async (req, res) => {
    try {
        const { sessionId, language = 'en' } = req.body;
        
        if (!req.files || !req.files.audio) {
            return res.status(400).json({ error: 'No audio file provided' });
        }
        
        if (!sessions[sessionId]) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        const audioFile = req.files.audio;
        const audioPath = path.join(__dirname, 'uploads', `${sessionId}-audio.webm`);
        
        // Ensure uploads directory exists
        if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
            fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
        }
        
        // Save audio file
        await audioFile.mv(audioPath);
        sessions[sessionId].audioPath = audioPath;
        
        console.log(`[ASR] Processing audio for session ${sessionId}`);
        
        // Transcribe using Vosk
        const transcription = await asrHandler.transcribeAudio(audioPath, language);
        sessions[sessionId].transcription = transcription;
        
        console.log(`[ASR] Transcription: ${transcription}`);
        
        // Extract structured JSON from transcription
        const recordJson = await extractJsonFromTranscription(transcription, language);
        recordJson.farmer_id = `farmer_${sessionId.slice(0, 8)}`; // Pseudonymous ID
        recordJson.timestamp = new Date().toISOString();
        recordJson.language = language;
        
        sessions[sessionId].recordJson = recordJson;
        
        console.log(`[JSON] Extracted record:`, recordJson);
        
        // Generate TTS response
        const botMessage = `Thank you. I heard: ${transcription.slice(0, 50)}... Is this correct?`;
        
        res.json({
            sessionId,
            transcription,
            recordJson,
            botMessage,
            status: 'ready_for_confirmation',
        });
    } catch (error) {
        console.error('[Error] upload-audio:', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/confirm-store
 * Store on IPFS and blockchain
 */
app.post('/api/confirm-store', async (req, res) => {
    try {
        const { sessionId, recordJson, consent } = req.body;
        
        if (!consent) {
            return res.status(400).json({ error: 'Consent not granted' });
        }
        
        if (!sessions[sessionId]) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        const session = sessions[sessionId];
        
        // Read audio file
        const audioBuffer = fs.readFileSync(session.audioPath);
        
        // Upload audio to IPFS
        console.log('[IPFS] Uploading audio...');
        const ipfsCid = await ipfsHandler.uploadAudio(audioBuffer, `${sessionId}.webm`);
        session.ipfsCid = ipfsCid;
        
        recordJson.audio_ipfs_cid = ipfsCid;
        
        console.log(`[IPFS] CID: ${ipfsCid}`);
        
        // Compute deterministic data hash
        const canonicalJson = createCanonicalJson(recordJson);
        const dataHash = computeDataHash(canonicalJson);
        session.dataHash = dataHash;
        
        console.log(`[Hash] Data hash: ${dataHash}`);
        
        // Store on blockchain
        console.log('[Blockchain] Storing record...');
        const txHash = await blockchainHandler.addRecord(
            recordJson.farmer_id,
            Math.floor(new Date(recordJson.timestamp).getTime() / 1000),
            dataHash,
            ipfsCid
        );
        session.txHash = txHash;
        
        console.log(`[Blockchain] TX Hash: ${txHash}`);
        
        // Generate TTS confirmation
        const ttsMessage = `Record saved successfully. Transaction ID: ${txHash.slice(0, 8)}. Thank you for your report.`;
        
        res.json({
            sessionId,
            ipfsCid,
            dataHash,
            txHash,
            message: ttsMessage,
            audioUrl: `/audio/bot-response-${sessionId}.wav`,
        });
    } catch (error) {
        console.error('[Error] confirm-store:', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/session/:sessionId
 * Get session details
 */
app.get('/api/session/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    
    if (!sessions[sessionId]) {
        return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(sessions[sessionId]);
});

/**
 * Health check
 */
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('[Error]', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
    console.log(`🌾 Farmer Voice Bot Backend running on http://localhost:${PORT}`);
    console.log(`📚 API: http://localhost:${PORT}/api`);
    console.log(`🏥 Health: http://localhost:${PORT}/health`);
});

module.exports = app;
