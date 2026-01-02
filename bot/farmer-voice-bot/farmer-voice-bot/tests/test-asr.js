/**
 * test-asr.js - Test ASR (Automatic Speech Recognition)
 * Tests Vosk transcription functionality
 */

const asrHandler = require('../backend/asrHandler');
const fs = require('fs');
const path = require('path');

async function testASR() {
    console.log('🧪 Testing ASR (Vosk)...\n');
    
    try {
        // Create a test audio file path (for POC, we'll use mock)
        const testAudioPath = path.join(__dirname, 'test-audio.webm');
        
        // Test mock transcription
        const languages = ['en', 'hi', 'ta'];
        
        for (const lang of languages) {
            console.log(`Testing language: ${lang}`);
            const transcription = await asrHandler.transcribeAudio(testAudioPath, lang);
            console.log(`✅ Result: "${transcription}"\n`);
        }
        
        console.log('✅ ASR tests passed!\n');
    } catch (error) {
        console.error('❌ ASR test failed:', error.message);
        process.exit(1);
    }
}

testASR();
