const Usuario = require('./Usuario');
const Drop = require('./Drop');
const Categoria = require('./Categoria');
const Produto = require('./Produto');
const Endereco = require('./Endereco');
const Carrinho = require('./Carrinho');
const Pedido = require('./Pedido');
const ItemPedido = require('./ItemPedido');
const Comentario = require('./Comentario');
const PropostaVotacao = require('./PropostaVotacao');
const Voto = require('./Voto');

Usuario.hasMany(Endereco, { foreignKey: 'id_usuario', as: 'enderecos', onDelete: 'CASCADE' });
Endereco.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

Usuario.hasMany(Produto, { foreignKey: 'id_usuario', as: 'produtos_cadastrados' });
Produto.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'criador' });

Usuario.hasMany(PropostaVotacao, { foreignKey: 'id_usuario', as: 'propostas_cadastradas' });
PropostaVotacao.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'criador' });

Produto.belongsTo(Drop, { foreignKey: 'id_drop', as: 'drop' });
Drop.hasMany(Produto, { foreignKey: 'id_drop', as: 'produtos' });

Usuario.hasMany(Carrinho, { foreignKey: 'id_usuario', as: 'itens_carrinho', onDelete: 'CASCADE' });
Carrinho.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
Carrinho.belongsTo(Produto, { foreignKey: 'id_produto', as: 'produto' });
Produto.hasMany(Carrinho, { foreignKey: 'id_produto', as: 'em_carrinhos' });

Usuario.hasMany(Pedido, { foreignKey: 'id_usuario', as: 'pedidos', onDelete: 'CASCADE' });
Pedido.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'cliente' });

Pedido.belongsTo(Endereco, { foreignKey: 'id_endereco', as: 'endereco_entrega' });
Endereco.hasMany(Pedido, { foreignKey: 'id_endereco', as: 'pedidos' });

Pedido.hasMany(ItemPedido, { foreignKey: 'id_pedido', as: 'itens', onDelete: 'CASCADE' });
ItemPedido.belongsTo(Pedido, { foreignKey: 'id_pedido', as: 'pedido' });

ItemPedido.belongsTo(Produto, { foreignKey: 'id_produto', as: 'produto' });
Produto.hasMany(ItemPedido, { foreignKey: 'id_produto', as: 'itens_comprados' });

Produto.hasMany(Comentario, { foreignKey: 'id_produto', as: 'comentarios', onDelete: 'CASCADE' });
Comentario.belongsTo(Produto, { foreignKey: 'id_produto', as: 'produto' });

Usuario.hasMany(Comentario, { foreignKey: 'id_usuario', as: 'comentarios', onDelete: 'CASCADE' });
Comentario.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'autor' });

PropostaVotacao.hasMany(Voto, { foreignKey: 'id_proposta', as: 'votos', onDelete: 'CASCADE' });
Voto.belongsTo(PropostaVotacao, { foreignKey: 'id_proposta', as: 'proposta' });

Usuario.hasMany(Voto, { foreignKey: 'id_usuario', as: 'votos', onDelete: 'CASCADE' });
Voto.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'eleitor' });

module.exports = {
  Usuario,
  Drop,
  Categoria,
  Produto,
  Endereco,
  Carrinho,
  Pedido,
  ItemPedido,
  Comentario,
  PropostaVotacao,
  Voto
};
