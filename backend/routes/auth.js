const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Simple login endpoint for demo credentials
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  console.log('Auth login request body:', req.body);
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Support both `password` and `password_hash` DB column names
    const stored = user.password || (typeof user.get === 'function' ? user.get('password_hash') : undefined) || user.password_hash;
    if (!stored) {
      console.warn('Login attempt but no password stored for user', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Plaintext comparison for demo/seeds. Replace with bcrypt.compare in production.
    if (stored !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return minimal user info
    return res.json({ id: user.id, email: user.email, role: user.role, name: user.name });
  } catch (err) {
    console.error('Auth error:', err && err.stack ? err.stack : err);
    const resp = { error: 'Server error' };
    if (process.env.NODE_ENV !== 'production') resp.detail = err && err.message ? err.message : String(err);
    return res.status(500).json(resp);
  }
});

module.exports = router;
