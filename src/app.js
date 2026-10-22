const express = require('express');
const path = require('path');
const sequelize = require('./config/database');
const apiRoutes = require('./routes/apiRoutes');
require('dotenv').config();

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api', apiRoutes);

sequelize.authenticate()
  .then(() => {
    console.log('Conectado ao banco de dados MySQL "driplab".');
  })
  .catch(err => console.error('Erro ao conectar ao MySQL:', err));

app.listen(3000, () => {
  console.log('Servidor DripLab rodando na porta 3000');
});