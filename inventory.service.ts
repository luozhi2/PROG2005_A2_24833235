import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Category = 'Electronics' | 'Furniture' | 'Clothing' | 'Tools' | 'Miscellaneous';
export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';
export type PopularItem = 'Yes' | 'No';

export interface InventoryItem {
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

export interface ActivityLog {
  time: string;
  action: string;
  itemName: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private inventory: InventoryItem[] = [];
  private nextId: number = 1;
  private activityLogs: ActivityLog[] = [];
  
  private inventorySubject = new BehaviorSubject<InventoryItem[]>([]);
  private logsSubject = new BehaviorSubject<ActivityLog[]>([]);

  constructor() {
    this.initializeSampleData();
  }

  getInventory(): Observable<InventoryItem[]> {
    return this.inventorySubject.asObservable();
  }

  getActivityLogs(): Observable<ActivityLog[]> {
    return this.logsSubject.asObservable();
  }

  private initializeSampleData(): void {
    const samples = [
      { itemName: 'Gaming Laptop', category: 'Electronics' as Category, quantity: 15, price: 1299.99, supplierName: 'TechDistro Inc.', stockStatus: 'In Stock' as StockStatus, popularItem: 'Yes' as PopularItem, comment: 'Best seller' },
      { itemName: 'Office Desk', category: 'Furniture' as Category, quantity: 3, price: 299.99, supplierName: 'FurnitureWorld', stockStatus: 'Low Stock' as StockStatus, popularItem: 'No' as PopularItem, comment: 'Ergonomic design' },
      { itemName: 'Wireless Mouse', category: 'Electronics' as Category, quantity: 0, price: 29.99, supplierName: 'Accessories Plus', stockStatus: 'Out of Stock' as StockStatus, popularItem: 'No' as PopularItem },
      { itemName: 'Leather Jacket', category: 'Clothing' as Category, quantity: 8, price: 199.99, supplierName: 'FashionHub', stockStatus: 'In Stock' as StockStatus, popularItem: 'Yes' as PopularItem, comment: 'Winter collection' },
      { itemName: 'Cordless Drill', category: 'Tools' as Category, quantity: 12, price: 89.99, supplierName: 'ToolMaster', stockStatus: 'In Stock' as StockStatus, popularItem: 'No' as PopularItem }
    ];
    samples.forEach(s => this.addItem(s, false));
  }

  private addToLog(action: string, itemName: string): void {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.activityLogs.unshift({ time: timeStr, action, itemName });
    if (this.activityLogs.length > 20) this.activityLogs.pop();
    this.logsSubject.next([...this.activityLogs]);
  }

  addItem(itemData: Omit<InventoryItem, 'itemId'>, showLog: boolean = true): { success: boolean; message: string } {
    const exists = this.inventory.some(i => i.itemName.toLowerCase() === itemData.itemName.toLowerCase());
    if (exists) return { success: false, message: `Item "${itemData.itemName}" already exists!` };
    
    const newItem = { ...itemData, itemId: this.nextId++ };
    this.inventory.push(newItem);
    if (showLog) this.addToLog('➕ Added', newItem.itemName);
    this.inventorySubject.next([...this.inventory]);
    return { success: true, message: `✅ "${newItem.itemName}" added!` };
  }

  updateItem(itemName: string, updatedData: Partial<InventoryItem>): { success: boolean; message: string } {
    const index = this.inventory.findIndex(i => i.itemName.toLowerCase() === itemName.toLowerCase());
    if (index === -1) return { success: false, message: `Item "${itemName}" not found!` };
    
    if (updatedData.itemName && updatedData.itemName.toLowerCase() !== itemName.toLowerCase()) {
      const exists = this.inventory.some(i => i.itemName.toLowerCase() === updatedData.itemName!.toLowerCase());
      if (exists) return { success: false, message: `Item "${updatedData.itemName}" already exists!` };
    }
    
    this.inventory[index] = { ...this.inventory[index], ...updatedData };
    this.addToLog('✏️ Updated', this.inventory[index].itemName);
    this.inventorySubject.next([...this.inventory]);
    return { success: true, message: `✏️ "${itemName}" updated!` };
  }

  deleteItem(itemName: string): { success: boolean; message: string } {
    const index = this.inventory.findIndex(i => i.itemName.toLowerCase() === itemName.toLowerCase());
    if (index === -1) return { success: false, message: `Item "${itemName}" not found!` };
    
    const deleted = this.inventory[index];
    this.inventory.splice(index, 1);
    this.addToLog('🗑️ Deleted', deleted.itemName);
    this.inventorySubject.next([...this.inventory]);
    return { success: true, message: `🗑️ "${itemName}" deleted!` };
  }

  searchItems(term: string): InventoryItem[] {
    if (!term.trim()) return [];
    return this.inventory.filter(i => i.itemName.toLowerCase().includes(term.toLowerCase()));
  }

  getAllItems(): InventoryItem[] { return [...this.inventory]; }
  getPopularItems(): InventoryItem[] { return this.inventory.filter(i => i.popularItem === 'Yes'); }
  getItemsByStockStatus(status: StockStatus): InventoryItem[] { return this.inventory.filter(i => i.stockStatus === status); }
  
  getStats() {
    return {
      total: this.inventory.length,
      inStock: this.getItemsByStockStatus('In Stock').length,
      lowStock: this.getItemsByStockStatus('Low Stock').length,
      outStock: this.getItemsByStockStatus('Out of Stock').length,
      popular: this.getPopularItems().length
    };
  }
}