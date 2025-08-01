// Dados simulados para demonstração
let currentUser = null;

// Lista de clientes para autocomplete
const clients = [
    { code: "CLI001", name: "Cliente 1" },
    { code: "CLI002", name: "Cliente 2" },
    { code: "CLI003", name: "Cliente 3" },
    { code: "CLI004", name: "Empresa ABC Ltda" },
    { code: "CLI005", name: "Comércio XYZ" },
    { code: "CLI006", name: "Distribuidora Central" },
    { code: "CLI007", name: "Loja do Bairro" },
    { code: "CLI008", name: "Supermercado Popular" }
];

// Lista de produtos para autocomplete
const products = [
    { code: "PROD001", name: "Produto A" },
    { code: "PROD002", name: "Produto B" },
    { code: "PROD003", name: "Produto C" },
    { code: "PROD004", name: "Produto D" },
    { code: "PROD005", name: "Produto E" },
    { code: "PROD006", name: "Produto F" },
    { code: "PROD007", name: "Produto G" },
    { code: "PROD008", name: "Produto H" },
    { code: "PROD009", name: "Produto I" },
    { code: "PROD010", name: "Produto J" },
    { code: "PROD011", name: "Produto K" },
    { code: "PROD012", name: "Produto L" }
];

let orders = [
    {
        id: 1,
        number: "PED-001",
        client: "Cliente 1",
        clientCode: "CLI001",
        date: "2024-01-15",
        status: "pendente",
        items: [
            { id: 1, name: "Produto A", code: "PROD001", quantity: 5, confirmed: false, confirmedQuantity: 0 },
            { id: 2, name: "Produto B", code: "PROD002", quantity: 3, confirmed: false, confirmedQuantity: 0 },
            { id: 3, name: "Produto C", code: "PROD003", quantity: 2, confirmed: false, confirmedQuantity: 0 }
        ]
    },
    {
        id: 2,
        number: "PED-002",
        client: "Cliente 2",
        clientCode: "CLI002",
        date: "2024-01-16",
        status: "pendente",
        items: [
            { id: 4, name: "Produto D", code: "PROD004", quantity: 4, confirmed: false, confirmedQuantity: 0 },
            { id: 5, name: "Produto E", code: "PROD005", quantity: 1, confirmed: false, confirmedQuantity: 0 }
        ]
    },
    {
        id: 3,
        number: "PED-003",
        client: "Cliente 3",
        clientCode: "CLI003",
        date: "2024-01-17",
        status: "separado",
        items: [
            { id: 6, name: "Produto F", code: "PROD006", quantity: 6, confirmed: true, confirmedQuantity: 6 },
            { id: 7, name: "Produto G", code: "PROD007", quantity: 2, confirmed: true, confirmedQuantity: 2 }
        ]
    },
    {
        id: 4,
        number: "PED-004",
        client: "Empresa ABC Ltda",
        clientCode: "CLI004",
        date: "2024-01-18",
        status: "pendente",
        items: [
            { id: 8, name: "Produto H", code: "PROD008", quantity: 10, confirmed: true, confirmedQuantity: 7 },
            { id: 9, name: "Produto I", code: "PROD009", quantity: 3, confirmed: false, confirmedQuantity: 0 }
        ]
    }
];

let currentOrder = null;

// Verificar se está na tela de login ou na aplicação principal
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (loginForm) {
        // Tela de login
        setupLogin();
    } else {
        // Aplicação principal
        setupMainApp();
    }
});

// Configuração da tela de login
function setupLogin() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Validação simples (admin/123)
        if (username === 'admin' && password === '123') {
            currentUser = username;
            localStorage.setItem('currentUser', username);
            window.location.href = 'pedidos.html';
        } else {
            errorMessage.textContent = 'Usuário ou senha incorretos!';
            errorMessage.style.display = 'block';
            
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 3000);
        }
    });
}

// Configuração da aplicação principal
function setupMainApp() {
    // Verificar se usuário está logado
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = savedUser;
    document.getElementById('currentUser').textContent = currentUser;
    
    // Configurar eventos
    setupEventListeners();
    
    // Preencher data de saída com a data de hoje
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateFilter').value = today;
    
    // Carregar dados iniciais
    loadOrders();
    updateStats();
}

