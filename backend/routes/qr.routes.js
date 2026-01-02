const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

const QR_STORE = path.join(__dirname, '..', '_tmp_qr.json');

async function readStore() {
  try {
    const raw = await fs.readFile(QR_STORE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

async function writeStore(data) {
  try {
    await fs.writeFile(QR_STORE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write QR store', e);
  }
}

// GET /api/qr - list
router.get('/', async (req, res) => {
  const list = await readStore();
  res.json(list);
});

// POST /api/qr - create
router.post('/', async (req, res) => {
  const body = req.body || {};
  if (!body.qrText && !body.productName) {
    return res.status(400).json({ error: 'Missing qrText or productName' });
  }

  const list = await readStore();
  const id = body.id || `qr_${Date.now()}`;
  const record = Object.assign({ id }, body);
  // avoid duplicates by qrText
  if (!list.some(r => r.qrText === record.qrText)) {
    list.unshift(record);
    // limit to 50
    if (list.length > 50) list.length = 50;
    await writeStore(list);
  }

  res.status(201).json(record);
});

// DELETE /api/qr/:id
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  let list = await readStore();
  const idx = list.findIndex(r => String(r.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  list.splice(idx, 1);
  await writeStore(list);
  res.json({ success: true });
});

module.exports = router;
