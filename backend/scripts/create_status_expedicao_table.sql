-- Tabela para controlar status de expedição dos pedidos
CREATE TABLE STATUS_EXPEDICAO (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    NUMPEDIDO INT NOT NULL UNIQUE,
    STATUS BIT NOT NULL DEFAULT 0 -- 0 = Pendente, 1 = Separado
);

-- Índice para melhor performance
CREATE INDEX IX_STATUS_EXPEDICAO_NUMPEDIDO ON STATUS_EXPEDICAO(NUMPEDIDO);
CREATE INDEX IX_STATUS_EXPEDICAO_STATUS ON STATUS_EXPEDICAO(STATUS);

-- Comentários para documentação
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Tabela para controlar status de expedição dos pedidos', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'STATUS_EXPEDICAO';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'ID único do registro', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'STATUS_EXPEDICAO', 
    @level2type = N'COLUMN', @level2name = N'ID';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Número do pedido (único)', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'STATUS_EXPEDICAO', 
    @level2type = N'COLUMN', @level2name = N'NUMPEDIDO';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Status do pedido (0 = Pendente, 1 = Separado)', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'STATUS_EXPEDICAO', 
    @level2type = N'COLUMN', @level2name = N'STATUS'; 