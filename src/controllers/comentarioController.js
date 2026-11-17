const { Comentario, Usuario } = require('../models');

async function listarPorProduto(req, res) {
  try {
    const { id } = req.params;

    const comentarios = await Comentario.findAll({
      where: { id_produto: id },
      include: [
        {
          model: Usuario,
          as: 'autor',
          attributes: ['id_usuario', 'nome', 'tipo']
        }
      ],
      order: [['id_comentario', 'DESC']]
    });

    res.json(comentarios);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao listar comentários', erro: erro.message });
  }
}

async function criar(req, res) {
  try {
    const { id } = req.params;
    const { texto } = req.body;
    const id_usuario = req.usuario.id_usuario;

    if (!texto || texto.trim() === '') {
      return res.status(400).json({ mensagem: 'O comentário não pode ser vazio.' });
    }

    const comentario = await Comentario.create({
      texto: texto.trim(),
      id_produto: id,
      id_usuario
    });

    const comentarioComAutor = await Comentario.findByPk(comentario.id_comentario, {
      include: [
        {
          model: Usuario,
          as: 'autor',
          attributes: ['id_usuario', 'nome', 'tipo']
        }
      ]
    });

    res.status(201).json(comentarioComAutor);
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao adicionar comentário', erro: erro.message });
  }
}

async function deletar(req, res) {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;
    const tipo_usuario = req.usuario.tipo;

    const comentario = await Comentario.findByPk(id);
    if (!comentario) {
      return res.status(404).json({ mensagem: 'Comentário não encontrado.' });
    }

    //REgra
    //admin operador podem deletar qualquer comentário
    //cliente só o dele
    const podeDeletar = ['admin', 'operador'].includes(tipo_usuario) || comentario.id_usuario === id_usuario;

    if (!podeDeletar) {
      return res.status(403).json({ mensagem: 'Você não tem permissão para remover este comentário.' });
    }

    await comentario.destroy();
    res.json({ mensagem: 'Comentário removido com sucesso!' });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao remover comentário', erro: erro.message });
  }
}

module.exports = { listarPorProduto, criar, deletar };
