const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ItemPedido = sequelize.define('ItemPedido', {
  id_item: 
  { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true },
  id_pedido: 
  { 
    type: DataTypes.INTEGER, 
    allowNull: false },
  id_produto: 
  { 
    type: DataTypes.INTEGER, 
    allowNull: false },
  quantidade: 
  { 
    type: DataTypes.INTEGER, 
    allowNull: false },
  preco_unitario: 
  { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false },
  tamanho: 
  { 
    type: DataTypes.STRING(10), 
    defaultValue: 'P' }
}, 
{ tableName: 'item_pedido' });

module.exports = ItemPedido;