const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PropostaVotacao = sequelize.define('PropostaVotacao', {
  id_proposta: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descricao: DataTypes.TEXT,
  categoria: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  status_votacao: {
    type: DataTypes.ENUM('Em Votacao', 'Apurada', 'Vencedora', 'Encerrada'),
    defaultValue: 'Em Votacao'
  },
  quantidade_votos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, { 
  tableName: 'propostas_votacao', 
  timestamps: false 
});

module.exports = PropostaVotacao;