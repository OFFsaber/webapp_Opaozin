const { executeQuery } = require('../config/database');
const pedidosQueries = require('../queries/pedidosQueries');

class Pedido {
    // Buscar todos os pedidos com filtros opcionais
    static async buscarTodos(filtros = {}) {
        try {
            // Obter data atual no formato YYYY-MM-DD
            const hoje = new Date();
            const dataAtual = hoje.toISOString().split('T')[0];
            
            // Usar data do filtro se fornecida, senão usar data atual
            const dataFiltro = filtros.dataInicio || dataAtual;
            
            // Obter query base com a data
            let query = pedidosQueries.getQueryBase(dataFiltro);
            const params = [];
            let paramIndex = 0;
            
            // Adicionar filtros adicionais se necessário
            if (filtros.cliente) {
                query = query.replace('ORDER BY CAB.DTSAIDA DESC', `AND CLI.CODIGO = @P${paramIndex} ORDER BY CAB.DTSAIDA DESC`);
                params.push(filtros.cliente);
                paramIndex++;
            }
            
            if (filtros.vendedor) {
                query = query.replace('ORDER BY CAB.DTSAIDA DESC', `AND CAB.CODVENDEDOR = @P${paramIndex} ORDER BY CAB.DTSAIDA DESC`);
                params.push(filtros.vendedor);
                paramIndex++;
            }
            
            if (filtros.transportadora) {
                query = query.replace('ORDER BY CAB.DTSAIDA DESC', `AND CAB.CODTRANSPORTADORA = @P${paramIndex} ORDER BY CAB.DTSAIDA DESC`);
                params.push(filtros.transportadora);
                paramIndex++;
            }
            
            if (filtros.numPedido) {
                query = query.replace('ORDER BY CAB.DTSAIDA DESC', `AND CAB.NUMPEDIDO = @P${paramIndex} ORDER BY CAB.DTSAIDA DESC`);
                params.push(filtros.numPedido);
                paramIndex++;
            }
            
            if (filtros.numCarga) {
                query = query.replace('ORDER BY CAB.DTSAIDA DESC', `AND CAB.NUMCARGA = @P${paramIndex} ORDER BY CAB.DTSAIDA DESC`);
                params.push(filtros.numCarga);
                paramIndex++;
            }
            
            if (filtros.veiculo) {
                query = query.replace('ORDER BY CAB.DTSAIDA DESC', `AND VEIC.CODIGO = @P${paramIndex} ORDER BY CAB.DTSAIDA DESC`);
                params.push(filtros.veiculo);
                paramIndex++;
            }
            
            if (filtros.motorista) {
                query = query.replace('ORDER BY CAB.DTSAIDA DESC', `AND MOT.CODIGO = @P${paramIndex} ORDER BY CAB.DTSAIDA DESC`);
                params.push(filtros.motorista);
                paramIndex++;
            }
            
            // DEBUG: Mostrar a query final
            console.log('🔍 QUERY FINAL EXECUTADA:');
            console.log(query);
            console.log('📋 PARÂMETROS:', params);
            
            // Executar a query
            if (params.length === 0) {
                const result = await executeQuery(query);
                return result.recordset;
            } else {
                const result = await executeQuery(query, params);
                return result.recordset;
            }
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
            throw error;
        }
    }
    
    // Buscar pedido por ID
    static async buscarPorId(id) {
        try {
            const result = await executeQuery(pedidosQueries.buscarDetalhesPedido, [id]);
            return result.recordset[0] || null;
        } catch (error) {
            console.error('Erro ao buscar pedido por ID:', error);
            throw error;
        }
    }
    
