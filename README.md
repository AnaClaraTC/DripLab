# DripLab

Plataforma de e-commerce streetwear baseada em lançamentos exclusivos (*drops*) e gamificação. A comunidade pode acompanhar coleções limitadas, acumular Drip Points, subir de nível, conquistar badges e participar de votações.

- **Site publicado:** [https://driplab-8r27.onrender.com/index.html](https://driplab-8r27.onrender.com/index.html)
- **Repositório:** [AnaClaraTC/DripLab](https://github.com/AnaClaraTC/DripLab)

## Objetivo

Oferecer um canal de venda de peças streetwear exclusivas em drops limitados, ao mesmo tempo que incentiva o engajamento e a fidelização dos clientes por meio de pontos, recompensas e participação da comunidade.

## Funcionalidades

### Visitante e cliente

- Cadastro e login com autenticação por token.
- Visualização de drops e produtos disponíveis.
- Busca de produtos por nome, categoria ou drop.
- Página de detalhes de produto e comentários.
- Carrinho de compras e cálculo de frete.
- Cadastro e gerenciamento de endereços.
- Finalização de pedidos e consulta ao histórico e status dos pedidos no perfil.
- Drip Points, níveis, badges e recompensas.
- Participação em votações da comunidade. Votos válidos concedem pontos.

### Operador e administrador

- Painel administrativo com métricas e informações da loja.
- Criação, edição e remoção de drops, incluindo banners personalizados.
- Cadastro, edição e remoção de produtos.
- Acompanhamento de estoque e pedidos, incluindo atualização do status dos pedidos.
- Gestão de contas de operadores disponível para administradores.

> **Perfis no cadastro:** o primeiro usuário cadastrado recebe automaticamente o perfil `admin`; os cadastros seguintes recebem `cliente`. Um administrador pode criar contas com o perfil `operador`.

## Tecnologias

- **Backend:** Node.js, Express 5, Sequelize 6 e `mysql2`.
- **Banco de dados:** MySQL ou TiDB Cloud (compatível com o protocolo MySQL).
- **Autenticação e segurança de senha:** JWT e Bcrypt.
- **Interface:** HTML5, CSS3 e JavaScript Vanilla.
- **Hospedagem publicada:** Render.

## Banco de dados

O modelo relacional está definido em [`database/init.sql`](database/init.sql). As principais entidades são:

- **Usuários** e **endereços**: cada usuário pode manter endereços para entrega.
- **Drops**, **categorias** e **produtos**: produtos podem pertencer a uma categoria e a um drop; o drop armazena datas, limite de peças e banners.
- **Carrinhos**, **pedidos** e **itens do pedido**: associam clientes, produtos, quantidades, preços, endereço de entrega e status.
- **Comentários**: vinculam textos publicados por usuários aos produtos.
- **Propostas de votação** e **votos**: votos relacionam usuários às propostas, com restrição para evitar votos repetidos na mesma proposta.
- **Badges**, **recompensas**, **badges de usuário** e **resgates**: representam conquistas e recompensas associadas aos usuários.

## Instalação e execução local

### Pré-requisitos

- Git.
- Node.js e npm.
- MySQL ou uma instância TiDB Cloud compatível com MySQL.
- Acesso à instância e permissão para criar o banco de dados.

### 1. Clonar e instalar dependências

```bash
git clone https://github.com/AnaClaraTC/DripLab.git
cd DripLab
npm install
```

### 2. Configurar as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto. O repositório inclui `.env.example` como referência; confira e ajuste os valores para o seu banco. Exemplo para uma instância TiDB Cloud:

```dotenv
DB_HOST=seu-host.tidbcloud.com
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=driplab
DB_PORT=4000
JWT_SECRET=defina-uma-chave-aleatoria-e-privada
```

Para MySQL local, informe o host, usuário, senha, banco e porta da instância (normalmente `3306`). A conexão Sequelize do projeto está configurada para usar TLS; portanto, o servidor MySQL precisa aceitar TLS e apresentar um certificado confiável pelo sistema.

### 3. Criar e inicializar o banco

Crie o banco `driplab` na instância escolhida e aplique o script de inicialização em um banco vazio:

```bash
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p "$DB_NAME" < database/init.sql
```

O comando solicitará a senha do banco. O `init.sql` cria as tabelas e adiciona categorias iniciais. Como ele remove tabelas existentes antes da criação, não o execute novamente em uma base com dados que deseja preservar.

### 4. Iniciar a aplicação

```bash
npm start
```

Por padrão, o servidor inicia na porta `3000`. Acesse [http://localhost:3000](http://localhost:3000). A porta do servidor pode ser definida pela variável `PORT`.

## Uso básico

### Fluxo do cliente

1. Acesse a loja, navegue pelos drops ativos e use a busca ou os filtros de categoria.
2. Abra um produto para consultar detalhes e adicioná-lo ao carrinho.
3. Crie uma conta ou entre com uma conta existente.
4. No perfil, cadastre um endereço e acompanhe os pedidos.
5. Finalize o pedido a partir do carrinho e acompanhe as atualizações de status no perfil.
6. Participe das votações para interagir com a comunidade e acumular Drip Points.

### Fluxo do operador e administrador

1. Entre com uma conta que tenha o perfil `operador` ou `admin`.
2. Acesse o dashboard para acompanhar os dados da loja.
3. Cadastre ou atualize drops, incluindo datas, limite de peças e banners.
4. Cadastre produtos, associe-os a categorias e drops e mantenha o estoque atualizado.
5. Consulte os pedidos e atualize seus status conforme o processamento.
6. As contas `admin` também podem gerenciar operadores e acessar as métricas administrativas.

## Estrutura do projeto

```text
DripLab/
├── database/
│   └── init.sql            # Criação do banco e categorias iniciais
├── src/
│   ├── config/             # Configuração do banco e Swagger
│   ├── controllers/        # Regras das rotas da API
│   ├── middlewares/        # Autenticação e autorização por perfil
│   ├── models/             # Modelos Sequelize e relacionamentos
│   ├── routes/             # Rotas da API
│   ├── services/           # Serviços de negócio
│   └── app.js              # Inicialização do servidor
├── static/
│   ├── css/                # Estilos
│   ├── images/             # Imagens e banners
│   ├── js/                 # Scripts da interface
│   └── music/              # Recursos de áudio
├── templates/              # Páginas HTML
├── uploads/                # Arquivos enviados
├── .env.example            # Referência de variáveis de ambiente
└── package.json            # Dependências e comandos npm
```