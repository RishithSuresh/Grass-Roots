# 🌾 GrassRoots - Farm-to-Retail Platform

A comprehensive platform connecting farmers directly with retailers, featuring voice-based crop registration, blockchain payments, and real-time market prices.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### For Farmers
- 🎤 **Voice-Based Crop Registration** - Register crops using voice calls (no smartphone needed)
- 📊 **Dashboard** - View and manage crop listings
- 💰 **Market Prices** - Real-time crop price information
- 🔗 **Blockchain Payments** - Secure, transparent payments via blockchain
- 📱 **QR Code Generation** - Generate QR codes for crop verification

### For Retailers
- 🛒 **Browse Crops** - Search and filter available crops from farmers
- 📦 **Order Management** - Place and track orders
- 💳 **Secure Payments** - Pay farmers using blockchain technology
- 🏪 **Shop Profile** - Manage shop information and inventory

### Platform Features
- 🔐 **Authentication** - Secure JWT-based authentication
- 🌐 **RESTful API** - Well-documented backend API
- 📱 **Responsive UI** - Mobile-friendly interface
- 🔊 **Voice Bot** - AI-powered voice assistant for farmers
- ⛓️ **Blockchain Integration** - Ethereum-based payment system

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **HTML5/CSS3/JavaScript** - Core web technologies
- **Bootstrap** - UI framework
- **Fetch API** - HTTP requests

### Voice Bot
- **Express.js** - Bot server
- **Vosk** - Speech recognition (ASR)
- **Web3.js** - Blockchain integration
- **IPFS** - Decentralized storage (optional)

