const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  shopName: DataTypes.STRING,
  address: DataTypes.TEXT,
  phone: DataTypes.STRING
}, {
  tableName: 'profiles',
  timestamps: false
});

module.exports = Profile;
