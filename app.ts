// Inventory Management System - Part 1
// Industrial Dark Theme UI
// Author: Congzheng Zhu
// PROG2005 Assignment 2

// ========== 类型定义 ==========
type Category = 'Electronics' | 'Furniture' | 'Clothing' | 'Tools' | 'Miscellaneous';
type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';
type PopularItem = 'Yes' | 'No';

interface InventoryItem {
    itemId: number;
    itemName: string;
    category: Category;
    quantity: number;
    price: number;
    supplierName: string;
    stockStatus: StockStatus;
    popularItem: PopularItem;
    comment?: string;
}

// ========== 数据存储 ==========
let inventory: InventoryItem[] = [];
let nextId: number = 1;
let activityLog: { time: string; action: string; itemName: string }[] = [];

// ========== 初始化示例数据 ==========
function initializeSampleData(): void {
    const sampleItems: Omit<InventoryItem, 'itemId'>[] = [
        { itemName: 'Gaming Laptop', category: 'Electronics', quantity: 15, price: 1299.99, supplierName: 'TechDistro Inc.', stockStatus: 'In Stock', popularItem: 'Yes', comment: 'Best seller' },
        { itemName: 'Office Desk', category: 'Furniture', quantity: 3, price: 299.99, supplierName: 'FurnitureWorld', stockStatus: 'Low Stock', popularItem: 'No', comment: 'Ergonomic design' },
        { itemName: 'Wireless Mouse', category: 'Electronics', quantity: 0, price: 29.99, supplierName: 'Accessories Plus', stockStatus: 'Out of Stock', popularItem: 'No' },
        { itemName: 'Leather Jacket', category: 'Clothing', quantity: 8, price: 199.99, supplierName: 'FashionHub', stockStatus: 'In Stock', popularItem: 'Yes', comment: 'Winter collection' },
        { itemName: 'Cordless Drill', category: 'Tools', quantity: 12, price: 89.99, supplierName: 'ToolMaster', stockStatus: 'In Stock', popularItem: 'No' }
    ];
    sampleItems.forEach(item => addItem(item, false));
}

// ========== 核心功能 ==========
function addItem(itemData: Omit<InventoryItem, 'itemId'>, showToastMsg: boolean = true): InventoryItem | null {
    const exists = inventory.some(i => i.itemName.toLowerCase() === itemData.itemName.toLowerCase());
    if (exists) {
        showToast(`❌ Item "${itemData.itemName}" already exists!`, 'error');
        return null;
    }
    
    const newItem: InventoryItem = { ...itemData, itemId: nextId++ };
    inventory.push(newItem);
    
    addToActivityLog('➕ Added', newItem.itemName);
    if (showToastMsg) showToast(`✅ Item "${newItem.itemName}" added!`, 'success');
    updateDashboardStats();
    return newItem;
}

function updateItemByName(itemName: string, updatedData: Partial<InventoryItem>, showToastMsg: boolean = true): boolean {
    const item = inventory.find(i => i.itemName.toLowerCase() === itemName.toLowerCase());
    if (!item) {
        if (showToastMsg) showToast(`❌ Item "${itemName}" not found!`, 'error');
        return false;
    }
    
    if (updatedData.itemName && updatedData.itemName.toLowerCase() !== itemName.toLowerCase()) {
        const exists = inventory.some(i => i.itemName.toLowerCase() === updatedData.itemName!.toLowerCase());
        if (exists) {
            if (showToastMsg) showToast(`❌ Item "${updatedData.itemName}" already exists!`, 'error');
            return false;
        }
    }
    
    Object.assign(item, updatedData);
    addToActivityLog('✏️ Updated', item.itemName);
    if (showToastMsg) showToast(`✏️ Item "${itemName}" updated!`, 'success');
    updateDashboardStats();
    return true;
}

function deleteItemByName(itemName: string, showToastMsg: boolean = true): boolean {
    const index = inventory.findIndex(i => i.itemName.toLowerCase() === itemName.toLowerCase());
    if (index === -1) {
        if (showToastMsg) showToast(`❌ Item "${itemName}" not found!`, 'error');
        return false;
    }
    
    if (confirm(`⚠️ Are you sure you want to delete "${itemName}"? This cannot be undone.`)) {
        const deletedItem = inventory[index];
        inventory.splice(index, 1);
        addToActivityLog('🗑️ Deleted', deletedItem.itemName);
        if (showToastMsg) showToast(`🗑️ Item "${itemName}" deleted!`, 'success');
        updateDashboardStats();
        return true;
    }
    return false;
}

function searchItemsByName(searchTerm: string): InventoryItem[] {
    if (!searchTerm.trim()) return [];
    return inventory.filter(i => i.itemName.toLowerCase().includes(searchTerm.toLowerCase()));
}

function getAllItems(): InventoryItem[] { return [...inventory]; }
function getPopularItems(): InventoryItem[] { return inventory.filter(i => i.popularItem === 'Yes'); }
function getItemsByStockStatus(status: StockStatus): InventoryItem[] { return inventory.filter(i => i.stockStatus === status); }

