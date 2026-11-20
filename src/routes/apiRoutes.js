const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const operadorController = require('../controllers/operadorController');
const produtoController = require('../controllers/produtoController');
const dropController = require('../controllers/dropController');
const comentarioController = require('../controllers/comentarioController');
const votacaoController = require('../controllers/votacaoController');
const enderecoController = require('../controllers/enderecoController');
const carrinhoController = require('../controllers/carrinhoController');
const pedidoController = require('../controllers/pedidoController');
const freteController = require('../controllers/freteController');
const dashboardController = require('../controllers/dashboardController');

const auth = require('../middlewares/auth');
const permitir = require('../middlewares/checkRole');

function authOpcional(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();
  const partes = authHeader.split(' ');
  const token = partes.length === 2 ? partes[1] : partes[0];
  try {
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'driplab_secret_key';
    req.usuario = jwt.verify(token, secret);
  } catch (e) {}
  next();
}

// Autenticacao e Perfil
router.post('/usuarios', authController.cadastrar);
router.post('/login', authController.login);
router.get('/auth/perfil', auth, authController.obterPerfil);
router.get('/usuarios/perfil', auth, authController.obterPerfil);
router.put('/usuarios/perfil', auth, authController.atualizarPerfil);

// Gestao de Operadores
router.get('/operadores', auth, permitir('admin'), operadorController.listar);
router.post('/operadores', auth, permitir('admin'), operadorController.cadastrar);
router.put('/operadores/:id', auth, permitir('admin'), operadorController.atualizar);
router.delete('/operadores/:id', auth, permitir('admin'), operadorController.deletar);

// Drops
router.get('/drops/ativo', dropController.obterAtivo);
router.get('/drops', dropController.listar);
router.post('/drops', auth, permitir('admin', 'operador'), dropController.cadastrar);
router.put('/drops/:id', auth, permitir('admin', 'operador'), dropController.atualizar);
router.delete('/drops/:id', auth, permitir('admin', 'operador'), dropController.deletar);

// Produtos
router.get('/produtos/mais-vendidos', produtoController.maisVendidos);
router.get('/produtos', produtoController.listar);
router.get('/produtos/:id', produtoController.obterPorId);
router.post('/produtos', auth, permitir('admin', 'operador'), produtoController.cadastrar);
router.delete('/produtos/:id', auth, permitir('admin', 'operador'), produtoController.deletar);
router.get('/categorias', produtoController.listarCategorias);

// Comentarios
router.get('/produtos/:id/comentarios', comentarioController.listarPorProduto);
router.post('/produtos/:id/comentarios', auth, comentarioController.criar);
router.delete('/comentarios/:id', auth, comentarioController.deletar);

// Propostas e Votacao
router.get('/propostas', authOpcional, votacaoController.listarPropostas);
router.post('/propostas', auth, permitir('admin'), votacaoController.criarProposta);
router.delete('/propostas/:id', auth, permitir('admin'), votacaoController.deletarProposta);
router.post('/votar', auth, votacaoController.votar);
router.post('/propostas/:id/votar', auth, votacaoController.votar);
router.delete('/votos/:id_proposta', auth, votacaoController.removerVoto);
router.delete('/propostas/:id/votar', auth, votacaoController.removerVoto);

// Enderecos
router.get('/enderecos', auth, enderecoController.listar);
router.post('/enderecos', auth, enderecoController.cadastrar);
router.put('/enderecos/:id', auth, enderecoController.atualizar);
router.delete('/enderecos/:id', auth, enderecoController.deletar);

// Carrinho
router.get('/carrinho', auth, carrinhoController.listar);
router.post('/carrinho', auth, carrinhoController.adicionar);
router.put('/carrinho/:id', auth, carrinhoController.atualizarQuantidade);
router.delete('/carrinho/:id', auth, carrinhoController.removerItem);
router.delete('/carrinho', auth, carrinhoController.limpar);

// Pedidos
router.post('/pedidos', auth, pedidoController.criar);
router.get('/pedidos/meus', auth, pedidoController.meusPedidos);
router.get('/pedidos/:id', auth, pedidoController.obterPorId);
router.get('/pedidos', auth, permitir('operador'), pedidoController.listarTodos);
router.patch('/pedidos/:id/status', auth, permitir('operador'), pedidoController.atualizarStatus);
router.put('/pedidos/:id/status', auth, permitir('operador'), pedidoController.atualizarStatus);

// Frete
router.post('/frete/calcular', freteController.calcular);
router.get('/frete/:cep', freteController.calcular);

// Dashboard
router.get('/dashboard/metricas', auth, permitir('admin'), dashboardController.metricas);
router.get('/dashboard/clientes', auth, permitir('operador'), dashboardController.listarClientes);

module.exports = router;
