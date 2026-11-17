const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario, Endereco, Pedido } = require('../models');

async function cadastrar(req, res) {
  try {
    const { nome, telefone, email, senha, cpf, nomelocal, cep, estado, cidade, bairro, rua, numero, complemento } = req.body;

    if (!nome || !telefone || !email || !senha || !cpf) {
      return res.status(400).json({ mensagem: 'Preencha todos os campos obrigatórios.' });
    }

    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ mensagem: 'Este e-mail já está cadastrado.' });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);
    
//Cria só cliente
    const usuario = await Usuario.create({
      nome,
      telefone,
      email,
      senha: senhaCriptografada,
      cpf,
      tipo: 'cliente',
      pontos: 0,
      nivel: 'Iniciante'
    });
//endereço
    if (nomelocal && cep && rua && numero && bairro && cidade && estado) {
      try {
        await Endereco.create({
          id_usuario: usuario.id_usuario,
          nomelocal,
          cep,
          estado: estado.toUpperCase(),
          cidade,
          bairro,
          rua,
          numero,
          complemento: complemento || null
        });
      } catch (errEndereco) {
        console.warn('Aviso ao salvar endereço no cadastro:', errEndereco.message);
      }
    }

    res.status(201).json({
      id_usuario: usuario.id_usuario,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      pontos: usuario.pontos,
      nivel: usuario.nivel,
      mensagem: 'Usuário cadastrado com sucesso!'
    });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao cadastrar usuário', erro: erro.message });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ mensagem: 'E-mail e senha são obrigatórios.' });
    }

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(401).json({ mensagem: 'Email ou senha inválidos' });

    const senhaConfere = await bcrypt.compare(senha, usuario.senha);
    if (!senhaConfere) return res.status(401).json({ mensagem: 'Email ou senha inválidos' });

    const secret = process.env.JWT_SECRET || 'driplab_secret_key';
    const token = jwt.sign(
      { 
        id_usuario: usuario.id_usuario, 
        tipo: usuario.tipo, 
        nome: usuario.nome,
        email: usuario.email,
        nivel: usuario.nivel 
      },
      secret,
      { expiresIn: '8h' }
    );

    res.json({ 
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        cpf: usuario.cpf,
        tipo: usuario.tipo,
        pontos: usuario.pontos,
        nivel: usuario.nivel
      }
    });
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao fazer login', erro: erro.message });
  }
}

async function obterPerfil(req, res) {
  try {
    const id_usuario = req.usuario.id_usuario;

    const usuario = await Usuario.findByPk(id_usuario, {
      attributes: ['id_usuario', 'nome', 'telefone', 'email', 'cpf', 'pontos', 'nivel', 'tipo', 'data_cadastro'],
      include: [
        {
          model: Endereco,
          as: 'enderecos'
        }
      ]
    });

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    const totalPedidos = await Pedido.count({ where: { id_usuario } });

    const dados = usuario.toJSON();
    dados.totalPedidos = totalPedidos;

    res.json(dados);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao buscar perfil', erro: erro.message });
  }
}

async function atualizarPerfil(req, res) {
  try {
    const id_usuario = req.usuario.id_usuario;
    const { nome, telefone, senhaAtual, novaSenha } = req.body;

    const usuario = await Usuario.findByPk(id_usuario);
    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    if (nome) usuario.nome = nome;
    if (telefone) usuario.telefone = telefone;

    if (novaSenha) {
      if (!senhaAtual) {
        return res.status(400).json({ mensagem: 'Informe a senha atual para alterar a senha.' });
      }
      const confere = await bcrypt.compare(senhaAtual, usuario.senha);
      if (!confere) {
        return res.status(400).json({ mensagem: 'Senha atual incorreta.' });
      }
      usuario.senha = await bcrypt.hash(novaSenha, 10);
    }

    await usuario.save();

    res.json({
      mensagem: 'Perfil atualizado com sucesso!',
      usuario: {
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        telefone: usuario.telefone,
        email: usuario.email,
        tipo: usuario.tipo
      }
    });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao atualizar perfil', erro: erro.message });
  }
}

module.exports = { cadastrar, login, obterPerfil, atualizarPerfil };
