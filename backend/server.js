const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./db');

const qrRoutes = require('./routes/qr');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const profileRoutes = require('./routes/profile');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

// API
app.use('/api/qr', qrRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/profile', profileRoutes);

// Serve frontend static files
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    // sync models (safe for initial development)
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
