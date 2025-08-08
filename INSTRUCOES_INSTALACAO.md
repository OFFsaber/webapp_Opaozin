# 🚀 Sistema de Controle de Expedição - Instruções de Instalação

## 📋 Visão Geral

O Sistema de Controle de Expedição foi configurado com:
- **Frontend**: HTML, CSS, JavaScript (já pronto)
- **Backend**: Node.js + Express + SQL Server
- **Banco de Dados**: SQL Server com autenticação Windows
- **Base de Dados**: `base_aa`

## 🛠️ Pré-requisitos

1. **Node.js** (versão 16 ou superior)
   - Download: https://nodejs.org/
   - Verificar instalação: `node --version`

2. **SQL Server** (2016 ou superior)
   - SQL Server Express ou Developer Edition
   - SQL Server Management Studio (SSMS)

3. **Permissões de Administrador** (para configuração inicial)

## 📦 Instalação Passo a Passo

### 1. Configurar SQL Server

#### 1.1 Criar a Base de Dados
```sql
-- Abrir SSMS e conectar ao SQL Server
-- Executar o comando:
CREATE DATABASE base_aa_opaozin;
GO
```

#### 1.2 Executar Script de Criação das Tabelas
```sql
-- No SSMS, abrir o arquivo: backend/scripts/create_tables.sql
-- Executar o script completo
-- OU via linha de comando:
sqlcmd -S localhost -d base_aa_opaozin -i backend/scripts/create_tables.sql
```

#### 1.3 Verificar Autenticação Windows
- Abrir SQL Server Configuration Manager
- Verificar se "SQL Server Network Configuration" > "Protocols for SQLEXPRESS" > "TCP/IP" está habilitado
- Verificar se "SQL Server Services" > "SQL Server (SQLEXPRESS)" está rodando

### 2. Configurar Backend

#### 2.1 Instalar Dependências
```bash
cd backend
npm install
```

#### 2.2 Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
copy env.example .env

# Editar o arquivo .env com suas configurações:
```

**Conteúdo do arquivo `.env`:**
```env
# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Configurações do SQL Server
DB_SERVER=localhost
DB_DOMAIN=
DB_USER=
DB_PASSWORD=

# Configurações do Frontend
FRONTEND_URL=http://localhost:5500

