const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ mensagem: 'Token não enviado' });

  const partes = authHeader.split(' ');
  const token = partes.length === 2 ? partes[1] : partes[0];

  try {
    const secret = process.env.JWT_SECRET || 'driplab_secret_key';
    const dados = jwt.verify(token, secret);
    req.usuario = dados;
    next();
  } catch (erro) {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado' });
  }
}

module.exports = autenticar;