// Configurar event listeners
function setupEventListeners() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
    
    // Filtros
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    
    // Autocomplete para clientes e produtos
    setupClientAutocomplete();
    setupProductAutocomplete();
    
    // Modal
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelModal').addEventListener('click', closeModal);
    document.getElementById('saveOrder').addEventListener('click', saveOrderChanges);
    
    // Fechar modal clicando fora
    document.getElementById('orderModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    // Relatórios
    document.getElementById('reportsBtn').addEventListener('click', openReportsModal);
    document.getElementById('closeReportsModal').addEventListener('click', closeReportsModal);
    document.getElementById('closeReportsModalBtn').addEventListener('click', closeReportsModal);
    
    // Tabs de relatórios
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchReportTab(this.dataset.tab);
        });
    });
    
    // Gerar relatórios
    document.getElementById('generateSeparatedReport').addEventListener('click', generateSeparatedReport);
    document.getElementById('generatePendingReport').addEventListener('click', generatePendingReport);
    document.getElementById('generateMissingReport').addEventListener('click', generateMissingReport);
    
    // Exportar relatórios
    document.getElementById('exportPDF').addEventListener('click', exportToPDF);
    document.getElementById('printReport').addEventListener('click', printReport);
    
    // Fechar modal de relatórios clicando fora
    document.getElementById('reportsModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeReportsModal();
        }
    });
}

// Carregar lista de pedidos
function loadOrders(filteredOrders = null) {
    const ordersList = document.getElementById('ordersList');
    const ordersToShow = filteredOrders || orders;
    
    ordersList.innerHTML = '';
    
    if (ordersToShow.length === 0) {
        ordersList.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-inbox fa-3x"></i>
                <p>Nenhum pedido encontrado</p>
            </div>
        `;
        return;
    }
    
    ordersToShow.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersList.appendChild(orderCard);
    });
}

// Criar card de pedido
function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = `order-card ${order.status}`;
    card.dataset.orderId = order.id;
    
    const confirmedItems = order.items.filter(item => item.confirmed).length;
    const totalItems = order.items.length;
    
    card.innerHTML = `
        <div class="order-header">
            <div class="order-number">${order.number}</div>
            <div class="order-status ${order.status}">${order.status}</div>
        </div>
        <div class="order-details">
            <div class="order-detail">
                <div class="detail-label">Cliente</div>
                <div class="detail-value">${order.client}</div>
            </div>
            <div class="order-detail">
                <div class="detail-label">Data</div>
                <div class="detail-value">${formatDate(order.date)}</div>
            </div>
            <div class="order-detail">
                <div class="detail-label">Itens</div>
                <div class="detail-value">${confirmedItems}/${totalItems} confirmados</div>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => openOrderModal(order));
    
    return card;
}

// Abrir modal de detalhes do pedido
function openOrderModal(order) {
    currentOrder = order;
    const modal = document.getElementById('orderModal');
    
    // Preencher informações do pedido
    document.getElementById('modalTitle').textContent = `Pedido ${order.number}`;
    document.getElementById('modalOrderNumber').textContent = order.number;
    document.getElementById('modalClient').textContent = order.client;
    document.getElementById('modalDate').textContent = formatDate(order.date);
    document.getElementById('modalStatus').textContent = order.status;
    
    // Carregar itens
    loadOrderItems(order);
    
    modal.style.display = 'block';
}

// Carregar itens do pedido no modal
function loadOrderItems(order) {
    const itemsList = document.getElementById('modalItemsList');
    itemsList.innerHTML = '';
    
    order.items.forEach(item => {
        const itemCard = createItemCard(item);
        itemsList.appendChild(itemCard);
    });
}

