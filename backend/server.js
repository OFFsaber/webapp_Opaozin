const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Importar configuração do banco de dados
const { connectDB, testConnection } = require('./config/database');

// Importar rotas
const pedidosRoutes = require('./routes/pedidos');
const relatoriosRoutes = require('./routes/relatorios');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do CORS (simplificada)
app.use(cors());

// Configurações de segurança (simplificadas)
app.use(helmet({
    contentSecurityPolicy: false
}));

// Rate limiting (comentado temporariamente para debug)
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutos
//     max: 100, // Máximo 100 requisições por IP
//     message: {
//         error: 'Muitas requisições deste IP, tente novamente em 15 minutos.'
//     }
// });
// app.use('/api/', limiter);

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
    next();
});

// Middleware de tratamento de erros (movido para o final)
// app.use((error, req, res, next) => {
//     console.error('❌ Erro na aplicação:', error);
//     res.status(500).json({
//         error: 'Erro interno do servidor',
//         message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado'
//     });
// });

// Rota de teste da API
app.get('/api/health', async (req, res) => {
    try {
        const dbStatus = await testConnection();
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            database: dbStatus ? 'Conectado' : 'Desconectado',
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            database: 'Erro na conexão',
            error: error.message
        });
    }
});

// Rota de teste simples
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Rota de teste do banco de dados
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await testConnection();
        if (result) {
            res.json({
                success: true,
                message: 'Conexão com o banco de dados estabelecida com sucesso!',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Falha na conexão com o banco de dados',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao testar conexão com o banco de dados',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Rotas da API (ANTES de tudo)
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/relatorios', relatoriosRoutes);

// Rota para servir o frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Servir arquivos estáticos do frontend (DEPOIS das rotas da API)
app.use(express.static(path.join(__dirname, '../frontend')));

// Rota para qualquer caminho não encontrado
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        path: req.originalUrl,
        method: req.method
    });
});

// Função para inicializar o servidor
async function startServer() {
    try {
        // Testar conexão com o banco de dados
        console.log('🔄 Testando conexão com o banco de dados...');
        await testConnection();
        
        // Iniciar servidor
        app.listen(PORT, '0.0.0.0', () => {
            console.log('🚀 Servidor iniciado com sucesso!');
            console.log(`📡 Servidor rodando em: http://localhost:${PORT}`);
            console.log(`🔗 API disponível em: http://localhost:${PORT}/api`);
            console.log(`🌐 Frontend disponível em: http://localhost:${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
            console.log(`🧪 Teste DB: http://localhost:${PORT}/api/test-db`);
            console.log('='.repeat(60));
            console.log('📱 Para acesso na rede local:');
            console.log(`🌐 Wi-Fi: http://192.168.1.3:${PORT}`);
            console.log(`🔗 Ethernet: http://192.168.240.1:${PORT}`);
            console.log('='.repeat(60));
        });
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error.message);
        process.exit(1);
    }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Iniciar servidor
startServer(); 