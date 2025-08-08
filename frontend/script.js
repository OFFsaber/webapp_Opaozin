// Configuração da API
const API_BASE_URL = window.location.origin + '/api';

// Dados da aplicação
let currentUser = null;
let orders = [];
let clients = [];
let products = [];

// Funções de API
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro na requisição API:', error);
        throw error;
    }
}

// Carregar dados da API
async function loadDataFromAPI() {
    try {
        // Carregar pedidos
        const pedidosResponse = await apiRequest('/pedidos');
        orders = pedidosResponse.data || [];
        
        // Carregar opções de filtros
        const filtrosResponse = await apiRequest('/pedidos/opcoes-filtros');
        const filtrosData = filtrosResponse.data || {};
        
        clients = filtrosData.clientes || [];
        products = []; // Produtos serão carregados conforme necessário
        
        // Atualizar dropdowns
        updateFilterDropdowns(filtrosData);
        
        return true;
    } catch (error) {
        console.error('Erro ao carregar dados da API:', error);
        showNotification('Erro ao carregar dados do servidor', 'error');
        return false;
    }
}

// Atualizar dropdowns de filtros
function updateFilterDropdowns(filtrosData) {
    // Atualizar dropdown de motoristas
    const driverFilter = document.getElementById('driverFilter');
    if (driverFilter) {
        driverFilter.innerHTML = '<option value="">Todos os motoristas</option>';
        filtrosData.motoristas?.forEach(motorista => {
            driverFilter.innerHTML += `<option value="${motorista.CODIGO}">${motorista.NOME}</option>`;
        });
    }
    
    // Atualizar dropdown de veículos
    const vehicleFilter = document.getElementById('vehicleFilter');
    if (vehicleFilter) {
        vehicleFilter.innerHTML = '<option value="">Todos os veículos</option>';
        filtrosData.veiculos?.forEach(veiculo => {
            vehicleFilter.innerHTML += `<option value="${veiculo.CODIGO}">${veiculo.DESCRICAO}</option>`;
        });
    }
    
    // Atualizar dropdown de clientes
    const clientFilter = document.getElementById('clientFilter');
    if (clientFilter) {
        clientFilter.innerHTML = '<option value="">Todos os clientes</option>';
        filtrosData.clientes?.forEach(cliente => {
            clientFilter.innerHTML += `<option value="${cliente.CODIGO}">${cliente.NOME}</option>`;
        });
    }
    
    // Atualizar dropdown de vendedores
    const vendedorFilter = document.getElementById('vendedorFilter');
    if (vendedorFilter) {
        vendedorFilter.innerHTML = '<option value="">Todos os vendedores</option>';
        filtrosData.vendedores?.forEach(vendedor => {
            vendedorFilter.innerHTML += `<option value="${vendedor.CODIGO}">${vendedor.NOME}</option>`;
        });
    }
    
    // Atualizar dropdown de transportadoras
    const transportadoraFilter = document.getElementById('transportadoraFilter');
    if (transportadoraFilter) {
        transportadoraFilter.innerHTML = '<option value="">Todas as transportadoras</option>';
        filtrosData.transportadoras?.forEach(transportadora => {
            transportadoraFilter.innerHTML += `<option value="${transportadora.CODIGO}">${transportadora.NOME}</option>`;
        });
    }
    
    // Atualizar dropdown de cargas
    const numCargaFilter = document.getElementById('numCargaFilter');
    if (numCargaFilter && filtrosData.cargas) {
        // Para cargas, vamos criar um datalist para autocomplete
        const datalist = document.createElement('datalist');
        datalist.id = 'cargasList';
        filtrosData.cargas.forEach(carga => {
            const option = document.createElement('option');
            option.value = carga.NUMCARGA;
            datalist.appendChild(option);
        });
        
        // Remover datalist anterior se existir
        const existingDatalist = document.getElementById('cargasList');
        if (existingDatalist) {
            existingDatalist.remove();
        }
        
        document.body.appendChild(datalist);
        numCargaFilter.setAttribute('list', 'cargasList');
    }
}

