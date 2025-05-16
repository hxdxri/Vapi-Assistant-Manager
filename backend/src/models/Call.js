const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Call = sequelize.define('Call', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER, // in seconds
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('completed', 'failed', 'in_progress'),
    defaultValue: 'in_progress'
  },
  transcript: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  intent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  timestamps: true
});

module.exports = Call; 