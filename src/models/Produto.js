const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Drop = require('./Drop');

const Produto = sequelize.define('Produto', {
  id_produto: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(100), allowNull: false },
  descricao: { type: DataTypes.TEXT },
  preco: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  estoque: { type: DataTypes.INTEGER, allowNull: false },
  categoria: { type: DataTypes.STRING(50), allowNull: false },
  SKU: { type: DataTypes.STRING(50), allowNull: false },
  tamanho: { type: DataTypes.ENUM('p', 'm', 'g', 'gg') },
  id_drop: { type: DataTypes.INTEGER }
}, { tableName: 'produtos' });

Produto.belongsTo(Drop, { foreignKey: 'id_drop' });
Drop.hasMany(Produto, { foreignKey: 'id_drop' });

module.exports = Produto;