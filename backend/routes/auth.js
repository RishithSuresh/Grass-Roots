const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Simple login endpoint for demo credentials
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });
  const user = await User.findOne({ where: { email } });
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  // Return minimal user info
  res.json({ id: user.id, email: user.email, role: user.role, name: user.name });
});

module.exports = router;
