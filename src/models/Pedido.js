const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');

const Pedido = sequelize.define('Pedido', {
  id_pedido: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  valor_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  metodo_pagamento: {
    type: DataTypes.ENUM('Cartao', 'Pix', 'Boleto'),
    allowNull: false
  },
  status_atual: {
    type: DataTypes.ENUM('Aguardando pagamento', 'Pago', 'Embalado', 'Enviado/Em transito', 'Entregue', 'Cancelado', 'Devolvido/Em troca'),
    defaultValue: 'Aguardando pagamento'
  }
}, { tableName: 'pedidos', timestamps: false });

Pedido.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Usuario.hasMany(Pedido, { foreignKey: 'id_usuario' });

module.exports = Pedido;