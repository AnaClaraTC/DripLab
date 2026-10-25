const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Badge = sequelize.define('Badge', {
  id_badge: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  descricao: DataTypes.STRING(100),
  icone: DataTypes.STRING(255)
}, { tableName: 'badges', timestamps: false });

module.exports = Badge;