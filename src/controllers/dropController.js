const { Op } = require('sequelize');
const { Drop, Produto } = require('../models');

async function obterAtivo(req, res) {
  try {
    const agora = new Date();

    let drop = await Drop.findOne({
      where: {
        data_inicio: { [Op.lte]: agora },
        data_fim: { [Op.gte]: agora }
      },
      include: [
        {
          model: Produto,
          as: 'produtos'
        }
      ],
      order: [['id_drop', 'DESC']]
    });

    if (!drop) {
      drop = await Drop.findOne({
        include: [
          {
            model: Produto,
            as: 'produtos'
          }
        ],
        order: [['id_drop', 'DESC']]
      });
    }

    res.json(drop || null);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao buscar drop ativo', erro: erro.message });
  }
}

async function listar(req, res) {
  try {
    const drops = await Drop.findAll({
      include: [
        {
          model: Produto,
          as: 'produtos'
        }
      ],
      order: [['id_drop', 'DESC']]
    });
    res.json(drops);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao listar drops', erro: erro.message });
  }
}

async function cadastrar(req, res) {
  try {
    const { nome, data_inicio, data_fim, limite_pecas, banner_index, banner_produto } = req.body;

    if (!nome || !data_inicio || !data_fim || !limite_pecas) {
      return res.status(400).json({ mensagem: 'Nome, datas de início/fim e limite de peças são obrigatórios.' });
    }

    const drop = await Drop.create({
      nome,
      data_inicio,
      data_fim,
      limite_pecas: Number(limite_pecas),
      banner_index: banner_index ? banner_index.trim() : null,
      banner_produto: banner_produto ? banner_produto.trim() : null
    });

    res.status(201).json({
      mensagem: 'Drop criado com sucesso!',
      drop
    });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao cadastrar drop', erro: erro.message });
  }
}

async function atualizar(req, res) {
  try {
    const { id } = req.params;
    const { nome, data_inicio, data_fim, limite_pecas, banner_index, banner_produto } = req.body;

    const drop = await Drop.findByPk(id);
    if (!drop) {
      return res.status(404).json({ mensagem: 'Drop não encontrado.' });
    }

    if (nome) drop.nome = nome;
    if (data_inicio) drop.data_inicio = data_inicio;
    if (data_fim) drop.data_fim = data_fim;
    if (limite_pecas !== undefined) drop.limite_pecas = Number(limite_pecas);
    if (banner_index !== undefined) drop.banner_index = banner_index ? banner_index.trim() : null;
    if (banner_produto !== undefined) drop.banner_produto = banner_produto ? banner_produto.trim() : null;

    await drop.save();

    res.json({
      mensagem: 'Drop atualizado com sucesso!',
      drop
    });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao atualizar drop', erro: erro.message });
  }
}

async function deletar(req, res) {
  try {
    const { id } = req.params;
    const drop = await Drop.findByPk(id);
    if (!drop) {
      return res.status(404).json({ mensagem: 'Drop não encontrado.' });
    }

    await drop.destroy();
    res.json({ mensagem: 'Drop removido com sucesso!' });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao deletar drop', erro: erro.message });
  }
}

module.exports = {
  obterAtivo,
  listar,
  cadastrar,
  atualizar,
  deletar
};
