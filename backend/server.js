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
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

// API
app.use('/api/qr', qrRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropsRoutes);

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
    // define basic associations
    Product.belongsTo(QR, { foreignKey: 'qrId', targetKey: 'id' });
    QR.belongsTo(Crop, { foreignKey: 'cropId', targetKey: 'id' });
    Order.hasMany(OrderItem, { foreignKey: 'orderId' });

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
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
