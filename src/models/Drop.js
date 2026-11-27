const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Drop = sequelize.define('Drop', {
  id_drop: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  nome: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },
  data_inicio: { 
    type: DataTypes.DATE, 
    allowNull: false 
  },
  data_fim: { 
    type: DataTypes.DATE, 
    allowNull: false 
  },
  limite_pecas: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  banner_index: {
    type: DataTypes.TEXT('medium'),
    allowNull: true
  },
  banner_produto: {
    type: DataTypes.TEXT('medium'),
    allowNull: true
  }
}, { 
  tableName: 'drops',
  timestamps: false
});

module.exports = Drop;
