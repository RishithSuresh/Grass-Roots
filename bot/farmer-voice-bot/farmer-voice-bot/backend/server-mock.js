const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const busboy = require('busboy');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Busboy middleware for multipart form data
app.use((req, res, next) => {
    if (req.is('multipart/form-data')) {
        const bb = busboy({ headers: req.headers });
        req.fields = {};
        req.files = [];

        bb.on('field', (fieldname, val) => {
            req.fields[fieldname] = val;
        });

        bb.on('file', (fieldname, file, info) => {
            const { filename } = info;
            const saveTo = path.join(require('os').tmpdir(), `${uuidv4()}_${filename}`);
            const writeStream = require('fs').createWriteStream(saveTo);
            file.pipe(writeStream);
            writeStream.on('close', () => {
                req.files.push({ fieldname, filename, path: saveTo });
            });
        });

        bb.on('finish', () => {
            next();
        });

        req.pipe(bb);
    } else {
        next();
    }
});

// Session store
const sessions = {};

// Mock responses
const mockTranscriptions = {
    en: 'I am growing rice on 5 acres in flowering stage. I noticed pest damage and used neem oil spray. I expect 50 quintals yield. Price is 2000 rupees per quintal.',
    hi: 'Main 5 bighe par makka ugra raha hoon. Fasal growth stage mein hai.',
    ta: 'Naan 5 veli maavil arisi karandi kondu irukkireen.'
};

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
    let sessionId = req.fields?.sessionId || req.body?.sessionId;
    let language = req.fields?.language || req.body?.language;
    
    console.log(`\n📥 Upload received:`);
    console.log(`   Session: ${sessionId}`);
    console.log(`   Language: ${language}`);
    console.log(`   Fields available: ${req.fields ? Object.keys(req.fields) : 'none'}`);
    console.log(`   Body keys: ${Object.keys(req.body).slice(0, 5)}`);
    
    // Validate required fields
    if (!sessionId || !language) {
        console.error(`❌ Missing fields - sessionId: ${sessionId}, language: ${language}`);
        return res.status(400).json({ error: 'Missing sessionId or language' });
    }
    
    // Get mock transcription (different each time to show variety)
    const transcriptions = {
        en: [
            'I am growing wheat on 3 acres in tillering stage. Noticed yellow leaf spots.',
            'I have cotton crop on 2 hectares. Flowering started. Used pesticide spray.',
            'Sugarcane field, 5 acres, early growth stage. Water logging issue observed.',
            'Corn crop, 4 acres, grain filling stage. Healthy so far.',
            'Paddy field, 6 acres, panicle initiation stage. No major issues.'
        ],
        hi: [
            'Main 5 bigha par makka ugra raha hoon. Neeche ke patte paile ho gaye hain.',
            'Mera gaon 3 acre par gahun hai. Vikas theek se ho raha hai.',
            'Cotton ka kheti 2 acre mein hai. Phuul aa gaye hain.'
        ],
        ta: [
            'Naan 5 veli maavil arisi karandi kondu irukkireen. Neela neruppu parthaal vizha',
            'Naan 4 veli manioc karandi kondu irukkireen. Neesanam ila.'
        ]
    };
    
    const langTranscriptions = transcriptions[language] || transcriptions.en;
    const randomTranscription = langTranscriptions[Math.floor(Math.random() * langTranscriptions.length)];

    // If client provided a transcription (via Web Speech API), prefer that
    const providedTranscription = (req.fields && req.fields.transcription) || req.body && req.body.transcription;
    const transcription = providedTranscription || randomTranscription;

    console.log(`📝 Transcribed (used): ${transcription.slice(0, 60)}...`);

    // Extract data from transcription keywords
    const recordJson = extractFarmerData(transcription, language);
    recordJson.farmer_id = `farmer_${sessionId.slice(0, 8)}`;
    recordJson.language = language;

    if (sessions[sessionId]) {
        sessions[sessionId].recordJson = recordJson;
        sessions[sessionId].transcription = transcription;
    }

    res.json({
        sessionId,
        transcription,
        recordJson,
        botMessage: `I heard you say: "${transcription.slice(0, 60)}..." Is this correct?`,
        status: 'ready_for_confirmation'
    });
});

/**
 * Helper: Extract farmer data from transcription
 */
