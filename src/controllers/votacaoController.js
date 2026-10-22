const Voto = require('../models/Voto');
const PropostaVotacao = require('../models/PropostaVotacao');
const Usuario = require('../models/Usuario');

async function votar(req, res) {
  try {
    const { id_proposta } = req.body;
    const id_usuario = req.usuario.id_usuario; 

    await Voto.create({ id_usuario, id_proposta });

    await PropostaVotacao.increment('quantidade_votos', {
      by: 1,
      where: { id_proposta }
    });

    await Usuario.increment('pontos', {
      by: 10,
      where: { id_usuario }
    });

    res.status(201).json({ mensagem: 'Voto computado e 10 pontos adicionados!' });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Você já votou nesta proposta ou ela não existe.', erro: erro.message });
  }
}

module.exports = { votar };