const { Endereco } = require('../models');
const {
  normalizarCep,
  normalizarUf,
  detalharErro
} = require('../utils/normalizacaoDados');

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function validarLimites(dados) {
  const limites = {
    nomelocal: 50,
    cidade: 100,
    bairro: 100,
    rua: 150,
    numero: 20,
    complemento: 100
  };
  for (const [campo, limite] of Object.entries(limites)) {
    if (dados[campo] !== undefined && texto(dados[campo]).length > limite) {
      return `O campo ${campo} deve ter no máximo ${limite} caracteres.`;
    }
  }
  return '';
}

async function listar(req, res) {
  try {
    const id_usuario = req.usuario.id_usuario;
    const enderecos = await Endereco.findAll({
      where: { id_usuario },
      order: [['id_endereco', 'ASC']]
    });

    res.json(enderecos);
  } catch (erro) {
    res.status(500).json({ mensagem: `Erro ao listar endereços: ${detalharErro(erro)}` });
  }
}

async function cadastrar(req, res) {
  try {
    const id_usuario = req.usuario.id_usuario;
    const { nomelocal, cep, estado, cidade, bairro, rua, numero, complemento } = req.body;

    if (![nomelocal, cep, estado, cidade, bairro, rua, numero].every((valor) => texto(valor))) {
      return res.status(400).json({ mensagem: 'Preencha todos os campos obrigatórios do endereço.' });
    }
    const erroLimite = validarLimites({ nomelocal, cidade, bairro, rua, numero, complemento });
    if (erroLimite) return res.status(400).json({ mensagem: erroLimite });

    let cepFormatado;
    let uf;
    try {
      cepFormatado = normalizarCep(cep);
      uf = normalizarUf(estado);
    } catch (erro) {
      return res.status(400).json({ mensagem: erro.message });
    }

    const endereco = await Endereco.create({
      id_usuario,
      nomelocal: texto(nomelocal),
      cep: cepFormatado,
      estado: uf,
      cidade: texto(cidade),
      bairro: texto(bairro),
      rua: texto(rua),
      numero: texto(numero),
      complemento: texto(complemento) || null
    });

    res.status(201).json({
      ok: true,
      id: endereco.id_endereco,
      endereco
    });
  } catch (erro) {
    res.status(400).json({ mensagem: `Erro ao cadastrar endereço: ${detalharErro(erro)}` });
  }
}

async function atualizar(req, res) {
  try {
    const id_usuario = req.usuario.id_usuario;
    const { id } = req.params;
    const { nomelocal, cep, estado, cidade, bairro, rua, numero, complemento } = req.body;

    const endereco = await Endereco.findOne({
      where: { id_endereco: id, id_usuario }
    });

    if (!endereco) {
      return res.status(404).json({ mensagem: 'Endereço não encontrado ou você não tem permissão para alterá-lo.' });
    }

    for (const [campo, valor] of Object.entries({ nomelocal, cidade, bairro, rua, numero })) {
      if (valor !== undefined && !texto(valor)) {
        return res.status(400).json({ mensagem: `O campo ${campo} não pode ficar vazio.` });
      }
    }
    const erroLimite = validarLimites({ nomelocal, cidade, bairro, rua, numero, complemento });
    if (erroLimite) return res.status(400).json({ mensagem: erroLimite });

    if (nomelocal !== undefined) endereco.nomelocal = texto(nomelocal);
    if (cep !== undefined) {
      try {
        endereco.cep = normalizarCep(cep);
      } catch (erro) {
        return res.status(400).json({ mensagem: erro.message });
      }
    }
    if (estado !== undefined) {
      try {
        endereco.estado = normalizarUf(estado);
      } catch (erro) {
        return res.status(400).json({ mensagem: erro.message });
      }
    }
    if (cidade !== undefined) endereco.cidade = texto(cidade);
    if (bairro !== undefined) endereco.bairro = texto(bairro);
    if (rua !== undefined) endereco.rua = texto(rua);
    if (numero !== undefined) endereco.numero = texto(numero);
    if (complemento !== undefined) endereco.complemento = texto(complemento) || null;

    await endereco.save();

    res.json({
      ok: true,
      mensagem: 'Endereço atualizado com sucesso!',
      endereco
    });
  } catch (erro) {
    res.status(400).json({ mensagem: `Erro ao atualizar endereço: ${detalharErro(erro)}` });
  }
}

async function deletar(req, res) {
  try {
    const id_usuario = req.usuario.id_usuario;
    const { id } = req.params;

    const endereco = await Endereco.findOne({
      where: { id_endereco: id, id_usuario }
    });

    if (!endereco) {
      return res.status(404).json({ mensagem: 'Endereço não encontrado ou você não tem permissão para removê-lo.' });
    }

    await endereco.destroy();

    res.json({ ok: true, mensagem: 'Endereço removido com sucesso!' });
  } catch (erro) {
    res.status(400).json({ mensagem: `Erro ao remover endereço: ${detalharErro(erro)}` });
  }
}

module.exports = { listar, cadastrar, atualizar, deletar };
