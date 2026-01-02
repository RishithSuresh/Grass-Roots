# 🚀 RUN IT NOW - STEP BY STEP

## You Need 4 Terminal Windows

### Terminal 1: Start IPFS
```bash
ipfs daemon
```
Wait for: `Daemon is ready`

---

### Terminal 2: Start Ganache
```bash
ganache-cli --deterministic --host 127.0.0.1 --port 8545
```
Save the first account's private key shown.

---

### Terminal 3: Deploy Smart Contract
```bash
cd /Users/nishanishmitha/Desktop/MP/farmer-voice-bot/blockchain

# Create .env file
echo "PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d" > .env
echo "GANACHE_RPC_URL=http://127.0.0.1:8545" >> .env

# Install dependencies
npm install

# Deploy contract
npx hardhat run scripts/deploy.js --network ganache
```

**IMPORTANT:** Copy the CONTRACT_ADDRESS from the output (looks like: 0x...)

---

### Terminal 4: Start Backend
```bash
cd /Users/nishanishmitha/Desktop/MP/farmer-voice-bot/backend

# Create .env with CONTRACT_ADDRESS from Terminal 3
cat > .env << 'EOF'
PORT=3000
GANACHE_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x<PASTE_ADDRESS_HERE>
PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
IPFS_API_URL=http://127.0.0.1:5001
EOF

# Install dependencies
npm install

# Start server
npm start
```

Expected output:
```
🌾 Farmer Voice Bot Backend running on http://localhost:3000
📚 API: http://localhost:3000/api
🏥 Health: http://localhost:3000/health
```

---

## Open Browser

```
http://localhost:3000
```

You should see the UI!

---

## Test the App

1. **Select Language** → "English"
2. **Click "Start Call"** → Allow microphone
3. **Speak** → Try: *"I'm growing rice on 5 acres in flowering stage with pest issues"*
4. **Click "Stop Recording"**
5. **See Transcription** → Mock text displayed
6. **Click "Yes, Store Record"**
7. **View Results** → TX ID, IPFS CID, Data Hash

---

## All 4 Terminals Needed

- Terminal 1: `ipfs daemon` (running)
- Terminal 2: `ganache-cli` (running)
- Terminal 3: `deploy.js` (one-time)
- Terminal 4: `npm start` (running)

**Keep them all open!**

---

## Quick Copy-Paste Setup

**Terminal 1:**
```bash
ipfs daemon
```

**Terminal 2:**
```bash
ganache-cli --deterministic
```

**Terminal 3:**
```bash
cd /Users/nishanishmitha/Desktop/MP/farmer-voice-bot/blockchain
echo "PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
GANACHE_RPC_URL=http://127.0.0.1:8545" > .env
npm install && npx hardhat run scripts/deploy.js --network ganache
# COPY THE CONTRACT_ADDRESS
```

**Terminal 4:**
```bash
cd /Users/nishanishmitha/Desktop/MP/farmer-voice-bot/backend
cat > .env << 'EOF'
PORT=3000
GANACHE_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x[PASTE_HERE]
PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
IPFS_API_URL=http://127.0.0.1:5001
EOF
npm install && npm start
```

---

## Browser

```
http://localhost:3000
```

---

**That's it! The app should be running! 🎉**
