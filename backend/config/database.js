const sql = require('mssql');

// Configuração do SQL Server com autenticação SQL Server
const dbConfig = {
    server: process.env.DB_SERVER || 'localhost', // Nome do servidor SQL Server
    database: process.env.DB_NAME || 'base_aa', // Nome da base de dados
    user: process.env.DB_USER || 'sa', // Usuário SQL Server
    password: process.env.DB_PASSWORD || 'javadeveloper', // Senha SQL Server
    options: {
        encrypt: false, // Desabilitar criptografia para conexões locais
        trustServerCertificate: true, // Confiar no certificado do servidor
        enableArithAbort: true
    },
    requestTimeout: 30000, // 30 segundos
    connectionTimeout: 30000, // 30 segundos
    pool: {
        max: 10, // Máximo de conexões no pool
        min: 0, // Mínimo de conexões no pool
        idleTimeoutMillis: 30000 // Tempo limite para conexões ociosas
    }
};

// Função para conectar ao banco de dados
async function connectDB() {
    try {
        const pool = await sql.connect(dbConfig);
        console.log('✅ Conectado ao SQL Server com sucesso!');
        console.log(`📊 Base de dados: ${dbConfig.database}`);
        console.log(`🖥️  Servidor: ${dbConfig.server}`);
        console.log(`👤 Usuário: ${dbConfig.user}`);
        return pool;
    } catch (error) {
        console.error('❌ Erro ao conectar ao SQL Server:', error.message);
        throw error;
    }
}

// Função para executar queries
async function executeQuery(query, params = []) {
    try {
        const pool = await sql.connect(dbConfig);
        const request = pool.request();
        
        // Adicionar parâmetros se fornecidos
        params.forEach((param, index) => {
            request.input(`P${index}`, param);
        });
        
        const result = await request.query(query);
        return result;
    } catch (error) {
        console.error('❌ Erro ao executar query:', error.message);
        throw error;
    }
}

// Função para executar stored procedures
async function executeStoredProcedure(procedureName, params = []) {
    try {
        const pool = await sql.connect(dbConfig);
        const request = pool.request();
        
        // Adicionar parâmetros se fornecidos
        params.forEach((param, index) => {
            request.input(`param${index + 1}`, param);
        });
        
        const result = await request.execute(procedureName);
        return result;
    } catch (error) {
        console.error('❌ Erro ao executar stored procedure:', error.message);
        throw error;
    }
}

// Função para testar a conexão
async function testConnection() {
    try {
        const result = await executeQuery('SELECT GETDATE() as currentTime, DB_NAME() as databaseName');
        console.log('✅ Teste de conexão bem-sucedido!');
        console.log(`⏰ Hora atual: ${result.recordset[0].currentTime}`);
        console.log(`📊 Base atual: ${result.recordset[0].databaseName}`);
        return true;
    } catch (error) {
        console.error('❌ Teste de conexão falhou:', error.message);
        return false;
    }
}

module.exports = {
    connectDB,
    executeQuery,
    executeStoredProcedure,
    testConnection,
    sql
}; 