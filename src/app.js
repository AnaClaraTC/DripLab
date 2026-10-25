const express = require('express');
const path = require('path');
const sequelize = require('./config/database');
const apiRoutes = require('./routes/apiRoutes');
const { swaggerUi, swaggerDocument } = require('./config/swagger');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', apiRoutes);

sequelize.authenticate()
  .then(() => {
    console.log('Conectado ao banco de dados MySQL "driplab".');
  })
  .catch(err => {
    console.error('Erro ao conectar ao MySQL:', err);
  });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor DripLab rodando na porta ${PORT}`);
  console.log(`Documentação da API disponível em: http://localhost:${PORT}/api-docs`);
});