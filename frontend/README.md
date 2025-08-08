# Frontend - Sistema de Controle de Expedição

## Visão Geral

O frontend do Sistema de Controle de Expedição é uma aplicação web responsiva desenvolvida em HTML, CSS e JavaScript puro. A interface foi projetada para ser intuitiva e fácil de usar, funcionando perfeitamente em smartphones, tablets e computadores.

## Estrutura de Arquivos

```
frontend/
├── index.html          # Tela de login
├── pedidos.html        # Tela principal com lista de pedidos
├── styles.css          # Estilos CSS responsivos
├── script.js           # Lógica JavaScript
└── README.md           # Esta documentação
```

## Funcionalidades Implementadas

### 1. Sistema de Login
- **Usuário**: `admin`
- **Senha**: `123`
- Interface moderna com validação em tempo real
- Persistência de sessão usando localStorage

### 2. Tela Principal (pedidos.html)
- **Header**: Nome do sistema, usuário logado e botão de logout
- **Filtros**: Data de saída, motorista, veículo, cliente, produto e status
- **Lista de Pedidos**: Cards organizados com informações principais incluindo data de entrega, motorista e veículo
- **Estatísticas**: Contadores de pedidos pendentes e separados

### 3. Modal de Detalhes do Pedido
- Informações completas do pedido
- Lista de itens com quantidades
- Botão verde para confirmar cada item
- Campo para informar quantidade confirmada
- Atualização automática de status

### 4. Sistema de Status
- **Pendente**: Pedidos com itens não confirmados (borda amarela/laranja)
- **Separado**: Pedidos com todos os itens confirmados E com quantidade suficiente (borda verde)
- **Lógica Corrigida**: Um pedido só é marcado como "separado" quando TODOS os itens têm quantidade confirmada >= quantidade solicitada
- Indicadores visuais por cores e ícones

### 5. Filtros Inteligentes
- **Filtro de Clientes**: Autocomplete com código ou nome do cliente
- **Filtro de Produtos**: Autocomplete com código ou nome do produto
- **Busca em tempo real**: Opções aparecem conforme digita
- **Seleção fácil**: Clique na opção desejada

### 6. Controle de Quantidades
- **Quantidade menor**: Item fica amarelo quando confirmado com menos que solicitado
- **Edição permitida**: Itens confirmados podem ser editados
- **Flexibilidade**: Permite quantidades até 2x a solicitada

### 7. Sistema de Relatórios
- **Relatório de Pedidos Separados**: Lista todos os pedidos com status "separado" com filtro por data
- **Relatório de Pedidos Pendentes**: Mostra pedidos pendentes e produtos faltantes com detalhes de quantidades
- **Relatório de Produtos Faltantes**: Lista consolidada de produtos faltantes com filtro por departamento
- **Relatório de Produtos Faltantes por Cliente**: Mostra produtos faltantes organizados por cliente com filtros de motorista e veículo
- **Exportação**: Opções para salvar em PDF e imprimir relatórios
- **Interface Intuitiva**: Sistema de abas para navegar entre diferentes tipos de relatório

## Como Usar

### 1. Acesso ao Sistema
1. Abra o arquivo `index.html` no navegador
2. Digite o usuário: `admin`
3. Digite a senha: `123`
4. Clique em "Entrar"

### 2. Navegação na Lista de Pedidos
1. Use os filtros para encontrar pedidos específicos
2. Clique em qualquer pedido para ver os detalhes
3. Os pedidos são organizados por status (pendente/separado)

### 3. Confirmação de Itens
1. Clique em um pedido para abrir o modal
2. Para cada item:
   - Digite a quantidade confirmada no campo
   - Clique no botão verde "Confirmar"
3. Quando todos os itens estiverem confirmados, o pedido muda para "Separado"

### 4. Filtros Disponíveis
- **Data de Saída**: Selecione uma data específica (preenchida automaticamente com a data de hoje)
- **Motorista**: Selecione um motorista específico
- **Veículo**: Selecione um veículo específico
- **Cliente**: Digite código ou nome do cliente (autocomplete)
- **Produto**: Digite código ou nome do produto (autocomplete)
- **Status**: Pendente ou Separado

### 5. Confirmação de Itens Melhorada
1. Digite a quantidade confirmada no campo
2. Clique no botão verde "Confirmar"
3. **Item amarelo**: Quantidade menor que solicitada
4. **Item verde**: Quantidade igual ou maior que solicitada
5. **Editar item**: Clique em "Editar" para modificar quantidade

