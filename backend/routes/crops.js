const express = require('express');
const router = express.Router();
const Crop = require('../models/crop');

router.get('/', async (req, res) => {
  try {
    const list = await Crop.findAll({ order: [['id', 'DESC']] });
    res.json(list);
  } catch (err) {
    console.error('Failed to fetch crops:', err && err.stack ? err.stack : err);
    // Don't crash the server for missing columns or DB issues; return empty list so frontend can fallback
    return res.json([]);
  }
});

router.get('/:id', async (req, res) => {
  const item = await Crop.findByPk(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.post('/', async (req, res) => {
  try {
    console.log('POST /api/crops body:', req.body);
    const created = await Crop.create(req.body);
    console.log('Created crop id:', created && created.id);
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating crop:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Failed to create crop', detail: err && err.message ? err.message : String(err) });
  }
});

router.delete('/:id', async (req, res) => {
  const item = await Crop.findByPk(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  await item.destroy();
  res.json({ success: true });
});

module.exports = router;
