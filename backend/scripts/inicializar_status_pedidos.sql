-- Script para inicializar pedidos existentes com status 0 (Pendente)
-- Este script adiciona registros na tabela STATUS_EXPEDICAO para pedidos que ainda não têm status

-- Inserir status 0 (Pendente) para todos os pedidos que não têm registro na tabela STATUS_EXPEDICAO
INSERT INTO STATUS_EXPEDICAO (NUMPEDIDO, STATUS)
SELECT 
    CAB.NUMPEDIDO,
    0 AS STATUS  -- 0 = Pendente
FROM CABPEDVENDA CAB WITH(NOLOCK)
WHERE CAB.STATUS = 'B'
AND CAB.ISFATURADO = 1
AND NOT EXISTS (
    SELECT 1 
    FROM STATUS_EXPEDICAO SE WITH(NOLOCK) 
    WHERE SE.NUMPEDIDO = CAB.NUMPEDIDO
);

-- Mostrar quantos registros foram inseridos
SELECT 
    'Registros inseridos' AS INFO,
    @@ROWCOUNT AS QUANTIDADE;

-- Verificar o total de pedidos com status
SELECT 
    'Total de pedidos com status' AS INFO,
    COUNT(*) AS TOTAL
FROM STATUS_EXPEDICAO WITH(NOLOCK);

-- Mostrar distribuição dos status
SELECT 
    CASE 
        WHEN STATUS = 0 THEN 'Pendente'
        WHEN STATUS = 1 THEN 'Separado'
        ELSE 'Desconhecido'
    END AS STATUS_DESCRICAO,
    COUNT(*) AS QUANTIDADE
FROM STATUS_EXPEDICAO WITH(NOLOCK)
GROUP BY STATUS
ORDER BY STATUS; 