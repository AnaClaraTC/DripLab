const Produto = require('../models/Produto');
const { Op } = require('sequelize');

async function listar(req, res) {
  try {
    const { pagina = 1, limite = 10, nome, categoria } = req.query;
    const filtro = {};

    if (nome) filtro.nome = { [Op.like]: `%${nome}%` };
    if (categoria) filtro.categoria = categoria;

    const produtos = await Produto.findAll({
      where: filtro,
      limit: Number(limite),
      offset: (Number(pagina) - 1) * Number(limite),
    });

    res.json(produtos);
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao listar produtos', erro: erro.message });
  }
}

async function cadastrar(req, res) {
  try {
    const produto = await Produto.create(req.body);
    res.status(201).json(produto);
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao cadastrar produto', erro: erro.message });
  }
}

async function deletar(req, res) {
  try {
    const { id } = req.params;
    const produto = await Produto.findByPk(id);
    if (!produto) return res.status(404).json({ mensagem: 'Produto não encontrado' });

    await produto.destroy();
    res.json({ mensagem: 'Produto removido com sucesso' });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao remover produto', erro: erro.message });
  }
}

module.exports = { listar, cadastrar, deletar };