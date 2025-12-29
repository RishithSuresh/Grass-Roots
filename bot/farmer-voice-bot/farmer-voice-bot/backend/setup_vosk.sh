#!/bin/bash
# Download and setup Vosk models for offline speech recognition

VOSK_DIR="$HOME/.vosk"
mkdir -p "$VOSK_DIR"

echo "📥 Downloading Vosk models..."

# English model
echo "Downloading English model..."
cd "$VOSK_DIR"
wget -q -O vosk-model-en-us-0.42.4.zip https://alphacephei.com/vosk/models/vosk-model-en-us-0.42.4.zip
unzip -q -o vosk-model-en-us-0.42.4.zip
rm -f vosk-model-en-us-0.42.4.zip

# Hindi model (optional)
echo "Downloading Hindi model..."
wget -q -O vosk-model-hi-0.42.4.zip https://alphacephei.com/vosk/models/vosk-model-hi-0.42.4.zip
unzip -q -o vosk-model-hi-0.42.4.zip
rm -f vosk-model-hi-0.42.4.zip

echo "✅ Vosk models downloaded and extracted to $VOSK_DIR"
ls -la "$VOSK_DIR"