let currentOrder = null;

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Aplicação iniciando...');
    
    // Verificar se estamos na página de login ou na aplicação principal
    const isLoginPage = window.location.pathname.includes('index.html') || window.location.pathname === '/';
    
    if (isLoginPage) {
        console.log('📝 Configurando página de login...');
        setupLogin();
    } else {
        console.log('🏠 Configurando aplicação principal...');
        setupMainApp();
    }
});

// Garantir que a data seja preenchida após todo o carregamento
window.addEventListener('load', function() {
    const today = new Date().toISOString().split('T')[0];
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter && !dateFilter.value) {
        dateFilter.value = today;
        console.log('📅 Data atual preenchida no window.load:', today);
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
async function setupMainApp() {
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
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.value = today;
        console.log('📅 Data atual preenchida:', today);
    } else {
        console.error('❌ Elemento dateFilter não encontrado');
    }
    
    // Carregar dados da API
    const success = await loadDataFromAPI();
    if (success) {
        // Carregar dados iniciais
        loadOrders();
        updateStats();
    }
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
    document.getElementById('closeModal').addEventListener('click', function() {
        console.log('🔒 Botão X clicado');
        closeModal();
    });
    document.getElementById('cancelModal').addEventListener('click', function() {
        console.log('🔒 Botão Cancelar clicado');
        closeModal();
    });
    document.getElementById('saveOrder').addEventListener('click', function() {
        console.log('💾 Botão Salvar clicado');
        saveOrderChanges();
        closeModal();
    });
    
    // Fechar modal clicando fora
    document.getElementById('orderModal').addEventListener('click', function(e) {
        if (e.target === this) {
            console.log('🔒 Clicou fora do modal');
            closeModal();
        }
    });
    
    // Fechar modal com tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('orderModal');
            if (modal && modal.style.display !== 'none') {
                console.log('🔒 Tecla ESC pressionada');
                closeModal();
            }
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
    document.getElementById('generateMissingByClientReport').addEventListener('click', generateMissingByClientReport);
    
    // Exportar relatórios
    document.getElementById('exportPDF').addEventListener('click', exportToPDF);
    document.getElementById('printReport').addEventListener('click', printReport);
    
    // Fechar modal de relatórios clicando fora
    document.getElementById('reportsModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeReportsModal();
        }
    });
    
    // Garantir que a data seja preenchida quando a página carregar
    const today = new Date().toISOString().split('T')[0];
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter && !dateFilter.value) {
        dateFilter.value = today;
        console.log('📅 Data atual preenchida no evento:', today);
    }
}

// Carregar lista de pedidos
async function loadOrders(filteredOrders = null) {
    const ordersList = document.getElementById('ordersList');
    
    try {
        let ordersToShow = filteredOrders;
        
        if (!ordersToShow) {
            // Buscar pedidos da API
            const response = await apiRequest('/pedidos');
            ordersToShow = response.data || [];
        }
        
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
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        ordersList.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <p>Erro ao carregar pedidos</p>
            </div>
        `;
    }
}

// Criar card de pedido
function createOrderCard(order) {
    const card = document.createElement('div');
    const statusExpedicao = order.STATUS_EXPEDICAO || 'PENDENTE';
    const statusBit = order.STATUS_BIT !== null && order.STATUS_BIT !== undefined ? order.STATUS_BIT : 0;
    const isSeparado = statusExpedicao === 'SEPARADO' || statusBit === 1;
    
    card.className = `order-card ${isSeparado ? 'separado' : 'pendente'}`;
    card.dataset.orderId = order.NUMPEDIDO;
    
    card.innerHTML = `
        <div class="order-header">
            <div class="order-number">${order.NUMPEDIDO}</div>
            <div class="order-status ${isSeparado ? 'separado' : 'pendente'}">
                ${isSeparado ? 'Separado' : 'Pendente'}
            </div>
        </div>
        <div class="order-details">
            <div class="order-detail">
                <div class="detail-label">Cliente</div>
                <div class="detail-value">${order.CLIENTE}</div>
            </div>
            <div class="order-detail">
                <div class="detail-label">Data Saída</div>
                <div class="detail-value">${formatDate(order.DTSAIDA)}</div>
            </div>
            <div class="order-detail">
                <div class="detail-label">Data Entrega</div>
                <div class="detail-value">${formatDate(order.DTPREVENTREGA)}</div>
            </div>
            <div class="order-detail">
                <div class="detail-label">Motorista</div>
                <div class="detail-value">${order.MOTORISTA || 'N/A'}</div>
            </div>
            <div class="order-detail">
                <div class="detail-label">Veículo</div>
                <div class="detail-value">${order.VEICULO || 'N/A'}</div>
            </div>
            <div class="order-detail">
                <div class="detail-label">Produtos Faltantes</div>
                <div class="detail-value">${order.QTD_PRODUTOS_FALTANTES || 0}</div>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => openOrderModal(order));
    
    return card;
}