// Criar card de item
function createItemCard(item) {
    const card = document.createElement('div');
    const isConfirmed = item.confirmed;
    const isQuantityLess = item.confirmedQuantity > 0 && item.confirmedQuantity < item.quantity;
    
    let cardClass = 'item-card';
    if (isConfirmed) {
        cardClass += ' confirmado';
    }
    if (isQuantityLess) {
        cardClass += ' quantidade-menor';
    }
    
    card.className = cardClass;
    card.dataset.itemId = item.id;
    
    card.innerHTML = `
        <div class="item-header">
            <div>
                <div class="item-name">${item.name}</div>
                <div class="item-code">Código: ${item.code}</div>
            </div>
            <div class="item-quantity">
                <div class="quantity-label">Quantidade Solicitada</div>
                <div class="detail-value">${item.quantity}</div>
            </div>
        </div>
        <div class="item-details">
            <div class="item-quantity">
                <div class="quantity-label">Quantidade Confirmada</div>
                <input type="number" class="quantity-input" value="${item.confirmedQuantity}" min="0" max="${item.quantity * 2}">
            </div>
            <div class="item-actions">
                <button class="confirm-btn" ${isConfirmed ? 'disabled' : ''}>
                    <i class="fas ${isConfirmed ? 'fa-check' : 'fa-check-circle'}"></i>
                    ${isConfirmed ? 'Confirmado' : 'Confirmar'}
                </button>
                ${isConfirmed ? '<button class="edit-btn" onclick="editItem(' + item.id + ')"><i class="fas fa-edit"></i> Editar</button>' : ''}
            </div>
        </div>
    `;
    
    // Event listeners para o item
    const confirmBtn = card.querySelector('.confirm-btn');
    const quantityInput = card.querySelector('.quantity-input');
    
    if (!isConfirmed) {
        confirmBtn.addEventListener('click', () => confirmItem(item.id, quantityInput.value));
    }
    
    quantityInput.addEventListener('input', () => {
        const value = parseInt(quantityInput.value) || 0;
        if (value > item.quantity * 2) {
            quantityInput.value = item.quantity * 2;
        }
        updateItemCardStyle(card, value, item.quantity);
    });
    
    return card;
}

// Confirmar item
function confirmItem(itemId, quantity) {
    const quantityNum = parseInt(quantity) || 0;
    
    if (quantityNum <= 0) {
        alert('Por favor, informe uma quantidade válida!');
        return;
    }
    
    // Encontrar e atualizar o item
    const item = currentOrder.items.find(i => i.id === itemId);
    if (item) {
        item.confirmed = true;
        item.confirmedQuantity = quantityNum;
        
        // Verificar se todos os itens foram confirmados E com quantidade suficiente
        // Um pedido só é marcado como 'separado' quando TODOS os itens têm quantidade >= solicitada
        const allFullyConfirmed = currentOrder.items.every(i => 
            i.confirmed && i.confirmedQuantity >= i.quantity
        );
        if (allFullyConfirmed) {
            currentOrder.status = 'separado';
        }
        
        // Atualizar o modal
        loadOrderItems(currentOrder);
        
        // Atualizar a lista de pedidos
        loadOrders();
        updateStats();
        
        // Mostrar notificação
        const message = quantityNum < item.quantity ? 
            `Item confirmado com quantidade menor (${quantityNum}/${item.quantity})` : 
            'Item confirmado com sucesso!';
        showNotification(message, quantityNum < item.quantity ? 'warning' : 'success');
    }
}

// Salvar alterações do pedido
function saveOrderChanges() {
    // Atualizar o pedido na lista principal
    const orderIndex = orders.findIndex(o => o.id === currentOrder.id);
    if (orderIndex !== -1) {
        orders[orderIndex] = currentOrder;
    }
    
    // Aqui você faria a chamada para a API para salvar no backend
    console.log('Salvando alterações:', currentOrder);
    
    closeModal();
    loadOrders();
    updateStats();
    
    // Mostrar mensagem de sucesso
    showNotification('Pedido atualizado com sucesso!', 'success');
}

// Fechar modal
function closeModal() {
    document.getElementById('orderModal').style.display = 'none';
    currentOrder = null;
}

