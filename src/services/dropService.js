const Drop = require('../models/Drop');
const Produto = require('../models/Produto');

async function validarCompraDrop(id_produto, quantidadeDesejada) {
  const produto = await Produto.findByPk(id_produto);
  if (!produto) throw new Error('Produto não encontrado');

  if (produto.id_drop) {
    const drop = await Drop.findByPk(produto.id_drop);
    const agora = new Date();

    if (agora < new Date(drop.data_inicio) || agora > new Date(drop.data_fim)) {
      throw new Error('Este Drop não está ativo no momento.');
    }

    const totalVendido = await Produto.sum('estoque', { where: { id_drop: drop.id_drop } }) || 0;
    if (totalVendido + quantidadeDesejada > drop.limite_pecas) {
      throw new Error('Quantidade excede o limite máximo de peças permitido para este Drop.');
    }
  }

  if (produto.estoque < quantidadeDesejada) {
    throw new Error('Estoque insuficiente para este produto.');
  }

  return produto;
}

module.exports = { validarCompraDrop };