### Blockchain
- **Hardhat** - Ethereum development environment
- **Solidity** - Smart contract language
- **Ethers.js** - Ethereum library

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **Git** - [Download](https://git-scm.com/)
- **npm** or **yarn** - Comes with Node.js

Optional (for blockchain features):
- **MetaMask** browser extension - [Install](https://metamask.io/)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Grass Roots"
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Voice Bot Dependencies
```bash
cd ../bot/farmer-voice-bot/farmer-voice-bot/backend
npm install
```

### 4. Install Blockchain Dependencies (Optional)
```bash
cd ../../../../blockchain-payment
npm install
```

## 🗄️ Database Setup

### 1. Create MySQL Database
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE grassroots_db;
exit;
```

### 2. Configure Database Connection

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=4000
HOST=localhost

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=grassroots_db

# JWT Configuration
JWT_SECRET=grassroots_super_secret_key_2024_change_in_production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=grassroots_refresh_token_secret_2024
JWT_REFRESH_EXPIRES_IN=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:5500,http://localhost:5500
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:5500,http://localhost:5500

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session Configuration
SESSION_SECRET=grassroots_session_secret_2024
SESSION_MAX_AGE=86400000

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

### 3. Run Database Schema
```bash
cd backend
mysql -u root -p grassroots_db < database/schema.sql
```

### 4. Seed Demo Data (Optional)
```bash
mysql -u root -p grassroots_db < database/seed_demo_users.sql
```

### 5. Configure Voice Bot Database

Create a `.env` file in `bot/farmer-voice-bot/farmer-voice-bot/backend`:

```env
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=grassroots_db

# IPFS Configuration (optional)
IPFS_HOST=localhost
IPFS_PORT=5001

# Blockchain Configuration (optional)
BLOCKCHAIN_RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=

# Audio Storage
AUDIO_UPLOAD_DIR=./uploads
```

## 🎯 Running the Project

### Option 1: Run All Services Separately

#### 1. Start the Main Backend Server
```bash
cd backend
node server.js
```
Server will run on: `http://localhost:4000`

#### 2. Start the Voice Bot Server
```bash
cd bot/farmer-voice-bot/farmer-voice-bot/backend
node server-simple.js
```
Voice Bot will run on: `http://localhost:3000`

#### 3. Open the Frontend
Open `frontend/index.html` in your browser, or use a local server:

```bash
# Using Python
cd frontend
python -m http.server 5500

# Using Node.js http-server
npx http-server frontend -p 5500
```
Frontend will be available at: `http://localhost:5500`

### Option 2: Run with Live Server (VS Code)

1. Install the **Live Server** extension in VS Code
2. Right-click on `frontend/index.html`
3. Select "Open with Live Server"
4. Start the backend servers as shown above

## 📁 Project Structure

```
Grass Roots/
├── backend/                    # Main backend server
│   ├── config/                # Configuration files
│   ├── database/              # Database schemas and seeds
│   │   ├── schema.sql        # Database schema
│   │   └── seed_demo_users.sql # Demo data
│   ├── routes/               # API routes
│   ├── scripts/              # Utility scripts
│   ├── server.js             # Main server file
│   ├── package.json          # Backend dependencies
│   └── .env                  # Environment variables
│
├── frontend/                  # Frontend application
│   ├── css/                  # Stylesheets
│   ├── js/                   # JavaScript files
│   ├── images/               # Images and assets
│   ├── index.html            # Landing page
│   ├── login.html            # Login page
│   ├── register.html         # Registration page
│   ├── farmer-dashboard.html # Farmer dashboard
│   └── retailer-dashboard.html # Retailer dashboard
│
├── bot/                       # Voice bot system
│   └── farmer-voice-bot/
│       └── farmer-voice-bot/
│           ├── backend/      # Voice bot backend
│           │   ├── server-simple.js # Simplified server
│           │   ├── server.js        # Full-featured server
│           │   └── .env            # Bot environment variables
│           └── frontend/     # Voice bot UI
│
├── blockchain-payment/        # Blockchain payment system
│   ├── contracts/            # Smart contracts
│   ├── scripts/              # Deployment scripts
│   ├── frontend/             # Blockchain UI
│   └── hardhat.config.js     # Hardhat configuration
│
└── README.md                 # This file
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "userType": "farmer",  // or "retailer"
  "address": "123 Farm Road"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Crop Endpoints

#### Get All Crops
```http
GET /api/crops
Authorization: Bearer <token>
```

#### Create Crop (Farmer)
```http
POST /api/crops
Authorization: Bearer <token>
Content-Type: application/json

{
  "cropName": "Wheat",
  "cropType": "grain",
  "quantityAvailable": 1000,
  "unit": "kg",
  "pricePerUnit": 25.50,
  "harvestDate": "2024-03-15",
  "description": "Organic wheat"
}
```

#### Update Crop
```http
PUT /api/crops/:cropId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantityAvailable": 800,
  "pricePerUnit": 26.00
}
```

#### Delete Crop
```http
DELETE /api/crops/:cropId
Authorization: Bearer <token>
```

### Order Endpoints

#### Create Order (Retailer)
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "cropId": 1,
  "quantity": 100,
  "deliveryAddress": "456 Store Street"
}
```

#### Get User Orders
```http
GET /api/orders
Authorization: Bearer <token>
```

#### Update Order Status
```http
PUT /api/orders/:orderId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"  // pending, confirmed, shipped, delivered, cancelled
}
```

### Voice Bot Endpoints

#### Start Voice Session
```http
POST /api/start-session
```

#### Upload Audio
```http
POST /api/upload-audio
Content-Type: multipart/form-data

{
  "sessionId": "uuid",
  "audio": <audio-file>
}
```

#### Save Crop (Voice Bot)
```http
POST /api/crops
Content-Type: application/json

{
  "cropType": "Rice",
  "area": "5",
  "plantingDate": "2024-01-15",
  "notes": "Basmati variety",
  "farmerEmail": "farmer@example.com"
}
```

#### Get All Crops (Voice Bot)
```http
GET /api/crops
```

## 🔧 Troubleshooting

### Database Connection Issues

**Problem**: `ER_ACCESS_DENIED_ERROR: Access denied for user`

**Solution**:
1. Check your MySQL credentials in `.env` file
2. Ensure MySQL server is running:
   ```bash
   # Windows
   net start MySQL80

   # Linux/Mac
   sudo systemctl start mysql
   ```
3. Verify user permissions:
   ```sql
   GRANT ALL PRIVILEGES ON grassroots_db.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::4000`

**Solution**:
```bash
# Windows - Find and kill process on port 4000
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4000 | xargs kill -9
```

### CORS Errors

**Problem**: `Access to fetch at 'http://localhost:4000' from origin 'http://localhost:5500' has been blocked by CORS`

**Solution**:
1. Ensure your frontend URL is in the `ALLOWED_ORIGINS` in `.env`
2. Restart the backend server after changing `.env`

### Voice Bot Not Saving to Database

**Problem**: Crops saved via voice bot not appearing in database

**Solution**:
1. Check voice bot `.env` has correct database credentials
2. Verify database connection in voice bot logs
3. Ensure `mysql2` package is installed:
   ```bash
   cd bot/farmer-voice-bot/farmer-voice-bot/backend
   npm install mysql2
   ```

### JWT Token Errors

**Problem**: `JsonWebTokenError: invalid token`

**Solution**:
1. Clear browser localStorage
2. Login again to get a fresh token
3. Ensure `JWT_SECRET` is set in `.env`

### Missing Dependencies

**Problem**: `Error: Cannot find module 'express'`

**Solution**:
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install
```

## 🧪 Testing

### Demo Accounts

After running `seed_demo_users.sql`, you can use these accounts:

**Farmer Account:**
- Email: `farmer@example.com`
- Password: `password123`

**Retailer Account:**
- Email: `retailer@example.com`
- Password: `password123`

### Testing Voice Bot

1. Open `http://localhost:3000` in your browser
2. Click "Start Recording"
3. Speak: "I want to register wheat crop, 5 acres, planted on January 15th"
4. Click "Stop Recording"
5. Check the database for the new crop entry

### Testing Blockchain Payments (Optional)

1. Install MetaMask browser extension
2. Start local Hardhat node:
   ```bash
   cd blockchain-payment
   npx hardhat node
   ```
3. Deploy contracts:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```
4. Import test account to MetaMask using private key from Hardhat
5. Test payment on `blockchain-payment.html`

## 📝 Demo Workflow

### Complete User Journey

1. **Farmer Registration**
   - Open `http://localhost:5500/register.html`
   - Register as a farmer
   - Login with credentials

2. **Add Crop via Voice Bot**
   - Open `http://localhost:3000`
   - Record voice message about crop
   - Verify crop appears in database

3. **View Crops in Dashboard**
   - Login to farmer dashboard
   - See all registered crops
   - Edit or delete crops

4. **Retailer Browse & Order**
   - Register as retailer
   - Browse available crops
   - Place an order

5. **Payment via Blockchain**
   - Navigate to blockchain payment page
   - Connect MetaMask wallet
   - Complete payment transaction

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Backend Development** - Node.js, MySQL, API Development
- **Frontend Development** - HTML/CSS/JS, UI/UX Design
- **Voice Bot** - Speech Recognition, NLP Integration
- **Blockchain** - Smart Contracts, Web3 Integration

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Contact: support@grassroots.com

## 🎯 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Real-time chat between farmers and retailers
- [ ] Weather API integration
- [ ] Crop disease detection using ML
- [ ] Multi-language support for voice bot
- [ ] Advanced analytics dashboard
- [ ] Integration with government agricultural databases
- [ ] Automated quality certification

---

**Made with ❤️ for farmers and retailers**