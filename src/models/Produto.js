const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pedido = sequelize.define('Pedido', {
  id_pedido: 
  { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true },
  data_pedido: 
  { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW },
  valor_total: 
  { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false },
  valor_frete: 
  { 
    type: DataTypes.DECIMAL(10, 2), 
    defaultValue: 0.00 },
  metodo_pagamento: 
  { 
    type: DataTypes.ENUM('Cartao', 'Pix', 'Boleto'),
    allowNull: true
  },
  status_atual: 
  { 
    type: DataTypes.ENUM(
      'Aguardando pagamento', 
      'Pago', 
      'Em separação', 
      'Embalado', 
      'Enviado/Em transito', 
      'Entregue', 
      'Cancelado', 
      'Devolvido/Em troca'
    ),
    defaultValue: 'Aguardando pagamento'
  },
  id_usuario: 
  { 
    type: DataTypes.INTEGER, 
    allowNull: false },
  id_endereco: 
  { 
    type: DataTypes.INTEGER, 
    allowNull: true }
}, 
{ tableName: 'pedidos' });

module.exports = Pedido;