// Abrir modal de detalhes do pedido
async function openOrderModal(order) {
    try {
        // Usar os dados do pedido que já temos
        currentOrder = order;
        
        const modal = document.getElementById('orderModal');
        
        // Resetar propriedades CSS do modal para garantir que seja exibido
        modal.style.display = 'block';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.zIndex = '1000';
        modal.style.pointerEvents = 'auto';
        
        // Preencher informações do pedido (já temos esses dados)
        document.getElementById('modalTitle').textContent = `Pedido ${currentOrder.NUMPEDIDO}`;
        document.getElementById('modalOrderNumber').textContent = currentOrder.NUMPEDIDO;
        document.getElementById('modalClient').textContent = currentOrder.CLIENTE || 'N/A';
        document.getElementById('modalDepartureDate').textContent = currentOrder.DTSAIDA || 'N/A';
        document.getElementById('modalDeliveryDate').textContent = currentOrder.DTPREVENTREGA || 'N/A';
        document.getElementById('modalDriver').textContent = currentOrder.MOTORISTA || 'N/A';
        document.getElementById('modalVehicle').textContent = currentOrder.VEICULO || 'N/A';
        document.getElementById('modalMissingProducts').textContent = currentOrder.QTD_PRODUTOS_FALTANTES || '0';
        
        // Buscar itens do pedido
        const itensResponse = await apiRequest(`/pedidos/${currentOrder.NUMPEDIDO}/itens`);
        if (itensResponse.success) {
            currentOrder.itens = itensResponse.data;
            loadOrderItems(currentOrder);
        }
        
        // Status de expedição já está incluído nos dados do pedido
        console.log('Status de expedição:', currentOrder.STATUS_EXPEDICAO);
        
        console.log('Modal aberto com sucesso');
    } catch (error) {
        console.error('Erro ao abrir modal:', error);
        showNotification('Erro ao carregar detalhes do pedido', 'error');
    }
}

// Carregar itens do pedido no modal
function loadOrderItems(order) {
    const itemsList = document.getElementById('modalItemsList');
    itemsList.innerHTML = '';
    
    if (!order.itens || order.itens.length === 0) {
        itemsList.innerHTML = '<p>Nenhum item encontrado para este pedido.</p>';
        return;
    }
    
    order.itens.forEach(item => {
        const itemCard = createItemCard(item);
        itemsList.appendChild(itemCard);
    });
}

// Criar card de item
function createItemCard(item) {
    const card = document.createElement('div');
    const isConfirmed = item.QTENTREGUE > 0;
    const isFullyConfirmed = item.QTENTREGUE >= item.QTPEDIDA;
    const isPartiallyConfirmed = isConfirmed && !isFullyConfirmed;
    
    let cardClass = 'item-card';
    if (isFullyConfirmed) {
        cardClass += ' confirmado';
    } else if (isPartiallyConfirmed) {
        cardClass += ' quantidade-menor';
    }
    
    card.className = cardClass;
    card.dataset.itemId = item.ID;
    
    card.innerHTML = `
        <div class="item-header">
            <div>
                <div class="item-name">${item.PRODUTO || 'N/A'}</div>
                <div class="item-code">Código: ${item.CODPRODUTO || 'N/A'}</div>
            </div>
            <div class="item-quantity">
                <div class="quantity-label">Quantidade Solicitada</div>
                <div class="detail-value">${item.QTPEDIDA || 0}</div>
            </div>
        </div>
        <div class="item-details">
            <div class="item-quantity">
                <div class="quantity-label">Quantidade Entregue</div>
                <input type="number" class="quantity-input" value="${item.QTENTREGUE || 0}" min="0" max="${(item.QTPEDIDA || 0) * 2}">
            </div>
        </div>
    `;
    
    // Event listener apenas para o campo de quantidade
    const quantityInput = card.querySelector('.quantity-input');
    
    quantityInput.addEventListener('input', () => {
        const value = parseInt(quantityInput.value) || 0;
        if (value > (item.QTPEDIDA || 0) * 2) {
            quantityInput.value = (item.QTPEDIDA || 0) * 2;
        }
        updateItemCardStyle(card, value, item.QTPEDIDA || 0);
    });
    
    return card;
}



