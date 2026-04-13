import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'

let db

function getDb() {
  if (!db) {
    const dbPath = join(app.getPath('userData'), 'kantin.db')
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    initSchema()
  }
  return db
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      balance REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS account_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER REFERENCES accounts(id),
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total REAL NOT NULL,
      payment_type TEXT NOT NULL,
      account_id INTEGER REFERENCES accounts(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER REFERENCES sales(id),
      product_id INTEGER REFERENCES products(id),
      product_name TEXT NOT NULL,
      product_price REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS kantin_balance_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      sale_id INTEGER REFERENCES sales(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Migrations — ALTER TABLE hata vermez, try-catch ile geç
  const migrations = [
    'ALTER TABLE products ADD COLUMN purchase_price REAL DEFAULT 0',
    'ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0',
    'ALTER TABLE sale_items ADD COLUMN product_purchase_price REAL DEFAULT 0'
  ]
  for (const sql of migrations) {
    try { db.exec(sql) } catch (_) { /* kolon zaten var */ }
  }
}

// ── Settings ──────────────────────────────────────────────────────────────────

export function getAdminPassword() {
  const row = getDb().prepare('SELECT value FROM settings WHERE key = ?').get('admin_password')
  return row ? row.value : null
}

export function setAdminPassword(password) {
  getDb()
    .prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
    .run('admin_password', password)
}

// ── Products ──────────────────────────────────────────────────────────────────

export function getAllProducts() {
  return getDb().prepare('SELECT * FROM products ORDER BY name').all()
}

export function getProductByBarcode(barcode) {
  return getDb().prepare('SELECT * FROM products WHERE barcode = ?').get(barcode) || null
}

export function addProduct(barcode, name, price, purchasePrice, stock) {
  return getDb()
    .prepare(
      'INSERT INTO products (barcode, name, price, purchase_price, stock) VALUES (?, ?, ?, ?, ?)'
    )
    .run(barcode, name, price, purchasePrice || 0, stock || 0)
}

export function updateProduct(id, name, price, purchasePrice, stock) {
  return getDb()
    .prepare(
      'UPDATE products SET name = ?, price = ?, purchase_price = ?, stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    )
    .run(name, price, purchasePrice || 0, stock || 0, id)
}

export function deleteProduct(id) {
  return getDb().prepare('DELETE FROM products WHERE id = ?').run(id)
}

// ── Accounts ──────────────────────────────────────────────────────────────────

export function getAllAccounts() {
  return getDb().prepare('SELECT * FROM accounts ORDER BY name').all()
}

export function addAccount(name) {
  return getDb().prepare('INSERT INTO accounts (name) VALUES (?)').run(name)
}

export function deleteAccount(id) {
  const database = getDb()
  const doDelete = database.transaction(() => {
    database.prepare('DELETE FROM account_transactions WHERE account_id = ?').run(id)
    database.prepare('DELETE FROM accounts WHERE id = ?').run(id)
  })
  doDelete()
}

export function updateAccountBalance(accountId, amount, type, description) {
  const database = getDb()
  const doUpdate = database.transaction(() => {
    database.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(amount, accountId)
    database
      .prepare(
        'INSERT INTO account_transactions (account_id, amount, type, description) VALUES (?, ?, ?, ?)'
      )
      .run(accountId, amount, type, description)
  })
  doUpdate()
  return database.prepare('SELECT * FROM accounts WHERE id = ?').get(accountId)
}

export function getAccountTransactions(accountId) {
  return getDb()
    .prepare(
      'SELECT * FROM account_transactions WHERE account_id = ? ORDER BY created_at DESC'
    )
    .all(accountId)
}

// ── Sales ─────────────────────────────────────────────────────────────────────

export function makeSale(items, total, paymentType, accountId) {
  const database = getDb()
  const doSale = database.transaction(() => {
    const sale = database
      .prepare('INSERT INTO sales (total, payment_type, account_id) VALUES (?, ?, ?)')
      .run(total, paymentType, accountId || null)
    const saleId = sale.lastInsertRowid

    for (const item of items) {
      // Güncel alış fiyatını ürün tablosundan al
      const product = database.prepare('SELECT purchase_price FROM products WHERE id = ?').get(item.id)
      const purchasePrice = product ? (product.purchase_price || 0) : 0

      database
        .prepare(
          'INSERT INTO sale_items (sale_id, product_id, product_name, product_price, product_purchase_price, quantity) VALUES (?, ?, ?, ?, ?, ?)'
        )
        .run(saleId, item.id, item.name, item.price, purchasePrice, item.quantity)

      // Stok düş
      database
        .prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?')
        .run(item.quantity, item.id)
    }

    database
      .prepare('INSERT INTO kantin_balance_log (amount, type, sale_id) VALUES (?, ?, ?)')
      .run(total, `sale_${paymentType}`, saleId)

    if (paymentType === 'hesap' && accountId) {
      database
        .prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?')
        .run(total, accountId)
      database
        .prepare(
          'INSERT INTO account_transactions (account_id, amount, type, description) VALUES (?, ?, ?, ?)'
        )
        .run(accountId, -total, 'sale', `Satış #${saleId}`)
    }

    return saleId
  })
  return doSale()
}

export function getSaleItems(saleId) {
  return getDb().prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(saleId)
}

// ── Reports ───────────────────────────────────────────────────────────────────

export function getSalesReport(startDate, endDate) {
  const database = getDb()

  const sales = database
    .prepare(
      `SELECT s.*, a.name as account_name
       FROM sales s
       LEFT JOIN accounts a ON s.account_id = a.id
       WHERE date(s.created_at) >= date(?) AND date(s.created_at) <= date(?)
       ORDER BY s.created_at DESC`
    )
    .all(startDate, endDate)

  const summary = database
    .prepare(
      `SELECT
         COUNT(*) as total_sales,
         COALESCE(SUM(total), 0) as total_revenue,
         COALESCE(SUM(CASE WHEN payment_type = 'nakit' THEN total ELSE 0 END), 0) as nakit_revenue,
         COALESCE(SUM(CASE WHEN payment_type = 'hesap' THEN total ELSE 0 END), 0) as hesap_revenue
       FROM sales
       WHERE date(created_at) >= date(?) AND date(created_at) <= date(?)`
    )
    .get(startDate, endDate)

  const netProfitRow = database
    .prepare(
      `SELECT COALESCE(SUM((si.product_price - si.product_purchase_price) * si.quantity), 0) as net_profit
       FROM sale_items si
       JOIN sales s ON si.sale_id = s.id
       WHERE date(s.created_at) >= date(?) AND date(s.created_at) <= date(?)`
    )
    .get(startDate, endDate)

  const topProducts = database
    .prepare(
      `SELECT
         si.product_name,
         SUM(si.quantity) as total_quantity,
         SUM(si.product_price * si.quantity) as total_revenue
       FROM sale_items si
       JOIN sales s ON si.sale_id = s.id
       WHERE date(s.created_at) >= date(?) AND date(s.created_at) <= date(?)
       GROUP BY si.product_name
       ORDER BY total_quantity DESC
       LIMIT 10`
    )
    .all(startDate, endDate)

  const balanceRow = database
    .prepare('SELECT COALESCE(SUM(amount), 0) as total FROM kantin_balance_log')
    .get()

  const accountsRow = database
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN balance > 0 THEN balance ELSE 0 END), 0) as total_credit,
         ABS(COALESCE(SUM(CASE WHEN balance < 0 THEN balance ELSE 0 END), 0)) as total_debt
       FROM accounts`
    )
    .get()

  return {
    sales,
    summary,
    topProducts,
    kantinBalance: balanceRow.total,
    netProfit: netProfitRow.net_profit,
    accountsSummary: {
      totalCredit: accountsRow.total_credit,
      totalDebt: accountsRow.total_debt
    }
  }
}

// ── Reset ─────────────────────────────────────────────────────────────────────

export function resetDatabase() {
  const database = getDb()
  const doReset = database.transaction(() => {
    database.exec(`
      DELETE FROM kantin_balance_log;
      DELETE FROM sale_items;
      DELETE FROM sales;
      DELETE FROM account_transactions;
      DELETE FROM accounts;
      DELETE FROM products;
    `)
    // settings (admin şifresi) silinmez
  })
  doReset()
}
