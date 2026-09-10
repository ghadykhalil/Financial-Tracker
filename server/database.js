const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbExec = (sql) => {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

async function initDatabase() {
  await dbRun('PRAGMA foreign_keys = ON;');

  // Create tables
  await dbExec(`
    CREATE TABLE IF NOT EXISTS capital_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      initial_capital REAL NOT NULL DEFAULT 6900,
      shop_allocated_capital REAL NOT NULL DEFAULT 1400,
      lbp_rate REAL NOT NULL DEFAULT 89000
    );

    CREATE TABLE IF NOT EXISTS capital_deposits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL DEFAULT 0,
      source TEXT NOT NULL,
      date TEXT NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS daily_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL DEFAULT 0,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS installment_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      item_name TEXT NOT NULL,
      wholesale_price REAL NOT NULL DEFAULT 0,
      sold_price REAL NOT NULL DEFAULT 0,
      location TEXT,
      comment TEXT,
      status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS installment_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER NOT NULL,
      date_label TEXT NOT NULL,
      amount_due REAL NOT NULL DEFAULT 0,
      amount_received REAL NOT NULL DEFAULT 0,
      is_paid INTEGER NOT NULL DEFAULT 0,
      paid_at TEXT,
      notes TEXT,
      FOREIGN KEY (plan_id) REFERENCES installment_plans (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS shop_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      comment TEXT,
      category TEXT DEFAULT 'General',
      purchased INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS shop_profits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS sales_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_name TEXT NOT NULL,
      wholesale_price REAL NOT NULL DEFAULT 0,
      sold_price REAL NOT NULL DEFAULT 0,
      earned_amount REAL NOT NULL DEFAULT 0,
      remaining_balance REAL NOT NULL DEFAULT 0,
      profit REAL NOT NULL DEFAULT 0,
      bought_by TEXT,
      location TEXT,
      comment TEXT,
      sale_date TEXT
    );

    CREATE TABLE IF NOT EXISTS pricing_catalog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_name TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      buy_price_guide REAL DEFAULT 0,
      sell_price_guide REAL DEFAULT 0,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS capital_money_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fund_type TEXT NOT NULL DEFAULT 'main_net',
      location_name TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      notes TEXT
    );
  `);

  // Migration logic for existing databases
  try {
    await dbRun('ALTER TABLE capital_settings ADD COLUMN lbp_rate REAL NOT NULL DEFAULT 89000');
  } catch (err) {
    // Column already exists
  }

  const existingCapital = await dbGet('SELECT * FROM capital_settings WHERE id = 1');
  if (!existingCapital) {
    await dbRun('INSERT INTO capital_settings (id, initial_capital, shop_allocated_capital, lbp_rate) VALUES (1, 6900, 1400, 89000)');
  }

  // Seed default pricing catalog guide if empty
  const catalogCountRow = await dbGet('SELECT COUNT(*) as count FROM pricing_catalog');
  if (catalogCountRow && catalogCountRow.count === 0) {
    const seedCatalog = [
      { item_name: 'Lenovo Legion 5 (RTX 3060 / 16GB)', category: 'Laptops', buy: 650, sell: 820, notes: 'Target clean condition. Include original 230W charger.' },
      { item_name: 'HP Omen 16 (i7 / RTX 3070)', category: 'Laptops', buy: 750, sell: 950, notes: 'Check screen specs (144Hz+) and thermals before buying.' },
      { item_name: 'Gaming PC Desktop (i5 12th / RTX 3060)', category: 'Gaming PCs', buy: 500, sell: 680, notes: 'Standard mid-range gaming rig spec.' },
      { item_name: 'PS4 Slim 500GB / 1TB', category: 'Consoles', buy: 120, sell: 175, notes: 'Include 1 original DualShock 4 controller & power cable.' },
      { item_name: 'PS5 Digital / Disc Edition', category: 'Consoles', buy: 340, sell: 440, notes: 'Ensure HDMI port & disc drive (if disc) are fully tested.' },
      { item_name: '24-inch Gaming Monitor (144Hz / 165Hz)', category: 'Monitors & Displays', buy: 90, sell: 135, notes: 'Check for dead pixels and IPS panel brand.' },
      { item_name: 'Nescafe 3-in-1 Box (24 sachets)', category: 'Beverages & Snacks', buy: 6, sell: 12, notes: 'CS Shop refreshment stock.' }
    ];
    for (const item of seedCatalog) {
      await dbRun(
        'INSERT INTO pricing_catalog (item_name, category, buy_price_guide, sell_price_guide, notes) VALUES (?, ?, ?, ?, ?)',
        [item.item_name, item.category, item.buy, item.sell, item.notes]
      );
    }
  }
}

module.exports = {
  db,
  dbRun,
  dbGet,
  dbAll,
  dbExec,
  initDatabase
};
