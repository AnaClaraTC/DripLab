
USE driplab;

UPDATE usuarios SET tipo = 'admin' WHERE tipo = 'administrador';

ALTER TABLE usuarios MODIFY COLUMN tipo ENUM('cliente', 'operador', 'admin') DEFAULT 'cliente';

//endereços
CREATE TABLE IF NOT EXISTS enderecos (
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

CREATE TABLE IF NOT EXISTS categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) UNIQUE NOT NULL,
    descricao VARCHAR(255)
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

SET @col_prod = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'driplab' AND TABLE_NAME = 'produtos' AND COLUMN_NAME = 'id_usuario');
SET @sql_prod = IF(@col_prod = 0, 'ALTER TABLE produtos ADD COLUMN id_usuario INT NULL, ADD CONSTRAINT fk_produtos_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL;', 'SELECT "Coluna id_usuario ja existe em produtos";');
PREPARE stmt_prod FROM @sql_prod;
EXECUTE stmt_prod;
DEALLOCATE PREPARE stmt_prod;

SET @col_prop = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'driplab' AND TABLE_NAME = 'propostas_votacao' AND COLUMN_NAME = 'id_usuario');
SET @sql_prop = IF(@col_prop = 0, 'ALTER TABLE propostas_votacao ADD COLUMN id_usuario INT NULL, ADD CONSTRAINT fk_propostas_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL;', 'SELECT "Coluna id_usuario ja existe em propostas_votacao";');
PREPARE stmt_prop FROM @sql_prop;
EXECUTE stmt_prop;
DEALLOCATE PREPARE stmt_prop;

//carrinhoo
CREATE TABLE IF NOT EXISTS carrinho (
    id_carrinho INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    tamanho VARCHAR(10) DEFAULT 'P',
    data_adicionado DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto) ON DELETE CASCADE
);

//mais infoemações carrinho
SET @col_frete = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'driplab' AND TABLE_NAME = 'pedidos' AND COLUMN_NAME = 'valor_frete');
SET @sql_frete = IF(@col_frete = 0, 'ALTER TABLE pedidos ADD COLUMN valor_frete DECIMAL(10, 2) DEFAULT 0.00;', 'SELECT "Coluna valor_frete ja existe em pedidos";');
PREPARE stmt_frete FROM @sql_frete;
EXECUTE stmt_frete;
DEALLOCATE PREPARE stmt_frete;

SET @col_end = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'driplab' AND TABLE_NAME = 'pedidos' AND COLUMN_NAME = 'id_endereco');
SET @sql_end = IF(@col_end = 0, 'ALTER TABLE pedidos ADD COLUMN id_endereco INT NULL, ADD CONSTRAINT fk_pedidos_endereco FOREIGN KEY (id_endereco) REFERENCES enderecos(id_endereco) ON DELETE SET NULL;', 'SELECT "Coluna id_endereco ja existe em pedidos";');
PREPARE stmt_end FROM @sql_end;
EXECUTE stmt_end;
DEALLOCATE PREPARE stmt_end;

ALTER TABLE pedidos MODIFY COLUMN status_atual ENUM('Aguardando pagamento', 'Pago', 'Em separação', 'Embalado', 'Enviado/Em transito', 'Entregue', 'Cancelado', 'Devolvido/Em troca') DEFAULT 'Aguardando pagamento';

SET @col_tam = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'driplab' AND TABLE_NAME = 'item_pedido' AND COLUMN_NAME = 'tamanho');
SET @sql_tam = IF(@col_tam = 0, 'ALTER TABLE item_pedido ADD COLUMN tamanho VARCHAR(10) DEFAULT "P";', 'SELECT "Coluna tamanho ja existe em item_pedido";');
PREPARE stmt_tam FROM @sql_tam;
EXECUTE stmt_tam;
DEALLOCATE PREPARE stmt_tam;
