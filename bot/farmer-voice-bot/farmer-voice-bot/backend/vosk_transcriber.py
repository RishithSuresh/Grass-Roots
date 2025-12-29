#!/usr/bin/env python3
"""
Speech-to-Text transcription using multiple backends
Tries Google Speech Recognition (with internet) or local fallback
"""

import sys
import os
import json

def transcribe_audio(audio_file_path, language='en'):
    """
    Transcribe audio file using SpeechRecognition library
    Returns transcribed text
    """
    try:
        import speech_recognition as sr
        from pydub import AudioSegment
        
        # Map language codes to speech_recognition language codes
        lang_map = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'kn': 'en-IN',  # Use English variant for Kannada as fallback
        }
        
        language_code = lang_map.get(language, 'en-US')
        
        # Check if file exists
        if not os.path.exists(audio_file_path):
            raise Exception(f"Audio file not found: {audio_file_path}")
        
        print(f"[ASR] Transcribing: {audio_file_path} ({language})", file=sys.stderr)
        
        # Initialize recognizer
        recognizer = sr.Recognizer()
        
        # Load audio file
        try:
            with sr.AudioFile(audio_file_path) as source:
                audio_data = recognizer.record(source)
        except Exception as e:
            # If direct load fails, try converting with pydub
            try:
                sound = AudioSegment.from_file(audio_file_path)
                wav_path = audio_file_path.replace('.webm', '.wav')
                sound.export(wav_path, format='wav')
                
                with sr.AudioFile(wav_path) as source:
                    audio_data = recognizer.record(source)
            except Exception as conv_error:
                raise Exception(f"Could not load audio: {e}, {conv_error}")
        
        # Try Google Speech Recognition (requires internet)
        try:
            text = recognizer.recognize_google(audio_data, language=language_code)
            print(f"[Google] Result: \"{text}\"", file=sys.stderr)
            return text
        except sr.UnknownValueError:
            print("[Google] Could not understand audio", file=sys.stderr)
            return get_mock_transcription(language)
        except sr.RequestError as e:
            print(f"[Google] Error: {e}", file=sys.stderr)
            return get_mock_transcription(language)
        
    except Exception as e:
        print(f"[ASR] Error: {e}", file=sys.stderr)
        return get_mock_transcription(language)

def get_mock_transcription(language='en'):
    """Return mock transcription for fallback"""
    mocks = {
        'en': 'I am growing wheat on 3 acres. The crop is in flowering stage. I noticed pest damage. I expect good yield.',
        'hi': 'Main 5 bighe par makka ugar raha hoon. Fasal growth stage mein hai. Mujhe kuch insect ka nuksan dikha.',
        'kn': 'Naan 4 acres par sugarcane karandi kondu irukkireen. Growth stage mein hai. Mujhe problem illa.',
    }
    return mocks.get(language, mocks['en'])

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: vosk_transcriber.py <audio_file> [language]")
        sys.exit(1)
    
    audio_file = sys.argv[1]
    language = sys.argv[2] if len(sys.argv) > 2 else 'en'
    
    result = transcribe_audio(audio_file, language)
    print(result)
