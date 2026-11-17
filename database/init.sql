CREATE DATABASE IF NOT EXISTS driplab
DEFAULT CHARACTER SET = 'utf8mb4';
USE driplab;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(15) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cpf VARCHAR(15) NOT NULL,
    pontos INT DEFAULT 0,
    nivel VARCHAR(50) DEFAULT 'Iniciante',
    tipo ENUM('cliente', 'operador', 'admin') DEFAULT 'cliente',
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enderecos (
    id_endereco INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    nomelocal VARCHAR(50) NOT NULL,
    cep VARCHAR(10) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    rua VARCHAR(150) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE drops (
    id_drop INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME NOT NULL,
    limite_pecas INT NOT NULL
);

CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) UNIQUE NOT NULL,
    descricao VARCHAR(255)
);

CREATE TABLE produtos (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL,
    estoque INT NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    SKU VARCHAR(50) NOT NULL,
    tamanho ENUM('p', 'm', 'g', 'gg'),
    id_drop INT,
    id_usuario INT NULL,
    FOREIGN KEY (id_drop) REFERENCES drops(id_drop) ON DELETE SET NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

CREATE TABLE carrinho (
    id_carrinho INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    tamanho VARCHAR(10) DEFAULT 'P',
    data_adicionado DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto) ON DELETE CASCADE
);

CREATE TABLE pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    data_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    valor_total DECIMAL(10, 2) NOT NULL,
    valor_frete DECIMAL(10, 2) DEFAULT 0.00,
    metodo_pagamento ENUM('Cartao', 'Pix', 'Boleto'),
    status_atual ENUM('Aguardando pagamento', 'Pago', 'Em separação', 'Embalado', 'Enviado/Em transito', 'Entregue', 'Cancelado', 'Devolvido/Em troca') DEFAULT 'Aguardando pagamento',
    id_usuario INT NOT NULL,
    id_endereco INT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_endereco) REFERENCES enderecos(id_endereco) ON DELETE SET NULL
);

CREATE TABLE item_pedido (
    id_item INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    tamanho VARCHAR(10) DEFAULT 'P',
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto) ON DELETE RESTRICT
);

CREATE TABLE comentarios (
    id_comentario INT AUTO_INCREMENT PRIMARY KEY,
    texto TEXT NOT NULL,
    data_comentario DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL,
    id_produto INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto) ON DELETE CASCADE
);

CREATE TABLE propostas_votacao (
    id_proposta INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) NOT NULL,
    status_votacao ENUM ('Em Votação', 'Apurada', 'Vencedora', 'Encerrada') DEFAULT 'Em Votação',
    quantidade_votos INT DEFAULT 0,
    id_usuario INT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

CREATE TABLE votos (
    id_voto INT AUTO_INCREMENT PRIMARY KEY,
    data_voto DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL,
    id_proposta INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_proposta) REFERENCES propostas_votacao(id_proposta) ON DELETE CASCADE,
    CONSTRAINT un_usuario_proposta UNIQUE (id_usuario, id_proposta) 
);

CREATE TABLE badges (
    id_badge INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(20) NOT NULL,
    descricao VARCHAR(100),
    icone VARCHAR(255)
);

CREATE TABLE usuario_badge (
    id_usuario_badge INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_badge INT NOT NULL,
    data_conquista DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_badge) REFERENCES badges(id_badge) ON DELETE CASCADE
);

CREATE TABLE recompensas (
    id_recompensa INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(30) NOT NULL,
    descricao VARCHAR(100),
    custo_pontos INT NOT NULL
);

CREATE TABLE usuario_recompensa (
    id_resgate INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_recompensa INT NOT NULL,
    data_resgate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_recompensa) REFERENCES recompensas(id_recompensa) ON DELETE CASCADE
);

INSERT IGNORE INTO categorias (nome, descricao) VALUES
('Camisa', 'Camisas de botão e manga longa streetwear'),
('Camiseta', 'Camisetas oversized, boxy e estampadas'),
('Casaco', 'Casacos e moletons oversized'),
('Calça', 'Calças cargo, baggy e retas'),
('Bermuda', 'Bermudas cargo e baggy utility'),
('Jaqueta', 'Jaquetas corta-vento e storm'),
('Acessórios', 'Bonés, gorros e acessórios diversos'),
('Bolsa', 'Shoulder bags e bolsas utilitárias'),
('Meias', 'Meias cano alto streetwear');

INSERT IGNORE INTO usuarios (nome, telefone, email, senha, cpf, tipo) VALUES ('Admin Master', '21999999999', 'admin@driplab.com', '$2b$10$rKVHJzKv2rrxW.uw11yM..HbmEUoQ/UMCt2StOYCqaJivFoNZy8UG', '00000000000', 'admin');