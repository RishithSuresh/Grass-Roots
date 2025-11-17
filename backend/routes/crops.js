const express = require('express');
const router = express.Router();
const Crop = require('../models/crop');

router.get('/', async (req, res) => {
  const list = await Crop.findAll({ order: [['id', 'DESC']] });
  res.json(list);
});

router.get('/:id', async (req, res) => {
  const item = await Crop.findByPk(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.post('/', async (req, res) => {
  try {
    const created = await Crop.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  const item = await Crop.findByPk(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  await item.destroy();
  res.json({ success: true });
});

module.exports = router;
