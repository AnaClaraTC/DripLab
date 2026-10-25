const express = require('express');
const router = express.Router();

const autenticar = require('../middlewares/auth');
const permitir = require('../middlewares/checkRole');

const authController = require('../controllers/authController');
const produtoController = require('../controllers/produtoController');

const { criarPedido } = require('../services/pedidoService');
const { registrarVoto } = require('../services/votacaoService');
const Comentario = require('../models/Comentario');
const Usuario = require('../models/Usuario');
const PropostaVotacao = require('../models/PropostaVotacao');
const Voto = require('../models/Voto');

router.post('/login', authController.login);
router.post('/usuarios', authController.cadastrar);

router.get('/produtos', produtoController.listar);
router.post('/produtos', autenticar, permitir('administrador'), produtoController.cadastrar);

router.post('/pedidos', autenticar, async (req, res) => {
  try {
    const { itens, metodo_pagamento } = req.body;
    const id_usuario = req.usuario.id_usuario || req.usuario.id;
    const pedido = await criarPedido(id_usuario, itens, metodo_pagamento);
    res.status(201).json({ mensagem: 'Pedido realizado com sucesso!', pedido });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao processar pedido', erro: erro.message });
  }
});

router.get('/propostas', async (req, res) => {
  try {
    const propostas = await PropostaVotacao.findAll();
    res.json(propostas);
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao buscar propostas', erro: erro.message });
  }
});

router.post('/propostas', autenticar, permitir('administrador'), async (req, res) => {
  try {
    const { titulo, descricao, categoria, status_votacao } = req.body;
    const proposta = await PropostaVotacao.create({
      titulo,
      descricao,
      categoria,
      status_votacao: status_votacao || 'Em Votacao'
    });
    res.status(201).json({ mensagem: 'Proposta criada com sucesso!', proposta });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao criar proposta', erro: erro.message });
  }
});

router.delete('/propostas/:id', autenticar, permitir('administrador'), async (req, res) => {
  try {
    const { id } = req.params;
    const proposta = await PropostaVotacao.findByPk(id);
    if (!proposta) {
      return res.status(404).json({ mensagem: 'Proposta não encontrada' });
    }
    await proposta.destroy();
    res.json({ mensagem: 'Proposta removida com sucesso' });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao deletar proposta', erro: erro.message });
  }
});

router.post('/voto', autenticar, async (req, res) => {
  try {
    const { id_proposta } = req.body;
    const id_usuario = req.usuario.id_usuario || req.usuario.id;

    const voto = await registrarVoto(id_usuario, id_proposta);
    res.status(201).json({ mensagem: 'Voto registrado com sucesso!', voto });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao registrar voto', erro: erro.message });
  }
});

router.delete('/voto/:id_proposta', autenticar, async (req, res) => {
  try {
    const { id_proposta } = req.params;
    const id_usuario = req.usuario.id_usuario || req.usuario.id;

    const voto = await Voto.findOne({ where: { id_usuario, id_proposta } });
    if (!voto) {
      return res.status(404).json({ mensagem: 'Voto não encontrado para este usuário nesta proposta' });
    }

    await voto.destroy();

    const proposta = await PropostaVotacao.findByPk(id_proposta);
    if (proposta && proposta.quantidade_votos > 0) {
      await proposta.decrement('quantidade_votos', { by: 1 });
    }

    res.json({ mensagem: 'Voto removido com sucesso!' });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao remover voto', erro: erro.message });
  }
});

router.post('/comentarios', autenticar, async (req, res) => {
  try {
    const { texto, id_produto } = req.body;
    const id_usuario = req.usuario.id_usuario || req.usuario.id;

    const comentario = await Comentario.create({
      texto,
      id_produto,
      id_usuario
    });
    res.status(201).json(comentario);
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao criar comentário', erro: erro.message });
  }
});

router.get('/produtos/:id/comentarios', async (req, res) => {
  try {
    const comentarios = await Comentario.findAll({
      where: { id_produto: req.params.id },
      include: [{ model: Usuario, attributes: ['nome'] }]
    });
    res.json(comentarios);
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao buscar comentários', erro: erro.message });
  }
});

router.delete('/comentarios/:id', autenticar, async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario || req.usuario.id;
    const comentario = await Comentario.findByPk(id);

    if (!comentario) {
      return res.status(404).json({ mensagem: 'Comentário não encontrado' });
    }

    if (comentario.id_usuario !== id_usuario && req.usuario.tipo !== 'administrador') {
      return res.status(403).json({ mensagem: 'Sem permissão para deletar este comentário' });
    }

    await comentario.destroy();
    res.json({ mensagem: 'Comentário removido com sucesso' });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao deletar comentário', erro: erro.message });
  }
});

module.exports = router;