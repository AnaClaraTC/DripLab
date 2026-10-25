const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ mensagem: 'Token não enviado' });

  const token = authHeader.split(' ')[1];

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = {
      id: dados.id || dados.id_usuario,
      id_usuario: dados.id_usuario || dados.id,
      tipo: dados.tipo,
      nivel: dados.nivel
    };
    next();
  } catch (erro) {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado' });
  }
}

module.exports = autenticar;