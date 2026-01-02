# Farmer Voice Call-Bot POC

A complete end-to-end **WebRTC-based voice call-bot** for farmers to report farm data, with **speech-to-text transcription**, **IPFS storage**, and **blockchain recording**.

## 🌾 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FARMER (Browser)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. Selects Language                                      │   │
│  │ 2. Starts WebRTC Recording (getUserMedia)               │   │
│  │ 3. Speaks farm data (crop, acreage, issues, etc.)       │   │
│  │ 4. Receives AI confirmation                             │   │
│  │ 5. Confirms consent → stores on blockchain              │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────┬─────────────────────────────────────────────────┘
                 │ WebRTC Audio Upload + JSON
    ┌────────────▼──────────────────────────────┐
    │   Node.js Express Backend (Port 3000)     │
    │ ┌──────────────────────────────────────┐  │
    │ │ 1. Receive audio + transcribe (ASR)  │  │
    │ │ 2. Extract structured JSON           │  │
    │ │ 3. Upload audio to IPFS              │  │
    │ │ 4. Compute SHA256 hash               │  │
    │ │ 5. Store on blockchain               │  │
    │ │ 6. Generate TTS response             │  │
    │ └──────────────────────────────────────┘  │
    └────────────────┬─────────────────────────┘
         ┌──────────┼──────────┐
         │          │          │
    ┌────▼────┐ ┌──▼────┐ ┌──▼─────────────┐
    │ IPFS    │ │Ganache│ │ Vosk ASR      │
    │ (Local) │ │(Dev)  │ │ (or Whisper)  │
    └─────────┘ └───────┘ └───────────────┘
```

## 📋 Features

✅ **WebRTC Audio Capture** - Browser microphone streaming  
✅ **Speech Recognition** - Vosk ASR (English, Hindi, Tamil)  
✅ **Structured Data Extraction** - JSON slot-filling from speech  
✅ **IPFS Storage** - Audio uploaded to local IPFS node  
✅ **Deterministic Hashing** - SHA256 of canonical JSON  
✅ **Blockchain Recording** - Smart contract on Ganache  
✅ **Consent Flow** - User approval before blockchain write  
✅ **TTS Confirmation** - Text-to-speech bot responses  
✅ **Multilingual Support** - English, Hindi, Tamil  
✅ **No PII On-Chain** - Only farmer_id pseudonym + hashes  

## 🚀 Quick Start

### Prerequisites

Ensure you have installed:
- **Node.js** v16+ (check: `node --version`)
- **Ganache CLI** for Ethereum dev chain (`npm install -g ganache-cli`)
- **IPFS** local node (`go-ipfs` or `kubo`, check: `ipfs --version`)

### 1️⃣ Start IPFS Node (Terminal 1)

```bash
ipfs daemon
# Expected output: "Daemon is ready"
```

### 2️⃣ Start Ganache (Terminal 2)

```bash
ganache-cli --deterministic
# Or use Ganache app GUI
```

### 3️⃣ Install Backend Dependencies (Terminal 3)

```bash
cd backend
npm install
```

### 4️⃣ Deploy Smart Contract

```bash
cd blockchain
npm install
npx hardhat compile

# Create .env file with Ganache account details
echo "PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d" > .env
echo "GANACHE_RPC_URL=http://127.0.0.1:8545" >> .env

npx hardhat run scripts/deploy.js --network ganache
# Copy CONTRACT_ADDRESS from output
```

### 5️⃣ Configure Backend (.env)

```bash
cd ../backend
cat > .env << EOF
PORT=3000
GANACHE_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x<PASTE_ADDRESS_FROM_DEPLOYMENT>
PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
IPFS_API_URL=http://127.0.0.1:5001
EOF
```

### 6️⃣ Start Backend Server

```bash
npm start
# Expected: "🌾 Farmer Voice Bot Backend running on http://localhost:3000"
```

### 7️⃣ Open Frontend (Browser)

Open `http://localhost:3000` in your browser.

---

## 📖 API Endpoints

### `POST /api/start-session`
Initialize a farmer session.

**Request:**
```json
{
  "language": "en"
}
```

