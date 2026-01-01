// Frontend WebRTC Audio Capture & Session Management

// Use same-origin API by default to avoid cross-origin / CSP issues.
// When this UI is served under the main GrassRoots backend (/callbot),
// the bot routes are mounted at `/api/bot` there — detect and use that.
let API_BASE = '/api';
try {
    if (location.pathname.startsWith('/callbot') || (location.hostname === 'localhost' && location.port === '4000')) {
        API_BASE = '/api/bot';
    }
} catch (e) {
    API_BASE = '/api';
}

// Build WebSocket URL from current location to match the origin (ws or wss)
const WS_BASE = (location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + location.host + '/ws';

// State Management
const state = {
    sessionId: null,
    language: 'en',
    ttsPreference: 'preferred',
    availableVoices: [],
    mediaRecorder: null,
    audioChunks: [],
    recordingActive: false,
    recordedBlob: null,
    transcription: '',
    botResponse: null,
    recordJson: null,
    assistantDialogueActive: false,
    stopDialogueRequested: false,
};

// DOM Elements
const elements = {
    languageSelect: document.getElementById('language'),
    voiceSelect: document.getElementById('voiceSelect'),
    startBtn: document.getElementById('startBtn'),
    stopBtn: document.getElementById('stopBtn'),
    recordingIndicator: document.getElementById('recordingIndicator'),
    transcriptionCard: document.getElementById('transcriptionCard'),
    transcriptionText: document.getElementById('transcriptionText'),
    transcriptionConfirmCard: document.getElementById('transcriptionConfirmCard'),
    transcriptionConfirmText: document.getElementById('transcriptionConfirmText'),
    transcriptionEditBox: document.getElementById('transcriptionEditBox'),
    confirmTranscriptionBtn: document.getElementById('confirmTranscriptionBtn'),
    reRecordAllBtn: document.getElementById('reRecordAllBtn'),
    botResponseCard: document.getElementById('botResponseCard'),
    botText: document.getElementById('botText'),
    playAudioBtn: document.getElementById('playAudioBtn'),
    botAudio: document.getElementById('botAudio'),
    consentCard: document.getElementById('consentCard'),
    consentSummary: document.getElementById('consentSummary'),
    consentYesBtn: document.getElementById('consentYesBtn'),
    consentNoBtn: document.getElementById('consentNoBtn'),
    resultsCard: document.getElementById('resultsCard'),
    txHash: document.getElementById('txHash'),
    ipfsCid: document.getElementById('ipfsCid'),
    dataHash: document.getElementById('dataHash'),
    newCallBtn: document.getElementById('newCallBtn'),
    errorCard: document.getElementById('errorCard'),
    errorMsg: document.getElementById('errorMsg'),
    dismissErrorBtn: document.getElementById('dismissErrorBtn'),
    sessionInfo: document.getElementById('sessionInfo'),
    sessionId: document.getElementById('sessionId'),
    status: document.getElementById('status'),
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await initializeSession();
    attachEventListeners();
    populateVoices();
});

// Populate available TTS voices and wire selection
function populateVoices() {
    const select = elements.voiceSelect;
    if (!select) return;

    function _populate() {
        const voices = speechSynthesis.getVoices();
        // Keep options minimal: Default and Prefer high-quality
        // But store available voices to pick better voice in code
        state.availableVoices = voices;
    }

    // Some browsers load voices asynchronously
    _populate();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = _populate;
    }

    select.addEventListener('change', (e) => {
        state.ttsPreference = e.target.value;
    });
}

function pickPreferredVoice(locale) {
    // Return a SpeechSynthesisVoice object based on preference and availability
    const voices = state.availableVoices || speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // If user chose preferred, try to pick well-known high-quality voices
    const preferredNames = [
        'Google UK English Male',
        'Google US English',
        'Google UK English Female',
        'Google Hindi',
        'Google Kannada',
        'Microsoft Zira',
        'Microsoft David',
        'Samantha',
        'Daniel',
        'en-US-Wavenet-D',
        'en-US-Wavenet-F',
        'hi-IN-Wavenet-A',
        'hi-IN-Wavenet-D',
        'kn-IN-Wavenet-A'
    ];

    if (state.ttsPreference === 'preferred') {
        for (let name of preferredNames) {
            const v = voices.find(v => v.name && v.name.includes(name));
            if (v) return v;
        }
    }

    // Fallback: pick a voice that matches locale
    const localeMatch = voices.find(v => v.lang && v.lang.startsWith(locale));
    if (localeMatch) return localeMatch;

    // Otherwise return first available
    return voices[0];
}

