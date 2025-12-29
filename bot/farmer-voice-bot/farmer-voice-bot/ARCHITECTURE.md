# ARCHITECTURE & DESIGN DOCUMENT

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FARMER VOICE CALL-BOT POC                       │
│                    (WebRTC + IPFS + Blockchain + ASR)                   │
└─────────────────────────────────────────────────────────────────────────┘

LAYER 1: FRONTEND (Browser)
├─ index.html          (WebRTC UI, session management)
├─ styles.css          (Responsive design)
└─ app.js              (Audio capture, form handling, API calls)
                       │
                       │ POST /api/start-session
                       │ POST /api/upload-audio
                       │ POST /api/confirm-store
                       ↓
LAYER 2: BACKEND (Node.js Express on Port 3000)
├─ server.js           (Main API server)
├─ asrHandler.js       (Vosk speech-to-text)
├─ utils.js            (JSON extraction, SHA256 hashing)
├─ ipfsHandler.js      (Upload audio to IPFS)
├─ blockchainHandler.js (Web3 contract calls)
└─ ttsHandler.js       (Text-to-speech responses)
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
LAYER 3: SERVICES
├─ Vosk ASR       (Local speech recognition)
├─ IPFS Node      (Distributed storage, Port 5001)
└─ Ganache        (Local Ethereum dev chain, Port 8545)
                       │
                       ↓
LAYER 4: SMART CONTRACT (Solidity on Ganache)
└─ FarmerRecords.sol   (Store farmer_id, timestamp, dataHash, ipfsCid)
```

---

## Data Flow (Step-by-Step)

### Phase 1: Session Initialization

```
1. User opens browser
   ↓
2. Frontend calls GET /api/start-session
   ↓
3. Backend generates UUID as sessionId
   ↓
4. Session stored in-memory: {sessionId, language, createdAt}
   ↓
5. Frontend receives sessionId, displays UI
```

### Phase 2: Audio Recording & Transcription

```
1. User clicks "Start Call"
   ↓
2. Browser requests microphone (getUserMedia)
   ↓
3. User speaks farm data
   ↓
4. Browser captures audio in WebM/Opus format
   ↓
5. User clicks "Stop Recording"
   ↓
6. Frontend sends audio blob via POST /api/upload-audio
   ↓
7. Backend saves audio file to disk (uploads/)
   ↓
8. Vosk ASR transcribes audio → text
   ↓
9. Backend extracts structured JSON via pattern matching:
   - Crop type (rice, wheat, etc.)
   - Acreage (numeric extraction)
   - Current stage (seedling, flowering, harvest, etc.)
   - Issues (pest, disease, drought, etc.)
   - Chemicals (neem, insecticide, etc.)
   - Expected yield
   - Price expectation
   ↓
10. Frontend displays transcription + record summary
```

### Phase 3: Data Hashing & Verification

```
1. Create canonical JSON (alphabetically sorted keys)
   {
     "acreage": 5,
     "audio_ipfs_cid": "QmXxxx",
     "chemicals_used": [...],
     "crop_type": "rice",
     ...
   }
   ↓
2. Compute SHA256(canonical JSON)
   ↓
3. Store hash in session: dataHash = "0xabcd1234..."
   ↓
4. Hash is deterministic:
   - Same data always produces same hash
   - Different data produces different hash
   - Key order doesn't matter
```

### Phase 4: IPFS Storage

```
1. User confirms consent
   ↓
2. Backend reads audio file (already saved)
   ↓
3. POST to IPFS: /api/v0/add
   ↓
4. IPFS returns Content Identifier (CID)
   CID = "QmABC123DEF456..."
   ↓
5. CID is deterministic and content-addressed
   - Same audio → same CID
   - Different audio → different CID
   - No file path needed, only content matters
   ↓
