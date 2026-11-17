const sequelize = require('../config/database');
const { Pedido, ItemPedido, Produto, Usuario, Endereco, Carrinho } = require('../models');

const STATUS_PERMITIDOS = [
  'Aguardando pagamento',
  'Pago',
  'Em separação',
  'Embalado',
  'Enviado/Em transito',
  'Entregue',
  'Cancelado',
  'Devolvido/Em troca'
];

async function criar(req, res) {
  const t = await sequelize.transaction();
  try {
    const id_usuario = req.usuario.id_usuario;
    let { itens, id_endereco, metodo_pagamento = 'Pix', valor_frete = 0.00 } = req.body;

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      const itensCarrinho = await Carrinho.findAll({
        where: { id_usuario },
        include: [{ model: Produto, as: 'produto' }]
      });

      if (!itensCarrinho || itensCarrinho.length === 0) {
        await t.rollback();
        return res.status(400).json({ mensagem: 'O carrinho está vazio. Adicione itens antes de fechar o pedido.' });
      }

      itens = itensCarrinho.map(ic => ({
        id_produto: ic.id_produto,
        quantidade: ic.quantidade,
        tamanho: ic.tamanho
      }));
    }

    let valorTotalItens = 0;
    const itensValidados = [];

    for (const item of itens) {
      const { id_produto, quantidade, tamanho = 'P' } = item;
      const qtd = Number(quantidade);

      if (!id_produto || qtd <= 0) {
        await t.rollback();
        return res.status(400).json({ mensagem: 'Item de pedido com dados inválidos.' });
      }

      const produto = await Produto.findByPk(id_produto, { transaction: t });
      if (!produto) {
        await t.rollback();
        return res.status(404).json({ mensagem: `Produto de ID ${id_produto} não foi encontrado.` });
      }

      if (produto.estoque < qtd) {
        await t.rollback();
        return res.status(400).json({
          mensagem: `Compra bloqueada: Estoque insuficiente para o produto "${produto.nome}". Quantidade solicitada: ${qtd}, disponível em estoque: ${produto.estoque}.`,
          id_produto: produto.id_produto,
          estoque_disponivel: produto.estoque
        });
      }

      const precoUnitario = Number(produto.preco);
      valorTotalItens += precoUnitario * qtd;

      itensValidados.push({
        produto,
        quantidade: qtd,
        preco_unitario: precoUnitario,
        tamanho: tamanho.toUpperCase()
      });
    }

    const totalFinal = Number((valorTotalItens + Number(valor_frete || 0)).toFixed(2));

    //Criacao pedido
    const pedido = await Pedido.create({
      id_usuario,
      id_endereco: id_endereco || null,
      valor_total: totalFinal,
      valor_frete: Number(valor_frete) || 0.00,
      metodo_pagamento,
      status_atual: 'Aguardando pagamento'
    }, { transaction: t });

    //Criacao itens pedido
    for (const item of itensValidados) {
      await ItemPedido.create({
        id_pedido: pedido.id_pedido,
        id_produto: item.produto.id_produto,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        tamanho: item.tamanho
      }, { transaction: t });

      //Update estoque produto
      item.produto.estoque -= item.quantidade;
      await item.produto.save({ transaction: t });
    }

    //Limpa carrinho
    await Carrinho.destroy({
      where: { id_usuario },
      transaction: t
    });

    await t.commit();

    const pedidoCompleto = await Pedido.findByPk(pedido.id_pedido, {
      include: [
        {
          model: ItemPedido,
          as: 'itens',
          include: [{ model: Produto, as: 'produto' }]
        },
        {
          model: Endereco,
          as: 'endereco_entrega'
        }
      ]
    });

    res.status(201).json({
      mensagem: 'Pedido realizado com sucesso!',
      pedido: pedidoCompleto
    });
  } catch (erro) {
    await t.rollback();
    res.status(500).json({ mensagem: 'Erro ao processar pedido', erro: erro.message });
  }
}

async function meusPedidos(req, res) {
  try {
    const id_usuario = req.usuario.id_usuario;

    const pedidos = await Pedido.findAll({
      where: { id_usuario },
      include: [
        {
          model: ItemPedido,
          as: 'itens',
          include: [
            {
              model: Produto,
              as: 'produto',
              attributes: ['id_produto', 'nome', 'preco', 'categoria']
            }
          ]
        },
        {
          model: Endereco,
          as: 'endereco_entrega'
        }
      ],
      order: [['id_pedido', 'DESC']]
    });

    res.json(pedidos);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao listar seus pedidos', erro: erro.message });
  }
}

async function obterPorId(req, res) {
  try {
    const { id } = req.params;
    const { id_usuario, tipo } = req.usuario;

    const pedido = await Pedido.findByPk(id, {
      include: [
        {
          model: ItemPedido,
          as: 'itens',
          include: [{ model: Produto, as: 'produto' }]
        },
        {
          model: Endereco,
          as: 'endereco_entrega'
        },
        {
          model: Usuario,
          as: 'cliente',
          attributes: ['id_usuario', 'nome', 'email', 'telefone', 'cpf']
        }
      ]
    });

    if (!pedido) {
      return res.status(404).json({ mensagem: 'Pedido não encontrado.' });
    }

    if (tipo === 'cliente' && pedido.id_usuario !== id_usuario) {
      return res.status(403).json({ mensagem: 'Você não tem permissão para visualizar este pedido.' });
    }

    res.json(pedido);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao buscar pedido', erro: erro.message });
  }
}

async function listarTodos(req, res) {
  try {
    const { status } = req.query;
    const filtro = {};
    if (status) filtro.status_atual = status;

    const pedidos = await Pedido.findAll({
      where: filtro,
      include: [
        {
          model: Usuario,
          as: 'cliente',
          attributes: ['id_usuario', 'nome', 'email', 'telefone', 'cpf']
        },
        {
          model: ItemPedido,
          as: 'itens',
          include: [{ model: Produto, as: 'produto' }]
        },
        {
          model: Endereco,
          as: 'endereco_entrega'
        }
      ],
      order: [['id_pedido', 'DESC']]
    });

    res.json(pedidos);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao listar pedidos', erro: erro.message });
  }
}

async function atualizarStatus(req, res) {
  try {
    const { id } = req.params;
    const { status_atual } = req.body;

    if (!status_atual) {
      return res.status(400).json({ mensagem: 'Informe o novo status do pedido.' });
    }

    if (!STATUS_PERMITIDOS.includes(status_atual)) {
      return res.status(400).json({ 
        mensagem: `Status inválido. Status permitidos: ${STATUS_PERMITIDOS.join(', ')}` 
      });
    }

    const pedido = await Pedido.findByPk(id);
    if (!pedido) {
      return res.status(404).json({ mensagem: 'Pedido não encontrado.' });
    }

    pedido.status_atual = status_atual;
    await pedido.save();

    res.json({
      mensagem: 'Status do pedido atualizado com sucesso!',
      pedido: {
        id_pedido: pedido.id_pedido,
        status_atual: pedido.status_atual
      }
    });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao atualizar status do pedido', erro: erro.message });
  }
}

module.exports = {
  criar,
  meusPedidos,
  obterPorId,
  listarTodos,
  atualizarStatus
};
