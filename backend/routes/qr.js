const express = require('express');
const router = express.Router();
const QR = require('../models/qr');
const QRCode = require('qrcode');

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

// Server-side QR generation endpoint (generates PNG data URL)
router.post('/generate', async (req, res) => {
  try {
    const body = req.body || {};
    // Allow caller to pass `text`; otherwise generate from the whole body
    const text = typeof body.text === 'string' && body.text.trim() ? body.text : JSON.stringify(body);

    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      scale: 6,
    });

    // Persist the generated QR into DB if model supports canvasData
    let record = null;
    try {
      record = await QR.create(Object.assign({}, body, { canvasData: dataUrl, generatedAt: new Date() }));
    } catch (persistErr) {
      // If saving fails, log and continue — still return generated image
      console.error('Failed to persist generated QR:', persistErr);
    }

    res.json({ dataUrl, record });
  } catch (err) {
    console.error('Server-side QR generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate QR' });
  }
});

router.delete('/:id', async (req, res) => {
  const item = await QR.findByPk(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  await item.destroy();
  res.json({ success: true });
});

module.exports = router;