    // Buscar pedido com itens
    static async buscarComItens(id) {
        try {
            // Buscar detalhes do pedido
            const pedidoResult = await executeQuery(pedidosQueries.buscarDetalhesPedido, [id]);
            
            if (pedidoResult.recordset.length === 0) {
                return null;
            }
            
            const pedido = pedidoResult.recordset[0];
            
            // Buscar itens do pedido
            const itensResult = await executeQuery(pedidosQueries.buscarItensPedido, [id]);
            
            // Estruturar os dados
            const pedidoCompleto = {
                id: pedido.NUMPEDIDO,
                numero_pedido: pedido.NUMPEDIDO,
                numero_carga: pedido.NUMCARGA,
                cliente: pedido.CLIENTE,
                codigo_cliente: pedido.CODCLIENTE,
                fantasia: pedido.FANTASIA,
                cnpj: pedido.CNPJ,
                data_saida: pedido.DTSAIDA,
                data_entrega: pedido.DTPREVENTREGA,
                vendedor: pedido.VENDEDOR,
                codigo_vendedor: pedido.CODVENDEDOR,
                status: pedido.STATUS,
                status_expedicao: pedido.STATUS_EXPEDICAO,
                observacao: pedido.OBSERVACAO,
                obs_pedido: pedido.OBSPEDIDO,
                transportadora: pedido.NOMETRANSPORTADORA,
                codigo_transportadora: pedido.CODTRANSPORTADORA,
                cidade: pedido.NOME_CIDADE,
                uf: pedido.UF_CIDADE,
                tipo_frete: pedido.TIPOFRETE,
                veiculo: pedido.VEICULO,
                motorista: pedido.MOTORISTA,
                itens: []
            };
            
            itensResult.recordset.forEach(item => {
                pedidoCompleto.itens.push({
                    id: item.ID,
                    codigo_produto: item.CODPRODUTO,
                    produto: item.PRODUTO,
                    unidade: item.UNIDADE,
                    quantidade: item.QTPEDIDA,
                    quantidade_entregue: item.QTENTREGUE,
                    quantidade_restante: item.QTRESTANTE,
                    valor_unitario: item.VLUNITARIO,
                    subtotal: item.SUBTOTAL,
                    valor_total_entregue: item.VALORTOTENTREGUE,
                    valor_total_restante: item.VALORTOTRESTANTE,
                    codigo_fabrica: item.CODFAB,
                    volume_item: item.VOLUMEITEM
                });
            });
            
            return pedidoCompleto;
        } catch (error) {
            console.error('Erro ao buscar pedido com itens:', error);
            throw error;
        }
    }
    
    // Buscar opções de filtros
    static async buscarOpcoesFiltros() {
        try {
            const [clientes, vendedores, transportadoras, veiculos, motoristas, cargas] = await Promise.all([
                executeQuery(pedidosQueries.buscarClientes),
                executeQuery(pedidosQueries.buscarVendedores),
                executeQuery(pedidosQueries.buscarTransportadoras),
                executeQuery(pedidosQueries.buscarVeiculos),
                executeQuery(pedidosQueries.buscarMotoristas),
                executeQuery(pedidosQueries.buscarCargas)
            ]);
            
            return {
                clientes: clientes.recordset,
                vendedores: vendedores.recordset,
                transportadoras: transportadoras.recordset,
                veiculos: veiculos.recordset,
                motoristas: motoristas.recordset,
                cargas: cargas.recordset
            };
        } catch (error) {
            console.error('Erro ao buscar opções de filtros:', error);
            throw error;
        }
    }
    
    // Buscar estatísticas
    static async buscarEstatisticas() {
        try {
            const result = await executeQuery(pedidosQueries.buscarEstatisticas);
            return result.recordset[0];
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            throw error;
        }
    }
    
    // Atualizar quantidade entregue de um item
    static async atualizarQuantidadeEntregue(itemId, quantidadeEntregue) {
        try {
            await executeQuery(pedidosQueries.atualizarQuantidadeEntregue, [itemId, quantidadeEntregue]);
            return true;
        } catch (error) {
            console.error('Erro ao atualizar quantidade entregue:', error);
            throw error;
        }
    }
    
    // Buscar produtos faltantes
    static async buscarProdutosFaltantes() {
        try {
            const result = await executeQuery(pedidosQueries.buscarProdutosFaltantes);
            return result.recordset;
        } catch (error) {
            console.error('Erro ao buscar produtos faltantes:', error);
            throw error;
        }
    }
    
