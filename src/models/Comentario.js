const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comentario = sequelize.define('Comentario', {
  id_comentario: 
  { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true },
  texto: 
  { 
    type: DataTypes.TEXT, 
    allowNull: false },
  data_comentario: 
  { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW },
  id_usuario: 
  { 
    type: DataTypes.INTEGER, 
    allowNull: false },
  id_produto: 
  { 
    type: DataTypes.INTEGER, 
    allowNull: false }
}, 
{ tableName: 'comentarios' });

module.exports = Comentario;