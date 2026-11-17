const sequelize = require('../config/database');
const Pedido = require('../models/Pedido');
const ItemPedido = require('../models/ItemPedido');
const Usuario = require('../models/Usuario');
const { validarCompraDrop } = require('./dropService');

async function criarPedido(id_usuario, itens, metodo_pagamento) {
  const t = await sequelize.transaction();

  try {
    let valorTotal = 0;

    for (const item of itens) {
      const produto = await validarCompraDrop(item.id_produto, item.quantidade);
      valorTotal += parseFloat(produto.preco) * item.quantidade;
    }

    const novoPedido = await Pedido.create({
      id_usuario,
      valor_total: valorTotal,
      metodo_pagamento,
      status_atual: 'Pago'
    }, { transaction: t });

    for (const item of itens) {
      const produto = await validarCompraDrop(item.id_produto, item.quantidade);

      await ItemPedido.create({
        id_pedido: novoPedido.id_pedido,
        id_produto: item.id_produto,
        quantidade: item.quantidade,
        preco_unitario: produto.preco
      }, { transaction: t });

      await produto.update({ estoque: produto.estoque - item.quantidade }, { transaction: t });
    }

    const pontosGanhos = Math.floor(valorTotal / 10);
    const usuario = await Usuario.findByPk(id_usuario);
    const novosPontos = usuario.pontos + pontosGanhos;

    let novoNivel = usuario.nivel;
    if (novosPontos >= 500) novoNivel = 'VIP';
    else if (novosPontos >= 200) novoNivel = 'Entusiasta';

    await usuario.update({ pontos: novosPontos, nivel: novoNivel }, { transaction: t });

    await t.commit();
    return novoPedido;

  } catch (erro) {
    await t.rollback();
    throw erro;
  }
}

module.exports = { criarPedido };