const xlsx = require('xlsx');
const path = require('path');
const { dbRun, dbGet, dbAll, initDatabase } = require('./database');

const excelFilePath = path.join(__dirname, '..', 'Stocks.xlsx');

async function seedFromExcel(force = false) {
  await initDatabase();

  // Check if already seeded
  const planCountRow = await dbGet('SELECT COUNT(*) as count FROM installment_plans');
  const expenseCountRow = await dbGet('SELECT COUNT(*) as count FROM shop_expenses');
  const salesCountRow = await dbGet('SELECT COUNT(*) as count FROM sales_history');

  const planCount = planCountRow ? planCountRow.count : 0;
  const expenseCount = expenseCountRow ? expenseCountRow.count : 0;
  const salesCount = salesCountRow ? salesCountRow.count : 0;

  if (!force && (planCount > 0 || expenseCount > 0 || salesCount > 0)) {
    console.log('Database already populated. Skipping Excel seed.');
    return;
  }

  console.log('Seeding database from Stocks.xlsx...');
  
  // Clear existing tables if force re-seed
  if (force) {
    await dbRun('DELETE FROM installment_payments');
    await dbRun('DELETE FROM installment_plans');
    await dbRun('DELETE FROM shop_expenses');
    await dbRun('DELETE FROM sales_history');
    await dbRun('DELETE FROM shop_profits');
  }

  const workbook = xlsx.readFile(excelFilePath);

  // 1. Parse CS Shop sheet
  if (workbook.Sheets['CS Shop']) {
    const csSheet = workbook.Sheets['CS Shop'];
    const csData = xlsx.utils.sheet_to_json(csSheet, { header: 1 });

    for (let r = 1; r < csData.length; r++) {
      const row = csData[r];
      if (!row || row.length === 0) continue;
      const item = row[0] ? String(row[0]).trim() : '';
      if (!item || item.toLowerCase().includes('total') || item.toLowerCase().includes('capital') || item.startsWith('?')) {
        continue;
      }
      
      let priceVal = 0;
      if (row[1] !== undefined && row[1] !== null && !isNaN(row[1])) {
        priceVal = parseFloat(row[1]);
      }
      
      const comment = row[2] ? String(row[2]).trim() : (typeof row[1] === 'string' ? row[1] : '');
      let category = 'General';
      const itemLower = item.toLowerCase();
      if (itemLower.includes('computer') || itemLower.includes('switch') || itemLower.includes('controller') || itemLower.includes('ps4')) {
        category = 'Hardware';
      } else if (itemLower.includes('rent')) {
        category = 'Rent';
      } else if (itemLower.includes('table') || itemLower.includes('desk') || itemLower.includes('chair')) {
        category = 'Furniture';
      } else if (itemLower.includes('ac') || itemLower.includes('fridge') || itemLower.includes('water') || itemLower.includes('raqwa')) {
        category = 'Appliances';
      }

      await dbRun(
        'INSERT INTO shop_expenses (item, price, comment, category, purchased) VALUES (?, ?, ?, ?, ?)',
        [item, priceVal, comment, category, 1]
      );
    }
  }

  // 2. Customer Installments Sheets
  const customerSheets = [
    { sheetName: 'Lenovo Legion - Mostafa Mhayd', defaultCustomer: 'Mostafa Mhayd' },
    { sheetName: 'HP Omen 16 - Manal Rifaii', defaultCustomer: 'Manal Rifai' },
    { sheetName: 'Gaming PC - Amo Hasan', defaultCustomer: 'Amo Hasan' },
    { sheetName: 'Gaming Laptop - Mohamad Khalil', defaultCustomer: 'Mohamad Khalil' }
  ];

  for (const { sheetName, defaultCustomer } of customerSheets) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    if (data.length < 2) continue;

    const firstRow = data[1];
    let item_name = firstRow[0] ? String(firstRow[0]).trim() : 'Electronics';
    if (sheetName.includes('Lenovo Legion') && item_name === 'HP Omen 16 gaming') {
      item_name = 'Lenovo Legion';
    }
    const wholesale_price = parseFloat(firstRow[1]) || 0;
    const sold_price = parseFloat(firstRow[2]) || 0;
    const bought_by = firstRow[9] ? String(firstRow[9]).trim() : defaultCustomer;
    const location = firstRow[10] ? String(firstRow[10]).trim() : '';
    const comment = firstRow[11] ? String(firstRow[11]).trim() : '';

    const planResult = await dbRun(
      'INSERT INTO installment_plans (customer_name, item_name, wholesale_price, sold_price, location, comment, status) VALUES (?, ?, ?, ?, ?, ?, "active")',
      [bought_by, item_name, wholesale_price, sold_price, location, comment]
    );
    const planId = planResult.lastID;

    // Read payment schedule rows
    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      if (!row || row.length === 0) continue;
      
      const received = parseFloat(row[4]) || 0;
      const amountDue = parseFloat(row[5]) || 0;
      const dateLabel = row[6] ? String(row[6]).trim() : '';
      const notes = row[7] ? String(row[7]).trim() : '';

      if (row[3] && String(row[3]).toLowerCase().includes('total')) continue;
      
      if (dateLabel && (amountDue > 0 || received > 0)) {
        const isPaid = (received >= amountDue && amountDue > 0) ? 1 : 0;
        await dbRun(
          'INSERT INTO installment_payments (plan_id, date_label, amount_due, amount_received, is_paid, notes) VALUES (?, ?, ?, ?, ?, ?)',
          [planId, dateLabel, amountDue, received, isPaid, notes]
        );
      }
    }
  }

  // 3. Parse 'old' sheet (Sales History)
  if (workbook.Sheets['old']) {
    const oldSheet = workbook.Sheets['old'];
    const oldData = xlsx.utils.sheet_to_json(oldSheet, { header: 1 });

    for (let r = 1; r < oldData.length; r++) {
      const row = oldData[r];
      if (!row || row.length === 0) continue;
      
      const item_name = row[0] ? String(row[0]).trim() : '';
      if (!item_name || item_name.toLowerCase().includes('initial capital') || item_name.toLowerCase().includes('total')) {
        continue;
      }

      const wholesale_price = parseFloat(row[1]) || 0;
      const sold_price = parseFloat(row[2]) || 0;
      const earned_amount = parseFloat(row[3]) || 0;
      const remaining_balance = parseFloat(row[4]) || 0;
      const profit = parseFloat(row[5]) || 0;
      const bought_by = row[6] ? String(row[6]).trim() : '';
      const location = row[7] ? String(row[7]).trim() : '';
      const comment = row[8] ? String(row[8]).trim() : '';

      if (sold_price > 0 || wholesale_price > 0 || earned_amount > 0) {
        await dbRun(
          'INSERT INTO sales_history (item_name, wholesale_price, sold_price, earned_amount, remaining_balance, profit, bought_by, location, comment, sale_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [item_name, wholesale_price, sold_price, earned_amount, remaining_balance, profit, bought_by, location, comment, 'Past Sale']
        );
      }
    }
  }

  console.log('Successfully seeded database from Stocks.xlsx!');
}

module.exports = {
  seedFromExcel
};
