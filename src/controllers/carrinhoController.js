const { Carrinho, Produto } = require('../models');

async function listar(req, res) {
  try {
    const id_usuario = req.usuario.id_usuario;

    const itens = await Carrinho.findAll({
      where: { id_usuario },
      include: [
        {
          model: Produto,
          as: 'produto',
          attributes: ['id_produto', 'nome', 'descricao', 'preco', 'estoque', 'categoria', 'SKU', 'tamanho']
        }
      ],
      order: [['id_carrinho', 'ASC']]
    });

    let subtotal = 0;
    const itensFormatados = itens.map(item => {
      const precoUnitario = Number(item.produto ? item.produto.preco : 0);
      const totalItem = precoUnitario * item.quantidade;
      subtotal += totalItem;

      return {
        id_carrinho: item.id_carrinho,
        id_produto: item.id_produto,
        quantidade: item.quantidade,
        tamanho: item.tamanho,
        data_adicionado: item.data_adicionado,
        produto: item.produto,
        preco_unitario: precoUnitario,
        total_item: totalItem,
        estoque_disponivel: item.produto ? item.produto.estoque : 0,
        estoque_suficiente: item.produto ? item.produto.estoque >= item.quantidade : false
      };
    });

    res.json({
      itens: itensFormatados,
      total_itens: itensFormatados.reduce((acc, cur) => acc + cur.quantidade, 0),
      subtotal: Number(subtotal.toFixed(2))
    });
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao buscar carrinho', erro: erro.message });
  }
}

async function adicionar(req, res) {
  try {
    const id_usuario = req.usuario.id_usuario;
    const { id_produto, quantidade = 1, tamanho = 'P' } = req.body;

    if (!id_produto) {
      return res.status(400).json({ mensagem: 'ID do produto é obrigatório.' });
    }

    const produto = await Produto.findByPk(id_produto);
    if (!produto) {
      return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    }

    const qtdDesejada = Number(quantidade) || 1;
    if (qtdDesejada <= 0) {
      return res.status(400).json({ mensagem: 'A quantidade deve ser maior que zero.' });
    }

    if (produto.estoque < qtdDesejada) {
      return res.status(400).json({ 
        mensagem: `Estoque insuficiente para o produto "${produto.nome}". Disponível: ${produto.estoque}.`,
        estoque_disponivel: produto.estoque
      });
    }

    const itemExistente = await Carrinho.findOne({
      where: { 
        id_usuario, 
        id_produto,
        tamanho: tamanho.toUpperCase()
      }
    });

    let itemCarrinho;
    if (itemExistente) {
      const novaQtd = itemExistente.quantidade + qtdDesejada;
      if (produto.estoque < novaQtd) {
        return res.status(400).json({ 
          mensagem: `Não é possível adicionar mais unidades. Você já possui ${itemExistente.quantidade} no carrinho e o estoque máximo é ${produto.estoque}.`,
          estoque_disponivel: produto.estoque
        });
      }
      itemExistente.quantidade = novaQtd;
      await itemExistente.save();
      itemCarrinho = itemExistente;
    } else {
      itemCarrinho = await Carrinho.create({
        id_usuario,
        id_produto,
        quantidade: qtdDesejada,
        tamanho: tamanho.toUpperCase()
      });
    }

    res.status(201).json({
      mensagem: 'Produto adicionado ao carrinho!',
      item: itemCarrinho
    });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao adicionar ao carrinho', erro: erro.message });
  }
}

async function atualizarQuantidade(req, res) {
  try {
    const id_usuario = req.usuario.id_usuario;
    const { id } = req.params;
    const { quantidade } = req.body;

    const item = await Carrinho.findOne({
      where: { id_carrinho: id, id_usuario },
      include: [{ model: Produto, as: 'produto' }]
    });

    if (!item) {
      return res.status(404).json({ mensagem: 'Item do carrinho não encontrado.' });
    }

    const novaQtd = Number(quantidade);

    if (novaQtd <= 0) {
      await item.destroy();
      return res.json({ mensagem: 'Item removido do carrinho com sucesso.' });
    }

    if (item.produto && item.produto.estoque < novaQtd) {
      return res.status(400).json({ 
        mensagem: `Estoque insuficiente para ${novaQtd} unidades. Disponível: ${item.produto.estoque}.`,
        estoque_disponivel: item.produto.estoque
      });
    }

    item.quantidade = novaQtd;
    await item.save();

    res.json({
      mensagem: 'Quantidade atualizada!',
      item
    });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao atualizar carrinho', erro: erro.message });
  }
}

async function removerItem(req, res) {
  try {
    const id_usuario = req.usuario.id_usuario;
    const { id } = req.params;

    const item = await Carrinho.findOne({
      where: { id_carrinho: id, id_usuario }
    });

    if (!item) {
      return res.status(404).json({ mensagem: 'Item não encontrado no seu carrinho.' });
    }

    await item.destroy();
    res.json({ mensagem: 'Item removido do carrinho com sucesso!' });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao remover item do carrinho', erro: erro.message });
  }
}

async function limpar(req, res) {
  try {
    const id_usuario = req.usuario.id_usuario;
    await Carrinho.destroy({ where: { id_usuario } });
    res.json({ mensagem: 'Carrinho limpo com sucesso!' });
  } catch (erro) {
    res.status(400).json({ mensagem: 'Erro ao limpar carrinho', erro: erro.message });
  }
}

module.exports = { listar, adicionar, atualizarQuantidade, removerItem, limpar };
