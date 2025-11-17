const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Crop = sequelize.define('Crop', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: DataTypes.STRING,
  variety: DataTypes.STRING,
  plantedAt: DataTypes.DATEONLY,
  harvestEstimate: DataTypes.DATEONLY,
  notes: DataTypes.TEXT,
  farmerEmail: DataTypes.STRING
}, {
  tableName: 'crops',
  timestamps: false
});

module.exports = Crop;
