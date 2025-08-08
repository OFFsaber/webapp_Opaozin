const { executeQuery } = require('../config/database');
const pedidosQueries = require('../queries/pedidosQueries');

class Item {
    // Buscar itens de um pedido
    static async buscarPorPedido(pedidoId) {
        try {
            const result = await executeQuery(pedidosQueries.buscarItensPedido, [pedidoId]);
            return result.recordset;
        } catch (error) {
            console.error('Erro ao buscar itens do pedido:', error);
            throw error;
        }
    }
    
    // Buscar item por ID
    static async buscarPorId(id) {
        try {
            const query = `
                SELECT 
                    I.CODPRODUTO,
                    P.NOME AS PRODUTO,
                    P.UNIDADE,
                    ISNULL(I.QTPEDIDA, 0) AS QTPEDIDA,
                    ISNULL(I.QTENTREGUE, 0) AS QTENTREGUE,
                    ISNULL(I.QTRESTANTE, 0) AS QTRESTANTE,
                    ISNULL(I.VLUNITARIO, 0) AS VLUNITARIO,
                    ISNULL(I.SUBTOTAL, 0) AS SUBTOTAL,
                    ISNULL(I.VALORTOTENTREGUE, 0) AS VALORTOTENTREGUE,
                    ISNULL(I.VALORTOTRESTANTE, 0) AS VALORTOTRESTANTE,
                    I.ID,
                    ISNULL(P.CODFABRICA, '') AS CODFAB,
                    ISNULL(I.VOLUMEITEM, 0) AS VOLUMEITEM
                FROM ITEMPEDVENDA I WITH(NOLOCK)
                INNER JOIN PRODUTO P WITH(NOLOCK) ON I.CODPRODUTO = P.CODIGO
                WHERE I.ID = @P0
            `;
            
            const result = await executeQuery(query, [id]);
            return result.recordset[0] || null;
        } catch (error) {
            console.error('Erro ao buscar item por ID:', error);
            throw error;
        }
    }
    
    // Confirmar item (atualizar quantidade entregue)
    static async confirmar(id, quantidadeConfirmada) {
        try {
            await executeQuery(pedidosQueries.atualizarQuantidadeEntregue, [id, quantidadeConfirmada]);
            return true;
        } catch (error) {
            console.error('Erro ao confirmar item:', error);
            throw error;
        }
    }
    
    // Desconfirmar item (zerar quantidade entregue)
    static async desconfirmar(id) {
        try {
            await executeQuery(pedidosQueries.atualizarQuantidadeEntregue, [id, 0]);
            return true;
        } catch (error) {
            console.error('Erro ao desconfirmar item:', error);
            throw error;
        }
    }
    
    // Buscar produtos faltantes
    static async buscarProdutosFaltantes(filtros = {}) {
        try {
            let query = pedidosQueries.buscarProdutosFaltantes;
            const params = [];
            let paramIndex = 0;
            
            // Adicionar filtros se fornecidos
            if (filtros.dataInicio && filtros.dataFim) {
                query += ` AND CONVERT(CHAR(10), CAB.DTEMISSAO, 120) BETWEEN @P${paramIndex} AND @P${paramIndex + 1}`;
                params.push(filtros.dataInicio, filtros.dataFim);
                paramIndex += 2;
            }
            
            if (filtros.cliente) {
                query += ` AND CAB.CODCLIENTE = @P${paramIndex}`;
                params.push(filtros.cliente);
                paramIndex++;
            }
            
            if (filtros.vendedor) {
                query += ` AND CAB.CODVENDEDOR = @P${paramIndex}`;
                params.push(filtros.vendedor);
                paramIndex++;
            }
            
            const result = await executeQuery(query, params);
            return result.recordset;
        } catch (error) {
            console.error('Erro ao buscar produtos faltantes:', error);
            throw error;
        }
    }
    
    // Buscar produtos faltantes por cliente
    static async buscarProdutosFaltantesPorCliente(codigoCliente, filtros = {}) {
        try {
            let query = pedidosQueries.buscarProdutosFaltantes + ' AND CAB.CODCLIENTE = @P0';
            const params = [codigoCliente];
            let paramIndex = 1;
            
            // Adicionar filtros adicionais se fornecidos
            if (filtros.dataInicio && filtros.dataFim) {
                query += ` AND CONVERT(CHAR(10), CAB.DTEMISSAO, 120) BETWEEN @P${paramIndex} AND @P${paramIndex + 1}`;
                params.push(filtros.dataInicio, filtros.dataFim);
                paramIndex += 2;
            }
            
            if (filtros.vendedor) {
                query += ` AND CAB.CODVENDEDOR = @P${paramIndex}`;
                params.push(filtros.vendedor);
                paramIndex++;
            }
            
            const result = await executeQuery(query, params);
            return result.recordset;
        } catch (error) {
            console.error('Erro ao buscar produtos faltantes por cliente:', error);
            throw error;
        }
    }
    
    // Verificar se todos os itens de um pedido estão completos
    static async verificarPedidoCompleto(pedidoId) {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_itens,
                    SUM(CASE WHEN QTRESTANTE = 0 THEN 1 ELSE 0 END) as itens_completos
                FROM ITEMPEDVENDA I WITH(NOLOCK)
                WHERE I.NUMPEDIDO = @P0
            `;
            
            const result = await executeQuery(query, [pedidoId]);
            const { total_itens, itens_completos } = result.recordset[0];
            
            return total_itens > 0 && total_itens === itens_completos;
        } catch (error) {
            console.error('Erro ao verificar se pedido está completo:', error);
            throw error;
        }
    }
    
    // Buscar estatísticas de itens
    static async buscarEstatisticasItens() {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_itens,
                    SUM(ISNULL(QTPEDIDA, 0)) as total_quantidade_pedida,
                    SUM(ISNULL(QTENTREGUE, 0)) as total_quantidade_entregue,
                    SUM(ISNULL(QTRESTANTE, 0)) as total_quantidade_restante,
                    SUM(ISNULL(SUBTOTAL, 0)) as total_valor_pedido,
                    SUM(ISNULL(VALORTOTENTREGUE, 0)) as total_valor_entregue,
                    SUM(ISNULL(VALORTOTRESTANTE, 0)) as total_valor_restante
                FROM ITEMPEDVENDA I WITH(NOLOCK)
                INNER JOIN CABPEDVENDA CAB WITH(NOLOCK) ON CAB.NUMPEDIDO = I.NUMPEDIDO
                WHERE CAB.STATUS IN ('L','P','B','C','F')
                AND CAB.TIPOVENDA IN ('SAIDA_BALCAO','SAIDA_TELEMARKETING','ENTREGA_FUTURA','SAIDA_MANIFESTO','ORDEM_PRODUCAO','SAIDA_DAV','SAIDA_DEVOLUCAO','SAIDA_DAV_SR')
                AND NOT (CAB.TIPOVENDA IN ('SAIDA_DAV','SAIDA_DAV_SR') AND CAB.ISFATURADO = 1)
            `;
            
            const result = await executeQuery(query);
            return result.recordset[0];
        } catch (error) {
            console.error('Erro ao buscar estatísticas de itens:', error);
            throw error;
        }
    }
}

module.exports = Item; 