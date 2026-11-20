const express = require('express');
const path = require('path');
const sequelize = require('./config/database');
const apiRoutes = require('./routes/apiRoutes');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/static', express.static(path.join(__dirname, '..', 'static')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'templates')));

app.use('/api', apiRoutes);

sequelize.authenticate()
  .then(() => {
    console.log('Conectado ao banco de dados');
  })
  .catch(err => console.error('Erro ao conectar:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;