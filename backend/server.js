const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./db');
const mysql = require('mysql2/promise');

const qrRoutes = require('./routes/qr');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const profileRoutes = require('./routes/profile');
const authRoutes = require('./routes/auth');
const cropsRoutes = require('./routes/crops');

// models for associations & seeding
const QR = require('./models/qr');
const Product = require('./models/product');
const Crop = require('./models/crop');
const User = require('./models/user');
const Order = require('./models/order');
const OrderItem = require('./models/orderItem');

const app = express();
// Allow CORS (including file:// null origin) during development
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json({ limit: '5mb' }));

// Simple request logger to aid debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Origin: ${req.get('origin') || 'none'}`);
  next();
});

// API
app.use('/api/qr', qrRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropsRoutes);

// Simple health check / debug endpoint
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

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
    // Ensure the target database exists (helps when DB not created yet)
    const DB_HOST = process.env.DB_HOST || '127.0.0.1';
    const DB_PORT = process.env.DB_PORT || 3306;
    const DB_NAME = process.env.DB_NAME || 'grassroots_db';
    const DB_USER = process.env.DB_USER || 'root';
    const DB_PASS = process.env.DB_PASS || '';

    try {
      const adminConn = await mysql.createConnection({ host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASS });
      await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await adminConn.end();
      console.log('Ensured database exists:', DB_NAME);
    } catch (dbErr) {
      console.warn('Could not ensure database exists (check MySQL), continuing and letting Sequelize handle it:', dbErr && dbErr.message ? dbErr.message : dbErr);
    }

    await sequelize.authenticate();
    // sync models (safe for initial development)
    // define basic associations
    Product.belongsTo(QR, { foreignKey: 'qrId', targetKey: 'id' });
    QR.belongsTo(Crop, { foreignKey: 'cropId', targetKey: 'id' });
    Order.hasMany(OrderItem, { foreignKey: 'orderId' });

    // Use plain sync to avoid destructive ALTERs on production-like schemas
    await sequelize.sync();

    // seed demo users and some sample data if missing
    const demoFarmer = await User.findOne({ where: { email: 'farmer@demo.test' } });
    if (!demoFarmer) {
      await User.create({ email: 'farmer@demo.test', password: 'farmerpass', role: 'farmer', name: 'Demo Farmer' });
    }
    const demoRetailer = await User.findOne({ where: { email: 'retailer@demo.test' } });
    if (!demoRetailer) {
      await User.create({ email: 'retailer@demo.test', password: 'retailerpass', role: 'retailer', name: 'Demo Retailer' });
    }

    // sample crop if none
    const cropsCount = await Crop.count();
    if (cropsCount === 0) {
      const c = await Crop.create({ name: 'Tomato', variety: 'Cherry', plantedAt: null, harvestEstimate: null, notes: 'Demo crop', farmerEmail: 'farmer@demo.test' });
      // create a QR for this crop
      await QR.create({ id: 'QR-DEMO-1', cropId: c.id, productName: 'Tomato (Cherry)', cropType: 'Tomato', generatedAt: new Date(), canvasData: '' });
    }

    // DEMO PRODUCTS for retailer
    const demoProducts = [
      { id: 'P-DEMO-1', qrId: 'QR-DEMO-1', name: 'Tomato (Cherry)', price: 45.0, stock: 120, description: 'Fresh cherry tomatoes from demo farm.' },
      { id: 'P-DEMO-2', qrId: null, name: 'Organic Basmati Rice', price: 80.0, stock: 60, description: 'Premium organic rice, long grain.' },
      { id: 'P-DEMO-3', qrId: null, name: 'Green Chilli', price: 30.0, stock: 200, description: 'Spicy green chillies, locally sourced.' },
      { id: 'P-DEMO-4', qrId: null, name: 'Potato', price: 25.0, stock: 300, description: 'Farm-fresh potatoes, best for fries.' }
    ];
    for (const prod of demoProducts) {
      const exists = await Product.findByPk(prod.id);
      if (!exists) await Product.create(prod);
    }
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
