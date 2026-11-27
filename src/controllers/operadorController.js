const bcrypt = require('bcrypt');
const { Usuario } = require('../models');
const {
  normalizarCpf,
  normalizarTelefone,
  detalharErro
} = require('../utils/normalizacaoDados');

async function listar(req, res) {
  try {
    const operadores = await Usuario.findAll({
      where: { tipo: 'operador' },
      attributes: ['id_usuario', 'nome', 'email', 'telefone', 'cpf', 'nivel', 'tipo', 'data_cadastro'],
      order: [['id_usuario', 'DESC']]
    });

    res.json(operadores);
  } catch (erro) {
    res.status(500).json({ mensagem: `Erro ao listar operadores: ${detalharErro(erro)}` });
  }
}

async function cadastrar(req, res) {
  try {
    const { nome, email, telefone, cpf, senha, nivel = 'Operador' } = req.body;

    if (![nome, email, telefone, cpf, senha].every((valor) => typeof valor === 'string' && valor.trim())) {
      return res.status(400).json({ mensagem: 'Nome, e-mail, telefone, CPF e senha são obrigatórios.' });
    }
    if (nome.trim().length > 100 || email.trim().length > 100 ||
        typeof nivel !== 'string' || nivel.length > 50) {
      return res.status(400).json({ mensagem: 'Nome e e-mail devem ter até 100 caracteres; nível deve ter até 50.' });
    }

    let telefoneFormatado;
    let cpfFormatado;
    try {
      telefoneFormatado = normalizarTelefone(telefone);
      cpfFormatado = normalizarCpf(cpf);
    } catch (erro) {
      return res.status(400).json({ mensagem: erro.message });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const usuarioExistente = await Usuario.findOne({ where: { email: emailNormalizado } });
    if (usuarioExistente) {
      return res.status(400).json({ mensagem: 'Este e-mail já está em uso.' });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const operador = await Usuario.create({
      nome: nome.trim(),
      email: emailNormalizado,
      telefone: telefoneFormatado,
      cpf: cpfFormatado,
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
    res.status(400).json({ mensagem: `Erro ao cadastrar operador: ${detalharErro(erro)}` });
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

    if (nome !== undefined) {
      if (typeof nome !== 'string' || !nome.trim() || nome.trim().length > 100) {
        return res.status(400).json({ mensagem: 'O nome deve conter de 1 a 100 caracteres.' });
      }
      operador.nome = nome.trim();
    }
    if (email !== undefined) {
      if (typeof email !== 'string' || !email.trim() || email.trim().length > 100) {
        return res.status(400).json({ mensagem: 'O e-mail deve conter de 1 a 100 caracteres.' });
      }
      operador.email = email.trim().toLowerCase();
    }
    if (telefone !== undefined) {
      try {
        operador.telefone = normalizarTelefone(telefone);
      } catch (erro) {
        return res.status(400).json({ mensagem: erro.message });
      }
    }
    if (cpf !== undefined) {
      try {
        operador.cpf = normalizarCpf(cpf);
      } catch (erro) {
        return res.status(400).json({ mensagem: erro.message });
      }
    }
    if (nivel !== undefined) {
      if (typeof nivel !== 'string' || nivel.length > 50) {
        return res.status(400).json({ mensagem: 'O nível deve ter no máximo 50 caracteres.' });
      }
      operador.nivel = nivel;
    }

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
    res.status(400).json({ mensagem: `Erro ao atualizar operador: ${detalharErro(erro)}` });
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
    res.status(400).json({ mensagem: `Erro ao remover operador: ${detalharErro(erro)}` });
  }
}

module.exports = { listar, cadastrar, atualizar, deletar };