**Response:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Session started. Please record your message.",
  "languages": ["en", "hi", "ta"]
}
```

---

### `POST /api/upload-audio`
Upload audio, transcribe, and extract data.

**Request:** (multipart/form-data)
- `sessionId`: session ID
- `audio`: audio file (webm)
- `language`: language code

**Response:**
```json
{
  "sessionId": "...",
  "transcription": "I am growing rice on 5 acres...",
  "recordJson": {
    "farmer_id": "farmer_abc123",
    "timestamp": "2025-01-15T10:30:00Z",
    "language": "en",
    "crop_type": "rice",
    "acreage": 5,
    "current_stage": "flowering",
    "observed_issues": ["pest"],
    "chemicals_used": [{"name": "neem oil", "dosage": "5L"}],
    "expected_yield": "50 quintals",
    "price_expectation": "2000 INR",
    "audio_ipfs_cid": null
  },
  "botMessage": "Thank you. I heard: I am growing rice on 5 acres... Is this correct?",
  "status": "ready_for_confirmation"
}
```

---

### `POST /api/confirm-store`
Confirm consent and store on IPFS + blockchain.

**Request:**
```json
{
  "sessionId": "...",
  "recordJson": {...},
  "consent": true
}
```

**Response:**
```json
{
  "sessionId": "...",
  "ipfsCid": "QmXxxx...",
  "dataHash": "0xabcd1234...",
  "txHash": "0x5ef2e...",
  "message": "Record saved successfully. Transaction ID: 0x5ef2e. Thank you for your report.",
  "audioUrl": "/audio/bot-response-550e8400-e29b-41d4-a716-446655440000.wav"
}
```

---

### `GET /api/session/:sessionId`
Retrieve session details.

**Response:**
```json
{
  "sessionId": "...",
  "language": "en",
  "createdAt": "2025-01-15T10:25:00Z",
  "transcription": "...",
  "recordJson": {...},
  "ipfsCid": "...",
  "dataHash": "...",
  "txHash": "..."
}
```

---

## 🧪 Testing

### Test ASR (Speech Recognition)
```bash
cd tests
node test-asr.js
```

### Test IPFS Upload
```bash
node test-ipfs.js
```

### Test Hashing (Determinism)
```bash
node test-hash.js
```

### Test Blockchain Connection
```bash
node test-contract.js
```

---

## 📊 Data Flow (Full Call)

1. **Frontend Initialization**
   - Browser loads `http://localhost:3000`
   - `/api/start-session` → returns `sessionId`

2. **Audio Recording**
   - User selects language
   - Clicks "Start Call" → WebRTC `getUserMedia` (microphone access)
   - User speaks farm data
   - Clicks "Stop Recording"

3. **Upload & Transcription**
   - Frontend sends audio blob to `/api/upload-audio`
   - Backend receives WebM audio file
   - Vosk ASR transcribes audio → text
   - JSON extraction (slot-filling) → canonical `recordJson`

4. **IPFS Storage**
   - Backend uploads audio buffer to local IPFS node
   - IPFS returns CID (content-addressed hash)
   - CID added to `recordJson.audio_ipfs_cid`

5. **Hashing**
   - Backend creates canonical JSON (alphabetically sorted keys)
   - Computes SHA256 hash of canonical JSON
   - Hash stored in session

6. **Blockchain Write**
   - User sees summary and consent prompt
   - User clicks "Yes, Store Record"
   - Backend calls `FarmerRecords.addRecord(farmerId, timestamp, dataHash, ipfsCid)`
   - Ganache processes transaction → `txHash`
   - Smart contract emits event: `RecordAdded`

7. **Confirmation & TTS**
   - Backend returns `{ipfsCid, dataHash, txHash}`
   - Frontend displays results
   - TTS message: "Record saved. Reference: {txHash}. Thank you."

---

## 🔍 JSON Schema (Canonical)

The **canonical form** (used for hashing) is deterministic:

```json
{
  "acreage": 5,
  "audio_ipfs_cid": "QmXxxx...",
  "chemicals_used": [
    {"dosage": "5L", "name": "neem oil"},
    {"dosage": "2kg", "name": "fungicide"}
  ],
  "crop_type": "rice",
  "current_stage": "flowering",
  "expected_yield": "50 quintals",
  "farmer_id": "farmer_abc123",
  "language": "en",
  "observed_issues": ["pest", "disease"],
  "price_expectation": "2000 INR",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Key Properties:**
- **All keys are alphabetically sorted** (ensures determinism)
- **Values are immutable** once recorded
- **SHA256(canonical JSON) = data_hash** (stored on-chain)
- **IPFS CID also stored** (links to audio)

---

## 🔐 Smart Contract Details

**Contract:** `FarmerRecords.sol`

**Functions:**

```solidity
// Add a new record
function addRecord(
    string farmerId,
    uint256 timestamp,
    bytes32 dataHash,
    string ipfsCid
) public

// Get total record count
function recordCount() public view returns (uint256)

// Get record by index
function getRecord(uint256 index) public view returns (
    string farmerId,
    uint256 timestamp,
    bytes32 dataHash,
    string ipfsCid
)

// Get all farmer records
function getfarmerRecordIndices(string farmerId) public view returns (uint256[])

