# 🌾 GrassRoots Backend Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Installation](#backend-installation)
4. [Configuration](#configuration)
5. [Running the Server](#running-the-server)
6. [API Documentation](#api-documentation)
7. [Database Schema](#database-schema)

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **MySQL** (v8.0 or higher)
- **Git** (optional, for version control)

### Check Installations:
```bash
node --version
npm --version
mysql --version
```

---

## 🗄️ Database Setup

### Step 1: Install MySQL

**Windows:**
1. Download MySQL Installer from [mysql.com](https://dev.mysql.com/downloads/installer/)
2. Run the installer and choose "Developer Default"
3. Set root password during installation
4. Complete the installation

**Mac:**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

### Step 2: Create Database

1. **Open MySQL Command Line:**
```bash
mysql -u root -p
```

2. **Execute the Schema:**
```sql
-- Option 1: Run the schema file directly
SOURCE d:/Programming/Grass Roots/backend/database/schema.sql;

-- Option 2: Copy and paste the entire schema.sql content
```

3. **Verify Database Creation:**
```sql
SHOW DATABASES;
USE grassroots_db;
SHOW TABLES;
```

You should see 17 tables created:
- users
- farmer_profiles
- retailer_profiles
- crop_categories
- crops
- market_prices
- products
- orders
- order_items
- payments
- transactions
- qr_codes
- reviews
- notifications
- price_alerts
- activity_logs
- blockchain_records

---

## 📦 Backend Installation

### Step 1: Navigate to Backend Directory
```bash
cd "d:/Programming/Grass Roots/backend"
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages:
- express (Web framework)
- mysql2 (MySQL driver)
- bcryptjs (Password hashing)
- jsonwebtoken (JWT authentication)
- cors (Cross-origin resource sharing)
- helmet (Security headers)
- express-validator (Input validation)
- express-rate-limit (Rate limiting)
- morgan (HTTP logging)
- compression (Response compression)
- qrcode (QR code generation)
- multer (File uploads)
- dotenv (Environment variables)

---

## ⚙️ Configuration

### Step 1: Create Environment File

Copy the example environment file:
```bash
cp .env.example .env
```

### Step 2: Edit .env File

Open `.env` and configure your settings:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=grassroots_db

# JWT Configuration
JWT_SECRET=grassroots_super_secret_key_2024
JWT_EXPIRES_IN=7d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:5500,file://

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important:** Replace `your_mysql_password_here` with your actual MySQL root password!

---

## 🚀 Running the Server

### Development Mode (with auto-restart):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

### Callbot (Farmer Voice Bot)
The callbot lives under `bot/farmer-voice-bot/farmer-voice-bot`. It serves both the bot frontend and backend on port **3000** by default.

To start the callbot backend:
```bash
cd bot/farmer-voice-bot/farmer-voice-bot/backend
npm install
npm start
```

After the callbot backend is running, the dashboard's **Access Callbot** button will open the bot UI at `http://localhost:3000/` and the dashboard will show the bot health status.

### Expected Output:
```
============================================================
🌾 GrassRoots Agricultural Marketplace API
============================================================
✅ Database connected successfully
📊 Database: grassroots_db
🖥️  Host: localhost:3306
🚀 Server: http://localhost:3000
📝 Environment: development
============================================================
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "farmer@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "9876543210",
  "user_type": "farmer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": 1,
    "email": "farmer@example.com",
    "full_name": "John Doe",
    "user_type": "farmer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "farmer@example.com",
  "password": "password123"
}
```

### Testing the API

Use **Postman**, **Thunder Client**, or **curl**:

```bash
# Health Check
curl http://localhost:3000/health

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","full_name":"Test User","phone":"9876543210","user_type":"farmer"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🎯 Next Steps

1. ✅ Database created with 17 tables
2. ✅ Backend server configured
3. ✅ Authentication endpoints ready
4. ⏳ Additional API endpoints (crops, products, orders, etc.)
5. ⏳ Frontend integration

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: Access denied for user 'root'@'localhost'
```
**Solution:** Check your MySQL password in `.env` file

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:** Change PORT in `.env` or kill the process using port 3000

### Module Not Found
```
Error: Cannot find module 'express'
```
**Solution:** Run `npm install` again

---

## 📊 Database Statistics

- **Total Tables:** 17
- **Total Views:** 4
- **Stored Procedures:** 2
- **Triggers:** 3
- **Sample Data:** Included (3 farmers, 2 retailers, 4 crops, 4 market prices)

---

**Your backend is now ready! 🎉**