// Configurar autocomplete para clientes
function setupClientAutocomplete() {
    const clientInput = document.getElementById('clientFilter');
    const dropdown = document.getElementById('clientDropdown');
    
    clientInput.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        
        if (value.length < 2) {
            dropdown.style.display = 'none';
            return;
        }
        
        const filteredClients = clients.filter(client => 
            client.code.toLowerCase().includes(value) || 
            client.name.toLowerCase().includes(value)
        );
        
        if (filteredClients.length > 0) {
            dropdown.innerHTML = filteredClients.map(client => `
                <div class="autocomplete-item" data-code="${client.code}" data-name="${client.name}">
                    <div class="client-code">${client.code}</div>
                    <div class="client-name">${client.name}</div>
                </div>
            `).join('');
            
            dropdown.style.display = 'block';
            
            // Event listeners para os itens do dropdown
            dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
                item.addEventListener('click', function() {
                    const code = this.dataset.code;
                    const name = this.dataset.name;
                    clientInput.value = `${code} - ${name}`;
                    dropdown.style.display = 'none';
                });
            });
        } else {
            dropdown.style.display = 'none';
        }
    });
    
    // Fechar dropdown quando clicar fora
    document.addEventListener('click', function(e) {
        if (!clientInput.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

// Configurar autocomplete para produtos
function setupProductAutocomplete() {
    const productInput = document.getElementById('productFilter');
    const dropdown = document.getElementById('productDropdown');
    
    productInput.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        
        if (value.length < 2) {
            dropdown.style.display = 'none';
            return;
        }
        
        const filteredProducts = products.filter(product => 
            product.code.toLowerCase().includes(value) || 
            product.name.toLowerCase().includes(value)
        );
        
        if (filteredProducts.length > 0) {
            dropdown.innerHTML = filteredProducts.map(product => `
                <div class="autocomplete-item" data-code="${product.code}" data-name="${product.name}">
                    <div class="product-code">${product.code}</div>
                    <div class="product-name">${product.name}</div>
                </div>
            `).join('');
            
            dropdown.style.display = 'block';
            
            // Event listeners para os itens do dropdown
            dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
                item.addEventListener('click', function() {
                    const code = this.dataset.code;
                    const name = this.dataset.name;
                    productInput.value = `${code} - ${name}`;
                    dropdown.style.display = 'none';
                });
            });
        } else {
            dropdown.style.display = 'none';
        }
    });
    
    // Fechar dropdown quando clicar fora
    document.addEventListener('click', function(e) {
        if (!productInput.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

// Atualizar estilo do card do item baseado na quantidade
function updateItemCardStyle(card, confirmedQuantity, requestedQuantity) {
    card.classList.remove('quantidade-menor');
    
    if (confirmedQuantity > 0 && confirmedQuantity < requestedQuantity) {
        card.classList.add('quantidade-menor');
    }
}

// Editar item confirmado
function editItem(itemId) {
    const item = currentOrder.items.find(i => i.id === itemId);
    if (item) {
        item.confirmed = false;
        loadOrderItems(currentOrder);
    }
}

// Aplicar filtros
function applyFilters() {
    const dateFilter = document.getElementById('dateFilter').value;
    const client = document.getElementById('clientFilter').value;
    const product = document.getElementById('productFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    let filteredOrders = orders.filter(order => {
        // Filtro por data de saída (data exata)
        if (dateFilter && order.date !== dateFilter) return false;
        
        // Filtro por cliente
        if (client) {
            const clientMatch = order.client.toLowerCase().includes(client.toLowerCase()) ||
                              order.clientCode.toLowerCase().includes(client.toLowerCase());
            if (!clientMatch) return false;
        }
        
        // Filtro por status
        if (status && order.status !== status) return false;
        
        // Filtro por produto
        if (product) {
            const hasProduct = order.items.some(item => 
                item.name.toLowerCase().includes(product.toLowerCase()) || 
                item.code.toLowerCase().includes(product.toLowerCase())
            );
            if (!hasProduct) return false;
        }
        
        return true;
    });
    
    loadOrders(filteredOrders);
}

// Limpar filtros
function clearFilters() {
    document.getElementById('dateFilter').value = '';
    document.getElementById('clientFilter').value = '';
    document.getElementById('productFilter').value = '';
    document.getElementById('statusFilter').value = '';
    
    loadOrders();
}

// Atualizar estatísticas
function updateStats() {
    const pendingCount = orders.filter(order => order.status === 'pendente').length;
    const completedCount = orders.filter(order => order.status === 'separado').length;
    
    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('completedCount').textContent = completedCount;
}

// Formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    // Adicionar ao body
    document.body.appendChild(notification);
    
    // Mostrar
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Adicionar estilos para notificações
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        padding: 15px 20px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 10000;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-success {
        border-left: 4px solid #28a745;
    }
    
    .notification-success i {
        color: #28a745;
    }
    
    .notification-info {
        border-left: 4px solid #17a2b8;
    }
    
    .notification-info i {
        color: #17a2b8;
    }
    
    .notification-warning {
        border-left: 4px solid #ffc107;
    }
    
    .notification-warning i {
        color: #ffc107;
    }
    
    .no-orders {
        text-align: center;
        padding: 40px;
        color: #666;
    }
    
    .no-orders i {
        margin-bottom: 15px;
        opacity: 0.5;
    }
`;

// Adicionar estilos ao head
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Variáveis globais para relatórios
let currentReport = null;
let currentReportType = null;

// Funções de relatórios
function openReportsModal() {
    const modal = document.getElementById('reportsModal');
    modal.style.display = 'block';
    
    // Preencher datas com hoje
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('separatedDateFilter').value = today;
    document.getElementById('pendingDateFilter').value = today;
    
    // Limpar conteúdo anterior
    document.getElementById('separatedReportContent').innerHTML = '';
    document.getElementById('pendingReportContent').innerHTML = '';
    document.getElementById('missingReportContent').innerHTML = '';
}

function closeReportsModal() {
    document.getElementById('reportsModal').style.display = 'none';
    currentReport = null;
    currentReportType = null;
}

function switchReportTab(tabName) {
    // Remover classe active de todas as tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.report-tab').forEach(tab => tab.classList.remove('active'));
    
    // Adicionar classe active na tab selecionada
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Relatório de Pedidos Separados
function generateSeparatedReport() {
    const dateFilter = document.getElementById('separatedDateFilter').value;
    const filteredOrders = orders.filter(order => {
        if (dateFilter && order.date !== dateFilter) return false;
        return order.status === 'separado';
    });
    
    const content = document.getElementById('separatedReportContent');
    
    if (filteredOrders.length === 0) {
        content.innerHTML = '<p class="no-data">Nenhum pedido separado encontrado para a data selecionada.</p>';
        return;
    }
    
    const summary = `
        <div class="report-summary">
            <h4>Resumo do Relatório</h4>
            <div class="summary-stats">
                <div class="summary-stat">
                    <div class="number">${filteredOrders.length}</div>
                    <div class="label">Pedidos Separados</div>
                </div>
                <div class="summary-stat">
                    <div class="number">${filteredOrders.reduce((total, order) => total + order.items.length, 0)}</div>
                    <div class="label">Total de Itens</div>
                </div>
            </div>
        </div>
    `;
    
    const table = `
        <table class="report-table">
            <thead>
                <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Data</th>
                    <th>Itens</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${filteredOrders.map(order => `
                    <tr>
                        <td>${order.number}</td>
                        <td>${order.client}</td>
                        <td>${formatDate(order.date)}</td>
                        <td>${order.items.length}</td>
                        <td><span class="status-badge separado">Separado</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    content.innerHTML = summary + table;
    currentReport = { type: 'separated', data: filteredOrders, date: dateFilter };
    currentReportType = 'separated';
}

// Relatório de Pedidos Pendentes
function generatePendingReport() {
    const dateFilter = document.getElementById('pendingDateFilter').value;
    const filteredOrders = orders.filter(order => {
        if (dateFilter && order.date !== dateFilter) return false;
        return order.status === 'pendente';
    });
    
    const content = document.getElementById('pendingReportContent');
    
    if (filteredOrders.length === 0) {
        content.innerHTML = '<p class="no-data">Nenhum pedido pendente encontrado para a data selecionada.</p>';
        return;
    }
    
    const summary = `
        <div class="report-summary">
            <h4>Resumo do Relatório</h4>
            <div class="summary-stats">
                <div class="summary-stat">
                    <div class="number">${filteredOrders.length}</div>
                    <div class="label">Pedidos Pendentes</div>
                </div>
                <div class="summary-stat">
                    <div class="number">${filteredOrders.reduce((total, order) => total + order.items.filter(item => !item.confirmed).length, 0)}</div>
                    <div class="label">Itens Pendentes</div>
                </div>
            </div>
        </div>
    `;
    
    let tableRows = '';
    filteredOrders.forEach(order => {
        const pendingItems = order.items.filter(item => !item.confirmed);
        const confirmedItems = order.items.filter(item => item.confirmed);
        
        if (pendingItems.length > 0) {
            tableRows += `
                <tr>
                    <td rowspan="${pendingItems.length + 1}">${order.number}</td>
                    <td rowspan="${pendingItems.length + 1}">${order.client}</td>
                    <td rowspan="${pendingItems.length + 1}">${formatDate(order.date)}</td>
                    <td colspan="3"><strong>Itens Pendentes:</strong></td>
                </tr>
            `;
            
            pendingItems.forEach(item => {
                tableRows += `
                    <tr>
                        <td>${item.name} (${item.code})</td>
                        <td>${item.quantity}</td>
                        <td>0</td>
                        <td>${item.quantity}</td>
                    </tr>
                `;
            });
        }
    });
    
    const table = `
        <table class="report-table">
            <thead>
                <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Data</th>
                    <th>Produto</th>
                    <th>Quantidade Pedida</th>
                    <th>Quantidade Separada</th>
                    <th>Quantidade Faltante</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
    
    content.innerHTML = summary + table;
    currentReport = { type: 'pending', data: filteredOrders, date: dateFilter };
    currentReportType = 'pending';
}

// Relatório de Produtos Faltantes
function generateMissingReport() {
    const departmentFilter = document.getElementById('departmentFilter').value;
    
    // Coletar todos os produtos faltantes
    let missingProducts = {};
    
    orders.forEach(order => {
        if (order.status === 'pendente') {
            order.items.forEach(item => {
                if (!item.confirmed || item.confirmedQuantity < item.quantity) {
                    const missingQty = item.quantity - (item.confirmedQuantity || 0);
                    const key = `${item.code}-${item.name}`;
                    
                    if (!missingProducts[key]) {
                        missingProducts[key] = {
                            code: item.code,
                            name: item.name,
                            totalMissing: 0,
                            departments: new Set()
                        };
                    }
                    
                    missingProducts[key].totalMissing += missingQty;
                    // Simular departamento baseado no código do produto
                    const dept = getDepartmentFromCode(item.code);
                    missingProducts[key].departments.add(dept);
                }
            });
        }
    });
    
    // Filtrar por departamento se especificado
    if (departmentFilter) {
        Object.keys(missingProducts).forEach(key => {
            if (!missingProducts[key].departments.has(departmentFilter)) {
                delete missingProducts[key];
            }
        });
    }
    
    const content = document.getElementById('missingReportContent');
    
    if (Object.keys(missingProducts).length === 0) {
        content.innerHTML = '<p class="no-data">Nenhum produto faltante encontrado.</p>';
        return;
    }
    
    const summary = `
        <div class="report-summary">
            <h4>Resumo do Relatório</h4>
            <div class="summary-stats">
                <div class="summary-stat">
                    <div class="number">${Object.keys(missingProducts).length}</div>
                    <div class="label">Produtos Faltantes</div>
                </div>
                <div class="summary-stat">
                    <div class="number">${Object.values(missingProducts).reduce((total, product) => total + product.totalMissing, 0)}</div>
                    <div class="label">Total de Unidades</div>
                </div>
            </div>
        </div>
    `;
    
    const table = `
        <table class="report-table">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Produto</th>
                    <th>Quantidade Faltante</th>
                    <th>Departamento</th>
                </tr>
            </thead>
            <tbody>
                ${Object.values(missingProducts).map(product => `
                    <tr>
                        <td>${product.code}</td>
                        <td>${product.name}</td>
                        <td><strong>${product.totalMissing}</strong></td>
                        <td>${Array.from(product.departments).join(', ')}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    content.innerHTML = summary + table;
    currentReport = { type: 'missing', data: missingProducts, department: departmentFilter };
    currentReportType = 'missing';
}

// Função auxiliar para determinar departamento baseado no código
function getDepartmentFromCode(code) {
    const codeNum = parseInt(code.replace(/\D/g, ''));
    if (codeNum <= 3) return 'eletronicos';
    if (codeNum <= 6) return 'vestuario';
    if (codeNum <= 9) return 'casa';
    return 'esporte';
}

// Exportar para PDF
function exportToPDF() {
    if (!currentReport) {
        showNotification('Gere um relatório primeiro!', 'warning');
        return;
    }
    
    // Simular exportação para PDF
    showNotification('Exportando para PDF...', 'info');
    
    setTimeout(() => {
        showNotification('Relatório exportado com sucesso!', 'success');
    }, 2000);
}

// Imprimir relatório
function printReport() {
    if (!currentReport) {
        showNotification('Gere um relatório primeiro!', 'warning');
        return;
    }
    
    const reportContent = document.querySelector('.report-tab.active .report-content');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Relatório - Sistema de Expedição</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
                    th { background: #f5f5f5; }
                    .report-header { text-align: center; margin-bottom: 30px; }
                    .report-summary { background: #e3f2fd; padding: 15px; margin-bottom: 20px; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <div class="report-header">
                    <h1>Sistema de Controle de Expedição</h1>
                    <h2>Relatório - ${getReportTitle()}</h2>
                    <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
                </div>
                ${reportContent.innerHTML}
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

function getReportTitle() {
    switch (currentReportType) {
        case 'separated': return 'Pedidos Separados';
        case 'pending': return 'Pedidos Pendentes';
        case 'missing': return 'Produtos Faltantes';
        default: return 'Relatório';
    }
} 