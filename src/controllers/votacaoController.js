const { Voto, PropostaVotacao, Usuario } = require('../models');

async function listarPropostas(req, res) {
  try {
    const id_usuario = req.usuario ? req.usuario.id_usuario : null;

    const propostas = await PropostaVotacao.findAll({
      include: [
        {
          model: Usuario,
          as: 'criador',
          attributes: ['id_usuario', 'nome', 'tipo']
        }
      ],
      order: [['id_proposta', 'DESC']]
    });

    let votosDoUsuario = [];
    if (id_usuario) {
      const votos = await Voto.findAll({ where: { id_usuario } });
      votosDoUsuario = votos.map(v => v.id_proposta);
    }

    const resultado = propostas.map(p => {
      const item = p.toJSON();
      item.jaVotou = votosDoUsuario.includes(p.id_proposta);
      return item;
    });

    res.json(resultado);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao listar propostas', erro: erro.message });
  }
}

async function criarProposta(req, res) {
  try {
    const { titulo, descricao, categoria, status_votacao = 'Em Votação' } = req.body;
    const id_usuario = req.usuario.id_usuario;

    if (!titulo || !categoria) {
      return res.status(400).json({ mensagem: 'Título e categoria são obrigatórios.' });
    }

    const proposta = await PropostaVotacao.create({
      titulo,
      descricao,
      categoria,
      status_votacao,
      quantidade_votos: 0,
      id_usuario
    });

    const propostaComCriador = await PropostaVotacao.findByPk(proposta.id_proposta, {
      include: [
        {
          model: Usuario,
          as: 'criador',
          attributes: ['id_usuario', 'nome', 'tipo']
        }
      ]
    });

    res.status(201).json(propostaComCriador);
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao criar proposta', erro: erro.message });
  }
}

async function deletarProposta(req, res) {
  try {
    const { id } = req.params;
    const proposta = await PropostaVotacao.findByPk(id);

    if (!proposta) {
      return res.status(404).json({ mensagem: 'Proposta não encontrada.' });
    }

    await proposta.destroy();
    res.json({ mensagem: 'Proposta excluída com sucesso!' });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao excluir proposta', erro: erro.message });
  }
}

async function votar(req, res) {
  try {
    const id_proposta = req.body.id_proposta || req.params.id;
    const id_usuario = req.usuario.id_usuario; 

    if (!id_proposta) {
      return res.status(400).json({ mensagem: 'ID da proposta é obrigatório.' });
    }

    const proposta = await PropostaVotacao.findByPk(id_proposta);
    if (!proposta) {
      return res.status(404).json({ mensagem: 'Proposta não encontrada.' });
    }

    const votoExistente = await Voto.findOne({
      where: { id_usuario, id_proposta }
    });

    if (votoExistente) {
      return res.status(400).json({ mensagem: 'Você já votou nesta proposta.' });
    }

    await Voto.create({ id_usuario, id_proposta });

    await PropostaVotacao.increment('quantidade_votos', {
      by: 1,
      where: { id_proposta }
    });

    await Usuario.increment('pontos', {
      by: 10,
      where: { id_usuario }
    });

    const propostaAtualizada = await PropostaVotacao.findByPk(id_proposta);

    res.status(201).json({ 
      mensagem: 'Voto computado e 10 pontos adicionados!',
      quantidade_votos: propostaAtualizada.quantidade_votos
    });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao computar voto.', erro: erro.message });
  }
}

async function removerVoto(req, res) {
  try {
    const id_proposta = req.params.id_proposta || req.params.id || req.body.id_proposta;
    const id_usuario = req.usuario.id_usuario;

    if (!id_proposta) {
      return res.status(400).json({ mensagem: 'ID da proposta é obrigatório.' });
    }

    const voto = await Voto.findOne({
      where: { id_usuario, id_proposta }
    });

    if (!voto) {
      return res.status(404).json({ mensagem: 'Você não possui voto registrado nesta proposta.' });
    }

    await voto.destroy();

    const proposta = await PropostaVotacao.findByPk(id_proposta);
    if (proposta && proposta.quantidade_votos > 0) {
      await PropostaVotacao.decrement('quantidade_votos', {
        by: 1,
        where: { id_proposta }
      });
    }

    const usuario = await Usuario.findByPk(id_usuario);
    if (usuario && usuario.pontos >= 10) {
      await Usuario.decrement('pontos', {
        by: 10,
        where: { id_usuario }
      });
    }

    const propostaAtualizada = await PropostaVotacao.findByPk(id_proposta);

    res.json({
      mensagem: 'Voto removido com sucesso!',
      quantidade_votos: propostaAtualizada ? propostaAtualizada.quantidade_votos : 0
    });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao remover voto.', erro: erro.message });
  }
}

module.exports = { 
  listarPropostas, 
  criarProposta, 
  deletarProposta, 
  votar, 
  removerVoto 
};
