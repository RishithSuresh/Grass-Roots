const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const db = require('../config/database');

// POST /api/ml/predict
// Expects JSON body like: { crop: 'Tomato', location: 'Bangalore' }
// Optionally accepts currentPrice and change, but if omitted, the latest DB entry for the crop+location will be used.
router.post('/predict', async (req, res) => {
  const payload = req.body || {};
  const scriptPath = path.join(__dirname, '..', '..', 'ML', 'ML model', 'predict.py');

  if (!payload.crop || !payload.location) {
    return res.status(400).json({ error: 'Missing required fields: crop, location' });
  }

  // If currentPrice not provided, try to fetch the latest market price from DB
  try {
    if (typeof payload.currentPrice !== 'number') {
      const sql = `SELECT crop_name, market_name, city, state, modal_price, price_change_percentage, trend, price_date
                   FROM market_prices
                   WHERE crop_name = ? AND (city = ? OR market_name = ?)
                   ORDER BY price_date DESC
                   LIMIT 1`;
      const row = await db.getOne(sql, [payload.crop, payload.location, payload.location]);
      if (!row) {
        return res.status(404).json({ error: 'No market price found for the provided crop/location' });
      }

      payload.currentPrice = Number(row.modal_price);
      payload.change = Number(row.price_change_percentage) || 0;
      payload._db_source = { market_name: row.market_name, city: row.city, price_date: row.price_date };
    }
  } catch (err) {
    console.error('DB lookup failed:', err);
    return res.status(500).json({ error: 'Failed to read market data from database', details: String(err) });
  }

  // Determine Python executable. Prefer workspace venv if present to ensure required packages.
  const fs = require('fs');
  const repoRoot = path.resolve(__dirname, '..', '..');
  const candidates = [
    path.join(repoRoot, '.venv', 'Scripts', 'python.exe'),
    path.join(repoRoot, '.venv', 'bin', 'python'),
    'python'
  ];
  let pythonExec = 'python';
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) { pythonExec = c; break; }
    } catch (e) { /* ignore */ }
  }
  console.log('Using python executable for ML prediction:', pythonExec);

  // Spawn python script and pass JSON via stdin
  try {
    console.log('ML predictor script path:', scriptPath, 'exists:', fs.existsSync(scriptPath));
    console.log('ML predictor python executable:', pythonExec, 'exists:', (pythonExec === 'python' ? 'unknown' : fs.existsSync(pythonExec)));
  } catch (e) { console.warn('Error checking paths', e); }

  const py = spawn(pythonExec, [scriptPath], { stdio: ['pipe', 'pipe', 'pipe'] });
  let stdout = '';
  let stderr = '';

  py.stdout.on('data', (data) => { stdout += data.toString(); });
  py.stderr.on('data', (data) => { stderr += data.toString(); });

  py.on('error', (err) => {
    console.error('Failed to spawn python predictor:', err);
    return res.status(500).json({ error: 'Failed to start python predictor', details: String(err) });
  });

  py.on('close', (code) => {
    console.log('Python predictor exited with code:', code);
    // If non-zero, but script wrote JSON to stdout (e.g., error details), return that to client
    if (code !== 0) {
      try {
        const parsed = JSON.parse(stdout);
        // return parser message if present
        return res.status(500).json(Object.assign({}, parsed, { _db_source: payload._db_source }));
      } catch (e) {
        console.error('ML predict script failed with no JSON output. stderr:', stderr);
        // Return a fallback prediction (simple heuristic) if script fails
        const fallback = Math.round(payload.currentPrice * (1 + ((payload.change || 0) / 100)));
        return res.json({ predictedPrice: fallback, model: 'fallback', message: 'Python predictor failed, returned fallback prediction', details: stderr || stdout, _db_source: payload._db_source });
      }
    }

    try {
      const result = JSON.parse(stdout);
      // include db source info for traceability
      return res.json(Object.assign({}, result, { _db_source: payload._db_source }));
    } catch (err) {
      console.error('Invalid JSON from python script:', err, stdout);
      const fallback = Math.round(payload.currentPrice * (1 + ((payload.change || 0) / 100)));
      return res.json({ predictedPrice: fallback, model: 'fallback', message: 'Invalid output from predictor, returned fallback prediction', _db_source: payload._db_source });
    }
  });

  // Send payload to python script
  py.stdin.write(JSON.stringify(payload));
  py.stdin.end();
});

module.exports = router;