6. Backend pins CID (optional, ensures persistence)
```

### Phase 5: Blockchain Storage

```
1. Backend calls Web3 contract method:
   FarmerRecords.addRecord(
     farmerId = "farmer_abc123",
     timestamp = 1673779800,
     dataHash = 0xabcd1234...,
     ipfsCid = "QmABC123DEF..."
   )
   ↓
2. Web3.js builds transaction:
   {
     to: CONTRACT_ADDRESS,
     data: encoded_function_call,
     gas: 300000,
     gasPrice: getGasPrice(),
     nonce: getNextNonce()
   }
   ↓
3. Sign with PRIVATE_KEY
   ↓
4. Send to Ganache on http://127.0.0.1:8545
   ↓
5. Ganache mines transaction (instant on test network)
   ↓
6. Smart contract stores record in array
   ↓
7. Contract emits event: RecordAdded
   ↓
8. Transaction returns: txHash = "0x5ef2e..."
```

### Phase 6: Confirmation & Display

```
1. Backend returns JSON:
   {
     ipfsCid: "QmABC123...",
     dataHash: "0xabcd1234...",
     txHash: "0x5ef2e...",
     message: "Record saved. Ref: 0x5ef2e. Thank you."
   }
   ↓
2. Frontend displays results:
   - IPFS CID (link to audio)
   - Data Hash (proof of data)
   - Transaction ID (blockchain reference)
   ↓
3. Optional: Generate TTS confirmation
   "Record saved successfully. Thank you for your report."
