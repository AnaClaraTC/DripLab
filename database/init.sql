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
    tipo ENUM('operador', 'administrador') DEFAULT 'operador',
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE drops (
    id_drop INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME NOT NULL,
    limite_pecas INT NOT NULL
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
    FOREIGN KEY (id_drop) REFERENCES drops(id_drop) ON DELETE SET NULL
);

CREATE TABLE pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    data_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    valor_total DECIMAL(10, 2) NOT NULL,
    metodo_pagamento ENUM('Cartao', 'Pix', 'Boleto'),
    status_atual ENUM('Aguardando pagamento', 'Pago', 'Embalado','Enviado/Em transito', 'Entregue','Cancelado','Devolvido/Em troca'),
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE item_pedido (
    id_item INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
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
    status_votacao ENUM ('Em Votacao', 'Apurada', 'Vencedora', 'Encerrada'),
    quantidade_votos INT DEFAULT 0
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
