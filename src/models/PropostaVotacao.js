const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PropostaVotacao = sequelize.define('PropostaVotacao', {
  id_proposta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titulo: { type: DataTypes.STRING(100), allowNull: false },
  descricao: { type: DataTypes.TEXT },
  categoria: { type: DataTypes.STRING(50), allowNull: false },
  status_votacao: { 
    type: DataTypes.ENUM('Em Votação', 'Apurada', 'Vencedora', 'Encerrada'),
    defaultValue: 'Em Votação'
  },
  quantidade_votos: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'propostas_votacao' });

module.exports = PropostaVotacao;