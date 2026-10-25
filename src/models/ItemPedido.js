const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Pedido = require('./Pedido');
const Produto = require('./Produto');

const ItemPedido = sequelize.define('ItemPedido', {
  id_item: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  preco_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, { tableName: 'item_pedido', timestamps: false });

ItemPedido.belongsTo(Pedido, { foreignKey: 'id_pedido', onDelete: 'CASCADE' });
ItemPedido.belongsTo(Produto, { foreignKey: 'id_produto', onDelete: 'RESTRICT' });

module.exports = ItemPedido;