// Salvar alterações do pedido
async function saveOrderChanges() {
    try {
        if (!currentOrder) {
            showNotification('Nenhum pedido selecionado', 'error');
            return;
        }

        console.log('🔍 Salvando alterações do pedido:', currentOrder.NUMPEDIDO);

        // Coletar todas as quantidades dos campos de input
        const modal = document.getElementById('orderModal');
        const quantityInputs = modal.querySelectorAll('.quantity-input');
        const itensAtualizados = [];

        // Validar e coletar as quantidades
        for (let i = 0; i < quantityInputs.length; i++) {
            const input = quantityInputs[i];
            const itemId = input.closest('.item-card').dataset.itemId;
            const quantidadeDigitada = parseInt(input.value) || 0;
            const item = currentOrder.itens.find(item => item.ID.toString() === itemId);
            
            if (!item) {
                console.error(`❌ Item não encontrado: ${itemId}`);
                continue;
            }

            // Validar quantidade
            if (quantidadeDigitada < 0) {
                showNotification(`Quantidade inválida para o item ${item.PRODUTO}`, 'error');
                return;
            }

            if (quantidadeDigitada > item.QTPEDIDA * 2) {
                showNotification(`Quantidade muito alta para o item ${item.PRODUTO}`, 'error');
                return;
            }

            itensAtualizados.push({
                itemId: itemId,
                quantidadeEntregue: quantidadeDigitada,
                quantidadePedida: item.QTPEDIDA
            });

            // Atualizar o item no currentOrder
            item.QTENTREGUE = quantidadeDigitada;
            item.QTRESTANTE = Math.max(0, item.QTPEDIDA - quantidadeDigitada);
        }

        console.log('📊 Itens atualizados:', itensAtualizados);

        // Verificar se todos os itens estão completos (quantidade entregue >= quantidade pedida)
        const todosItensConfirmados = itensAtualizados.every(item => 
            item.quantidadeEntregue >= item.quantidadePedida
        );

        console.log('✅ Todos os itens confirmados:', todosItensConfirmados);

        // Salvar todas as quantidades via API
        const response = await apiRequest(`/pedidos/${currentOrder.NUMPEDIDO}/salvar-quantidades`, {
            method: 'POST',
            body: JSON.stringify({ 
                itens: itensAtualizados,
                status: todosItensConfirmados ? 1 : 0
            })
        });

        if (response.success) {
            console.log('✅ Quantidades e status salvos com sucesso:', response.data);
            showNotification(
                todosItensConfirmados 
                    ? 'Pedido marcado como separado com sucesso!' 
                    : 'Quantidades atualizadas com sucesso!', 
                'success'
            );
        } else {
            console.error('❌ Erro ao salvar quantidades:', response.message);
            showNotification(`Erro ao salvar quantidades: ${response.message}`, 'error');
            return;
        }

        // Recarregar a lista de pedidos e estatísticas
        await loadOrders();
        await updateStats();
        
        // Fechar o modal
        closeModal();
        
    } catch (error) {
        console.error('❌ Erro ao salvar alterações:', error);
        showNotification('Erro ao salvar alterações do pedido', 'error');
    }
}

// Fechar modal
function closeModal() {
    console.log('🔒 Tentando fechar modal...');
    const modal = document.getElementById('orderModal');
    if (modal) {
        console.log('✅ Modal encontrado, alterando display para none');
        
        // Múltiplas formas de esconder o modal
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        modal.style.zIndex = '-1';
        modal.style.pointerEvents = 'none';
        
        // Remover classes que possam estar interferindo
        modal.classList.remove('show', 'active');
        
        // NÃO limpar o conteúdo do modal - apenas esconder
        // const modalContent = modal.querySelector('.modal-content');
        // if (modalContent) {
        //     modalContent.style.display = 'none';
        // }
        
        currentOrder = null;
        console.log('✅ Modal fechado com sucesso');
        
        // Verificar se realmente fechou
        setTimeout(() => {
            if (modal.style.display !== 'none') {
                console.log('⚠️ Modal não fechou, tentando método alternativo');
                forceCloseModal();
            }
        }, 100);
    } else {
        console.error('❌ Modal não encontrado!');
    }
}