// Parse a spoken number from free-text (handles digits, decimals, and common number words)
function parseNumberFromText(text) {
    if (!text || typeof text !== 'string') return null;
    const s = text.toLowerCase().trim();
    // Try direct numeric match first (integers, decimals)
    const numMatch = s.match(/-?\d+(?:\.\d+)?/);
    if (numMatch) return parseFloat(numMatch[0]);

    // Word -> value maps
    const SMALL = {
        zero:0, one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9,
        ten:10, eleven:11, twelve:12, thirteen:13, fourteen:14, fifteen:15, sixteen:16, seventeen:17, eighteen:18, nineteen:19
    };
    const TENS = { twenty:20, thirty:30, forty:40, fifty:50, sixty:60, seventy:70, eighty:80, ninety:90 };
    const SCALES = { hundred:100, thousand:1000, million:1000000 };

    const words = s.replace(/[^a-z0-9\s/-]/g, ' ').split(/[\s-]+/).filter(Boolean);
    if (words.length === 0) return null;

    let total = 0;
    let current = 0;
    let decimalMode = false;
    let decimalDigits = '';

    const digitForWord = (w) => {
        if (SMALL[w] !== undefined) return String(SMALL[w]);
        if (TENS[w] !== undefined) return String(TENS[w] / 10 | 0);
        if (/^\d$/.test(w)) return w;
        return null;
    };

    for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (w === 'and') continue;
        if (w === 'point' || w === 'dot') {
            decimalMode = true;
            continue;
        }
        if (decimalMode) {
            const d = digitForWord(w);
            if (d !== null) {
                decimalDigits += d;
                continue;
            }
            // try numeric digit token like '5' or '0'
            if (/^\d+$/.test(w)) {
                decimalDigits += w;
                continue;
            }
            // unknown token in decimal part — stop decimal parsing
            break;
        }

        if (SMALL[w] !== undefined) {
            current += SMALL[w];
            continue;
        }
        if (TENS[w] !== undefined) {
            current += TENS[w];
            continue;
        }
        if (w in SCALES) {
            if (current === 0) current = 1;
            current = current * SCALES[w];
            // scale may need to be added to total for thousand/million
            if (SCALES[w] >= 1000) {
                total += current;
                current = 0;
            }
            continue;
        }
        // fractions like 'half' or 'quarter'
        if (w === 'half') { current += 0.5; continue; }
        if (w === 'quarter') { current += 0.25; continue; }
        // explicit numeric token
        if (/^\d+$/.test(w)) { current += parseInt(w, 10); continue; }
        // fallback: try to parse floats like '2.5'
        const f = parseFloat(w);
        if (!isNaN(f)) { current += f; continue; }
        // otherwise ignore unknown word
    }

    total += current;
    if (total === 0 && decimalDigits === '') return null;
    if (decimalDigits) {
        const intPart = total;
        const dec = parseFloat('0.' + decimalDigits);
        return intPart + dec;
    }
    return total;
}

