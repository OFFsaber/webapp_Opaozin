const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware básico
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Rota de health
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// Rota principal
app.get('/', (req, res) => {
    res.json({
        message: 'Servidor funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor de teste rodando em http://localhost:${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/api/health`);
    console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
}); 