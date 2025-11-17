const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const QR = sequelize.define('QR', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  productName: DataTypes.STRING,
  cropType: DataTypes.STRING,
  quality: DataTypes.STRING,
  harvestDate: DataTypes.DATEONLY,
  farmLocation: DataTypes.STRING,
  fertilizerUsed: DataTypes.TEXT,
  pesticidesUsed: DataTypes.TEXT,
  batchNumber: DataTypes.STRING,
  price: DataTypes.STRING,
  farmerEmail: DataTypes.STRING,
  farmerName: DataTypes.STRING,
  generatedAt: DataTypes.DATE,
  canvasData: DataTypes.TEXT('long')
}, {
  tableName: 'qr_codes',
  timestamps: false
});

module.exports = QR;
