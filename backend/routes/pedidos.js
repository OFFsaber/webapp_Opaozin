const express = require('express');
const router = express.Router();
const PedidosController = require('../controllers/pedidosController');

// Middleware de validação básica
const validarPedido = (req, res, next) => {
    const { numero_pedido, cliente, data_saida } = req.body;
    
    if (!numero_pedido || !cliente || !data_saida) {
        return res.status(400).json({
            success: false,
            message: 'Número do pedido, cliente e data de saída são obrigatórios'
        });
    }
    
    next();
};

// Rotas para pedidos
router.get('/teste', PedidosController.testarPedidos);
router.get('/', PedidosController.listarPedidos);
router.get('/opcoes-filtros', PedidosController.buscarOpcoesFiltros);
router.get('/estatisticas', PedidosController.buscarEstatisticas);
router.get('/:id/itens', PedidosController.buscarItensPedido);
router.get('/:id', PedidosController.buscarPedido);
router.post('/', validarPedido, PedidosController.criarPedido);
router.put('/:id', validarPedido, PedidosController.atualizarPedido);
router.delete('/:id', PedidosController.deletarPedido);

// Rotas para itens
router.post('/:pedidoId/itens/:itemId/confirmar', PedidosController.confirmarItem);
router.post('/:pedidoId/itens/:itemId/desconfirmar', PedidosController.desconfirmarItem);

// Rota para salvar status de expedição
router.post('/:pedidoId/salvar-status', PedidosController.salvarStatusExpedicao);

// Rota para salvar todas as quantidades de uma vez
router.post('/:pedidoId/salvar-quantidades', PedidosController.salvarQuantidades);

module.exports = router; 