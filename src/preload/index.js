import { contextBridge, ipcRenderer } from 'electron'

const api = {
  products: {
    getAll: () => ipcRenderer.invoke('products:getAll'),
    getByBarcode: (barcode) => ipcRenderer.invoke('products:getByBarcode', barcode),
    add: (data) => ipcRenderer.invoke('products:add', data),
    update: (data) => ipcRenderer.invoke('products:update', data),
    delete: (id) => ipcRenderer.invoke('products:delete', id)
  },
  accounts: {
    getAll: () => ipcRenderer.invoke('accounts:getAll'),
    add: (data) => ipcRenderer.invoke('accounts:add', data),
    delete: (id) => ipcRenderer.invoke('accounts:delete', id),
    updateBalance: (data) => ipcRenderer.invoke('accounts:updateBalance', data),
    getTransactions: (id) => ipcRenderer.invoke('accounts:getTransactions', id)
  },
  sales: {
    make: (data) => ipcRenderer.invoke('sales:make', data),
    getItems: (id) => ipcRenderer.invoke('sales:getItems', id)
  },
  reports: {
    get: (data) => ipcRenderer.invoke('reports:get', data)
  },
  settings: {
    reset: () => ipcRenderer.invoke('settings:reset')
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.api = api
}
