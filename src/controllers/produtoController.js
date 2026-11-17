const { Op } = require('sequelize');
const { Produto, Usuario, Drop, Comentario, Categoria } = require('../models');

async function listar(req, res) {
  try {
    const { pagina = 1, limite = 50, nome, categoria, tamanho } = req.query;
    const filtro = {};

    if (nome) filtro.nome = { [Op.like]: `%${nome}%` };
    if (categoria && categoria !== 'todos') filtro.categoria = categoria;
    if (tamanho) filtro.tamanho = tamanho.toLowerCase();

    const produtos = await Produto.findAll({
      where: filtro,
      include: [
        {
          model: Usuario,
          as: 'criador',
          attributes: ['id_usuario', 'nome', 'email', 'tipo']
        },
        {
          model: Drop,
          as: 'drop',
          attributes: ['id_drop', 'nome']
        }
      ],
      limit: Number(limite),
      offset: (Number(pagina) - 1) * Number(limite),
      order: [['id_produto', 'DESC']]
    });

    res.json(produtos);
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao listar produtos', erro: erro.message });
  }
}

async function obterPorId(req, res) {
  try {
    const { id } = req.params;
    const produto = await Produto.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'criador',
          attributes: ['id_usuario', 'nome', 'email', 'tipo']
        },
        {
          model: Drop,
          as: 'drop'
        },
        {
          model: Comentario,
          as: 'comentarios',
          include: [
            {
              model: Usuario,
              as: 'autor',
              attributes: ['id_usuario', 'nome', 'tipo']
            }
          ]
        }
      ]
    });

    if (!produto) {
      return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    }

    res.json(produto);
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao obter produto', erro: erro.message });
  }
}

async function cadastrar(req, res) {
  try {
    const dados = { ...req.body };
    if (req.usuario && req.usuario.id_usuario) {
      dados.id_usuario = req.usuario.id_usuario;
    }

    if (!dados.nome || !dados.preco || dados.estoque === undefined || !dados.categoria || !dados.SKU) {
      return res.status(400).json({ mensagem: 'Preencha os campos obrigatórios do produto.' });
    }

    const produto = await Produto.create(dados);

    if (dados.categoria) {
      await Categoria.findOrCreate({
        where: { nome: dados.categoria },
        defaults: { nome: dados.categoria }
      }).catch(() => {});
    }

    const produtoCompleto = await Produto.findByPk(produto.id_produto, {
      include: [
        {
          model: Usuario,
          as: 'criador',
          attributes: ['id_usuario', 'nome', 'email', 'tipo']
        }
      ]
    });

    res.status(201).json(produtoCompleto);
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao cadastrar produto', erro: erro.message });
  }
}

async function deletar(req, res) {
  try {
    const { id } = req.params;
    const produto = await Produto.findByPk(id);
    if (!produto) return res.status(404).json({ mensagem: 'Produto não encontrado' });

    await produto.destroy();
    res.json({ mensagem: 'Produto removido com sucesso' });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao remover produto', erro: erro.message });
  }
}

async function listarCategorias(req, res) {
  try {
    let categorias = await Categoria.findAll({
      attributes: ['id_categoria', 'nome', 'descricao'],
      order: [['nome', 'ASC']]
    });

    if (categorias.length === 0) {
      const categoriasProdutos = await Produto.findAll({
        attributes: [[Produto.sequelize.fn('DISTINCT', Produto.sequelize.col('categoria')), 'nome']],
        raw: true
      });

      return res.json(categoriasProdutos.map(c => ({ nome: c.nome })));
    }

    res.json(categorias);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao listar categorias', erro: erro.message });
  }
}

module.exports = { listar, obterPorId, cadastrar, deletar, listarCategorias };
