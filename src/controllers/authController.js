const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

async function cadastrar(req, res) {
  try {
    const { nome, telefone, email, senha, cpf, tipo } = req.body;
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    
    const usuario = await Usuario.create({
      nome,
      telefone,
      email,
      senha: senhaCriptografada,
      cpf,
      tipo: tipo || 'operador'
    });

    res.status(201).json({
      id_usuario: usuario.id_usuario,
      nome: usuario.nome,
      email: usuario.email,
      pontos: usuario.pontos,
      nivel: usuario.nivel
    });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao cadastrar usuário', erro: erro.message });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(401).json({ mensagem: 'Email ou senha inválidos' });

    const senhaConfere = await bcrypt.compare(senha, usuario.senha);
    if (!senhaConfere) return res.status(401).json({ mensagem: 'Email ou senha inválidos' });

    const token = jwt.sign(
      { 
        id: usuario.id_usuario, 
        id_usuario: usuario.id_usuario, 
        tipo: usuario.tipo, 
        nivel: usuario.nivel 
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token });
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao fazer login', erro: erro.message });
  }
}

module.exports = { cadastrar, login };