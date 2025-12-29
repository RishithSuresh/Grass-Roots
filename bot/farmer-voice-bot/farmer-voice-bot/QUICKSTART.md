# QUICK START GUIDE

## ⚡ TL;DR - Run Everything in 10 Minutes

### Prerequisites
```bash
# Install (one-time)
brew install node
brew install ipfs
npm install -g ganache-cli
npm install -g hardhat
```

---

## 🚀 Step 1: Clone & Setup

```bash
cd /Users/nishanishmitha/Desktop/MP/farmer-voice-bot
bash setup.sh
```

---

## 🚀 Step 2: Terminal 1 - IPFS Daemon

```bash
ipfs daemon
```

Wait for: `Daemon is ready`

---

## 🚀 Step 3: Terminal 2 - Ganache

```bash
ganache-cli --deterministic --host 127.0.0.1 --port 8545
```

Copy output:
```
Available Accounts:
  (0) 0x627306090abaB3A6e1400e9345bC60c78a8BEf57
  (1) ...

Private Keys:
  (0) 0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
  (1) ...
```

---

## 🚀 Step 4: Terminal 3 - Deploy Smart Contract

```bash
cd blockchain

# Create .env
cat > .env << 'EOF'
GANACHE_RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
EOF

# Compile
npx hardhat compile

# Deploy
npx hardhat run scripts/deploy.js --network ganache
```

**Save the output:** `CONTRACT_ADDRESS=0x...`

---

## 🚀 Step 5: Terminal 4 - Start Backend

```bash
cd backend

# Create .env with CONTRACT_ADDRESS from Step 4
cat > .env << 'EOF'
PORT=3000
GANACHE_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x<PASTE_FROM_STEP_4>
PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
IPFS_API_URL=http://127.0.0.1:5001
EOF

# Start
npm start
```

Expected: `🌾 Farmer Voice Bot Backend running on http://localhost:3000`

---

## 🚀 Step 6: Open Browser

```
http://localhost:3000
```

---

## 🎤 Demo Flow

1. **Select Language** → Choose "English"
2. **Start Call** → Click button (allow microphone)
3. **Speak** → Say: *"I'm growing rice on 5 acres in flowering stage with pest issues"*
4. **Stop** → Click stop button
5. **See Transcription** → Should show your speech
6. **Confirm** → Click "Yes, Store Record"
7. **Results** → See `Transaction ID`, `IPFS CID`, `Data Hash`

---

## 🧪 Testing

```bash
cd tests

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

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 already in use | Kill: `lsof -ti:3000 \| xargs kill -9` |
| IPFS not running | Run `ipfs daemon` in Terminal 1 |
| Ganache not running | Run `ganache-cli --deterministic` in Terminal 2 |
| Microphone denied | Check browser permissions (Settings → Privacy) |
| Contract deploy fails | Ensure Ganache is running on 8545 |

---

## 📊 Architecture at a Glance

```
Browser (WebRTC Audio)
    ↓
Express Backend (Port 3000)
    ├→ Vosk ASR (Speech to Text)
    ├→ IPFS (Store Audio)
    ├→ SHA256 (Compute Hash)
    └→ Ganache (Store on Blockchain)
```

---

## 📝 Key Files

| File | Purpose |
|------|---------|
| `frontend/index.html` | WebRTC UI |
| `backend/server.js` | API endpoints |
| `backend/asrHandler.js` | Speech recognition |
| `backend/ipfsHandler.js` | IPFS upload |
| `backend/blockchainHandler.js` | Smart contract calls |
| `blockchain/contracts/FarmerRecords.sol` | Smart contract |

---

## 🎯 What Happens Behind Scenes

1. **You speak** → Browser captures audio via WebRTC
2. **Frontend uploads** → Audio sent to backend
3. **Backend transcribes** → Vosk converts audio to text
4. **Extracts JSON** → Farmer data structured (crop, acreage, etc.)
5. **Uploads to IPFS** → Audio stored, gets CID
6. **Computes hash** → SHA256 of canonical JSON
7. **Writes to blockchain** → Ganache stores record with hash + CID
8. **Returns results** → Frontend shows transaction ID

---

## ✅ Acceptance Checklist

- [ ] Audio captured via WebRTC
- [ ] Transcription shown on screen
- [ ] IPFS CID displayed
- [ ] Transaction ID shown
- [ ] Data hash computed
- [ ] Consent flow works
- [ ] Smart contract called successfully

---

**🌾 You're all set! Happy farming! 🚜**
