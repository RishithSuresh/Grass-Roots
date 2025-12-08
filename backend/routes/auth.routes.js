/**
 * Authentication Routes
 * Handles user registration, login, and token management
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getOne, insert, update } = require('../config/database');

// Validation middleware
const registerValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('full_name').trim().notEmpty(),
    body('phone').matches(/^[6-9]\d{9}$/),
    body('user_type').isIn(['farmer', 'retailer'])
];

const loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
];

// Generate JWT token
const generateToken = (userId, userType) => {
    return jwt.sign(
        { userId, userType },
        process.env.JWT_SECRET || 'your_secret_key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

/**
 * POST /api/auth/register
 * Register a new user (farmer or retailer)
 */
router.post('/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, password, full_name, phone, user_type } = req.body;

        // Check if user already exists
        const existingUser = await getOne('SELECT user_id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Insert user
        const userResult = await insert('users', {
            user_type,
            email,
            password_hash,
            full_name,
            phone,
            is_active: true
        });

        if (!userResult.success) {
            return res.status(500).json({ success: false, message: 'Failed to create user' });
        }

        const userId = userResult.insertId;

        // Create profile based on user type
        if (user_type === 'farmer') {
            await insert('farmer_profiles', { user_id: userId });
        } else if (user_type === 'retailer') {
            await insert('retailer_profiles', { user_id: userId, shop_name: 'My Shop' });
        }

        // Generate token
        const token = generateToken(userId, user_type);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                userId,
                email,
                full_name,
                user_type,
                token
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
router.post('/login', loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user
        const user = await getOne(
            'SELECT user_id, email, password_hash, full_name, user_type, is_active FROM users WHERE email = ?',
            [email]
        );

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.is_active) {
            return res.status(403).json({ success: false, message: 'Account is deactivated' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Update last login
        await update('users', { last_login_at: new Date() }, 'user_id = ?', [user.user_id]);

        // Generate token
        const token = generateToken(user.user_id, user.user_type);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                userId: user.user_id,
                email: user.email,
                full_name: user.full_name,
                user_type: user.user_type,
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * POST /api/auth/verify-token
 * Verify JWT token
 */
router.post('/verify-token', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
        
        res.json({ success: true, data: decoded });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
});

module.exports = router;

