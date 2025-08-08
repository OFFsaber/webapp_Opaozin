const Pedido = require('../models/Pedido');
const Item = require('../models/Item');
const { executeQuery } = require('../config/database');
const pedidosQueries = require('../queries/pedidosQueries');

class PedidosController {
    // Listar todos os pedidos com filtros
    static async listarPedidos(req, res) {
        try {
            const filtros = {
                dataInicio: req.query.dataInicio,
                dataFim: req.query.dataFim,
                cliente: req.query.cliente,
                vendedor: req.query.vendedor,
                transportadora: req.query.transportadora,
                numPedido: req.query.numPedido,
                numCarga: req.query.numCarga,
                veiculo: req.query.veiculo,
                motorista: req.query.motorista
            };
            
            const pedidos = await Pedido.buscarTodos(filtros);
            
            res.json({
                success: true,
                data: pedidos,
                message: `${pedidos.length} pedido(s) encontrado(s)`
            });
        } catch (error) {
            console.error('Erro ao listar pedidos:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    
    // Buscar pedido por ID
    static async buscarPedido(req, res) {
        try {
            const { id } = req.params;
            const pedido = await Pedido.buscarComItens(id);
            
            if (!pedido) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido não encontrado'
                });
            }
            
            res.json({
                success: true,
                data: pedido
            });
        } catch (error) {
            console.error('Erro ao buscar pedido:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    
    // Buscar itens de um pedido específico
    static async buscarItensPedido(req, res) {
        try {
            const { id } = req.params;
            const itens = await Item.buscarPorPedido(id);
            
            res.json({
                success: true,
                data: itens,
                message: `${itens.length} item(ns) encontrado(s)`
            });
        } catch (error) {
            console.error('Erro ao buscar itens do pedido:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    
    // Criar novo pedido (não implementado - dados vêm do sistema ERP)
    static async criarPedido(req, res) {
        try {
            res.status(501).json({
                success: false,
                message: 'Criação de pedidos não implementada - dados vêm do sistema ERP'
            });
        } catch (error) {
            console.error('Erro ao criar pedido:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    
    // Atualizar pedido (não implementado - dados vêm do sistema ERP)
    static async atualizarPedido(req, res) {
        try {
            res.status(501).json({
                success: false,
                message: 'Atualização de pedidos não implementada - dados vêm do sistema ERP'
            });
        } catch (error) {
            console.error('Erro ao atualizar pedido:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    
    // Deletar pedido (não implementado - dados vêm do sistema ERP)
    static async deletarPedido(req, res) {
        try {
            res.status(501).json({
                success: false,
                message: 'Exclusão de pedidos não implementada - dados vêm do sistema ERP'
            });
        } catch (error) {
            console.error('Erro ao deletar pedido:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    
    // Confirmar entrega de item
    static async confirmarItem(req, res) {
        try {
            const { pedidoId, itemId } = req.params;
            const { quantidadeEntregue, funcionario = 'Usuário' } = req.body;

            if (!quantidadeEntregue || quantidadeEntregue < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Quantidade entregue deve ser maior ou igual a zero'
                });
            }

            // Buscar informações do item antes da atualização
            const itemQuery = `
                SELECT I.QTPEDIDA, I.QTENTREGUE, P.NOME AS PRODUTO_NOME
                FROM ITEMPEDVENDA I WITH(NOLOCK)
                INNER JOIN PRODUTO P WITH(NOLOCK) ON P.CODIGO = I.CODPRODUTO
                WHERE I.NUMPEDIDO = @P0 AND I.CODPRODUTO = @P1
            `;
            const itemResult = await executeQuery(itemQuery, [pedidoId, itemId]);
            
            if (itemResult.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Item não encontrado'
                });
            }

            const itemInfo = itemResult.recordset[0];
            const quantidadePedida = itemInfo.QTPEDIDA;

            // Atualizar quantidade entregue
            await Pedido.atualizarQuantidadeEntregue(itemId, quantidadeEntregue);

            // Verificar se o pedido está completo
            const pedidoCompleto = await Pedido.verificarPedidoCompleto(pedidoId);
            let statusExpedicao = 0; // 0 = Pendente

            console.log(`🔍 Pedido ${pedidoId} está completo: ${pedidoCompleto}`);

            if (pedidoCompleto) {
                try {
                    // Verificar se o pedido já tem status na tabela
                    const temStatus = await Pedido.temStatusExpedicao(pedidoId);
                    console.log(`🔍 Pedido ${pedidoId} já tem status na tabela: ${temStatus}`);
                    
                    // Sempre inserir/atualizar o status para 1 (Separado)
                    await Pedido.inserirOuAtualizarStatusExpedicao(pedidoId, 1);
                    
                    if (temStatus) {
                        console.log(`✅ Status atualizado para separado: Pedido ${pedidoId}`);
                    } else {
                        console.log(`✅ Novo status inserido como separado: Pedido ${pedidoId}`);
                    }
                    
                    statusExpedicao = 1; // 1 = Separado
                    
                    // Verificar se foi realmente inserido/atualizado
                    const statusVerificado = await Pedido.buscarStatusExpedicao(pedidoId);
                    console.log(`✅ Status verificado na tabela: Pedido ${pedidoId} = ${statusVerificado}`);
                    
                } catch (error) {
                    console.error(`❌ Erro ao atualizar status do pedido ${pedidoId}:`, error);
                    throw error;
                }
            } else {
                console.log(`⏳ Pedido ${pedidoId} ainda não está completo, mantendo como pendente`);
            }

            res.json({
                success: true,
                message: 'Quantidade entregue atualizada com sucesso',
                pedidoCompleto: pedidoCompleto,
                statusExpedicao: statusExpedicao,
                itemConfirmado: {
                    produto: itemInfo.PRODUTO_NOME,
                    quantidadePedida: quantidadePedida,
                    quantidadeConfirmada: quantidadeEntregue,
                    funcionario: funcionario
                }
            });
        } catch (error) {
            console.error('Erro ao confirmar item:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    
    // Desconfirmar entrega de item (zerar quantidade entregue)
    static async desconfirmarItem(req, res) {
        try {
            const { itemId } = req.params;
            
            await Pedido.atualizarQuantidadeEntregue(itemId, 0);
            
            res.json({
                success: true,
                message: 'Quantidade entregue zerada com sucesso'
            });
        } catch (error) {
            console.error('Erro ao desconfirmar item:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    
    // Buscar estatísticas
    static async buscarEstatisticas(req, res) {
        try {
            const estatisticas = await Pedido.buscarEstatisticas();
            
            res.json({
                success: true,
                data: estatisticas
            });
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    
    // Buscar opções de filtros
    static async buscarOpcoesFiltros(req, res) {
        try {
            const opcoes = await Pedido.buscarOpcoesFiltros();
            
            res.json({
                success: true,
                data: opcoes
            });
        } catch (error) {
            console.error('Erro ao buscar opções de filtros:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    
    // Rota de teste para verificar pedidos
    static async testarPedidos(req, res) {
        try {
            const pedidos = await Pedido.testarPedidos();
            
            res.json({
                success: true,
                data: pedidos,
                message: `${pedidos.length} pedido(s) encontrado(s) no teste`
            });
        } catch (error) {
            console.error('Erro ao testar pedidos:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }

    // Salvar status de expedição
    static async salvarStatusExpedicao(req, res) {
        try {
            const { pedidoId } = req.params;
            const { status } = req.body;

            console.log(`🔍 Salvando status de expedição: Pedido ${pedidoId}, Status ${status}`);

            // Verificar se o pedido existe
            const pedido = await Pedido.buscarPorId(pedidoId);
            if (!pedido) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido não encontrado'
                });
            }

            // Verificar se o pedido está completo antes de marcar como separado
            if (status === 1) {
                const pedidoCompleto = await Pedido.verificarPedidoCompleto(pedidoId);
                if (!pedidoCompleto) {
                    return res.status(400).json({
                        success: false,
                        message: 'Pedido não pode ser marcado como separado pois ainda tem itens pendentes'
                    });
                }
            }

            // Inserir ou atualizar o status
            await Pedido.inserirOuAtualizarStatusExpedicao(pedidoId, status);

            // Verificar se foi realmente salvo
            const statusVerificado = await Pedido.buscarStatusExpedicao(pedidoId);
            console.log(`✅ Status verificado após salvar: Pedido ${pedidoId} = ${statusVerificado}`);

            res.json({
                success: true,
                message: `Status de expedição ${status === 1 ? 'separado' : 'pendente'} salvo com sucesso`,
                data: {
                    pedidoId: pedidoId,
                    status: status,
                    statusVerificado: statusVerificado
                }
            });
        } catch (error) {
            console.error('Erro ao salvar status de expedição:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }

    // Salvar todas as quantidades de uma vez
    static async salvarQuantidades(req, res) {
        try {
            const { pedidoId } = req.params;
            const { itens, status } = req.body;

            console.log(`🔍 Salvando quantidades do pedido ${pedidoId}:`, itens);
            console.log(`📊 Status a ser aplicado: ${status === 1 ? 'Separado' : 'Pendente'}`);

            // Verificar se o pedido existe
            const pedido = await Pedido.buscarPorId(pedidoId);
            if (!pedido) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido não encontrado'
                });
            }

            // Validar dados recebidos
            if (!itens || !Array.isArray(itens) || itens.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Lista de itens inválida'
                });
            }

            // Atualizar todas as quantidades entregues
            const resultados = [];
            for (const item of itens) {
                try {
                    await Pedido.atualizarQuantidadeEntregue(item.itemId, item.quantidadeEntregue);
                    resultados.push({
                        itemId: item.itemId,
                        quantidadeEntregue: item.quantidadeEntregue,
                        sucesso: true
                    });
                    console.log(`✅ Item ${item.itemId} atualizado: ${item.quantidadeEntregue}`);
                } catch (error) {
                    console.error(`❌ Erro ao atualizar item ${item.itemId}:`, error);
                    resultados.push({
                        itemId: item.itemId,
                        quantidadeEntregue: item.quantidadeEntregue,
                        sucesso: false,
                        erro: error.message
                    });
                }
            }

            // Verificar se todos os itens foram atualizados com sucesso
            const itensComErro = resultados.filter(r => !r.sucesso);
            if (itensComErro.length > 0) {
                return res.status(500).json({
                    success: false,
                    message: 'Alguns itens não puderam ser atualizados',
                    data: { itensComErro }
                });
            }

            // Verificar se o pedido está realmente completo antes de marcar como separado
            if (status === 1) {
                const pedidoCompleto = await Pedido.verificarPedidoCompleto(pedidoId);
                if (!pedidoCompleto) {
                    console.log(`⚠️ Pedido ${pedidoId} não está completo, mas foi solicitado status separado`);
                    return res.status(400).json({
                        success: false,
                        message: 'Pedido não pode ser marcado como separado pois ainda tem itens pendentes'
                    });
                }
            }

            // Inserir ou atualizar o status de expedição
            await Pedido.inserirOuAtualizarStatusExpedicao(pedidoId, status);

            // Verificar se foi realmente salvo
            const statusVerificado = await Pedido.buscarStatusExpedicao(pedidoId);
            console.log(`✅ Status verificado após salvar: Pedido ${pedidoId} = ${statusVerificado}`);

            res.json({
                success: true,
                message: `Quantidades e status ${status === 1 ? 'separado' : 'pendente'} salvos com sucesso`,
                data: {
                    pedidoId: pedidoId,
                    itensAtualizados: resultados,
                    status: status,
                    statusVerificado: statusVerificado
                }
            });
        } catch (error) {
            console.error('Erro ao salvar quantidades:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
}

module.exports = PedidosController; 