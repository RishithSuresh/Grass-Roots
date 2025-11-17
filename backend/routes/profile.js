const express = require('express');
const router = express.Router();
const Profile = require('../models/profile');

router.get('/', async (req, res) => {
  const p = await Profile.findOne();
  res.json(p || {});
});

router.post('/', async (req, res) => {
  const body = req.body;
  try {
    let p = await Profile.findOne();
    if (p) {
      await p.update(body);
    } else {
      p = await Profile.create(body);
    }
    res.json(p);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
