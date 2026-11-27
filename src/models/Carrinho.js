const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Carrinho = sequelize.define('Carrinho', {
  id_carrinho: 
  { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true },
  id_usuario: 
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
     allowNull: false, 
     defaultValue: 1 },
  tamanho: 
  { 
    type: DataTypes.STRING(10), 
    defaultValue: 'P' },
  data_adicionado: 
  { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW }
}, 
{ tableName: 'carrinho' });

module.exports = Carrinho;