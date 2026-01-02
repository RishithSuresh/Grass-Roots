#!/bin/bash
cd /Users/nishanishmitha/Desktop/MP/farmer-voice-bot/backend
npm install > /dev/null 2>&1
echo "PORT=3000" > .env
echo "GANACHE_RPC_URL=http://127.0.0.1:8545" >> .env
echo "CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000" >> .env
echo "PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d" >> .env
echo "IPFS_API_URL=http://127.0.0.1:5001" >> .env
npm start
