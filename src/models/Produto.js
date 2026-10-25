const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Produto = sequelize.define('Produto', {
  id_produto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descricao: DataTypes.TEXT,
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  estoque: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  SKU: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  tamanho: DataTypes.ENUM('p', 'm', 'g', 'gg'),
  id_drop: DataTypes.INTEGER
}, {
  tableName: 'produtos',
  timestamps: false
});

module.exports = Produto;