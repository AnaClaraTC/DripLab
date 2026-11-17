const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recompensa = sequelize.define('Recompensa', {
  id_recompensa: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  descricao: DataTypes.STRING(100),
  custo_pontos: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, { tableName: 'recompensas', timestamps: false });

module.exports = Recompensa;