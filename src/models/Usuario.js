const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(100), allowNull: false },
  telefone: { type: DataTypes.STRING(15), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  senha: { type: DataTypes.STRING(255), allowNull: false },
  cpf: { type: DataTypes.STRING(15), allowNull: false },
  pontos: { type: DataTypes.INTEGER, defaultValue: 0 },
  nivel: { type: DataTypes.STRING(50), defaultValue: 'Iniciante' },
  tipo: { type: DataTypes.ENUM('operador', 'administrador'), defaultValue: 'operador' }, 
  data_cadastro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'usuarios' });

module.exports = Usuario;