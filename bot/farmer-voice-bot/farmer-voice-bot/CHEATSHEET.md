# 📋 QUICK REFERENCE CARD

## 🎯 Your Complete Command Cheat Sheet

### All Commands You Need (Copy & Paste Ready)

---

## Terminal 1: IPFS
```bash
ipfs daemon
```
✅ Wait for: `Daemon is ready`

---

## Terminal 2: Ganache
```bash
ganache-cli --deterministic --host 127.0.0.1 --port 8545
```
✅ Save the private key shown

---

## Terminal 3: Deploy Contract
```bash
cd /Users/nishanishmitha/Desktop/MP/farmer-voice-bot/blockchain && \
echo "PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d" > .env && \
echo "GANACHE_RPC_URL=http://127.0.0.1:8545" >> .env && \
npm install && \
npx hardhat run scripts/deploy.js --network ganache
```

✅ **COPY** the `CONTRACT_ADDRESS` from output

---

## Terminal 4: Start Backend
```bash
cd /Users/nishanishmitha/Desktop/MP/farmer-voice-bot/backend && \
cat > .env << 'EOF'
PORT=3000
GANACHE_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0xREPLACE_WITH_ADDRESS_FROM_TERMINAL_3
PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
IPFS_API_URL=http://127.0.0.1:5001
EOF
npm install && npm start
```

✅ Look for: `🌾 Farmer Voice Bot Backend running on http://localhost:3000`

---

## Browser
```
http://localhost:3000
```

---

## Testing Commands (Optional)
```bash
cd /Users/nishanishmitha/Desktop/MP/farmer-voice-bot/tests

# Test ASR
node test-asr.js

# Test IPFS
node test-ipfs.js

# Test Hashing
node test-hash.js

# Test Blockchain
node test-contract.js
```

---

## 🔍 Troubleshooting Commands

### Port 3000 in use?
```bash
lsof -ti:3000 | xargs kill -9
```

### Check if service running?
```bash
# IPFS
curl http://127.0.0.1:5001/api/v0/version

# Ganache
curl http://127.0.0.1:8545

# Backend
curl http://localhost:3000/health
```

### Check IPFS status
```bash
ipfs id
```

### Check Ganache accounts
```bash
curl -X POST http://127.0.0.1:8545 \
-H "Content-Type: application/json" \
-d '{"jsonrpc":"2.0","method":"eth_accounts","params":[],"id":1}'
```

---

## 📂 Important Files

```
/Users/nishanishmitha/Desktop/MP/farmer-voice-bot/

├── frontend/
│   ├── index.html          ← Main UI
│   ├── app.js              ← WebRTC logic
│   └── styles.css          ← Styling
│
├── backend/
│   ├── server.js           ← API server
│   ├── .env                ← Your config (create this)
│   └── package.json        ← Dependencies
│
└── blockchain/
    ├── contracts/FarmerRecords.sol
    ├── .env                ← Your config (create this)
    └── package.json
```

---

## 🚨 Common Issues

| Issue | Fix |
|-------|-----|
| "Port 3000 already in use" | `lsof -ti:3000 \| xargs kill -9` |
| "Cannot find module" | Run `npm install` in that directory |
| "IPFS connection failed" | Start IPFS: `ipfs daemon` |
| "Ganache not responding" | Start Ganache: `ganache-cli --deterministic` |
| "Contract deploy failed" | Check Ganache is running on 8545 |
| "Microphone denied" | Check browser permissions (Settings) |

---

## 📊 What Gets Created

When you run everything:

```
Session Flow:
User → Browser → Backend → IPFS, Blockchain → Results

Key Outputs:
• Session ID: UUID for tracking
• Transcription: Your speech as text
• Record JSON: Structured farm data
• IPFS CID: Content ID for audio
• Data Hash: SHA256 of canonical JSON
• Transaction Hash: Blockchain proof
```

---

## ✅ Success Indicators

✅ Terminal 1: "Daemon is ready"  
✅ Terminal 2: Shows accounts & keys  
✅ Terminal 3: "Contract deployed to: 0x..."  
✅ Terminal 4: "Backend running on http://localhost:3000"  
✅ Browser: Shows blue UI with "Start Call" button  

---

## 🎬 Full Demo (5 Minutes)

1. **Setup** (2 min): Start 4 terminals
2. **Open** (30 sec): http://localhost:3000
3. **Record** (1 min): Click Start, speak, Stop
4. **Confirm** (1 min): See results, click confirm
5. **Results** (30 sec): View TX ID, IPFS CID, hash

---

## 📱 API Endpoints

```bash
# Start session
POST http://localhost:3000/api/start-session
Body: { "language": "en" }

# Upload audio & transcribe
POST http://localhost:3000/api/upload-audio
Body: FormData (sessionId, audio file, language)

# Confirm & store
POST http://localhost:3000/api/confirm-store
Body: { "sessionId": "...", "recordJson": {...}, "consent": true }

# Get session
GET http://localhost:3000/api/session/:sessionId

# Health check
GET http://localhost:3000/health
```

---

## 🔐 Security Notes

⚠️ **Dev Only - Not for Production**
- Private keys are hardcoded (dev only)
- Ganache is local test chain
- IPFS is local node
- No authentication yet

✅ **Production Ready Features**
- Deterministic hashing
- Blockchain immutability
- IPFS distribution
- Privacy design

---

## 📚 Documentation Files

```
START_HERE.md        ← Read this first
QUICKSTART.md        ← Setup guide
RUN_NOW.md          ← Copy-paste commands
DEMO.md             ← What you'll see
README.md           ← Full reference
ARCHITECTURE.md     ← Technical details
```

---

## 🎯 Next Steps

1. ✅ Open 4 terminals
2. ✅ Copy commands from above (Terminal 1-4)
3. ✅ Open http://localhost:3000
4. ✅ Click "Start Call"
5. ✅ Speak & see it work!

---

**You've got everything you need! Let's go! 🚜**