# Configurações de Segurança
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=24h
```

#### 2.3 Executar Script de Configuração (Windows)
```bash
# No Windows, executar:
setup.bat
```

### 3. Testar a Instalação

#### 3.1 Iniciar o Backend
```bash
cd backend
npm run dev
```

#### 3.2 Verificar Endpoints
- **Health Check**: http://localhost:3000/api/health
- **Teste DB**: http://localhost:3000/api/test-db
- **API Base**: http://localhost:3000/api

#### 3.3 Verificar Logs
O console deve mostrar:
```
🔄 Testando conexão com o banco de dados...
✅ Conectado ao SQL Server com sucesso!
📊 Base de dados: base_aa_opaozin
🖥️  Servidor: localhost
🚀 Servidor iniciado com sucesso!
📡 Servidor rodando em: http://localhost:3000
```

### 4. Configurar Frontend

#### 4.1 Servir Frontend via Backend
O backend já está configurado para servir o frontend em: http://localhost:3000

#### 4.2 Ou usar Live Server (VS Code)
- Instalar extensão "Live Server"
- Clicar com botão direito em `frontend/index.html`
- Selecionar "Open with Live Server"
- Acessar: http://localhost:5500

## 🔧 Configurações Avançadas

### Configuração de Rede
Se o SQL Server estiver em outro servidor:

1. **Atualizar `.env`:**
```env
DB_SERVER=192.168.1.100  # IP do servidor SQL
```

2. **Configurar Firewall:**
- Porta 1433 (SQL Server)
- Porta 3000 (Backend)

3. **Configurar SQL Server:**
- Habilitar TCP/IP
- Configurar porta
- Permitir conexões remotas

### Configuração de Domínio
Se estiver usando autenticação de domínio:

```env
DB_DOMAIN=SEU_DOMINIO
DB_USER=usuario_dominio
DB_PASSWORD=senha_usuario
```

## 🐛 Solução de Problemas

### Erro de Conexão com SQL Server

**Sintoma:** `Login failed for user`
**Solução:**
```sql
-- No SSMS, executar:
USE base_aa_opaozin;
GO
CREATE LOGIN [DOMINIO\usuario] FROM WINDOWS;
GO
CREATE USER [DOMINIO\usuario] FOR LOGIN [DOMINIO\usuario];
GO
GRANT SELECT, INSERT, UPDATE, DELETE ON pedidos TO [DOMINIO\usuario];
GRANT SELECT, INSERT, UPDATE, DELETE ON itens_pedido TO [DOMINIO\usuario];
GO
```

### Erro de Porta em Uso

**Sintoma:** `EADDRINUSE: address already in use :::3000`
**Solução:**
```bash
# Mudar porta no .env
PORT=3001
```

### Erro de CORS

**Sintoma:** `Access to fetch at 'http://localhost:3000/api' from origin 'http://localhost:5500' has been blocked`
**Solução:**
```env
# Atualizar .env
FRONTEND_URL=http://localhost:5500
```

### Erro de Dependências

**Sintoma:** `Cannot find module 'mssql'`
**Solução:**
```bash
cd backend
npm install
```

## 📊 Estrutura do Projeto

```
webapp_Opaozin/
├── backend/
│   ├── config/
│   │   └── database.js          # Configuração SQL Server
│   ├── controllers/
│   │   ├── pedidosController.js # Controlador de pedidos
│   │   └── relatoriosController.js # Controlador de relatórios
│   ├── models/
│   │   ├── Pedido.js            # Modelo de pedidos
│   │   └── Item.js              # Modelo de itens
│   ├── routes/
│   │   ├── pedidos.js           # Rotas de pedidos
│   │   └── relatorios.js        # Rotas de relatórios
│   ├── scripts/
│   │   └── create_tables.sql    # Script de criação das tabelas
│   ├── server.js                # Servidor principal
│   ├── package.json             # Dependências
│   ├── env.example              # Exemplo de configuração
│   ├── setup.bat                # Script de configuração
│   └── README.md                # Documentação do backend
├── frontend/
│   ├── index.html               # Página de login
│   ├── pedidos.html             # Página principal
│   ├── script.js                # JavaScript do frontend
│   ├── styles.css               # Estilos CSS
│   └── README.md                # Documentação do frontend
└── INSTRUCOES_INSTALACAO.md     # Este arquivo
```

## 🔌 Endpoints da API

### Pedidos
- `GET /api/pedidos` - Listar pedidos
- `GET /api/pedidos/:id` - Buscar pedido por ID
- `POST /api/pedidos` - Criar novo pedido
- `PUT /api/pedidos/:id` - Atualizar pedido
- `DELETE /api/pedidos/:id` - Deletar pedido
- `GET /api/pedidos/estatisticas` - Buscar estatísticas
- `GET /api/pedidos/opcoes-filtros` - Buscar opções para filtros

### Itens
- `POST /api/pedidos/:pedidoId/itens/:itemId/confirmar` - Confirmar item
- `POST /api/pedidos/:pedidoId/itens/:itemId/desconfirmar` - Desconfirmar item

### Relatórios
- `GET /api/relatorios/pedidos-separados` - Relatório de pedidos separados
- `GET /api/relatorios/pedidos-pendentes` - Relatório de pedidos pendentes
- `GET /api/relatorios/produtos-faltantes` - Relatório de produtos faltantes
- `GET /api/relatorios/produtos-faltantes-por-cliente` - Relatório de produtos faltantes por cliente
- `GET /api/relatorios/consolidado` - Relatório consolidado

### Sistema
- `GET /api/health` - Health check da API
- `GET /api/test-db` - Teste de conexão com banco de dados

## 🎯 Próximos Passos

1. **Testar todas as funcionalidades:**
   - Login (admin/123)
   - Visualizar pedidos
   - Confirmar itens
   - Gerar relatórios

2. **Configurar dados reais:**
   - Inserir pedidos reais no banco
   - Configurar clientes e produtos

3. **Personalizar:**
   - Ajustar estilos CSS
   - Modificar campos conforme necessidade
   - Adicionar novas funcionalidades

## 📞 Suporte

Em caso de problemas:
1. Verificar logs do console
2. Testar conexão com banco: http://localhost:3000/api/test-db
3. Verificar status da API: http://localhost:3000/api/health
4. Consultar documentação do backend: `backend/README.md`

---

**✅ Sistema configurado com sucesso!**

Acesse: http://localhost:3000
Login: admin / 123 