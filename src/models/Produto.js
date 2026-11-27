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
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
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
  tamanho: {
    type: DataTypes.ENUM('p', 'm', 'g', 'gg'),
    defaultValue: 'p'
  },
  imagem: {
    type: DataTypes.TEXT('medium'),
    allowNull: true
  },
  id_drop: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'produtos',
  timestamps: false
});

module.exports = Produto;