// Verify record exists
function verifyRecord(bytes32 dataHash) public view returns (bool)
```

**Events:**
```solidity
event RecordAdded(
    uint256 indexed recordId,
    string indexed farmerId,
    uint256 timestamp,
    bytes32 dataHash,
    string ipfsCid
)
```

---

## 🛠️ Technology Stack

| Component | Tech | Purpose |
|-----------|------|---------|
| **Frontend** | HTML5 + CSS3 + JavaScript | WebRTC UI, session management |
| **Backend** | Node.js + Express | API server, orchestration |
| **ASR** | Vosk | Speech-to-text (or Whisper) |
| **Storage** | IPFS | Distributed audio storage |
| **Blockchain** | Solidity + Hardhat | Smart contract + dev chain |
| **Dev Chain** | Ganache | Local Ethereum simulation |
| **Hashing** | Node crypto (SHA256) | Deterministic data integrity |

---

## 📝 Environment Variables

Create `.env` files:

**`backend/.env`**
```
PORT=3000
GANACHE_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
IPFS_API_URL=http://127.0.0.1:5001
```

**`blockchain/.env`**
```
GANACHE_RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
```

---

## 🐛 Troubleshooting

### ❌ "IPFS connection failed"
- Ensure IPFS daemon is running: `ipfs daemon`
- Check API URL in `.env`: `http://127.0.0.1:5001`

### ❌ "Ganache not running"
- Start with: `ganache-cli --deterministic`
- Or use Ganache desktop app
- Verify at: `http://127.0.0.1:8545`

### ❌ "Microphone access denied"
- Check browser permissions (allow microphone for localhost)
- Ensure HTTPS or localhost (WebRTC requirement)

### ❌ "Contract deployment failed"
- Ensure Ganache is running
- Check `PRIVATE_KEY` is valid
- Verify `GANACHE_RPC_URL` is correct

### ❌ "ASR not working"
- For POC, transcription is mocked (see `asrHandler.js`)
- To use real Vosk: install `vosk-api` and download language models
- Alternative: Use OpenAI Whisper

---

## 📚 File Structure

```
farmer-voice-bot/
├── frontend/
│   ├── index.html          # Main UI
│   ├── styles.css          # Styling
│   └── app.js              # WebRTC + session management
│
├── backend/
│   ├── server.js           # Express server + API endpoints
│   ├── asrHandler.js       # ASR integration (Vosk)
│   ├── ipfsHandler.js      # IPFS upload/retrieve
│   ├── blockchainHandler.js # Web3 + contract interaction
│   ├── ttsHandler.js       # TTS response generation
│   ├── utils.js            # JSON extraction, hashing
│   ├── package.json        # Node dependencies
│   └── uploads/            # Temp audio files
│
├── blockchain/
│   ├── contracts/
│   │   └── FarmerRecords.sol # Smart contract
│   ├── scripts/
│   │   └── deploy.js        # Deployment script
│   ├── hardhat.config.js    # Hardhat config
│   └── package.json         # Hardhat dependencies
│
├── tests/
│   ├── test-asr.js         # ASR tests
│   ├── test-ipfs.js        # IPFS tests
│   ├── test-hash.js        # Hashing determinism tests
│   └── test-contract.js    # Blockchain tests
│
└── README.md               # This file
```

---

## 🎯 Acceptance Criteria

✅ Farmer can open the page, start a voice "call," speak, and see transcription  
✅ Audio is saved to IPFS and CID returned  
✅ Deterministic SHA256 is computed and record stored on Ganache  
✅ Transaction ID is shown to user  
✅ TTS confirmation is played with summary + tx reference  
✅ Consent flow is implemented and respected  
✅ All tools are free/open-source  

---

## 🚀 Next Steps (Production Roadmap)

1. **Real ASR Integration** - Replace mock with Vosk or Whisper
2. **Real TTS** - Integrate Coqui TTS or OpenTTS
3. **Database** - Add SQLite/PostgreSQL for metadata
4. **Multi-language Support** - Add more languages via ASR/TTS
5. **Smart Contract Upgrade** - Add more fields, access control
6. **Frontend Enhancement** - Charts, export, dashboards
7. **Mobile App** - React Native version
8. **Deployment** - Docker, cloud hosting, testnet/mainnet

---

## 📄 License

MIT - Free and open-source for educational and commercial use.

---

## 👥 Contributors

- Built as a POC for farmer voice data collection
- Open to contributions and improvements

---

## 📞 Support

For issues or questions:
1. Check **Troubleshooting** section above
2. Review API logs (backend console)
3. Inspect browser DevTools (network + console)
4. Check IPFS/Ganache status

---

**🌾 Happy Farming! 🚜**