// Função alternativa para fechar modal (caso a primeira não funcione)
function forceCloseModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        modal.style.zIndex = '-1';
        modal.style.pointerEvents = 'none';
        modal.classList.remove('show', 'active');
        currentOrder = null;
        console.log('🔧 Modal forçado a fechar');
    }
}

// Configurar autocomplete para clientes
function setupClientAutocomplete() {
    const clientInput = document.getElementById('clientFilter');
    const dropdown = document.getElementById('clientDropdown');
    
    // Verificar se os elementos existem
    if (!clientInput || !dropdown) {
        console.log('⚠️ Elementos de autocomplete de clientes não encontrados');
        return;
    }
    
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
        if (clientInput && dropdown && !clientInput.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

// Configurar autocomplete para produtos
function setupProductAutocomplete() {
    const productInput = document.getElementById('productFilter');
    const dropdown = document.getElementById('productDropdown');
    
    // Verificar se os elementos existem
    if (!productInput || !dropdown) {
        console.log('⚠️ Elementos de autocomplete de produtos não encontrados');
        return;
    }
    
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
        if (productInput && dropdown && !productInput.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

// Atualizar estilo do card do item baseado na quantidade
function updateItemCardStyle(card, confirmedQuantity, requestedQuantity) {
    card.classList.remove('confirmado', 'quantidade-menor');
    
    if (confirmedQuantity >= requestedQuantity && confirmedQuantity > 0) {
        card.classList.add('confirmado'); // Verde - confirmado totalmente
    } else if (confirmedQuantity > 0 && confirmedQuantity < requestedQuantity) {
        card.classList.add('quantidade-menor'); // Amarelo - quantidade menor
    }
}

// Editar item confirmado
function editItem(itemId) {
    const item = currentOrder.itens.find(i => i.CODPRODUTO === itemId);
    if (item) {
        // Permitir edição do item
        const card = document.querySelector(`[data-item-id="${itemId}"]`);
        if (card) {
            const quantityInput = card.querySelector('.quantity-input');
            const confirmBtn = card.querySelector('.confirm-btn');
            
            quantityInput.disabled = false;
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i> Confirmar';
        }
    }
}

// Aplicar filtros
async function applyFilters() {
    const dateFilter = document.getElementById('dateFilter').value;
    const numPedidoFilter = document.getElementById('numPedidoFilter').value;
    const numCargaFilter = document.getElementById('numCargaFilter').value;
    const motorista = document.getElementById('driverFilter').value;
    const veiculo = document.getElementById('vehicleFilter').value;
    const client = document.getElementById('clientFilter').value;
    const vendedor = document.getElementById('vendedorFilter').value;
    const transportadora = document.getElementById('transportadoraFilter').value;
    
    try {
        // Construir query string para filtros
        const params = new URLSearchParams();
        if (dateFilter) {
            // Converter para formato de data esperado pelo backend
            const date = new Date(dateFilter);
            const dateStr = date.toISOString().split('T')[0];
            params.append('dataInicio', dateStr);
        }
        if (numPedidoFilter) params.append('numPedido', numPedidoFilter);
        if (numCargaFilter) params.append('numCarga', numCargaFilter);
        if (motorista) params.append('motorista', motorista);
        if (veiculo) params.append('veiculo', veiculo);
        if (client) params.append('cliente', client);
        if (vendedor) params.append('vendedor', vendedor);
        if (transportadora) params.append('transportadora', transportadora);
        
        // Buscar pedidos filtrados da API
        const response = await apiRequest(`/pedidos?${params.toString()}`);
        const filteredOrders = response.data || [];
        
        loadOrders(filteredOrders);
        showNotification(`Filtros aplicados. ${filteredOrders.length} pedido(s) encontrado(s).`, 'success');
    } catch (error) {
        console.error('Erro ao aplicar filtros:', error);
        showNotification('Erro ao aplicar filtros', 'error');
    }
}

// Limpar filtros
async function clearFilters() {
    // Não limpar a data, manter a data atual
    // document.getElementById('dateFilter').value = '';
    document.getElementById('numPedidoFilter').value = '';
    document.getElementById('numCargaFilter').value = '';
    document.getElementById('driverFilter').value = '';
    document.getElementById('vehicleFilter').value = '';
    document.getElementById('clientFilter').value = '';
    document.getElementById('vendedorFilter').value = '';
    document.getElementById('transportadoraFilter').value = '';
    
    await loadOrders();
}

// Atualizar estatísticas
async function updateStats() {
    try {
        const response = await apiRequest('/pedidos/estatisticas');
        const stats = response.data;
        
        document.getElementById('pendingCount').textContent = stats.PEDIDOS_PENDENTES || 0;
        document.getElementById('completedCount').textContent = stats.PEDIDOS_SEPARADOS || 0;
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        // Fallback para contagem local
        const pendentesCount = orders.filter(order => {
            const statusBit = order.STATUS_BIT !== null && order.STATUS_BIT !== undefined ? order.STATUS_BIT : 0;
            return order.STATUS_EXPEDICAO === 'PENDENTE' || statusBit === 0;
        }).length;
        const separadosCount = orders.filter(order => {
            const statusBit = order.STATUS_BIT !== null && order.STATUS_BIT !== undefined ? order.STATUS_BIT : 0;
            return order.STATUS_EXPEDICAO === 'SEPARADO' || statusBit === 1;
        }).length;
        
        document.getElementById('pendingCount').textContent = pendentesCount;
        document.getElementById('completedCount').textContent = separadosCount;
    }
}

// Formatar data
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Formatar moeda
function formatCurrency(value) {
    if (!value) return '0,00';
    return parseFloat(value).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Obter texto do status
function getStatusText(status) {
    const statusMap = {
        'B': 'Separado'
    };
    return statusMap[status] || status;
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
    
    content.innerHTML = '<p class="no-data">Relatório de pedidos separados em desenvolvimento.</p>';
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
    
    content.innerHTML = '<p class="no-data">Relatório de pedidos pendentes em desenvolvimento.</p>';
    currentReport = { type: 'pending', data: filteredOrders, date: dateFilter };
    currentReportType = 'pending';
}

// Relatório de Produtos Faltantes
function generateMissingReport() {
    const content = document.getElementById('missingReportContent');
    content.innerHTML = '<p class="no-data">Relatório de produtos faltantes em desenvolvimento.</p>';
    currentReport = { type: 'missing', data: {} };
    currentReportType = 'missing';
}

// Relatório de Produtos Faltantes por Cliente
function generateMissingByClientReport() {
    const content = document.getElementById('missingByClientReportContent');
    content.innerHTML = '<p class="no-data">Relatório de produtos faltantes por cliente em desenvolvimento.</p>';
    currentReport = { type: 'missingByClient', data: {} };
    currentReportType = 'missingByClient';
}

// Exportar para PDF
function exportToPDF() {
    if (!currentReport) {
        showNotification('Gere um relatório primeiro!', 'warning');
        return;
    }
    
    showNotification('Exportação para PDF em desenvolvimento.', 'info');
}

// Imprimir relatório
function printReport() {
    if (!currentReport) {
        showNotification('Gere um relatório primeiro!', 'warning');
        return;
    }
    
    showNotification('Impressão em desenvolvimento.', 'info');
}

// Exibir status de expedição
function displayStatusExpedicao(status) {
    const statusContainer = document.getElementById('statusExpedicao');
    if (!statusContainer) return;
    
    const isSeparado = status === 'SEPARADO' || status === 1;
    const statusClass = isSeparado ? 'success' : 'warning';
    const statusIcon = isSeparado ? '✅' : '⏳';
    const statusText = isSeparado ? 'Separado' : 'Pendente';
    
    statusContainer.innerHTML = `
        <div class="status-expedicao ${statusClass}">
            <span class="status-icon">${statusIcon}</span>
            <span class="status-text">${statusText}</span>
        </div>
    `;
}