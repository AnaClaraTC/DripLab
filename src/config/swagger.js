const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'DripLab API',
    version: '1.0.0',
    description: 'Documentação da API RESTful da plataforma e-commerce e gamificação DripLab',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor Local',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    '/api/usuarios': {
      post: {
        summary: 'Cadastrar novo usuário',
        tags: ['Usuários'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nome: { type: 'string', example: 'João Silva' },
                  telefone: { type: 'string', example: '11999999999' },
                  email: { type: 'string', example: 'joao@email.com' },
                  senha: { type: 'string', example: '123456' },
                  cpf: { type: 'string', example: '12345678900' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Usuário criado com sucesso' },
          400: { description: 'Dados inválidos' },
        },
      },
    },
    '/api/login': {
      post: {
        summary: 'Autenticar usuário e gerar JWT',
        tags: ['Autenticação'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'joao@email.com' },
                  senha: { type: 'string', example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login efetuado com sucesso' },
          401: { description: 'Credenciais inválidas' },
        },
      },
    },
    '/api/produtos': {
      get: {
        summary: 'Listar todos os produtos',
        tags: ['Produtos'],
        responses: {
          200: { description: 'Lista de produtos retornada com sucesso' },
        },
      },
    },
  },
};

module.exports = { swaggerUi, swaggerDocument };