const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Produto = require('./Produto');

const Comentario = sequelize.define('Comentario', {
  id_comentario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  texto: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  data_comentario: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, { tableName: 'comentarios', timestamps: false });

Comentario.belongsTo(Usuario, { foreignKey: 'id_usuario', onDelete: 'CASCADE' });
Comentario.belongsTo(Produto, { foreignKey: 'id_produto', onDelete: 'CASCADE' });

module.exports = Comentario;