function addToActivityLog(action: string, itemName: string): void {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    activityLog.unshift({ time: timeStr, action, itemName });
    if (activityLog.length > 20) activityLog.pop();
    renderActivityLog();
}

// ========== UI 渲染 ==========
function showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function updateDashboardStats(): void {
    document.getElementById('totalItems')!.textContent = inventory.length.toString();
    document.getElementById('inStockCount')!.textContent = getItemsByStockStatus('In Stock').length.toString();
    document.getElementById('popularCount')!.textContent = getPopularItems().length.toString();
    
    document.getElementById('kpiTotal')!.textContent = inventory.length.toString();
    document.getElementById('kpiInStock')!.textContent = getItemsByStockStatus('In Stock').length.toString();
    document.getElementById('kpiLowStock')!.textContent = getItemsByStockStatus('Low Stock').length.toString();
    document.getElementById('kpiOutStock')!.textContent = getItemsByStockStatus('Out of Stock').length.toString();
    document.getElementById('kpiPopular')!.textContent = getPopularItems().length.toString();
}

function renderActivityLog(): void {
    const container = document.getElementById('recentActivity');
    if (!container) return;
    if (activityLog.length === 0) {
        container.innerHTML = '<div class="activity-item" style="color: #5a6b7f;">No recent activity</div>';
        return;
    }
    container.innerHTML = activityLog.slice(0, 10).map(log => `
        <div class="activity-item">
            <span class="activity-time">[${log.time}]</span>
            <span>${log.action}</span>
            <strong style="color: #28a745;">${escapeHtml(log.itemName)}</strong>
        </div>
    `).join('');
}

function renderItemsGrid(items: InventoryItem[], containerId: string): void {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (items.length === 0) {
        container.innerHTML = '<div class="empty-state">📭 No items found</div>';
        return;
    }
    
    container.innerHTML = items.map(item => `
        <div class="item-card">
            <div class="item-header">
                <div><div class="item-name">${escapeHtml(item.itemName)}</div><div class="item-id">ID: ${item.itemId}</div></div>
                <div>${item.popularItem === 'Yes' ? '<span class="popular-badge">⭐ Popular</span>' : ''}</div>
            </div>
            <div class="item-body">
                <div class="info-row"><span class="info-label">Category</span><span>${item.category}</span></div>
                <div class="info-row"><span class="info-label">Quantity</span><span>${item.quantity}</span></div>
                <div class="info-row"><span class="info-label">Price</span><span>$${item.price.toFixed(2)}</span></div>
                <div class="info-row"><span class="info-label">Supplier</span><span>${escapeHtml(item.supplierName)}</span></div>
                <div class="info-row"><span class="info-label">Stock Status</span><span class="stock-badge stock-${item.stockStatus.replace(/\s/g, '')}">${getStockIcon(item.stockStatus)} ${item.stockStatus}</span></div>
                ${item.comment ? `<div class="info-row"><span class="info-label">Comment</span><span>${escapeHtml(item.comment)}</span></div>` : ''}
            </div>
            <div class="item-footer"><button class="btn-edit" onclick="editItemFromCard('${escapeHtml(item.itemName)}')">✏️ Edit</button></div>
        </div>
    `).join('');
}

function getStockIcon(status: string): string {
    switch(status) {
        case 'In Stock': return '🟢';
        case 'Low Stock': return '🟡';
        case 'Out of Stock': return '⚫';
        default: return '';
    }
}

function formatDate(dateString: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-AU');
}

function escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ========== 表单操作 ==========
function getFormData(): Omit<InventoryItem, 'itemId'> {
    return {
        itemName: (document.getElementById('itemName') as HTMLInputElement).value.trim(),
        category: (document.getElementById('category') as HTMLSelectElement).value as Category,
        quantity: parseInt((document.getElementById('quantity') as HTMLInputElement).value),
        price: parseFloat((document.getElementById('price') as HTMLInputElement).value),
        supplierName: (document.getElementById('supplierName') as HTMLInputElement).value.trim(),
        stockStatus: (document.getElementById('stockStatus') as HTMLSelectElement).value as StockStatus,
        popularItem: (document.getElementById('popularItem') as HTMLSelectElement).value as PopularItem,
        comment: (document.getElementById('comment') as HTMLInputElement).value.trim() || undefined
    };
}

function validateFormData(data: Omit<InventoryItem, 'itemId'>): boolean {
    if (!data.itemName) { showToast('❌ Item Name is required!', 'error'); return false; }
    if (!data.supplierName) { showToast('❌ Supplier Name is required!', 'error'); return false; }
    if (isNaN(data.quantity) || data.quantity < 0) { showToast('❌ Quantity must be 0 or greater!', 'error'); return false; }
    if (isNaN(data.price) || data.price < 0) { showToast('❌ Price must be 0 or greater!', 'error'); return false; }
    return true;
}

