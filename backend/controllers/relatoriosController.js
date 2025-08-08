const Pedido = require('../models/Pedido');
const Item = require('../models/Item');

class RelatoriosController {
    // Relatório de pedidos separados
    static async relatorioPedidosSeparados(req, res) {
        try {
            const { dataSaida } = req.query;
            
            const filtros = {
                status: 'separado'
            };
            
            if (dataSaida) {
                filtros.dataSaida = dataSaida;
            }
            
            const pedidos = await Pedido.buscarTodos(filtros);
            
            // Calcular estatísticas
            const totalPedidos = pedidos.length;
            const totalItens = pedidos.reduce((total, pedido) => {
                // Aqui você precisaria buscar os itens de cada pedido
                // Por simplicidade, vamos assumir que cada pedido tem itens
                return total + (pedido.itens ? pedido.itens.length : 0);
            }, 0);
            
            res.json({
                success: true,
                data: {
                    pedidos,
                    estatisticas: {
                        totalPedidos,
                        totalItens
                    }
                },
                message: `Relatório gerado com ${totalPedidos} pedido(s) separado(s)`
            });
        } catch (error) {
            console.error('Erro ao gerar relatório de pedidos separados:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    
    // Relatório de pedidos pendentes
    static async relatorioPedidosPendentes(req, res) {
        try {
            const { dataSaida } = req.query;
            
            const filtros = {
                status: 'pendente'
            };
            
            if (dataSaida) {
                filtros.dataSaida = dataSaida;
            }
            
            const pedidos = await Pedido.buscarTodos(filtros);
            
            // Para cada pedido, buscar os itens pendentes
            const pedidosComItensPendentes = [];
            
            for (const pedido of pedidos) {
                const pedidoCompleto = await Pedido.buscarComItens(pedido.id);
                if (pedidoCompleto) {
                    const itensPendentes = pedidoCompleto.itens.filter(item => 
                        !item.confirmado || item.quantidade_confirmada < item.quantidade
                    );
                    
                    if (itensPendentes.length > 0) {
                        pedidosComItensPendentes.push({
                            ...pedido,
                            itensPendentes
                        });
                    }
                }
            }
            
            // Calcular estatísticas
            const totalPedidos = pedidosComItensPendentes.length;
            const totalItensPendentes = pedidosComItensPendentes.reduce((total, pedido) => 
                total + pedido.itensPendentes.length, 0
            );
            
            res.json({
                success: true,
                data: {
                    pedidos: pedidosComItensPendentes,
                    estatisticas: {
                        totalPedidos,
                        totalItensPendentes
                    }
                },
                message: `Relatório gerado com ${totalPedidos} pedido(s) pendente(s)`
            });
        } catch (error) {
            console.error('Erro ao gerar relatório de pedidos pendentes:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    
    // Relatório de produtos faltantes
    static async relatorioProdutosFaltantes(req, res) {
        try {
            const { dataSaida, motorista, veiculo } = req.query;
            
            const filtros = {};
            if (dataSaida) filtros.dataSaida = dataSaida;
            if (motorista) filtros.motorista = motorista;
            if (veiculo) filtros.veiculo = veiculo;
            
            const produtosFaltantes = await Item.buscarProdutosFaltantes(filtros);
            
            // Calcular estatísticas
            const totalProdutos = produtosFaltantes.length;
            const totalUnidades = produtosFaltantes.reduce((total, produto) => 
                total + produto.quantidade_faltante, 0
            );
            
            res.json({
                success: true,
                data: {
                    produtos: produtosFaltantes,
                    estatisticas: {
                        totalProdutos,
                        totalUnidades
                    }
                },
                message: `Relatório gerado com ${totalProdutos} produto(s) faltante(s)`
            });
        } catch (error) {
            console.error('Erro ao gerar relatório de produtos faltantes:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    
    // Relatório de produtos faltantes por cliente
    static async relatorioProdutosFaltantesPorCliente(req, res) {
        try {
            const { dataSaida, motorista, veiculo } = req.query;
            
            const filtros = {};
            if (dataSaida) filtros.dataSaida = dataSaida;
            if (motorista) filtros.motorista = motorista;
            if (veiculo) filtros.veiculo = veiculo;
            
            const produtosFaltantesPorCliente = await Item.buscarProdutosFaltantesPorCliente(filtros);
            
            // Agrupar por cliente
            const clientesAgrupados = {};
            
            produtosFaltantesPorCliente.forEach(item => {
                if (!clientesAgrupados[item.cliente]) {
                    clientesAgrupados[item.cliente] = {
                        cliente: item.cliente,
                        numero_pedido: item.numero_pedido,
                        data_entrega: item.data_entrega,
                        motorista: item.motorista,
                        veiculo: item.veiculo,
                        itens: []
                    };
                }
                
                clientesAgrupados[item.cliente].itens.push({
                    codigo_produto: item.codigo_produto,
                    produto: item.produto,
                    quantidade_pedida: item.quantidade_pedida,
                    quantidade_confirmada: item.quantidade_confirmada,
                    quantidade_faltante: item.quantidade_faltante
                });
            });
            
            const clientes = Object.values(clientesAgrupados);
            
            // Calcular estatísticas
            const totalClientes = clientes.length;
            const totalItens = clientes.reduce((total, cliente) => 
                total + cliente.itens.length, 0
            );
            
            res.json({
                success: true,
                data: {
                    clientes,
                    estatisticas: {
                        totalClientes,
                        totalItens
                    }
                },
                message: `Relatório gerado com ${totalClientes} cliente(s) com faltantes`
            });
        } catch (error) {
            console.error('Erro ao gerar relatório de produtos faltantes por cliente:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    
    // Relatório consolidado
    static async relatorioConsolidado(req, res) {
        try {
            const { dataSaida } = req.query;
            
            // Buscar estatísticas gerais
            const estatisticas = await Pedido.buscarEstatisticas();
            
            // Buscar produtos faltantes
            const filtros = {};
            if (dataSaida) filtros.dataSaida = dataSaida;
            
            const produtosFaltantes = await Item.buscarProdutosFaltantes(filtros);
            
            // Buscar top 5 clientes com mais faltantes
            const produtosFaltantesPorCliente = await Item.buscarProdutosFaltantesPorCliente(filtros);
            
            const clientesAgrupados = {};
            produtosFaltantesPorCliente.forEach(item => {
                if (!clientesAgrupados[item.cliente]) {
                    clientesAgrupados[item.cliente] = {
                        cliente: item.cliente,
                        totalFaltantes: 0,
                        itens: []
                    };
                }
                
                clientesAgrupados[item.cliente].totalFaltantes += item.quantidade_faltante;
                clientesAgrupados[item.cliente].itens.push(item);
            });
            
            const topClientes = Object.values(clientesAgrupados)
                .sort((a, b) => b.totalFaltantes - a.totalFaltantes)
                .slice(0, 5);
            
            res.json({
                success: true,
                data: {
                    estatisticas,
                    produtosFaltantes: {
                        total: produtosFaltantes.length,
                        produtos: produtosFaltantes.slice(0, 10) // Top 10
                    },
                    topClientesComFaltantes: topClientes
                },
                message: 'Relatório consolidado gerado com sucesso'
            });
        } catch (error) {
            console.error('Erro ao gerar relatório consolidado:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    
    // Exportar relatório para PDF (simulado)
    static async exportarPDF(req, res) {
        try {
            const { tipo, filtros } = req.body;
            
            // Aqui você implementaria a lógica de exportação para PDF
            // Por enquanto, vamos simular
            
            let dados = {};
            
            switch (tipo) {
                case 'separados':
                    dados = await this.gerarDadosRelatorioSeparados(filtros);
                    break;
                case 'pendentes':
                    dados = await this.gerarDadosRelatorioPendentes(filtros);
                    break;
                case 'faltantes':
                    dados = await this.gerarDadosRelatorioFaltantes(filtros);
                    break;
                case 'faltantesPorCliente':
                    dados = await this.gerarDadosRelatorioFaltantesPorCliente(filtros);
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Tipo de relatório inválido'
                    });
            }
            
            // Simular geração do PDF
            const nomeArquivo = `relatorio_${tipo}_${new Date().toISOString().split('T')[0]}.pdf`;
            
            res.json({
                success: true,
                data: {
                    nomeArquivo,
                    dados,
                    urlDownload: `/downloads/${nomeArquivo}` // URL simulada
                },
                message: 'Relatório exportado com sucesso'
            });
        } catch (error) {
            console.error('Erro ao exportar relatório:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    
    // Métodos auxiliares para gerar dados dos relatórios
    static async gerarDadosRelatorioSeparados(filtros) {
        const pedidos = await Pedido.buscarTodos({ ...filtros, status: 'separado' });
        return {
            titulo: 'Relatório de Pedidos Separados',
            data: new Date().toLocaleDateString('pt-BR'),
            pedidos,
            total: pedidos.length
        };
    }
    
    static async gerarDadosRelatorioPendentes(filtros) {
        const pedidos = await Pedido.buscarTodos({ ...filtros, status: 'pendente' });
        return {
            titulo: 'Relatório de Pedidos Pendentes',
            data: new Date().toLocaleDateString('pt-BR'),
            pedidos,
            total: pedidos.length
        };
    }
    
    static async gerarDadosRelatorioFaltantes(filtros) {
        const produtos = await Item.buscarProdutosFaltantes(filtros);
        return {
            titulo: 'Relatório de Produtos Faltantes',
            data: new Date().toLocaleDateString('pt-BR'),
            produtos,
            total: produtos.length
        };
    }
    
    static async gerarDadosRelatorioFaltantesPorCliente(filtros) {
        const produtos = await Item.buscarProdutosFaltantesPorCliente(filtros);
        return {
            titulo: 'Relatório de Produtos Faltantes por Cliente',
            data: new Date().toLocaleDateString('pt-BR'),
            produtos,
            total: produtos.length
        };
    }
}

module.exports = RelatoriosController; 