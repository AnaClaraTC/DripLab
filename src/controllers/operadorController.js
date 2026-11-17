const bcrypt = require('bcrypt');
const { Usuario } = require('../models');

async function listar(req, res) {
  try {
    const operadores = await Usuario.findAll({
      where: { tipo: 'operador' },
      attributes: ['id_usuario', 'nome', 'email', 'telefone', 'cpf', 'nivel', 'tipo', 'data_cadastro'],
      order: [['id_usuario', 'DESC']]
    });

    res.json(operadores);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao listar operadores', erro: erro.message });
  }
}

async function cadastrar(req, res) {
  try {
    const { nome, email, telefone, cpf, senha, nivel = 'Operador' } = req.body;

    if (!nome || !email || !cpf || !senha) {
      return res.status(400).json({ mensagem: 'Nome, e-mail, CPF e senha são obrigatórios.' });
    }

    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ mensagem: 'Este e-mail já está em uso.' });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const operador = await Usuario.create({
      nome,
      email,
      telefone: telefone || '+55 (00) 00000-0000',
      cpf,
      senha: senhaCriptografada,
      tipo: 'operador',
      nivel,
      pontos: 0
    });

    res.status(201).json({
      mensagem: 'Operador criado com sucesso!',
      operador: {
        id_usuario: operador.id_usuario,
        nome: operador.nome,
        email: operador.email,
        telefone: operador.telefone,
        cpf: operador.cpf,
        tipo: operador.tipo,
        nivel: operador.nivel
      }
    });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao cadastrar operador', erro: erro.message });
  }
}

async function atualizar(req, res) {
  try {
    const { id } = req.params;
    const { nome, email, telefone, cpf, nivel, novaSenha } = req.body;

    const operador = await Usuario.findOne({
      where: { id_usuario: id, tipo: 'operador' }
    });

    if (!operador) {
      return res.status(404).json({ mensagem: 'Operador não encontrado.' });
    }

    if (nome) operador.nome = nome;
    if (email) operador.email = email;
    if (telefone) operador.telefone = telefone;
    if (cpf) operador.cpf = cpf;
    if (nivel) operador.nivel = nivel;

    if (novaSenha && novaSenha.trim() !== '') {
      operador.senha = await bcrypt.hash(novaSenha, 10);
    }

    await operador.save();

    res.json({
      mensagem: 'Dados do operador atualizados com sucesso!',
      operador: {
        id_usuario: operador.id_usuario,
        nome: operador.nome,
        email: operador.email,
        telefone: operador.telefone,
        cpf: operador.cpf,
        tipo: operador.tipo,
        nivel: operador.nivel
      }
    });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao atualizar operador', erro: erro.message });
  }
}

async function deletar(req, res) {
  try {
    const { id } = req.params;

    const operador = await Usuario.findOne({
      where: { id_usuario: id, tipo: 'operador' }
    });

    if (!operador) {
      return res.status(404).json({ mensagem: 'Operador não encontrado ou não é um operador.' });
    }

    await operador.destroy();

    res.json({ mensagem: 'Operador removido com sucesso!' });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao remover operador', erro: erro.message });
  }
}

module.exports = { listar, cadastrar, atualizar, deletar };
