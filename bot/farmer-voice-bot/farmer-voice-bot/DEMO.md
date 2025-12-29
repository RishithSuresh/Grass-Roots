# 🎬 WHAT YOU'LL SEE WHEN YOU RUN IT

## Step 1: Browser Opens
```
You open: http://localhost:3000

You see:
┌─────────────────────────────────────────┐
│  🌾 Farmer Voice Call-Bot               │
│  Report your farm status via voice      │
├─────────────────────────────────────────┤
│  Session ID: 550e8400-e29b-...          │
│  Status: Ready                          │
├─────────────────────────────────────────┤
│  Select Language: [English ▼]           │
├─────────────────────────────────────────┤
│  🎤 Start Call                          │
└─────────────────────────────────────────┘
```

---

## Step 2: Click "Start Call"
```
Browser asks: "Allow microphone?"
You click: Allow

UI changes to:
┌─────────────────────────────────────────┐
│  Status: Recording...                   │
│  🔴 ← Pulsing red indicator             │
├─────────────────────────────────────────┤
│  ⏹ Stop Recording                       │
└─────────────────────────────────────────┘
```

---

## Step 3: You Speak
Say something like:
```
"I'm growing rice on 5 acres. The crop is in flowering stage. 
I noticed some pest damage and used neem oil spray. 
I expect 50 quintals of yield. Price is 2000 rupees per quintal."
```

UI shows:
```
🎤 Recording... (your voice being captured)
```

---

## Step 4: Click "Stop Recording"
```
UI changes to:
┌─────────────────────────────────────────┐
│  Status: Processing audio...            │
├─────────────────────────────────────────┤
│  (Uploading, transcribing, extracting)  │
└─────────────────────────────────────────┘
```

---

## Step 5: Transcription Appears
```
┌─────────────────────────────────────────┐
│  Transcription                          │
├─────────────────────────────────────────┤
│  I am growing rice on 5 acres. The      │
│  crop is in flowering stage. I noticed  │
│  some pest damage and used neem oil     │
│  spray. I expect 50 quintals of yield.  │
│  Price is 2000 rupees per quintal.      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Bot Response                           │
├─────────────────────────────────────────┤
│  Thank you. I heard: I am growing rice  │
│  on 5 acres. The crop is in... Is this  │
│  correct?                               │
│  🔊 Play Audio                          │
└─────────────────────────────────────────┘
```

---

## Step 6: Confirm Consent
```
┌─────────────────────────────────────────┐
│  Confirm Storage                        │
├─────────────────────────────────────────┤
│  Crop: rice                             │
│  Acreage: 5                             │
│  Issues: pest                           │
├─────────────────────────────────────────┤
│  ⚠️ This record will be stored on the   │
│     blockchain.                         │
├─────────────────────────────────────────┤
│  ✓ Yes, Store Record  ✗ Cancel          │
└─────────────────────────────────────────┘
```

You click: **✓ Yes, Store Record**

---

## Step 7: Processing...
```
Status: Storing on blockchain...

Backend logs (in Terminal 4):
[Session] New session: 550e8400...
[ASR] Transcription: I am growing rice...
[JSON] Extracted record: { farmer_id: "farmer_550e8400", ... }
[IPFS] Uploading audio...
[IPFS] CID: QmXxxx...
[Hash] Data hash: 0xabcd1234...
[Blockchain] Storing record...
[Blockchain] TX Hash: 0x5ef2e...
```

---

## Step 8: Results Displayed! 🎉
```
┌─────────────────────────────────────────┐
│  ✅ Record Stored                       │
├─────────────────────────────────────────┤
│  Transaction ID:                        │
│  0x5ef2e4d5f8a9c1b3e7a2f6d8c9e1a3b5...  │
├─────────────────────────────────────────┤
│  IPFS CID:                              │
│  QmXxxx...                              │
├─────────────────────────────────────────┤
│  Data Hash:                             │
│  0xabcd1234...                          │
├─────────────────────────────────────────┤
│  Start New Call                         │
└─────────────────────────────────────────┘
```

---

## What's Happening Behind the Scenes

1. ✅ **Audio Captured** - Your voice via WebRTC
2. ✅ **Uploaded** - To backend server
3. ✅ **Transcribed** - Vosk ASR converts to text
4. ✅ **Extracted** - JSON created with farm data
5. ✅ **IPFS Stored** - Audio uploaded, CID generated
6. ✅ **Hashed** - SHA256 of canonical JSON
7. ✅ **Blockchain** - Record written to Ganache
8. ✅ **Transaction** - TX ID returned
9. ✅ **Displayed** - Results shown to user

---

## Terminal Outputs You'll See

### Terminal 1 (IPFS)
```
Daemon is ready
Swarm listening on /ip4/127.0.0.1/tcp/4001
...
```

### Terminal 2 (Ganache)
```
Available Accounts:
(0) 0x627306090abaB3A6e1400e9345bC60c78a8BEf57
...
```

### Terminal 3 (Deploy)
```
Deploying FarmerRecords contract...
✅ Contract deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
Add this to your .env file:
CONTRACT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

### Terminal 4 (Backend)
```
🌾 Farmer Voice Bot Backend running on http://localhost:3000
📚 API: http://localhost:3000/api
🏥 Health: http://localhost:3000/health
[Session] New session created: 550e8400...
[ASR] Transcription: I am growing rice...
[IPFS] CID: QmXxxx...
[Blockchain] TX Hash: 0x5ef2e...
```

---

## You Can See:

✅ Live audio capture (microphone icon)  
✅ Transcription of what you said  
✅ Extracted farm data  
✅ IPFS CID (where audio is stored)  
✅ Data hash (proof of data)  
✅ Transaction ID (on blockchain)  
✅ All in a beautiful, responsive UI  

---

## The Cool Part

Everything happens **live**:
- Your voice → Text (instant)
- Data extraction (instant)
- IPFS upload (1-2 sec)
- Blockchain write (instant on Ganache)
- Results display (instant)

**Total time: ~5 seconds from stop recording to final results!**

---

## Next: Try It Yourself

1. Open 4 terminals
2. Run the 4 commands from RUN_NOW.md
3. Open http://localhost:3000
4. Click "Start Call"
5. Speak!
6. See magic happen ✨

---

**Ready? Let's go! 🚜**
