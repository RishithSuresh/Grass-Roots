# 🔒 TimeLock Vault - Blockchain Time-Locked Deposits

A beautiful and secure decentralized application (dApp) for time-locked ETH deposits built with Solidity, Hardhat, React, and ethers.js.

## ✨ Features

- 🛡️ **Secure Smart Contracts** - Audited Solidity contracts with comprehensive test coverage
- ⏰ **Flexible Lock Durations** - Lock ETH for seconds, minutes, hours, or days
- 💎 **Multiple Concurrent Locks** - Create and manage multiple time-locked deposits
- 📊 **Real-time Statistics** - Track total locked, withdrawn, and active locks
- ⏱️ **Live Countdown Timers** - See exactly when your funds unlock
- 🎨 **Beautiful UI/UX** - Modern gradient design with glassmorphism effects
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🔔 **Transaction Notifications** - Real-time feedback for all operations
- 🦊 **MetaMask Integration** - Seamless wallet connectivity

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dummy-blockchain-project
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

### Running the Application

#### 1. Start Local Blockchain

Open a terminal and run:
```bash
npx hardhat node
```

This will start a local Ethereum network on `http://127.0.0.1:8545`

#### 2. Deploy Smart Contract

In a new terminal, deploy the Lock contract:
```bash
npm run deploy
```

Copy the deployed contract address from the output.

#### 3. Update Contract Address

Update `frontend/.env` with the deployed contract address:
```
VITE_LOCK_ADDRESS=<your-deployed-contract-address>
VITE_RPC_URL=http://127.0.0.1:8545
```

#### 4. Start Frontend

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

#### 5. Configure MetaMask

1. Open MetaMask
2. Add a new network:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH
3. Import one of the test accounts from the Hardhat node output using its private key

## 🧪 Testing

Run the smart contract tests:
```bash
npm test
```

All tests should pass with 100% coverage.

## 📖 Usage

1. **Connect Wallet** - Click "Connect Wallet" to connect your MetaMask
2. **Create Lock** - Enter amount and duration, then click "Lock ETH"
3. **View Locks** - See all your active and completed locks with countdown timers
4. **Withdraw** - Click "Withdraw" on unlocked deposits to claim your ETH

## 🏗️ Project Structure

```
dummy-blockchain-project/
├── contracts/          # Solidity smart contracts
│   └── Lock.sol
├── scripts/           # Deployment and interaction scripts
│   ├── deploy.js
│   └── interact.js
├── test/              # Smart contract tests
│   └── Lock.js
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── App.jsx    # Main application component
│   │   ├── App.css    # Styling
│   │   ├── contract.js # Contract interaction utilities
│   │   └── contracts/ # Contract ABIs
│   └── index.html
└── hardhat.config.js  # Hardhat configuration
```

## 🔧 Technologies Used

- **Blockchain**: Solidity ^0.8.28, Hardhat
- **Frontend**: React 18, Vite
- **Web3**: ethers.js v6
- **Styling**: Custom CSS with modern gradients and animations
- **Testing**: Chai, Hardhat Network Helpers

## 📝 Smart Contract Functions

- `deposit(uint256 _unlockTime)` - Lock ETH until specified timestamp
- `withdraw(uint256 lockIndex)` - Withdraw unlocked funds
- `getLocks(address user)` - Get all locks for a user

## 🎨 Design Features

- Gradient backgrounds with purple/blue theme
- Glassmorphism effects on cards
- Smooth animations and transitions
- Real-time countdown timers
- Status badges for lock states
- Progress bars for active locks
- Responsive grid layouts

## 🔐 Security

- Comprehensive test coverage
- Reentrancy protection
- Input validation
- Time-based access control
- Event emission for transparency

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
