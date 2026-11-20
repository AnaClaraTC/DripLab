const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { Produto, Usuario, Drop, Comentario, Categoria, ItemPedido } = require('../models');

async function listar(req, res) {
  try {
    const { pagina = 1, limite = 50, nome, busca, categoria, tamanho, id_drop, ordenar } = req.query;
    const termo = (busca || nome || '').trim();

    let whereClause = {};

    if (categoria && categoria.toLowerCase() !== 'todos') {
      whereClause.categoria = { [Op.like]: `%${categoria.trim()}%` };
    }

    if (tamanho) {
      whereClause.tamanho = tamanho.toLowerCase();
    }

    if (id_drop) {
      whereClause.id_drop = id_drop;
    }

    const includeList = [
      {
        model: Usuario,
        as: 'criador',
        attributes: ['id_usuario', 'nome', 'email', 'tipo']
      },
      {
        model: Drop,
        as: 'drop',
        attributes: ['id_drop', 'nome', 'banner_index', 'banner_produto']
      }
    ];

    if (termo) {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { nome: { [Op.like]: `%${termo}%` } },
          { categoria: { [Op.like]: `%${termo}%` } },
          { '$drop.nome$': { [Op.like]: `%${termo}%` } }
        ]
      };
    }

    let orderClause = [['id_produto', 'DESC']];
    if (ordenar === 'antigo') {
      orderClause = [['id_produto', 'ASC']];
    } else if (ordenar === 'recente') {
      orderClause = [['id_produto', 'DESC']];
    } else if (ordenar === 'comprado') {
      // Order by sales or fallback to recent
      orderClause = [['id_produto', 'DESC']];
    }

    const produtos = await Produto.findAll({
      where: whereClause,
      include: includeList,
      subQuery: false,
      limit: Number(limite),
      offset: (Number(pagina) - 1) * Number(limite),
      order: orderClause
    });

    res.json(produtos);
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao listar produtos', erro: erro.message });
  }
}

async function maisVendidos(req, res) {
  try {
    const itensVendidos = await ItemPedido.findAll({
      attributes: [
        'id_produto',
        [sequelize.fn('SUM', sequelize.col('ItemPedido.quantidade')), 'total_vendido']
      ],
      include: [
        {
          model: Produto,
          as: 'produto',
          include: [
            {
              model: Drop,
              as: 'drop',
              attributes: ['id_drop', 'nome']
            },
            {
              model: Usuario,
              as: 'criador',
              attributes: ['id_usuario', 'nome', 'tipo']
            }
          ]
        }
      ],
      group: [
        'ItemPedido.id_produto',
        'produto.id_produto',
        'produto->drop.id_drop',
        'produto->criador.id_usuario'
      ],
      order: [[sequelize.literal('total_vendido'), 'DESC']],
      limit: 16
    });

    const produtos = itensVendidos
      .filter(item => item.produto)
      .map(item => {
        const prod = item.produto.toJSON();
        prod.total_vendido = Number(item.getDataValue('total_vendido') || 0);
        return prod;
      });

    res.json(produtos);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao listar produtos mais vendidos', erro: erro.message });
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
          as: 'drop',
          attributes: ['id_drop', 'nome', 'banner_index', 'banner_produto']
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
      return res.status(400).json({ mensagem: 'Preencha os campos obrigatórios do produto (nome, preço, estoque, categoria, SKU).' });
    }

    if (dados.imagem) {
      dados.imagem = dados.imagem.trim();
    }

    if (dados.id_drop) {
      dados.id_drop = Number(dados.id_drop) || null;
    }

    const produto = await Produto.create(dados);

    if (dados.categoria) {
      await Categoria.findOrCreate({
        where: { nome: dados.categoria.trim() },
        defaults: { nome: dados.categoria.trim() }
      }).catch(() => {});
    }

    const produtoCompleto = await Produto.findByPk(produto.id_produto, {
      include: [
        {
          model: Usuario,
          as: 'criador',
          attributes: ['id_usuario', 'nome', 'email', 'tipo']
        },
        {
          model: Drop,
          as: 'drop',
          attributes: ['id_drop', 'nome', 'banner_index', 'banner_produto']
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
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('categoria')), 'nome']],
        raw: true
      });

      return res.json(categoriasProdutos.map(c => ({ nome: c.nome })));
    }

    res.json(categorias);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao listar categorias', erro: erro.message });
  }
}

module.exports = {
  listar,
  maisVendidos,
  obterPorId,
  cadastrar,
  deletar,
  listarCategorias
};
