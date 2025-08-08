# Adaptação dos Scripts SQL para Backend Node.js

## Resumo das Alterações

Este documento descreve as adaptações feitas nos scripts SQL fornecidos para integração com o backend Node.js, mantendo os nomes das colunas originais conforme solicitado.

## Scripts SQL Originais

### 1. `sql/listar pedidos.sql`
- **Propósito**: Listar itens de um pedido específico
- **Parâmetros**: `@P0` (número do pedido)
- **Tabelas**: `ITEMPEDVENDA`, `PRODUTO`, `PRECO_ESTOQUE`, `CABPEDVENDA`

### 2. `sql/itens de um pedido.sql`
- **Propósito**: Buscar detalhes completos de pedidos por período
- **Parâmetros**: `@P0` (data início), `@P1` (data fim), `@P2` (código empresa)
- **Tabelas**: `CABPEDVENDA`, `PESSOA`, `VENDEDOR`, `CIDADE`, etc.

## Adaptações Realizadas

### 1. Configuração do Banco de Dados
- **Arquivo**: `backend/config/database.js`
- **Alteração**: Nome da base de dados alterado de `base_aa_opaozin` para `base_aa`

### 2. Queries Adaptadas
- **Arquivo**: `backend/queries/pedidosQueries.js` (novo)
- **Conteúdo**: Queries SQL adaptadas dos scripts originais, focando apenas nos dados necessários para exibição

#### Queries Principais:

##### `listarPedidos`
```sql
SELECT 
    CAB.NUMPEDIDO,
    CAB.CODCLIENTE,
    CLI.NOME AS CLIENTE,
    CLI.FANTASIA,
    CAB.STATUS,
    CONVERT(CHAR(10), CAB.DTEMISSAO, 120) AS DTEMISSAO,
    CONVERT(CHAR(10), CAB.DTPREVENTREGA, 120) AS DTPREVENTREGA,
    CAB.CODVENDEDOR,
    V.NOME AS VENDEDOR,
    ISNULL(CAB.VLTOTNOTA, 0) AS VLTOTNOTA,
    ISNULL(CAB.VLTOTITENS, 0) AS VLTOTITENS,
    ISNULL(CAB.VLTOTENTREGUE, 0) AS VLTOTENTREGUE,
    ISNULL(CAB.VLTOTRESTANTE, 0) AS VLTOTRESTANTE,
    CAB.OBSERVACAO,
    CAB.OBSPEDIDO,
    CAB.CODTRANSPORTADORA,
    TRANSP.NOME AS NOMETRANSPORTADORA,
    CID.CIDADE AS NOME_CIDADE,
    CID.UF AS UF_CIDADE
FROM CABPEDVENDA CAB WITH(NOLOCK)
INNER JOIN PESSOA CLI WITH(NOLOCK) ON CAB.CODCLIENTE = CLI.CODIGO
INNER JOIN VENDEDOR V WITH(NOLOCK) ON V.CODIGO = CAB.CODVENDEDOR
INNER JOIN CIDADE CID WITH(NOLOCK) ON CID.CODMUNICIPIO = CLI.CODCIDADE
LEFT JOIN PESSOA TRANSP WITH(NOLOCK) ON CAB.CODTRANSPORTADORA = TRANSP.CODIGO
WHERE CAB.STATUS IN ('L','P','B','C','F')
AND CAB.TIPOVENDA IN ('SAIDA_BALCAO','SAIDA_TELEMARKETING','ENTREGA_FUTURA','SAIDA_MANIFESTO','ORDEM_PRODUCAO','SAIDA_DAV','SAIDA_DEVOLUCAO','SAIDA_DAV_SR')
AND NOT (CAB.TIPOVENDA IN ('SAIDA_DAV','SAIDA_DAV_SR') AND CAB.ISFATURADO = 1)
ORDER BY CAB.DTEMISSAO DESC
```

##### `buscarItensPedido`
```sql
SELECT 
    I.CODPRODUTO,
    P.NOME AS PRODUTO,
    P.UNIDADE,
    ISNULL(I.QTPEDIDA, 0) AS QTPEDIDA,
    ISNULL(I.QTENTREGUE, 0) AS QTENTREGUE,
    ISNULL(I.QTRESTANTE, 0) AS QTRESTANTE,
    ISNULL(I.VLUNITARIO, 0) AS VLUNITARIO,
    ISNULL(I.SUBTOTAL, 0) AS SUBTOTAL,
    ISNULL(I.VALORTOTENTREGUE, 0) AS VALORTOTENTREGUE,
    ISNULL(I.VALORTOTRESTANTE, 0) AS VALORTOTRESTANTE,
    I.ID,
    ISNULL(P.CODFABRICA, '') AS CODFAB,
    ISNULL(I.VOLUMEITEM, 0) AS VOLUMEITEM
FROM ITEMPEDVENDA I WITH(NOLOCK)
INNER JOIN PRODUTO P WITH(NOLOCK) ON I.CODPRODUTO = P.CODIGO
INNER JOIN CABPEDVENDA C WITH(NOLOCK) ON C.NUMPEDIDO = I.NUMPEDIDO
WHERE I.NUMPEDIDO = @P0
ORDER BY I.ID
```

