const express = require('express');
const router = express.Router();
const RelatoriosController = require('../controllers/relatoriosController');

// Relatórios específicos
router.get('/pedidos-separados', RelatoriosController.relatorioPedidosSeparados);
router.get('/pedidos-pendentes', RelatoriosController.relatorioPedidosPendentes);
router.get('/produtos-faltantes', RelatoriosController.relatorioProdutosFaltantes);
router.get('/produtos-faltantes-por-cliente', RelatoriosController.relatorioProdutosFaltantesPorCliente);

// Relatório consolidado
router.get('/consolidado', RelatoriosController.relatorioConsolidado);

// Exportação
router.post('/exportar-pdf', RelatoriosController.exportarPDF);

module.exports = router; 