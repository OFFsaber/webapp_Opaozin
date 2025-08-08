-- Script para criar as tabelas do Sistema de Controle de Expedição
-- Base de dados: base_aa_opaozin

USE base_aa_opaozin;
GO

-- Tabela de pedidos
CREATE TABLE pedidos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    numero_pedido VARCHAR(50) NOT NULL,
    cliente VARCHAR(200) NOT NULL,
    codigo_cliente VARCHAR(50),
    data_saida DATE NOT NULL,
    data_entrega DATE,
    motorista VARCHAR(100),
    veiculo VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'separado', 'cancelado')),
    data_criacao DATETIME DEFAULT GETDATE(),
    data_atualizacao DATETIME DEFAULT GETDATE()
);

-- Tabela de itens dos pedidos
CREATE TABLE itens_pedido (
    id INT IDENTITY(1,1) PRIMARY KEY,
    pedido_id INT NOT NULL,
    produto VARCHAR(200) NOT NULL,
    codigo_produto VARCHAR(50),
    quantidade INT NOT NULL DEFAULT 0,
    quantidade_confirmada INT DEFAULT 0,
    confirmado BIT DEFAULT 0,
    data_confirmacao DATETIME,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
);

-- Índices para melhor performance
CREATE INDEX idx_pedidos_data_saida ON pedidos(data_saida);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedidos_motorista ON pedidos(motorista);
CREATE INDEX idx_pedidos_veiculo ON pedidos(veiculo);
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente);
CREATE INDEX idx_itens_pedido_id ON itens_pedido(pedido_id);
CREATE INDEX idx_itens_produto ON itens_pedido(codigo_produto);
CREATE INDEX idx_itens_confirmado ON itens_pedido(confirmado);

-- Inserir dados de exemplo
INSERT INTO pedidos (numero_pedido, cliente, codigo_cliente, data_saida, data_entrega, motorista, veiculo, status) VALUES
('PED-001', 'Cliente 1', 'CLI001', '2024-01-15', '2024-01-20', 'João Silva', 'ABC-1234', 'pendente'),
('PED-002', 'Cliente 2', 'CLI002', '2024-01-16', '2024-01-21', 'Maria Santos', 'DEF-5678', 'pendente'),
('PED-003', 'Cliente 3', 'CLI003', '2024-01-17', '2024-01-22', 'Pedro Oliveira', 'GHI-9012', 'separado'),
('PED-004', 'Empresa ABC Ltda', 'CLI004', '2024-01-18', '2024-01-23', 'Ana Costa', 'JKL-3456', 'pendente');

-- Inserir itens de exemplo
INSERT INTO itens_pedido (pedido_id, produto, codigo_produto, quantidade, quantidade_confirmada, confirmado) VALUES
(1, 'Produto A', 'PROD001', 5, 0, 0),
(1, 'Produto B', 'PROD002', 3, 0, 0),
(1, 'Produto C', 'PROD003', 2, 0, 0),
(2, 'Produto D', 'PROD004', 4, 0, 0),
(2, 'Produto E', 'PROD005', 1, 0, 0),
(3, 'Produto F', 'PROD006', 6, 6, 1),
(3, 'Produto G', 'PROD007', 2, 2, 1),
(4, 'Produto H', 'PROD008', 10, 7, 1),
(4, 'Produto I', 'PROD009', 3, 0, 0);

-- Stored Procedure para buscar pedidos com filtros
CREATE PROCEDURE sp_buscar_pedidos
    @data_saida DATE = NULL,
    @motorista VARCHAR(100) = NULL,
    @veiculo VARCHAR(20) = NULL,
    @cliente VARCHAR(200) = NULL,
    @status VARCHAR(20) = NULL
AS
BEGIN
    SELECT 
        p.id,
        p.numero_pedido,
        p.cliente,
        p.codigo_cliente,
        p.data_saida,
        p.data_entrega,
        p.motorista,
        p.veiculo,
        p.status,
        p.data_criacao,
        p.data_atualizacao
    FROM pedidos p
    WHERE (@data_saida IS NULL OR p.data_saida = @data_saida)
        AND (@motorista IS NULL OR p.motorista = @motorista)
        AND (@veiculo IS NULL OR p.veiculo = @veiculo)
        AND (@cliente IS NULL OR p.cliente LIKE '%' + @cliente + '%' OR p.codigo_cliente LIKE '%' + @cliente + '%')
        AND (@status IS NULL OR p.status = @status)
    ORDER BY p.data_saida DESC, p.numero_pedido;
END;
GO

-- Stored Procedure para buscar estatísticas
CREATE PROCEDURE sp_estatisticas_pedidos
    @data_saida DATE = NULL
AS
BEGIN
    SELECT 
        COUNT(*) as total_pedidos,
        SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pedidos_pendentes,
        SUM(CASE WHEN status = 'separado' THEN 1 ELSE 0 END) as pedidos_separados,
        SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END) as pedidos_cancelados
    FROM pedidos
    WHERE (@data_saida IS NULL OR data_saida = @data_saida);
END;
GO

-- Stored Procedure para buscar produtos faltantes
CREATE PROCEDURE sp_produtos_faltantes
    @data_saida DATE = NULL,
    @motorista VARCHAR(100) = NULL,
    @veiculo VARCHAR(20) = NULL
AS
BEGIN
    SELECT 
        i.codigo_produto,
        i.produto,
        SUM(i.quantidade - ISNULL(i.quantidade_confirmada, 0)) as quantidade_faltante,
        COUNT(DISTINCT p.id) as total_pedidos
    FROM itens_pedido i
    INNER JOIN pedidos p ON i.pedido_id = p.id
    WHERE p.status = 'pendente'
        AND (i.confirmado = 0 OR i.quantidade_confirmada < i.quantidade)
        AND (@data_saida IS NULL OR p.data_saida = @data_saida)
        AND (@motorista IS NULL OR p.motorista = @motorista)
        AND (@veiculo IS NULL OR p.veiculo = @veiculo)
    GROUP BY i.codigo_produto, i.produto
    HAVING SUM(i.quantidade - ISNULL(i.quantidade_confirmada, 0)) > 0
    ORDER BY quantidade_faltante DESC;
END;
GO

PRINT 'Tabelas e stored procedures criadas com sucesso!';
PRINT 'Dados de exemplo inseridos.';
PRINT 'Sistema de Controle de Expedição configurado.'; 