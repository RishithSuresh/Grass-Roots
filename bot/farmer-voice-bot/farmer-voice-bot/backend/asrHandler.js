const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Transcribe audio using Vosk ASR (via Python)
 * For POC: returns mock transcription if Vosk not available
 */
async function transcribeAudio(audioPath, language = 'en') {
    try {
        // Check if audio file exists
        if (!fs.existsSync(audioPath)) {
            throw new Error(`Audio file not found: ${audioPath}`);
        }
        
        console.log(`[Vosk] Transcribing: ${audioPath} (${language})`);
        
        try {
            // Try to use Vosk Python script for real transcription
            const result = execSync(`python3 ${path.join(__dirname, 'vosk_transcriber.py')} "${audioPath}" "${language}"`, {
                encoding: 'utf-8',
                timeout: 30000,
            }).trim();
            
            if (result && result.length > 0) {
                console.log(`[Vosk] Result: "${result}"`);
                return result;
            }
        } catch (vosk_error) {
            console.log(`[Vosk] Vosk not available, using mock: ${vosk_error.message}`);
        }
        
        // Fallback to mock transcription
        const mockTranscriptions = {
            en: 'I am growing rice on 5 acres. The crop is in flowering stage. I noticed some pest damage and used neem oil spray. I expect 50 quintals of yield.',
            hi: 'Main 5 bighe par makka ugar raha hoon. Fasal growth stage mein hai. Mujhe kuch insect ka nuksan dikha.',
            kn: 'Naan 4 acres par sugarcane karandi kondu irukkireen. Growth stage mein hai. Mujhe neelavaada problem illa.',
        };
        
        const transcription = mockTranscriptions[language] || mockTranscriptions['en'];
        
        console.log(`[Mock] Result: "${transcription}"`);
        return transcription;
        
    } catch (error) {
        console.error('[ASR] Error:', error.message);
        throw error;
    }
}

module.exports = {
    transcribeAudio,
};
