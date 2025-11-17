const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: DataTypes.STRING,
  productId: DataTypes.STRING,
  name: DataTypes.STRING,
  qty: DataTypes.INTEGER,
  price: DataTypes.FLOAT
}, {
  tableName: 'order_items',
  timestamps: false
});

module.exports = OrderItem;
