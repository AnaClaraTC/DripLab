const { Endereco } = require('../models');

async function listar(req, res) {
  try {
    const id_usuario = req.usuario.id_usuario;
    const enderecos = await Endereco.findAll({
      where: { id_usuario },
      order: [['id_endereco', 'ASC']]
    });

    res.json(enderecos);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao listar endereços', erro: erro.message });
  }
}

async function cadastrar(req, res) {
  try {
    const id_usuario = req.usuario.id_usuario;
    const { nomelocal, cep, estado, cidade, bairro, rua, numero, complemento } = req.body;

    if (!nomelocal || !cep || !estado || !cidade || !bairro || !rua || !numero) {
      return res.status(400).json({ mensagem: 'Preencha todos os campos obrigatórios do endereço.' });
    }

    const endereco = await Endereco.create({
      id_usuario,
      nomelocal: nomelocal.trim(),
      cep: cep.trim(),
      estado: estado.trim().toUpperCase(),
      cidade: cidade.trim(),
      bairro: bairro.trim(),
      rua: rua.trim(),
      numero: numero.trim(),
      complemento: complemento ? complemento.trim() : null
    });

    res.status(201).json({
      ok: true,
      id: endereco.id_endereco,
      endereco
    });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao cadastrar endereço', erro: erro.message });
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

    if (nomelocal) endereco.nomelocal = nomelocal.trim();
    if (cep) endereco.cep = cep.trim();
    if (estado) endereco.estado = estado.trim().toUpperCase();
    if (cidade) endereco.cidade = cidade.trim();
    if (bairro) endereco.bairro = bairro.trim();
    if (rua) endereco.rua = rua.trim();
    if (numero) endereco.numero = numero.trim();
    if (complemento !== undefined) endereco.complemento = complemento ? complemento.trim() : null;

    await endereco.save();

    res.json({
      ok: true,
      mensagem: 'Endereço atualizado com sucesso!',
      endereco
    });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao atualizar endereço', erro: erro.message });
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
    res.status(400).json({ mensagem: 'Erro ao remover endereço', erro: erro.message });
  }
}

module.exports = { listar, cadastrar, atualizar, deletar };
