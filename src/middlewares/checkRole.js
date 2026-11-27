//hierarquia
//admin > operador > cliente

const HIERARQUIA = {
  cliente: 1,
  operador: 2,
  admin: 3
};

function permitir(...tiposPermitidos) {
  const permitidos = tiposPermitidos.map(t => String(t).toLowerCase());

  return (req, res, next) => {
    if (!req.usuario || !req.usuario.tipo) {
      return res.status(401).json({ mensagem: 'Usuário não autenticado' });
    }

    const usuarioTipo = String(req.usuario.tipo).toLowerCase();

    const temPermissaoDireta = permitidos.includes(usuarioTipo);

    const ehAdmin = usuarioTipo === 'admin';
    const adminAcessoGeral = ehAdmin && (permitidos.includes('operador') || permitidos.includes('cliente'));

    if (!temPermissaoDireta && !adminAcessoGeral) {
      return res.status(403).json({ 
        mensagem: 'Sem permissão para essa ação',
        tipo_usuario: usuarioTipo,
        necessario: tiposPermitidos
      });
    }
    next();
  };
}

module.exports = permitir;
