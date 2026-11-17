const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Endereco = sequelize.define('Endereco', {
  id_endereco: 
  { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true },
  id_usuario: 
  { 
    type: DataTypes.INTEGER, 
    allowNull: false },
  nomelocal: 
  { 
    type: DataTypes.STRING(50), 
    allowNull: false },
  cep: 
  { 
    type: DataTypes.STRING(10), 
    allowNull: false },
  estado: 
  { 
    type: DataTypes.STRING(2), 
    allowNull: false },
  cidade: 
  { 
    type: DataTypes.STRING(100), 
    allowNull: false },
  bairro: 
  { 
    type: DataTypes.STRING(100), 
    allowNull: false },
  rua: 
  { 
    type: DataTypes.STRING(150), 
    allowNull: false },
  numero: 
  { 
    type: DataTypes.STRING(20), 
    allowNull: false },
  complemento: 
  { 
    type: DataTypes.STRING(100), 
    allowNull: true }
}, 
{ tableName: 'enderecos' });

module.exports = Endereco;