```

---

## JSON Schema (Complete)

### Input: Raw Transcription
```
"I am growing rice on 5 acres. The crop is in flowering stage. 
I noticed some pest damage and used neem oil spray. 
I expect 50 quintals of yield. Price expectation is 2000 rupees per quintal."
```

### Output: Extracted JSON
```json
{
  "farmer_id": "farmer_550e8400",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "language": "en",
  "crop_type": "rice",
  "acreage": 5,
  "current_stage": "flowering",
  "observed_issues": ["pest"],
  "chemicals_used": [
    {
      "name": "neem oil",
      "dosage": "standard"
    }
  ],
  "expected_yield": "50 quintals",
  "price_expectation": "2000 rupees",
  "audio_ipfs_cid": "QmABC123DEF456GHI789..."
}
```

### Canonical Form (For Hashing)
```json
{
  "acreage": 5,
  "audio_ipfs_cid": "QmABC123DEF456GHI789...",
  "chemicals_used": [
    {
      "dosage": "standard",
      "name": "neem oil"
    }
  ],
  "crop_type": "rice",
  "current_stage": "flowering",
  "expected_yield": "50 quintals",
  "farmer_id": "farmer_550e8400",
  "language": "en",
  "observed_issues": ["pest"],
  "price_expectation": "2000 rupees",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**SHA256 Hash:**
```
0xabcd1234ef5678901234567890abcdef1234567890abcdef1234567890abcdef
```

---

## Smart Contract: FarmerRecords.sol

### State Variables
```solidity
FarmerRecord[] public records;              // Array of all records
mapping(bytes32 => bool) public recordExists;  // Dedup by dataHash
mapping(string => uint256[]) public farmerRecords;  // Query by farmerId
```

### Data Structure
```solidity
struct FarmerRecord {
    string farmerId;       // "farmer_abc123"
    uint256 timestamp;     // Unix timestamp
    bytes32 dataHash;      // SHA256 of canonical JSON
    string ipfsCid;        // IPFS content ID
    address recordedBy;    // Who submitted
}
```

### Key Methods

**Add Record:**
```solidity
function addRecord(
    string _farmerId,
    uint256 _timestamp,
    bytes32 _dataHash,
    string _ipfsCid
) public
```

**Verification:**
- farmerId not empty
- timestamp > 0
- dataHash not zero
- ipfsCid not empty
- dataHash not duplicate

**Events:**
```solidity
event RecordAdded(
    uint256 indexed recordId,
    string indexed farmerId,
    uint256 timestamp,
    bytes32 dataHash,
    string ipfsCid
);
```

---

## API Endpoints

### 1. Start Session
```
POST /api/start-session
Request: { language: "en" }
Response: { sessionId: "uuid", languages: [...] }
```

### 2. Upload & Transcribe
```
POST /api/upload-audio
Request: FormData (sessionId, audio, language)
Response: { transcription: "...", recordJson: {...}, botMessage: "..." }
```

### 3. Confirm & Store
```
POST /api/confirm-store
Request: { sessionId, recordJson, consent: true }
Response: { ipfsCid, dataHash, txHash, message }
```

### 4. Get Session
```
GET /api/session/:sessionId
Response: { sessionId, language, transcription, recordJson, ... }
```

---

## Error Handling

### Frontend Errors
- Microphone access denied → Show alert
- Network timeout → Retry or show error
- Validation errors → Display on UI

### Backend Errors
- Missing files → 400 Bad Request
- ASR failure → Log and use fallback
- IPFS unavailable → Use mock CID
- Blockchain failure → Log and show to user
- Session not found → 404 Not Found

---

## Security Considerations

### Privacy
- No personally identifiable information (PII) on-chain
- Only pseudonymous `farmer_id` stored
- Audio stored on IPFS (distributed, not centralized)
- Data hash ensures integrity without storing raw data

### Blockchain
- Smart contract uses `msg.sender` for audit trail
- Deterministic hashing prevents tampering
- Immutable records (append-only)
- No access control (POC - add authentication in production)

### Data Integrity
- SHA256 is cryptographically secure
- Canonical JSON ensures determinism
- IPFS content-addressing prevents corruption
- Blockchain provides timestamp proof

---

## Scalability & Performance

### Current Limitations (POC)
- Single backend instance
- In-memory session store (lost on restart)
- All ASR/TTS are mocked
- No database (no persistent history)

### Production Improvements
- Add PostgreSQL for sessions + records
- Implement real Vosk/Whisper ASR
- Add real TTS (Coqui/OpenTTS)
- Horizontal scaling with load balancer
- Redis for session cache
- Queue system for async processing
- CDN for frontend
- Mainnet blockchain (not just Ganache)

---

## File Storage

### Temporary Files
```
backend/uploads/
├── session-id-1-audio.webm
├── session-id-2-audio.webm
└── ...
```

**Note:** These can be deleted after IPFS upload (not needed for POC).

---

## Configuration

### Port Assignments
- Frontend: 3000 (Express serves static files)
- IPFS API: 5001
- Ganache RPC: 8545

### Environment Variables
```env
PORT=3000
GANACHE_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x...
IPFS_API_URL=http://127.0.0.1:5001
```

---

## Testing Strategy

### Unit Tests
- JSON extraction logic
- Hash determinism
- Canonical JSON formatting

### Integration Tests
- IPFS upload/retrieval
- Blockchain transaction (mock)
- Full API flow

### Manual Tests
- WebRTC audio capture
- Transcription accuracy
- UI responsiveness

### Load Tests (Future)
- Concurrent sessions
- Blockchain throughput
- IPFS storage capacity

---

## Deployment Checklist

- [ ] Use real ASR (Vosk/Whisper)
- [ ] Use real TTS (Coqui/OpenTTS)
- [ ] Add PostgreSQL database
- [ ] Implement user authentication
- [ ] Add input validation & sanitization
- [ ] Use HTTPS (not HTTP)
- [ ] Add rate limiting
- [ ] Add logging & monitoring
- [ ] Deploy to cloud (AWS/GCP/Azure)
- [ ] Use testnet (Sepolia/Goerli) or mainnet (Ethereum)
- [ ] Add smart contract security audit
- [ ] Set up IPFS node cluster (production)

---

## References

- **WebRTC:** https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
- **Web3.js:** https://web3js.readthedocs.io/
- **IPFS:** https://docs.ipfs.tech/
- **Hardhat:** https://hardhat.org/docs
- **Solidity:** https://docs.soliditylang.org/

---

**Built with ❤️ for farmers | Open-source POC**
