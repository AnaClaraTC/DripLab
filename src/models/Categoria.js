const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Categoria = sequelize.define('Categoria', {
  id_categoria: 
  { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true },
  nome: 
  { 
    type: DataTypes.STRING(50), 
    allowNull: false, 
    unique: true },
  descricao: 
  { 
    type: DataTypes.STRING(255), 
    allowNull: true }
}, 
{ tableName: 'categorias' });

module.exports = Categoria;