### 6. Sistema de Relatórios
1. Clique no botão "Relatórios" no cabeçalho
2. Escolha o tipo de relatório desejado:
   - **Pedidos Separados**: Filtre por data e visualize pedidos completos
   - **Pedidos Pendentes**: Veja produtos faltantes com quantidades detalhadas
   - **Produtos Faltantes**: Lista consolidada por departamento
   - **Faltantes por Cliente**: Produtos faltantes organizados por cliente com filtros de motorista e veículo
3. Clique em "Gerar Relatório" para atualizar os dados
4. Use "Exportar PDF" ou "Imprimir" para salvar/visualizar o relatório

## Correções e Melhorias

### Correção de Bug - Lógica de Status
- **Problema**: Pedidos eram marcados como "separado" mesmo com itens com quantidade insuficiente
- **Solução**: Implementada verificação que exige quantidade confirmada >= quantidade solicitada para TODOS os itens
- **Impacto**: Maior precisão no controle de separação de pedidos

### Melhorias nos Filtros
- **Filtro de Produtos**: Implementado autocomplete igual ao de clientes
- **Filtro de Data**: Simplificado para uma única data de saída
- **Data Automática**: Campo de data preenchido automaticamente com a data de hoje
- **Experiência do Usuário**: Busca mais intuitiva e rápida

### Sistema de Relatórios
- **Quatro Tipos de Relatório**: Pedidos Separados, Pedidos Pendentes, Produtos Faltantes e Faltantes por Cliente
- **Filtros Específicos**: Data para pedidos, departamento para produtos faltantes, motorista e veículo para faltantes por cliente
- **Exportação Completa**: PDF e impressão com formatação profissional
- **Interface Moderna**: Sistema de abas intuitivo e responsivo
- **Dados Consolidados**: Resumos estatísticos e tabelas detalhadas

## Design e Interface

### Características Visuais
- **Cores**: Gradiente azul/roxo moderno
- **Tipografia**: Segoe UI para melhor legibilidade
- **Ícones**: Font Awesome para elementos visuais
- **Animações**: Transições suaves e feedback visual

### Responsividade
- **Mobile First**: Otimizado para smartphones
- **Tablet**: Interface adaptada para tablets
- **Desktop**: Layout completo para computadores
- **Touch Friendly**: Botões e elementos adequados para toque

### Elementos de UX
- **Feedback Visual**: Cores diferentes para status
- **Notificações**: Mensagens de sucesso/erro
- **Loading States**: Indicadores de carregamento
- **Hover Effects**: Interações visuais

## Dados de Demonstração

O sistema inclui dados simulados para demonstração:

### Pedidos de Exemplo
- **PED-001**: Cliente 1 (Pendente)
- **PED-002**: Cliente 2 (Pendente)  
- **PED-003**: Cliente 3 (Separado)
- **PED-004**: Empresa ABC Ltda (Pendente - com item parcialmente confirmado)

### Clientes de Exemplo
- CLI001 - Cliente 1
- CLI002 - Cliente 2
- CLI003 - Cliente 3
- CLI004 - Empresa ABC Ltda
- CLI005 - Comércio XYZ
- CLI006 - Distribuidora Central
- CLI007 - Loja do Bairro
- CLI008 - Supermercado Popular

### Produtos de Exemplo
- Produto A (PROD001)
- Produto B (PROD002)
- Produto C (PROD003)
- Produto D (PROD004)
- Produto E (PROD005)
- Produto F (PROD006)
- Produto G (PROD007)
- Produto H (PROD008)
- Produto I (PROD009)
- Produto J (PROD010)
- Produto K (PROD011)
- Produto L (PROD012)

## Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Estilos modernos com Flexbox e Grid
- **JavaScript ES6+**: Lógica da aplicação
- **Font Awesome**: Ícones
- **LocalStorage**: Persistência de sessão

## Compatibilidade

- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Android, iOS, Windows, Mac, Linux
- **Resoluções**: 320px até 4K

## Próximos Passos

Para integração com o backend:
1. Substituir dados simulados por chamadas API
2. Implementar autenticação real
3. Adicionar sincronização em tempo real
4. Implementar cache offline

## Desenvolvimento

Para modificar o sistema:
1. Edite os arquivos HTML para estrutura
2. Modifique o CSS para estilos
3. Atualize o JavaScript para lógica
4. Teste em diferentes dispositivos

## Suporte

O sistema foi desenvolvido seguindo as melhores práticas de desenvolvimento web moderno, garantindo:
- Código limpo e bem documentado
- Performance otimizada
- Acessibilidade básica
- Manutenibilidade 