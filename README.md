# Sistema de Controle de Expedição e Separação de Pedidos

## Descrição Geral

O Sistema de Controle de Expedição e Separação de Pedidos é uma aplicação web desenvolvida para otimizar e controlar o processo de separação de produtos na expedição da CONTRATANTE. O sistema funcionará como uma ponte inteligente entre o sistema S7 existente e as operações de expedição, proporcionando controle total sobre os pedidos que necessitam ser separados e enviados aos clientes.

## Características Técnicas

### Tipo de Aplicação
- **Aplicação Web Responsiva** - Interface adaptável que funciona perfeitamente em smartphones, tablets e computadores
- **Acesso Interno Exclusivo** - Disponível apenas na rede interna da empresa (mesma rede do servidor)
- **Sem Necessidade de Internet Externa** - Funciona completamente na rede local

### Compatibilidade
- Smartphones (Android e iOS) via navegador
- Tablets via navegador
- Computadores (Windows, Mac, Linux) via navegador
- Múltiplos usuários simultâneos

## Funcionalidades Principais

### 1. Busca e Listagem de Pedidos
- **Fonte de Dados**: Integração direta com o sistema S7
- **Interface Intuitiva**: Lista organizada e de fácil navegação

### 2. Detalhamento de Pedidos
- **Visualização Completa**: Ao clicar em qualquer pedido, todos os itens são exibidos detalhadamente
- **Informações Exibidas**:
  - Número do pedido
  - Cliente destinatário
  - Lista completa de produtos
  - Quantidades de cada item
  - Códigos de produto
  - Descrições dos produtos

### 3. Controle de Separação
- **Marcação Individual**: Cada item pode ser marcado como "conferido" individualmente
- **Status Visual**: Indicadores visuais claros (cores, ícones) para itens separados e pendentes
- **Confirmação de Pedido**: Quando todos os itens estão conferidos, o pedido é marcado como "completamente separado"
- **Histórico de Ações**: Registro de quem conferiu cada item e quando

### 4. Relatórios em Tempo Real
- **Dashboard Principal**: Visão geral instantânea do status da expedição
- **Indicadores em Tempo Real**:
  - Total de pedidos pendentes de separação
  - Total de pedidos completamente separados
  - Produtos específicos que estão faltando
  - Pedidos prontos para envio
- **Relatórios Detalhados**:
  - Lista de produtos pendentes por pedido
  - Relatório de produtividade da equipe
  - Tempo médio de separação por pedido
  - Histórico de separações realizadas

## Fluxo de Trabalho Prático

1. **Acesso ao Sistema**: O funcionário da expedição acessa o sistema através de qualquer dispositivo conectado à rede interna da empresa
2. **Visualização de Pedidos**: O sistema exibe automaticamente todos os pedidos com "carga montada" que precisam ser separados
3. **Seleção do Pedido**: O funcionário clica no pedido que deseja separar e visualiza todos os itens necessários
4. **Processo de Separação**: Conforme separa fisicamente cada produto, o funcionário marca o item como "conferido" no sistema
5. **Finalização**: Quando todos os itens estão conferidos, o pedido é automaticamente marcado como "pronto para envio"
6. **Monitoramento**: Supervisores podem acompanhar em tempo real o progresso através dos relatórios

## Benefícios Operacionais

- **Redução de Erros**: Controle rigoroso evita esquecimento de itens
- **Aumento de Produtividade**: Interface otimizada acelera o processo
- **Rastreabilidade Completa**: Histórico detalhado de todas as ações
- **Mobilidade**: Funcionários podem usar smartphones durante a separação
- **Visibilidade Gerencial**: Relatórios em tempo real para tomada de decisões
- **Integração Transparente**: Funciona em harmonia com o sistema S7 existente

## Requisitos de Infraestrutura

### Servidor
- Máquina capaz de executar simultaneamente o sistema S7 e o novo software
- Conexão de rede estável para múltiplos acessos simultâneos

### Dispositivos de Acesso
- Qualquer smartphone, tablet ou computador com navegador web
- Conexão à rede interna da empresa
- Não requer instalação de aplicativos adicionais

## Segurança e Acesso

- **Acesso Restrito**: Apenas dispositivos na rede interna podem acessar
- **Múltiplos Usuários**: Sistema suporta vários funcionários trabalhando simultaneamente
- **Dados Protegidos**: Todas as informações permanecem na rede interna da empresa

## Tecnologias Utilizadas

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js
- **Inicializador**: Python (executável para arranque do sistema)
- **Sistema Operacional**: Windows (integração com sistema S7)

## Estrutura do Projeto

```
webapp_Opaozin/
├── frontend/          # Interface do usuário
├── backend/           # Servidor e lógica de negócio
├── inicializador/     # Motor de arranque em Python
└── README.md
```

## Instalação e Execução

1. Execute o arquivo inicializador Python
2. O sistema automaticamente iniciará o servidor Node.js
3. Acesse a aplicação através do navegador na rede interna