    // Buscar produtos faltantes por cliente
    static async buscarProdutosFaltantesPorCliente(codigoCliente) {
        try {
            let query = pedidosQueries.buscarProdutosFaltantes + ' AND CAB.CODCLIENTE = @P0';
            const result = await executeQuery(query, [codigoCliente]);
            return result.recordset;
        } catch (error) {
            console.error('Erro ao buscar produtos faltantes por cliente:', error);
            throw error;
        }
    }
    
    // Método de teste para verificar se há pedidos
    static async testarPedidos() {
        try {
            const result = await executeQuery(pedidosQueries.testarPedidos);
            return result.recordset;
        } catch (error) {
            console.error('Erro ao testar pedidos:', error);
            throw error;
        }
    }

    // Verificar se pedido está completo (todos os itens confirmados)
    static async verificarPedidoCompleto(pedidoId) {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_itens,
                    SUM(CASE WHEN QTRESTANTE = 0 THEN 1 ELSE 0 END) as itens_completos,
                    SUM(CASE WHEN QTRESTANTE > 0 THEN 1 ELSE 0 END) as itens_pendentes
                FROM ITEMPEDVENDA I WITH(NOLOCK)
                WHERE I.NUMPEDIDO = @P0
            `;
            
            const result = await executeQuery(query, [pedidoId]);
            const { total_itens, itens_completos, itens_pendentes } = result.recordset[0];
            
            console.log(`🔍 Verificação pedido ${pedidoId}: Total=${total_itens}, Completos=${itens_completos}, Pendentes=${itens_pendentes}`);
            
            const isComplete = total_itens > 0 && itens_pendentes === 0;
            console.log(`✅ Pedido ${pedidoId} está completo: ${isComplete}`);
            
            return isComplete;
        } catch (error) {
            console.error('Erro ao verificar se pedido está completo:', error);
            throw error;
        }
    }
    
    // Atualizar status do pedido para separado
    static async atualizarStatusParaSeparado(pedidoId) {
        try {
            await executeQuery(pedidosQueries.atualizarStatusPedidoSeparado, [pedidoId]);
            return true;
        } catch (error) {
            console.error('Erro ao atualizar status do pedido:', error);
            throw error;
        }
    }

    // Inserir ou atualizar status de expedição
    static async inserirOuAtualizarStatusExpedicao(pedidoId, status) {
        try {
            await executeQuery(pedidosQueries.inserirOuAtualizarStatusExpedicao, [pedidoId, status]);
            console.log(`✅ Status de expedição atualizado: Pedido ${pedidoId} -> ${status ? 'Separado' : 'Pendente'}`);
            return true;
        } catch (error) {
            console.error('Erro ao inserir/atualizar status de expedição:', error);
            throw error;
        }
    }

    // Buscar status de expedição de um pedido
    static async buscarStatusExpedicao(pedidoId) {
        try {
            const query = `
                SELECT STATUS
                FROM STATUS_EXPEDICAO WITH(NOLOCK)
                WHERE NUMPEDIDO = @P0
            `;
            const result = await executeQuery(query, [pedidoId]);
            if (result.recordset.length > 0) {
                // Converter bit para 0/1
                return result.recordset[0].STATUS ? 1 : 0;
            }
            return null;
        } catch (error) {
            console.error('Erro ao buscar status de expedição:', error);
            return null;
        }
    }

    // Verificar se pedido tem status de expedição
    static async temStatusExpedicao(pedidoId) {
        try {
            const query = `
                SELECT COUNT(*) as total
                FROM STATUS_EXPEDICAO WITH(NOLOCK)
                WHERE NUMPEDIDO = @P0
            `;
            const result = await executeQuery(query, [pedidoId]);
            return result.recordset[0].total > 0;
        } catch (error) {
            console.error('Erro ao verificar status de expedição:', error);
            return false;
        }
    }
}

module.exports = Pedido; 