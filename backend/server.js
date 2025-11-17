const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'grassroots',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ============ AUTHENTICATION ROUTES ============

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, full_name, phone, user_type } = req.body;

    // Validate input
    if (!email || !password || !full_name || !phone || !user_type) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash, full_name, phone, user_type) VALUES (?, ?, ?, ?, ?)',
      [email, password_hash, full_name, phone, user_type]
    );

    const user_id = result.insertId;

    // Create farmer or retailer record
    if (user_type === 'farmer') {
      await pool.execute('INSERT INTO farmers (user_id) VALUES (?)', [user_id]);
    } else if (user_type === 'retailer') {
      await pool.execute('INSERT INTO retailers (user_id) VALUES (?)', [user_id]);
    }

    // Generate token
    const token = jwt.sign({ user_id, email, user_type }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      token,
      user: { user_id, email, full_name, user_type }
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ success: false, error: 'Email already registered' });
    } else {
      res.status(500).json({ success: false, error: 'Registration failed' });
    }
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    // Get user
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, user_type: user.user_type },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        user_type: user.user_type
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// ============ TEST ROUTE ============
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'GrassRoots API is running!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 GrassRoots API server running on port ${PORT}`);
  console.log(`📊 Database: ${process.env.DB_NAME || 'grassroots'}`);
});

