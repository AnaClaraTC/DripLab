const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const PropostaVotacao = require('./PropostaVotacao');

const Voto = sequelize.define('Voto', {
  id_voto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  data_voto: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, { 
  tableName: 'votos', 
  timestamps: false
});

Voto.belongsTo(Usuario, { foreignKey: 'id_usuario', onDelete: 'CASCADE' });
Voto.belongsTo(PropostaVotacao, { foreignKey: 'id_proposta', onDelete: 'CASCADE' });

module.exports = Voto;