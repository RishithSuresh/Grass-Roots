const express = require('express');
const router = express.Router();
const QR = require('../models/qr');

router.get('/', async (req, res) => {
  const list = await QR.findAll({ order: [['generatedAt', 'DESC']] });
  res.json(list);
});

router.get('/:id', async (req, res) => {
  const item = await QR.findByPk(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.post('/', async (req, res) => {
  const payload = req.body;
  try {
    const record = await QR.create(payload);
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  const item = await QR.findByPk(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  await item.destroy();
  res.json({ success: true });
});

module.exports = router;