function clearForm(): void {
    (document.getElementById('itemName') as HTMLInputElement).value = '';
    (document.getElementById('category') as HTMLSelectElement).value = 'Electronics';
    (document.getElementById('quantity') as HTMLInputElement).value = '0';
    (document.getElementById('price') as HTMLInputElement).value = '0';
    (document.getElementById('supplierName') as HTMLInputElement).value = '';
    (document.getElementById('stockStatus') as HTMLSelectElement).value = 'In Stock';
    (document.getElementById('popularItem') as HTMLSelectElement).value = 'No';
    (document.getElementById('comment') as HTMLInputElement).value = '';
}

function setFormData(item: InventoryItem): void {
    (document.getElementById('itemName') as HTMLInputElement).value = item.itemName;
    (document.getElementById('category') as HTMLSelectElement).value = item.category;
    (document.getElementById('quantity') as HTMLInputElement).value = item.quantity.toString();
    (document.getElementById('price') as HTMLInputElement).value = item.price.toString();
    (document.getElementById('supplierName') as HTMLInputElement).value = item.supplierName;
    (document.getElementById('stockStatus') as HTMLSelectElement).value = item.stockStatus;
    (document.getElementById('popularItem') as HTMLSelectElement).value = item.popularItem;
    (document.getElementById('comment') as HTMLInputElement).value = item.comment || '';
}

(window as any).editItemFromCard = function(itemName: string): void {
    const item = inventory.find(i => i.itemName === itemName);
    if (item) {
        setFormData(item);
        switchView('add');
        showToast(`📝 Editing "${itemName}" - click Update to save`, 'info');
    }
};

// ========== 视图切换 ==========
function switchView(viewName: string): void {
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    document.getElementById(`${viewName}View`)?.classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if ((item as HTMLElement).dataset.view === viewName) item.classList.add('active');
    });
    
    if (viewName === 'inventory') renderItemsGrid(getAllItems(), 'inventoryList');
    else if (viewName === 'popular') renderItemsGrid(getPopularItems(), 'popularList');
    else if (viewName === 'dashboard') { updateDashboardStats(); renderActivityLog(); }
}

// ========== 事件处理 ==========
function handleAddItem(): void {
    const formData = getFormData();
    if (!validateFormData(formData)) return;
    const result = addItem(formData);
    if (result) { clearForm(); renderItemsGrid(getAllItems(), 'inventoryList'); updateDashboardStats(); }
}

function handleUpdateItem(): void {
    const itemName = (document.getElementById('itemName') as HTMLInputElement).value.trim();
    if (!itemName) { showToast('❌ Please enter Item Name to update!', 'error'); return; }
    const formData = getFormData();
    if (!validateFormData(formData)) return;
    if (updateItemByName(itemName, formData)) {
        clearForm();
        renderItemsGrid(getAllItems(), 'inventoryList');
        renderItemsGrid(getPopularItems(), 'popularList');
        updateDashboardStats();
    }
}

function handleDeleteItem(): void {
    const itemName = (document.getElementById('deleteInput') as HTMLInputElement).value.trim();
    if (!itemName) { showToast('❌ Please enter Item Name to delete!', 'error'); return; }
    if (deleteItemByName(itemName)) {
        (document.getElementById('deleteInput') as HTMLInputElement).value = '';
        renderItemsGrid(getAllItems(), 'inventoryList');
        renderItemsGrid(getPopularItems(), 'popularList');
        updateDashboardStats();
    }
}

function handleSearch(): void {
    const searchTerm = (document.getElementById('searchInput') as HTMLInputElement).value.trim();
    if (!searchTerm) { showToast('🔍 Please enter a search term!', 'info'); return; }
    const results = searchItemsByName(searchTerm);
    renderItemsGrid(results, 'inventoryList');
    if (results.length === 0) showToast(`No items matching "${searchTerm}"`, 'info');
    else showToast(`Found ${results.length} item(s)`, 'success');
}

function handleResetSearch(): void {
    (document.getElementById('searchInput') as HTMLInputElement).value = '';
    renderItemsGrid(getAllItems(), 'inventoryList');
}

// ========== 初始化 ==========
function init(): void {
    initializeSampleData();
    
    document.getElementById('addBtn')?.addEventListener('click', handleAddItem);
    document.getElementById('updateBtn')?.addEventListener('click', handleUpdateItem);
    document.getElementById('deleteBtn')?.addEventListener('click', handleDeleteItem);
    document.getElementById('searchBtn')?.addEventListener('click', handleSearch);
    document.getElementById('resetSearchBtn')?.addEventListener('click', handleResetSearch);
    document.getElementById('clearFormBtn')?.addEventListener('click', clearForm);
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const view = (e.currentTarget as HTMLElement).dataset.view;
            if (view) switchView(view);
        });
    });
    
    updateDashboardStats();
    renderItemsGrid(getAllItems(), 'inventoryList');
    renderItemsGrid(getPopularItems(), 'popularList');
    renderActivityLog();
    switchView('dashboard');
}

init();