function extractFarmerData(text, language) {
    const lowerText = text.toLowerCase();
    
    // Extract acreage (numbers followed by acre/hectare/bigha/veli)
    let acreage = 5;
    const acreMatch = text.match(/(\d+)\s*(acre|hectare|bigha|veli)/i);
    if (acreMatch) acreage = parseInt(acreMatch[1]);
    
    // Extract crop type
    let crop_type = 'rice';
    const crops = ['wheat', 'cotton', 'sugarcane', 'corn', 'paddy', 'rice', 'makka', 'arisi', 'manioc'];
    for (let crop of crops) {
        if (lowerText.includes(crop)) {
            crop_type = crop;
            break;
        }
    }
    
    // Extract growth stage
    let current_stage = 'vegetative';
    const stages = ['tillering', 'flowering', 'grain filling', 'panicle initiation', 'early growth', 'vegetative'];
    for (let stage of stages) {
        if (lowerText.includes(stage)) {
            current_stage = stage;
            break;
        }
    }
    
    // Extract observed issues
    let observed_issues = [];
    const issues = ['pest', 'disease', 'water logging', 'yellow leaf', 'spot', 'wilting'];
    for (let issue of issues) {
        if (lowerText.includes(issue)) {
            observed_issues.push(issue);
        }
    }
    
    // Extract chemicals used
    let chemicals_used = [];
    const chemicals = ['pesticide', 'neem oil', 'fertilizer', 'spray'];
    for (let chem of chemicals) {
        if (lowerText.includes(chem)) {
            chemicals_used.push({ name: chem, dosage: '5L' });
        }
    }
    
    return {
        crop_type,
        acreage,
        current_stage,
        observed_issues: observed_issues.length > 0 ? observed_issues : ['none'],
        chemicals_used: chemicals_used.length > 0 ? chemicals_used : [],
        expected_yield: '50 quintals',
        price_expectation: '2000 INR',
        audio_ipfs_cid: null,
        timestamp: new Date().toISOString()
    };
}

/**
 * POST /api/confirm-store
 */
app.post('/api/confirm-store', (req, res) => {
    const { sessionId, consent } = req.body;
    
    if (!consent) {
        return res.status(400).json({ error: 'Consent not given' });
    }
    
    // Mock IPFS CID
    const ipfsCid = `QmMock${Date.now().toString(36).toUpperCase()}`;
    
    // Mock hash
    const dataHash = `0x${Math.random().toString(16).slice(2, 66)}`;
    
    // Mock transaction
    const txHash = `0x${Math.random().toString(16).slice(2, 66)}`;
    
    console.log(`✅ Record stored!`);
    console.log(`   IPFS CID: ${ipfsCid}`);
    console.log(`   Data Hash: ${dataHash}`);
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
 * POST /api/upload-answers
 * Accepts multipart form with files named 'answers' and optional client_transcript_X fields.
 * Returns server-side ASR results per answer using Python transcriber.
 */
app.post('/api/upload-answers', (req, res) => {
    const { execSync } = require('child_process');
    const path = require('path');
    
    const sessionId = req.fields?.sessionId || req.body?.sessionId;
    const language = req.fields?.language || req.body?.language || 'en';
    if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

    // Collect provided client transcripts
    const clientTranscripts = Object.keys(req.fields || {})
        .filter(k => k.startsWith('client_transcript_'))
        .sort()
        .map(k => req.fields[k]);

    // If files were uploaded, transcribe them using Python
    const uploadedFiles = req.files || [];
    const serverASR = [];

    if (uploadedFiles.length > 0) {
        console.log(`\n🎤 Transcribing ${uploadedFiles.length} audio files...`);
        uploadedFiles.forEach((f, idx) => {
            console.log(` - ${f.filename} -> ${f.path}`);
            try {
                // Run Python transcriber on the audio file
                const transcription = execSync(
                    `/Users/nishanishmitha/Desktop/MP/.venv/bin/python ${path.join(__dirname, 'vosk_transcriber.py')} "${f.path}" "${language}"`,
                    { encoding: 'utf-8', timeout: 60000 }
                ).trim();
                
                console.log(`   ✅ Transcribed: "${transcription}"`);
                serverASR.push(transcription || `server transcribed answer ${idx+1}`);
            } catch (error) {
                console.log(`   ❌ Error transcribing: ${error.message}`);
                serverASR.push(`server transcribed answer ${idx+1}`);
            }
        });
    } else if (clientTranscripts.length > 0) {
        // Use client transcripts if no files
        for (let i = 0; i < clientTranscripts.length; i++) {
            const t = clientTranscripts[i] || '';
            serverASR.push(t || `server transcribed answer ${i+1}`);
        }
    } else {
        // Fallback to mocks
        const mocks = {
            en: [ 'wheat', '3 acres', 'flowering', 'pest damage' ],
            hi: [ 'makka', '5 bigha', 'phool aana', 'keede' ],
            kn: [ 'sugarcane', '4 acres', 'growth', 'water damage' ]
        };
        const pick = mocks[language] || mocks.en;
        for (let i = 0; i < pick.length; i++) serverASR.push(pick[i]);
    }

    // Return ASR results
    res.json({ sessionId, serverASR, files: (uploadedFiles || []).map(f => ({ filename: f.filename, path: f.path })) });
});

/**
 * GET /api/session/:sessionId
 */
app.get('/api/session/:sessionId', (req, res) => {
    const session = sessions[req.params.sessionId];
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
});

/**
 * Health check
 */
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
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
