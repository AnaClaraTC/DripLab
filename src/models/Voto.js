const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Voto = sequelize.define('Voto', {
  id_voto: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  data_voto: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  id_proposta: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'votos' });

module.exports = Voto;