### 3. Modelos Atualizados

#### `backend/models/Pedido.js`
- **Métodos adaptados**:
  - `buscarTodos()`: Usa queries adaptadas com filtros
  - `buscarComItens()`: Estrutura dados com nomes de colunas originais
  - `buscarOpcoesFiltros()`: Busca clientes, vendedores e transportadoras
  - `buscarEstatisticas()`: Estatísticas baseadas nos dados reais

#### `backend/models/Item.js`
- **Métodos adaptados**:
  - `buscarPorPedido()`: Usa query adaptada
  - `confirmar()`: Atualiza `QTENTREGUE` em vez de `quantidade_confirmada`
  - `buscarProdutosFaltantes()`: Baseado em `QTRESTANTE > 0`

### 4. Controller Atualizado

#### `backend/controllers/pedidosController.js`
- **Endpoints adaptados**:
  - `listarPedidos`: Filtros por data, cliente, vendedor, transportadora
  - `confirmarItem`: Atualiza quantidade entregue
  - `buscarOpcoesFiltros`: Retorna opções para dropdowns

### 5. Frontend Atualizado

#### `frontend/script.js`
- **Funções adaptadas**:
  - `createOrderCard()`: Usa campos `NUMPEDIDO`, `CLIENTE`, `VENDEDOR`, etc.
  - `createItemCard()`: Usa campos `CODPRODUTO`, `PRODUTO`, `QTPEDIDA`, `QTENTREGUE`
  - `applyFilters()`: Filtros adaptados para novos campos
  - `updateStats()`: Estatísticas baseadas nos novos campos

## Mapeamento de Campos

### Pedidos
| Campo Original | Campo Adaptado | Descrição |
|----------------|----------------|-----------|
| `NUMPEDIDO` | `numero_pedido` | Número do pedido |
| `CLIENTE` | `cliente` | Nome do cliente |
| `DTEMISSAO` | `data_saida` | Data de emissão |
| `DTPREVENTREGA` | `data_entrega` | Data prevista de entrega |
| `VENDEDOR` | `vendedor` | Nome do vendedor |
| `NOMETRANSPORTADORA` | `transportadora` | Nome da transportadora |
| `VLTOTNOTA` | `valor_total` | Valor total da nota |

### Itens
| Campo Original | Campo Adaptado | Descrição |
|----------------|----------------|-----------|
| `CODPRODUTO` | `codigo_produto` | Código do produto |
| `PRODUTO` | `produto` | Nome do produto |
| `QTPEDIDA` | `quantidade` | Quantidade pedida |
| `QTENTREGUE` | `quantidade_entregue` | Quantidade entregue |
| `QTRESTANTE` | `quantidade_restante` | Quantidade restante |

## Funcionalidades Implementadas

### ✅ Funcionalidades Ativas
- Listagem de pedidos com filtros
- Visualização de detalhes do pedido
- Confirmação de itens (atualização de quantidade entregue)
- Estatísticas em tempo real
- Filtros por data, cliente, vendedor, transportadora
- Busca de produtos faltantes

### ❌ Funcionalidades Desabilitadas
- Criação de pedidos (dados vêm do ERP)
- Atualização de pedidos (dados vêm do ERP)
- Exclusão de pedidos (dados vêm do ERP)

## Próximos Passos

1. **Teste de Conexão**: Verificar conexão com a base `base_aa`
2. **Validação de Dados**: Testar queries com dados reais
3. **Ajustes de Performance**: Otimizar queries se necessário
4. **Testes de Integração**: Validar frontend + backend

## Observações Importantes

- **Nomes de Colunas**: Mantidos exatamente como nos scripts originais
- **Dados Removidos**: Campos desnecessários para exibição foram removidos
- **Compatibilidade**: Queries adaptadas para funcionar com Node.js + mssql
- **Segurança**: Mantidos os `WITH(NOLOCK)` dos scripts originais 