const express = require('express');
const router = express.Router();

// Demo crops returned when no DB available
const DEMO_CROPS = [
  { id: 1, name: 'Tomato (Cherry)', type: 'Tomato', variety: 'Cherry' },
  { id: 2, name: 'Basmati Rice', type: 'Rice', variety: 'Basmati' },
  { id: 3, name: 'Baby Carrots', type: 'Carrots', variety: 'Baby' }
];

router.get('/', (req, res) => {
  res.json(DEMO_CROPS);
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const c = DEMO_CROPS.find(x => x.id === id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json(c);
});

module.exports = router;
