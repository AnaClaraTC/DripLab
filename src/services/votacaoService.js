const Voto = require('../models/Voto');
const PropostaVotacao = require('../models/PropostaVotacao');

async function registrarVoto(id_usuario, id_proposta) {
  const proposta = await PropostaVotacao.findByPk(id_proposta);
  if (!proposta) throw new Error('Proposta de votação não encontrada.');

  if (proposta.status_votacao !== 'Em Votacao') {
    throw new Error('Esta proposta não está aberta para votação.');
  }

  const votoExistente = await Voto.findOne({ where: { id_usuario, id_proposta } });
  if (votoExistente) {
    throw new Error('Você já votou nesta proposta.');
  }

  const novoVoto = await Voto.create({ id_usuario, id_proposta });

  await proposta.increment('quantidade_votos', { by: 1 });

  return novoVoto;
}

module.exports = { registrarVoto };