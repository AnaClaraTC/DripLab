const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const produtoController = require('../controllers/produtoController');
const votacaoController = require('../controllers/votacaoController');

const auth = require('../middlewares/auth');
const permitir = require('../middlewares/checkRole');

router.post('/usuarios', authController.cadastrar);
router.post('/login', authController.login);

router.get('/produtos', auth, produtoController.listar);
router.post('/produtos', auth, permitir('administrador'), produtoController.cadastrar);
router.delete('/produtos/:id', auth, permitir('administrador'), produtoController.deletar);

router.post('/votar', auth, votacaoController.votar);

module.exports = router;