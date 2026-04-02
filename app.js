"use strict";
// Inventory Management System - Part 1
// Industrial Dark Theme UI
// Author: [你的名字]
// PROG2005 Assignment 2
// ========== 数据存储 ==========
let inventory = [];
let nextId = 1;
let activityLog = [];
// ========== 初始化示例数据 ==========
function initializeSampleData() {
    const sampleItems = [
        { itemName: 'Gaming Laptop', category: 'Electronics', quantity: 15, price: 1299.99, supplierName: 'TechDistro Inc.', stockStatus: 'In Stock', popularItem: 'Yes', comment: 'Best seller' },
        { itemName: 'Office Desk', category: 'Furniture', quantity: 3, price: 299.99, supplierName: 'FurnitureWorld', stockStatus: 'Low Stock', popularItem: 'No', comment: 'Ergonomic design' },
        { itemName: 'Wireless Mouse', category: 'Electronics', quantity: 0, price: 29.99, supplierName: 'Accessories Plus', stockStatus: 'Out of Stock', popularItem: 'No' },
        { itemName: 'Leather Jacket', category: 'Clothing', quantity: 8, price: 199.99, supplierName: 'FashionHub', stockStatus: 'In Stock', popularItem: 'Yes', comment: 'Winter collection' },
        { itemName: 'Cordless Drill', category: 'Tools', quantity: 12, price: 89.99, supplierName: 'ToolMaster', stockStatus: 'In Stock', popularItem: 'No' }
    ];
    sampleItems.forEach(item => addItem(item, false));
}
// ========== 核心功能 ==========
function addItem(itemData, showToastMsg = true) {
    const exists = inventory.some(i => i.itemName.toLowerCase() === itemData.itemName.toLowerCase());
    if (exists) {
        showToast(`❌ Item "${itemData.itemName}" already exists!`, 'error');
        return null;
    }
    const newItem = { ...itemData, itemId: nextId++ };
    inventory.push(newItem);
    addToActivityLog('➕ Added', newItem.itemName);
    if (showToastMsg)
        showToast(`✅ Item "${newItem.itemName}" added!`, 'success');
    updateDashboardStats();
    return newItem;
}
function updateItemByName(itemName, updatedData, showToastMsg = true) {
    const item = inventory.find(i => i.itemName.toLowerCase() === itemName.toLowerCase());
    if (!item) {
        if (showToastMsg)
            showToast(`❌ Item "${itemName}" not found!`, 'error');
        return false;
    }
    if (updatedData.itemName && updatedData.itemName.toLowerCase() !== itemName.toLowerCase()) {
        const exists = inventory.some(i => i.itemName.toLowerCase() === updatedData.itemName.toLowerCase());
        if (exists) {
            if (showToastMsg)
                showToast(`❌ Item "${updatedData.itemName}" already exists!`, 'error');
            return false;
        }
    }
    Object.assign(item, updatedData);
    addToActivityLog('✏️ Updated', item.itemName);
    if (showToastMsg)
        showToast(`✏️ Item "${itemName}" updated!`, 'success');
    updateDashboardStats();
    return true;
}
function deleteItemByName(itemName, showToastMsg = true) {
    const index = inventory.findIndex(i => i.itemName.toLowerCase() === itemName.toLowerCase());
    if (index === -1) {
        if (showToastMsg)
            showToast(`❌ Item "${itemName}" not found!`, 'error');
        return false;
    }
    if (confirm(`⚠️ Are you sure you want to delete "${itemName}"? This cannot be undone.`)) {
        const deletedItem = inventory[index];
        inventory.splice(index, 1);
        addToActivityLog('🗑️ Deleted', deletedItem.itemName);
        if (showToastMsg)
            showToast(`🗑️ Item "${itemName}" deleted!`, 'success');
        updateDashboardStats();
        return true;
    }
    return false;
}
function searchItemsByName(searchTerm) {
    if (!searchTerm.trim())
        return [];
    return inventory.filter(i => i.itemName.toLowerCase().includes(searchTerm.toLowerCase()));
}
function getAllItems() { return [...inventory]; }
function getPopularItems() { return inventory.filter(i => i.popularItem === 'Yes'); }
function getItemsByStockStatus(status) { return inventory.filter(i => i.stockStatus === status); }
function addToActivityLog(action, itemName) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    activityLog.unshift({ time: timeStr, action, itemName });
    if (activityLog.length > 20)
        activityLog.pop();
    renderActivityLog();
}
// ========== UI 渲染 ==========
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast)
        return;
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}
function updateDashboardStats() {
    document.getElementById('totalItems').textContent = inventory.length.toString();
    document.getElementById('inStockCount').textContent = getItemsByStockStatus('In Stock').length.toString();
    document.getElementById('popularCount').textContent = getPopularItems().length.toString();
    document.getElementById('kpiTotal').textContent = inventory.length.toString();
    document.getElementById('kpiInStock').textContent = getItemsByStockStatus('In Stock').length.toString();
    document.getElementById('kpiLowStock').textContent = getItemsByStockStatus('Low Stock').length.toString();
    document.getElementById('kpiOutStock').textContent = getItemsByStockStatus('Out of Stock').length.toString();
    document.getElementById('kpiPopular').textContent = getPopularItems().length.toString();
}
function renderActivityLog() {
    const container = document.getElementById('recentActivity');
    if (!container)
        return;
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
function renderItemsGrid(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container)
        return;
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
function getStockIcon(status) {
    switch (status) {
        case 'In Stock': return '🟢';
        case 'Low Stock': return '🟡';
        case 'Out of Stock': return '⚫';
        default: return '';
    }
}
function formatDate(dateString) {
    if (!dateString)
        return '-';
    return new Date(dateString).toLocaleDateString('en-AU');
}
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
// ========== 表单操作 ==========
function getFormData() {
    return {
        itemName: document.getElementById('itemName').value.trim(),
        category: document.getElementById('category').value,
        quantity: parseInt(document.getElementById('quantity').value),
        price: parseFloat(document.getElementById('price').value),
        supplierName: document.getElementById('supplierName').value.trim(),
        stockStatus: document.getElementById('stockStatus').value,
        popularItem: document.getElementById('popularItem').value,
        comment: document.getElementById('comment').value.trim() || undefined
    };
}
function validateFormData(data) {
    if (!data.itemName) {
        showToast('❌ Item Name is required!', 'error');
        return false;
    }
    if (!data.supplierName) {
        showToast('❌ Supplier Name is required!', 'error');
        return false;
    }
    if (isNaN(data.quantity) || data.quantity < 0) {
        showToast('❌ Quantity must be 0 or greater!', 'error');
        return false;
    }
    if (isNaN(data.price) || data.price < 0) {
        showToast('❌ Price must be 0 or greater!', 'error');
        return false;
    }
    return true;
}
function clearForm() {
    document.getElementById('itemName').value = '';
    document.getElementById('category').value = 'Electronics';
    document.getElementById('quantity').value = '0';
    document.getElementById('price').value = '0';
    document.getElementById('supplierName').value = '';
    document.getElementById('stockStatus').value = 'In Stock';
    document.getElementById('popularItem').value = 'No';
    document.getElementById('comment').value = '';
}
function setFormData(item) {
    document.getElementById('itemName').value = item.itemName;
    document.getElementById('category').value = item.category;
    document.getElementById('quantity').value = item.quantity.toString();
    document.getElementById('price').value = item.price.toString();
    document.getElementById('supplierName').value = item.supplierName;
    document.getElementById('stockStatus').value = item.stockStatus;
    document.getElementById('popularItem').value = item.popularItem;
    document.getElementById('comment').value = item.comment || '';
}
window.editItemFromCard = function (itemName) {
    const item = inventory.find(i => i.itemName === itemName);
    if (item) {
        setFormData(item);
        switchView('add');
        showToast(`📝 Editing "${itemName}" - click Update to save`, 'info');
    }
};
// ========== 视图切换 ==========
function switchView(viewName) {
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    document.getElementById(`${viewName}View`)?.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === viewName)
            item.classList.add('active');
    });
    if (viewName === 'inventory')
        renderItemsGrid(getAllItems(), 'inventoryList');
    else if (viewName === 'popular')
        renderItemsGrid(getPopularItems(), 'popularList');
    else if (viewName === 'dashboard') {
        updateDashboardStats();
        renderActivityLog();
    }
}
// ========== 事件处理 ==========
function handleAddItem() {
    const formData = getFormData();
    if (!validateFormData(formData))
        return;
    const result = addItem(formData);
    if (result) {
        clearForm();
        renderItemsGrid(getAllItems(), 'inventoryList');
        updateDashboardStats();
    }
}
function handleUpdateItem() {
    const itemName = document.getElementById('itemName').value.trim();
    if (!itemName) {
        showToast('❌ Please enter Item Name to update!', 'error');
        return;
    }
    const formData = getFormData();
    if (!validateFormData(formData))
        return;
    if (updateItemByName(itemName, formData)) {
        clearForm();
        renderItemsGrid(getAllItems(), 'inventoryList');
        renderItemsGrid(getPopularItems(), 'popularList');
        updateDashboardStats();
    }
}
function handleDeleteItem() {
    const itemName = document.getElementById('deleteInput').value.trim();
    if (!itemName) {
        showToast('❌ Please enter Item Name to delete!', 'error');
        return;
    }
    if (deleteItemByName(itemName)) {
        document.getElementById('deleteInput').value = '';
        renderItemsGrid(getAllItems(), 'inventoryList');
        renderItemsGrid(getPopularItems(), 'popularList');
        updateDashboardStats();
    }
}
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (!searchTerm) {
        showToast('🔍 Please enter a search term!', 'info');
        return;
    }
    const results = searchItemsByName(searchTerm);
    renderItemsGrid(results, 'inventoryList');
    if (results.length === 0)
        showToast(`No items matching "${searchTerm}"`, 'info');
    else
        showToast(`Found ${results.length} item(s)`, 'success');
}
function handleResetSearch() {
    document.getElementById('searchInput').value = '';
    renderItemsGrid(getAllItems(), 'inventoryList');
}
// ========== 初始化 ==========
function init() {
    initializeSampleData();
    document.getElementById('addBtn')?.addEventListener('click', handleAddItem);
    document.getElementById('updateBtn')?.addEventListener('click', handleUpdateItem);
    document.getElementById('deleteBtn')?.addEventListener('click', handleDeleteItem);
    document.getElementById('searchBtn')?.addEventListener('click', handleSearch);
    document.getElementById('resetSearchBtn')?.addEventListener('click', handleResetSearch);
    document.getElementById('clearFormBtn')?.addEventListener('click', clearForm);
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            if (view)
                switchView(view);
        });
    });
    updateDashboardStats();
    renderItemsGrid(getAllItems(), 'inventoryList');
    renderItemsGrid(getPopularItems(), 'popularList');
    renderActivityLog();
    switchView('dashboard');
}
init();
