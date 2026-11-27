const { Op } = require('sequelize');
const { Usuario, Pedido, Produto, PropostaVotacao, Endereco } = require('../models');

async function metricas(req, res) {
  try {
    const totalPedidos = await Pedido.count();
    const totalProdutos = await Produto.count();
    const totalClientes = await Usuario.count({ where: { tipo: 'cliente' } });
    const totalOperadores = await Usuario.count({ where: { tipo: 'operador' } });
    const propostasAtivas = await PropostaVotacao.count({ where: { status_votacao: 'Em Votação' } });

    //Faturamento
    const pedidosPagos = await Pedido.findAll({
      where: {
        status_atual: {
          [Op.in]: ['Pago', 'Em separação', 'Embalado', 'Enviado/Em transito', 'Entregue']
        }
      },
      attributes: ['valor_total']
    });

    const totalVendas = pedidosPagos.reduce((acc, p) => acc + Number(p.valor_total || 0), 0);

    //Pouco estque 5
    const produtosEstoqueBaixo = await Produto.findAll({
      where: {
        estoque: { [Op.lte]: 5 }
      },
      attributes: ['id_produto', 'nome', 'estoque', 'preco', 'categoria'],
      order: [['estoque', 'ASC']]
    });

    res.json({
      totalPedidos,
      totalVendas: Number(totalVendas.toFixed(2)),
      totalProdutos,
      totalClientes,
      totalOperadores,
      propostasAtivas,
      qtdEstoqueBaixo: produtosEstoqueBaixo.length,
      produtosEstoqueBaixo
    });
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao compilar métricas do painel', erro: erro.message });
  }
}

async function listarClientes(req, res) {
  try {
    const clientes = await Usuario.findAll({
      where: { tipo: 'cliente' },
      attributes: ['id_usuario', 'nome', 'email', 'telefone', 'cpf', 'pontos', 'nivel', 'data_cadastro'],
      include: [
        {
          model: Endereco,
          as: 'enderecos',
          attributes: ['id_endereco', 'nomelocal', 'cidade', 'estado']
        },
        {
          model: Pedido,
          as: 'pedidos',
          attributes: ['id_pedido', 'valor_total', 'status_atual', 'data_pedido']
        }
      ],
      order: [['id_usuario', 'DESC']]
    });

    const formatados = clientes.map(c => {
      const json = c.toJSON();
      json.totalPedidos = json.pedidos ? json.pedidos.length : 0;
      return json;
    });

    res.json(formatados);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao listar clientes', erro: erro.message });
  }
}

module.exports = { metricas, listarClientes };