async function initializeSession() {
    try {
        const response = await fetch(`${API_BASE}/start-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language: state.language }),
        });
        
        const data = await response.json();
        state.sessionId = data.sessionId;
        
        elements.sessionInfo.classList.remove('hidden');
        elements.sessionId.textContent = state.sessionId;
        updateStatus('Ready');
        
        console.log('Session initialized:', state.sessionId);
    } catch (error) {
        showError('Failed to initialize session: ' + error.message);
    }
}

function attachEventListeners() {
    elements.languageSelect.addEventListener('change', (e) => {
        state.language = e.target.value;
    });
    
    elements.startBtn.addEventListener('click', startRecording);
    elements.stopBtn.addEventListener('click', stopRecording);
    elements.playAudioBtn.addEventListener('click', playBotAudio);
    elements.consentYesBtn.addEventListener('click', confirmStore);
    elements.consentNoBtn.addEventListener('click', cancelStore);
    elements.newCallBtn.addEventListener('click', resetAndNewCall);
    elements.dismissErrorBtn.addEventListener('click', hideError);
    // Transcription confirmation buttons
    const confirmTransBtn = document.getElementById('confirmTranscriptionBtn');
    if (confirmTransBtn) confirmTransBtn.addEventListener('click', confirmTranscription);
    const reRecordBtn = document.getElementById('reRecordAllBtn');
    if (reRecordBtn) reRecordBtn.addEventListener('click', resetAndNewCall);
    // Review/upload buttons
    const uploadBtn = document.getElementById('uploadAnswersBtn');
    if (uploadBtn) uploadBtn.addEventListener('click', uploadAnswers);
    const skipBtn = document.getElementById('skipReviewBtn');
    if (skipBtn) skipBtn.addEventListener('click', () => {
        document.getElementById('reviewCard').classList.add('hidden');
        // fallback to full upload
        uploadAndTranscribe();
    });
}

async function startRecording() {
    try {
        updateStatus('Requesting microphone access...');
        // Better audio constraints for clearer microphone input
        const audioConstraints = {
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: false,  // Disable auto-gain to avoid clipping
                sampleRate: 16000  // Standard speech recognition sample rate
            }
        };
        const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
        
        const mimeType = 'audio/webm;codecs=opus';
        // Keep the raw MediaStream available and use per-question recorders
        state.stream = stream;
        state.recordingActive = true;
        state.answersAudio = []; // per-question Blobs
        state.answersTranscripts = [];
        // Start guided assistant Q&A after user granted mic access
        try {
            startAssistantDialogue();
        } catch (e) {
            console.warn('Assistant dialogue failed to start', e);
        }
        
        elements.startBtn.classList.add('hidden');
        elements.stopBtn.classList.remove('hidden');
        elements.recordingIndicator.classList.remove('hidden');
        updateStatus('Recording...');
        
        console.log('Recording started');
    } catch (error) {
        showError('Microphone access denied: ' + error.message);
    }
}

function stopRecording() {
    // Signal the assistant dialogue to stop
    state.stopDialogueRequested = true;
    state.assistantDialogueActive = false;
    state.recordingActive = false;
    
    if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
    }
    if (state.mediaRecorder) {
        try { state.mediaRecorder.stop(); } catch (e) {}
    }
    
    elements.stopBtn.classList.add('hidden');
    elements.startBtn.classList.remove('hidden');
    elements.recordingIndicator.classList.add('hidden');
    updateStatus('Recording stopped.');
}

// --- Guided Voice Assistant (asks questions via TTS, captures answers via Web Speech API) ---
const assistantQuestions = [
    'What crop have you grown?',
    'How many acres or hectares is the plot?',
    'What is the current growth stage of the crop?',
    'Have you observed any pests or diseases or other issues?'
];

async function startAssistantDialogue() {
    // Ensure MediaRecorder is running (we record the session audio)
    if (!state.recordingActive) return;

    state.perQuestionMode = true;
    state.assistantDialogueActive = true;
    state.stopDialogueRequested = false;
    const answers = [];
    updateStatus('Assistant: Asking questions...');

    for (let i = 0; i < assistantQuestions.length; i++) {
        if (state.stopDialogueRequested || !state.recordingActive) {
            console.log('Dialogue stopped by user');
            break;
        }
        const q = assistantQuestions[i];
        try {
            const { transcript, audioBlob } = await askQuestionWithAudio(q, 12000); // 12s timeout per question
            answers.push(transcript || '');
            state.answersAudio[i] = audioBlob;
            state.answersTranscripts[i] = transcript || '';
            // update live transcript shown to user
            state.transcriptionLive = answers.join(' | ');
            elements.transcriptionCard.classList.remove('hidden');
            elements.transcriptionText.textContent = state.transcriptionLive;
        } catch (e) {
            console.warn('Question failed:', e);
            answers.push('');
            state.answersAudio[i] = null;
            state.answersTranscripts[i] = '';
        }
        // brief pause between Qs
        await new Promise(r => setTimeout(r, 400));
    }

    state.assistantDialogueActive = false;

    // If user stopped, skip showing results
    if (state.stopDialogueRequested) {
        return;
    }

    // Populate recordJson fields from collected answers (best-effort)
    const [crop, acreage, stage, issues] = answers;
    state.recordJson = state.recordJson || {};
    if (crop) state.recordJson.crop_type = crop;
    if (acreage) {
        const parsed = parseNumberFromText(acreage);
        state.recordJson.acreage = (parsed !== null) ? parsed : (Number((acreage.match(/\d+/) || [])[0]) || acreage);
    }
    if (stage) state.recordJson.current_stage = stage;
    if (issues) state.recordJson.observed_issues = issues.split(/,|and|\band\b/).map(s => s.trim()).filter(Boolean);

    // Stop recording to trigger upload flow
    try {
        if (state.mediaRecorder && state.recordingActive) {
            state.mediaRecorder.stop();
            state.recordingActive = false;
        }
    } catch (e) { /* ignore */ }

    updateStatus('Processing responses...');
    // Show review UI so user can replay/re-record and then upload per-question answers
    showReviewCard();
}

async function askQuestionWithAudio(promptText, timeoutMs = 10000) {
    return new Promise((resolve) => {
        try {
            // Start recording audio
            let mediaRecorder = null;
            let audioChunks = [];
            
            if (state.stream) {
                mediaRecorder = new MediaRecorder(state.stream);
                mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
                mediaRecorder.start();
            }
            
            // Speak the question
            const utter = new SpeechSynthesisUtterance(promptText);
            const langMap = { en: 'en-US', hi: 'hi-IN', kn: 'kn-IN' };
            utter.lang = langMap[state.language] || 'en-US';
            
            try {
                const chosen = pickPreferredVoice(utter.lang);
                if (chosen) utter.voice = chosen;
            } catch (e) { /* ignore */ }
            
            // Start listening after a short delay
            const delay = setTimeout(() => {
                const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
                recognition.lang = langMap[state.language] || 'en-US';
                recognition.continuous = false;
                recognition.interimResults = true;
                
                let transcript = '';
                let isFinal = false;
                
                recognition.onstart = () => {
                    elements.transcriptionCard.classList.remove('hidden');
                    elements.transcriptionText.textContent = '🎤 Listening...';
                };
                
                recognition.onresult = (event) => {
                    transcript = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        transcript += event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            isFinal = true;
                        }
                    }
                    elements.transcriptionText.textContent = transcript || '🎤 Listening...';
                };
                
                recognition.onerror = (event) => {
                    console.error('Speech recognition error:', event.error);
                };
                
                recognition.onend = () => {
                    clearTimeout(timeout);
                    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                        mediaRecorder.stop();
                    }
                    recognition.abort();
                    
                    // Return both audio and transcript
                    const audioBlob = mediaRecorder ? new Blob(audioChunks, { type: 'audio/webm' }) : null;
                    resolve({ transcript: transcript.trim(), audioBlob: audioBlob });
                };
                
                try {
                    recognition.start();
                } catch (e) {
                    console.warn('Recognition start failed:', e);
                    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                        mediaRecorder.stop();
                    }
                    resolve({ transcript: '', audioBlob: null });
                }
                
                // Timeout after 15 seconds of listening
                const timeout = setTimeout(() => {
                    recognition.abort();
                    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                        mediaRecorder.stop();
                    }
                    const audioBlob = mediaRecorder ? new Blob(audioChunks, { type: 'audio/webm' }) : null;
                    resolve({ transcript: transcript.trim(), audioBlob: audioBlob });
                }, 15000);
            }, 500);
            
            // Speak the question
            speechSynthesis.cancel();
            speechSynthesis.speak(utter);
            
        } catch (error) {
            console.error('Ask question error:', error);
            resolve({ transcript: '', audioBlob: null });
        }
    });
}

function askQuestion(promptText, timeoutMs = 10000) {
    return new Promise((resolve) => {
        // Speak the prompt using SpeechSynthesis
        try {
            const utter = new SpeechSynthesisUtterance(promptText);
            // map language codes
            const langMap = { en: 'en-US', hi: 'hi-IN', kn: 'kn-IN' };
            utter.lang = langMap[state.language] || state.language || 'en-US';
            try { const chosen = pickPreferredVoice(utter.lang); if (chosen) utter.voice = chosen; } catch (e) {}
            speechSynthesis.cancel();
            speechSynthesis.speak(utter);
        } catch (e) {
            console.warn('TTS failed', e);
        }

        // If Web Speech API available, use it to capture answer
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            // fallback: ask user to type
            const typed = window.prompt(promptText + ' (type your answer)');
            return resolve(typed || '');
        }

        const recog = new SpeechRecognition();
        const langMap = { en: 'en-US', hi: 'hi-IN', kn: 'kn-IN' };
        recog.lang = langMap[state.language] || 'en-US';
        recog.interimResults = true;
        recog.maxAlternatives = 1;

        let lastInterim = '';
        let finished = false;
        let silenceTimer = null;
        const resetSilence = () => {
            if (silenceTimer) clearTimeout(silenceTimer);
            silenceTimer = setTimeout(() => { if (!finished) { finished = true; try { recog.stop(); } catch (e) {} resolve(lastInterim); } }, 1200);
        };

        const timer = setTimeout(() => {
            if (!finished) {
                finished = true;
                try { recog.stop(); } catch (e) {}
                resolve('');
            }
        }, Math.max(timeoutMs, 30000));

        recog.onresult = (event) => {
            if (finished) return;
            const results = Array.from(event.results);
            const last = results[results.length - 1];
            const transcriptText = Array.from(last).map(r => r[0].transcript).join('');
            if (last.isFinal) {
                finished = true;
                clearTimeout(timer);
                try { recog.stop(); } catch (e) {}
                resolve(transcriptText);
            } else {
                lastInterim = transcriptText;
                elements.transcriptionCard.classList.remove('hidden');
                elements.transcriptionText.textContent = (state.transcriptionLive || '') + ' ' + lastInterim;
                resetSilence();
            }
        };

        recog.onerror = (e) => {
            console.warn('Speech recognition error', e.error);
            if (!finished) {
                finished = true;
                clearTimeout(timer);
                resolve('');
            }
        };

        recog.onend = () => {
            if (!finished) {
                finished = true;
                clearTimeout(timer);
                resolve(lastInterim);
            }
        };

        try {
            recog.start();
        } catch (e) {
            console.warn('recog start failed', e);
            clearTimeout(timer);
            resolve('');
        }
    });
}

async function handleRecordingStop() {
    state.recordedBlob = new Blob(state.audioChunks, { type: 'audio/webm' });
    console.log('Recording stopped. Blob size:', state.recordedBlob.size);
    
    // Stop speech recognition (if running) so we get a final transcript
    try { stopSpeechRecognition(); } catch (e) { /* ignore */ }

    // If we are running per-question assistant mode, do NOT trigger the full upload flow.
    if (state.perQuestionMode) {
        // main recorded blob preserved, but user should review per-question answers
        updateStatus('Recording complete. Review your answers.');
        showReviewCard();
        return;
    }

    await uploadAndTranscribe();
}

async function uploadAndTranscribe() {
    try {
        const formData = new FormData();
        formData.append('sessionId', state.sessionId);
        formData.append('audio', state.recordedBlob, 'recording.webm');
        formData.append('language', state.language);
        // If the browser produced a live transcription via Web Speech API, include it
        if (state.transcriptionLive) {
            formData.append('transcription', state.transcriptionLive);
        }
        
        updateStatus('Uploading and transcribing...');
        
        const response = await fetch(`${API_BASE}/upload-audio`, {
            method: 'POST',
            body: formData,
        });
        
        const data = await response.json();
        
        if (data.error) {
            showError(data.error);
            return;
        }
        
        state.transcription = data.transcription;
        state.recordJson = data.recordJson;
        
        displayTranscription();
        displayBotResponse(data.botMessage);
        updateStatus('Ready for confirmation');
        
        showConsentCard();
    } catch (error) {
        showError('Upload failed: ' + error.message);
    }
}

// Upload per-question answers (transcripts only, no audio files needed)
async function uploadAnswers() {
    if (!state.sessionId) return;
    const form = new FormData();
    form.append('sessionId', state.sessionId);
    form.append('language', state.language);
    
    // Send audio files and client transcripts
    state.answersAudio.forEach((blob, i) => {
        if (i < 4 && blob) {
            form.append(`audio_${i}`, blob, `answer_${i}.webm`);
        }
    });
    
    state.answersTranscripts.forEach((t, i) => {
        if (i < 4) {
            form.append(`client_transcript_${i}`, t || '');
        }
    });

    updateStatus('Processing your answers...');
    const res = await fetch(`${API_BASE}/upload-answers`, { method: 'POST', body: form });
    const data = await res.json();
    if (data.error) { showError(data.error); return; }

    // Use transcripts from server (which translated from audio)
    if (data.transcripts && Array.isArray(data.transcripts)) {
        state.answersTranscripts = data.transcripts.slice(0, 4);
    } else {
        state.answersTranscripts = state.answersTranscripts.slice(0, 4);
    }

    // Combine all transcripts into one text
    const fullTranscription = state.answersTranscripts.filter(t => t && t.trim()).join(' | ');
    state.transcription = fullTranscription || 'No transcription captured';

    // Merge into recordJson
    const [crop, acreage, stage, issues] = state.answersTranscripts;
    if (crop) state.recordJson.crop_type = crop;
    if (acreage) state.recordJson.acreage = Number((acreage.match(/\d+/) || [])[0]) || acreage;
    if (stage) state.recordJson.current_stage = stage;
    if (issues) state.recordJson.observed_issues = issues.split(/,|and|\band\b/).map(s => s.trim()).filter(Boolean);

    // Show transcription confirmation card
    showTranscriptionConfirmation(state.transcription);
}

// Show transcription confirmation before blockchain storage
function showTranscriptionConfirmation(transcriptionText) {
    const card = document.getElementById('transcriptionConfirmCard');
    if (!card) return;
    
    const textDisplay = document.getElementById('transcriptionConfirmText');
    const editBox = document.getElementById('transcriptionEditBox');
    
    if (textDisplay) textDisplay.textContent = transcriptionText;
    if (editBox) editBox.value = transcriptionText;
    
    // Hide review card and show confirmation card
    const reviewCard = document.getElementById('reviewCard');
    if (reviewCard) reviewCard.classList.add('hidden');
    card.classList.remove('hidden');
    
    updateStatus('Please review the transcription...');
}

// User confirms the transcription and wants to store on blockchain
function confirmTranscription() {
    const editBox = document.getElementById('transcriptionEditBox');
    if (editBox && editBox.value.trim()) {
        // Update transcription with user edits if any
        state.transcription = editBox.value.trim();
        // Parse updated text into recordJson
        const answers = state.transcription.split('|').map(s => s.trim());
        const [crop, acreage, stage, issues, price] = answers;
        if (crop) state.recordJson.crop_type = crop;
        if (acreage) state.recordJson.acreage = Number((acreage.match(/\d+/) || [])[0]) || acreage;
        if (stage) state.recordJson.current_stage = stage;
        if (issues) state.recordJson.observed_issues = issues.split(/,|and|\band\b/).map(s => s.trim()).filter(Boolean);
        if (price) state.recordJson.price_expectation = price;
    }
    
    const card = document.getElementById('transcriptionConfirmCard');
    if (card) card.classList.add('hidden');
    
    displayTranscription();
    displayBotResponse('Transcription confirmed. Ready to store on blockchain.');
    showConsentCard();
}

// UI: Review answers (simple implementation)
function showReviewCard() {
    const review = document.getElementById('reviewCard');
    if (!review) return;
    const list = review.querySelector('.answers-list');
    list.innerHTML = '';
    state.answersAudio.forEach((blob, i) => {
        const li = document.createElement('div');
        li.className = 'answer-item';
        const q = document.createElement('div'); 
        q.style.fontWeight = '600';
        q.style.marginBottom = '8px';
        q.textContent = `Q${i+1}: ${assistantQuestions[i]}`;
        
        const transcript = document.createElement('div');
        transcript.className = 'transcription-box';
        transcript.style.marginBottom = '12px';
        transcript.textContent = state.answersTranscripts[i] || '(No transcription)';
        
        const rer = document.createElement('button'); 
        rer.className = 'btn btn-small';
        rer.textContent = '🔄 Re-record';
        rer.addEventListener('click', async () => { await reRecordQuestion(i); showReviewCard(); });
        
        li.appendChild(q); 
        li.appendChild(transcript); 
        li.appendChild(rer);
        list.appendChild(li);
    });
    review.classList.remove('hidden');
}

async function reRecordQuestion(index) {
    // Ask the same question and replace the stored audio/transcript
    const q = assistantQuestions[index];
    const ans = await askQuestion(q, 12000);
    state.answersTranscripts[index] = ans;
    // record audio for answer
    const blob = await recordOneAnswer(index);
    if (blob) state.answersAudio[index] = blob;
}

// Record one answer using state.stream; returns Blob
function recordOneAnswer(index) {
    return new Promise((resolve) => {
        if (!state.stream) return resolve(null);
        const mimeType = 'audio/webm;codecs=opus';
        let chunks = [];
        const mr = new MediaRecorder(state.stream, { mimeType });
        mr.ondataavailable = (e) => chunks.push(e.data);
        mr.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
        mr.start();
        // Stop when we have a client-side transcript or after 8s
        const stopAfter = setTimeout(() => { try { mr.stop(); } catch (e) {} }, 8000);
        // If the answer was captured by the Web Speech API in state.transcriptionLive, stop earlier
        setTimeout(() => { /* allow speech recog to finish */ }, 50);
        // We'll stop when askQuestion finishes (askQuestion starts its own MediaRecorder), so for re-record we do short timeout
    });
}

// --- Web Speech API (client-side speech recognition) ---
function startSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn('Web Speech API not supported in this browser');
        return null;
    }

    const recog = new SpeechRecognition();
    // map simple codes to common BCP47 locales
    const langMap = { en: 'en-US', hi: 'hi-IN', kn: 'kn-IN' };
    recog.lang = langMap[state.language] || state.language || 'en-US';
    recog.interimResults = true;
    recog.maxAlternatives = 1;

    recog.onresult = (event) => {
        const results = Array.from(event.results);
        const transcript = results.map(r => r[0].transcript).join('');
        state.transcriptionLive = transcript;
        elements.transcriptionCard.classList.remove('hidden');
        elements.transcriptionText.textContent = transcript || 'Listening...';
    };

    recog.onerror = (e) => {
        console.warn('SpeechRecognition error', e.error);
    };

    recog.onend = () => {
        // Keep last final transcript, do not clear
    };

    recog.start();
    return recog;
}

function stopSpeechRecognition() {
    if (state._recognition) {
        try { state._recognition.stop(); } catch (e) {}
        state._recognition = null;
    }
}

function displayTranscription() {
    elements.transcriptionCard.classList.remove('hidden');
    elements.transcriptionText.textContent = state.transcription || 'No speech detected';
}

function displayBotResponse(message) {
    elements.botResponseCard.classList.remove('hidden');
    elements.botText.textContent = message || 'Processing...';
}

function playBotAudio() {
    if (state.botResponse && state.botResponse.audioUrl) {
        elements.botAudio.src = state.botResponse.audioUrl;
        elements.botAudio.play();
    }
}

function showConsentCard() {
    const summary = `
        Crop: ${state.recordJson.crop_type || 'N/A'}
        Acreage: ${state.recordJson.acreage || 'N/A'}
        Issues: ${state.recordJson.observed_issues?.join(', ') || 'None'}
    `;
    elements.consentSummary.textContent = summary;
    elements.consentCard.classList.remove('hidden');
}

async function confirmStore() {
    try {
        elements.consentYesBtn.disabled = true;
        updateStatus('Storing on blockchain...');
        
        const response = await fetch(`${API_BASE}/confirm-store`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: state.sessionId,
                recordJson: state.recordJson,
                consent: true,
            }),
        });
        
        const data = await response.json();
        
        if (data.error) {
            showError(data.error);
            elements.consentYesBtn.disabled = false;
            return;
        }
        
        state.botResponse = data;
        displayResults(data);
        updateStatus('✅ Complete');
    } catch (error) {
        showError('Store confirmation failed: ' + error.message);
        elements.consentYesBtn.disabled = false;
    }
}

function cancelStore() {
    elements.consentCard.classList.add('hidden');
    updateStatus('Cancelled');
    showError('Record storage cancelled by user.');
}

function displayResults(data) {
    elements.consentCard.classList.add('hidden');
    elements.resultsCard.classList.remove('hidden');
    elements.txHash.textContent = data.txHash || 'N/A';
    elements.ipfsCid.textContent = data.ipfsCid || 'N/A';
    elements.dataHash.textContent = data.dataHash || 'N/A';
}

function resetAndNewCall() {
    state.audioChunks = [];
    state.recordedBlob = null;
    state.transcription = '';
    state.recordJson = null;
    state.botResponse = null;
    
    elements.transcriptionCard.classList.add('hidden');
    elements.botResponseCard.classList.add('hidden');
    elements.resultsCard.classList.add('hidden');
    elements.startBtn.classList.remove('hidden');
    
    updateStatus('Ready');
}

function updateStatus(message) {
    elements.status.textContent = message;
}

function showError(message) {
    elements.errorMsg.textContent = message;
    elements.errorCard.classList.remove('hidden');
}

function hideError() {
    elements.errorCard.classList.add('hidden');
}
