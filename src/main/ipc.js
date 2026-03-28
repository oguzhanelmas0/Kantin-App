import { ipcMain } from 'electron'
import {
  getAllProducts,
  getProductByBarcode,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllAccounts,
  addAccount,
  deleteAccount,
  updateAccountBalance,
  getAccountTransactions,
  makeSale,
  getSaleItems,
  getSalesReport,
  resetDatabase
} from './database'

export function registerIpcHandlers() {
  // Products
  ipcMain.handle('products:getAll', () => getAllProducts())
  ipcMain.handle('products:getByBarcode', (_, barcode) => getProductByBarcode(barcode))
  ipcMain.handle('products:add', (_, { barcode, name, price }) => addProduct(barcode, name, price))
  ipcMain.handle('products:update', (_, { id, name, price }) => updateProduct(id, name, price))
  ipcMain.handle('products:delete', (_, id) => deleteProduct(id))

  // Accounts
  ipcMain.handle('accounts:getAll', () => getAllAccounts())
  ipcMain.handle('accounts:add', (_, { name }) => addAccount(name))
  ipcMain.handle('accounts:delete', (_, id) => deleteAccount(id))
  ipcMain.handle('accounts:updateBalance', (_, { accountId, amount, type, description }) =>
    updateAccountBalance(accountId, amount, type, description)
  )
  ipcMain.handle('accounts:getTransactions', (_, accountId) => getAccountTransactions(accountId))

  // Sales
  ipcMain.handle('sales:make', (_, { items, total, paymentType, accountId }) =>
    makeSale(items, total, paymentType, accountId)
  )
  ipcMain.handle('sales:getItems', (_, saleId) => getSaleItems(saleId))

  // Reports
  ipcMain.handle('reports:get', (_, { startDate, endDate }) => getSalesReport(startDate, endDate))

  // Settings
  ipcMain.handle('settings:reset', () => resetDatabase())
}
