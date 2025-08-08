# Sistema de Controle de Expedição - Backend

Backend Node.js para o Sistema de Controle de Expedição, conectando com SQL Server usando autenticação Windows.

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- SQL Server (2016 ou superior)
- Base de dados `base_aa_opaozin` criada no SQL Server
- Autenticação Windows configurada

## 🚀 Instalação

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `env.example` para `.env` e configure as variáveis:

```bash
cp env.example .env
```

Edite o arquivo `.env`:

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

### 3. Configurar SQL Server

#### 3.1 Criar a base de dados

```sql
CREATE DATABASE base_aa_opaozin;
GO
```

#### 3.2 Executar script de criação das tabelas

Execute o script `scripts/create_tables.sql` no SQL Server Management Studio ou via linha de comando:

```bash
sqlcmd -S localhost -d base_aa_opaozin -i scripts/create_tables.sql
```

### 4. Configurar autenticação Windows

Certifique-se de que o usuário que executará a aplicação tem permissões de acesso ao SQL Server e à base de dados `base_aa_opaozin`.

## 🏃‍♂️ Executando a aplicação

### Modo desenvolvimento

```bash
npm run dev
```

### Modo produção

```bash
npm start
```

A aplicação estará disponível em:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health
- **Teste DB**: http://localhost:3000/api/test-db

## 📊 Estrutura do Banco de Dados

### Tabela `pedidos`
- `id` - Identificador único
- `numero_pedido` - Número do pedido
- `cliente` - Nome do cliente
- `codigo_cliente` - Código do cliente
- `data_saida` - Data de saída
- `data_entrega` - Data de entrega
- `motorista` - Nome do motorista
- `veiculo` - Placa do veículo
- `status` - Status do pedido (pendente, separado, cancelado)
- `data_criacao` - Data de criação
- `data_atualizacao` - Data de atualização

### Tabela `itens_pedido`
- `id` - Identificador único
- `pedido_id` - Referência ao pedido
- `produto` - Nome do produto
- `codigo_produto` - Código do produto
- `quantidade` - Quantidade solicitada
- `quantidade_confirmada` - Quantidade confirmada
- `confirmado` - Se o item foi confirmado
- `data_confirmacao` - Data de confirmação

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
- `POST /api/relatorios/exportar-pdf` - Exportar relatório para PDF

### Sistema

- `GET /api/health` - Health check da API
- `GET /api/test-db` - Teste de conexão com banco de dados

## 🔧 Configurações Avançadas

### Configuração do SQL Server

Para conexões remotas, certifique-se de:

1. **Habilitar TCP/IP** no SQL Server Configuration Manager
2. **Configurar porta** (padrão: 1433)
3. **Configurar firewall** para permitir conexões
4. **Habilitar autenticação Windows** no SQL Server

### Configuração de Pool de Conexões

O pool de conexões está configurado com:
- Máximo: 10 conexões
- Mínimo: 0 conexões
- Timeout: 30 segundos

### Configurações de Segurança

- **Helmet**: Configurado para segurança HTTP
- **CORS**: Configurado para permitir conexões do frontend
- **Rate Limiting**: 100 requisições por IP a cada 15 minutos

## 🐛 Solução de Problemas

### Erro de conexão com SQL Server

1. Verifique se o SQL Server está rodando
2. Confirme o nome do servidor em `DB_SERVER`
3. Verifique se a autenticação Windows está habilitada
4. Confirme se o usuário tem permissões na base de dados

### Erro de permissões

```sql
-- Conceder permissões ao usuário
USE base_aa_opaozin;
GO
GRANT SELECT, INSERT, UPDATE, DELETE ON pedidos TO [DOMINIO\usuario];
GRANT SELECT, INSERT, UPDATE, DELETE ON itens_pedido TO [DOMINIO\usuario];
GO
```

### Logs de erro

Os logs são exibidos no console. Para logs mais detalhados, configure:

```env
NODE_ENV=development
```

## 📝 Exemplos de Uso

### Criar um pedido

```bash
curl -X POST http://localhost:3000/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "numero_pedido": "PED-005",
    "cliente": "Novo Cliente",
    "codigo_cliente": "CLI005",
    "data_saida": "2024-01-20",
    "data_entrega": "2024-01-25",
    "motorista": "João Silva",
    "veiculo": "ABC-1234",
    "itens": [
      {
        "produto": "Produto X",
        "codigo_produto": "PROD010",
        "quantidade": 5
      }
    ]
  }'
```

### Confirmar um item

```bash
curl -X POST http://localhost:3000/api/pedidos/1/itens/1/confirmar \
  -H "Content-Type: application/json" \
  -d '{
    "quantidade_confirmada": 5
  }'
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. 