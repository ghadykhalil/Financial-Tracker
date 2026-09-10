const express = require('express');
const cors = require('cors');
const path = require('path');
const { dbRun, dbGet, dbAll, initDatabase } = require('./database');
const { seedFromExcel } = require('./excelParser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize DB and Seed on startup
(async () => {
  try {
    await initDatabase();
    await seedFromExcel(false);
  } catch (err) {
    console.error('Error during startup database initialization:', err);
  }
})();

// Serve React Frontend Production Build
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// Helper function to calculate dashboard metrics
async function getSummaryMetrics() {
  const capitalRow = (await dbGet('SELECT * FROM capital_settings WHERE id = 1')) || { initial_capital: 6900, shop_allocated_capital: 1400, lbp_rate: 89000 };
  const initialCapital = capitalRow.initial_capital;
  const lbpRate = capitalRow.lbp_rate || 89000;

  // Capital deposits (salary, additions)
  const depositsRow = await dbGet('SELECT SUM(amount) as totalDeposits FROM capital_deposits');
  const totalCapitalDeposits = depositsRow ? (depositsRow.totalDeposits || 0) : 0;

  // Personal daily expenses (deductions)
  const dailyExpRow = await dbGet('SELECT SUM(amount) as totalDailyExp FROM daily_expenses');
  const totalDailyExpenses = dailyExpRow ? (dailyExpRow.totalDailyExp || 0) : 0;

  // Effective Initial Capital = Base Initial + Salary/Deposits - Personal Expenses
  const effectiveInitialCapital = initialCapital + totalCapitalDeposits - totalDailyExpenses;

  // Dynamic CS Shop Allocated Capital = SUM of price for all SECURED (purchased = 1) shop items!
  const securedShopRow = await dbGet('SELECT SUM(price) as totalSecured FROM shop_expenses WHERE purchased = 1');
  const shopAllocatedCapital = securedShopRow ? (securedShopRow.totalSecured || 0) : 0;

  // Total CS Shop setup expenses
  const shopExpensesRow = await dbGet('SELECT SUM(price) as totalExpenses FROM shop_expenses');
  const shopTotalExpenses = shopExpensesRow ? (shopExpensesRow.totalExpenses || 0) : 0;

  // Active plans metrics
  const plans = await dbAll('SELECT * FROM installment_plans');
  let totalWholesale = 0;
  let totalSold = 0;
  let totalReceived = 0;
  let completedReceived = 0;
  let frozenReceived = 0;
  let activeWholesale = 0;
  let activeSold = 0;
  let activeCount = 0;

  for (const plan of plans) {
    totalWholesale += plan.wholesale_price || 0;
    totalSold += plan.sold_price || 0;
    
    if (plan.status !== 'completed') {
      activeWholesale += plan.wholesale_price || 0;
      activeSold += plan.sold_price || 0;
      activeCount++;
    }

    const receivedRow = await dbGet('SELECT SUM(amount_received) as sumReceived FROM installment_payments WHERE plan_id = ?', [plan.id]);
    const rec = receivedRow ? (receivedRow.sumReceived || 0) : 0;
    totalReceived += rec;

    const unpaidRow = await dbGet('SELECT COUNT(*) as unpaidCount FROM installment_payments WHERE plan_id = ? AND is_paid = 0', [plan.id]);
    const unpaidCount = unpaidRow ? unpaidRow.unpaidCount : 0;

    const totalCountRow = await dbGet('SELECT COUNT(*) as totalCount FROM installment_payments WHERE plan_id = ?', [plan.id]);
    const totalCount = totalCountRow ? totalCountRow.totalCount : 0;

    const remaining = Math.max(0, (plan.sold_price || 0) - rec);
    const isCompleted = (remaining === 0 && (plan.sold_price || 0) > 0) || (totalCount > 0 && unpaidCount === 0) || plan.status === 'completed';

    if (isCompleted) {
      completedReceived += rec;
    } else {
      // Incomplete installment: money stays alone frozen until 100% completed
      frozenReceived += rec;
    }
  }

  const totalRemaining = Math.max(0, totalSold - totalReceived);
  const activeReceived = frozenReceived;
  const activeRemainingBreakEven = Math.max(0, activeWholesale - activeReceived);
  const activeExpectedProfit = activeSold - activeWholesale;
  const totalExpectedProfit = totalSold - totalWholesale;

  const installmentBreakevenProgress = activeWholesale > 0
    ? Math.min(100, Math.round((activeReceived / activeWholesale) * 100))
    : 0;
  const overallCollectionProgress = totalSold > 0
    ? Math.min(100, Math.round((totalReceived / totalSold) * 100))
    : 0;

  // Main Net Capital: Base Initial + Deposits - Personal Exp - Wholesale Costs - Secured Shop + ONLY Completed Installments Money
  const actualCapital = effectiveInitialCapital - totalWholesale - shopAllocatedCapital + completedReceived;

  // Frozen Installments Amount: Cash collected ($750) kept alone frozen until plan is 100% completed
  const frozenInstallmentAmount = frozenReceived;

  // Total Portfolio Combined Cash Value (Main Capital + Standalone Frozen Money)
  const totalNetWithFrozen = actualCapital + frozenInstallmentAmount;

  // Expected Total Capital = Main Net Capital + Active Installments Wholesale + Expected Profits
  const expectedCapitalWithInstallments = actualCapital + activeWholesale + activeExpectedProfit;

  // Expected Projected Equity (On Paper): Actual Total Cash + Uncollected Installments + CS Shop Recovered Investment
  const expectedProjectedEquity = totalNetWithFrozen + totalRemaining + shopAllocatedCapital;

  // CS Shop Profits & Break-even target
  const shopProfitsRow = await dbGet('SELECT SUM(amount) as totalProfits FROM shop_profits');
  const shopTotalProfits = shopProfitsRow ? (shopProfitsRow.totalProfits || 0) : 0;

  const shopTargetCapital = shopTotalExpenses > 0
    ? shopTotalExpenses
    : (shopAllocatedCapital > 0 ? shopAllocatedCapital : (capitalRow.shop_allocated_capital || 1400));

  const shopBreakevenProgress = shopTargetCapital > 0 
    ? Math.round((shopTotalProfits / shopTargetCapital) * 100)
    : 0;

  // Sales History Metrics
  const historyProfitsRow = await dbGet('SELECT SUM(profit) as totalHistProfit FROM sales_history');
  const totalHistProfit = historyProfitsRow ? (historyProfitsRow.totalHistProfit || 0) : 0;

  // Earned profit on installments
  let installmentEarnedProfit = 0;
  for (const plan of plans) {
    const recRow = await dbGet('SELECT SUM(amount_received) as sumReceived FROM installment_payments WHERE plan_id = ?', [plan.id]);
    const rec = recRow ? (recRow.sumReceived || 0) : 0;
    const planProfit = rec - plan.wholesale_price;
    if (planProfit > 0) {
      installmentEarnedProfit += planProfit;
    }
  }

  const totalHistoricalProfit = totalHistProfit + installmentEarnedProfit + shopTotalProfits;

  return {
    initial_capital: initialCapital,
    effective_initial_capital: effectiveInitialCapital,
    shop_allocated_capital: shopAllocatedCapital,
    total_capital_deposits: totalCapitalDeposits,
    total_daily_expenses: totalDailyExpenses,
    active_plans_count: activeCount,
    total_plans_count: plans.length,
    active_installment_wholesale: activeWholesale,
    active_installment_sold: activeSold,
    active_installment_expected_profit: activeExpectedProfit,
    total_installment_expected_profit: totalExpectedProfit,
    expected_capital_with_installments: expectedCapitalWithInstallments,
    active_installment_received: activeReceived,
    total_installment_wholesale: totalWholesale,
    total_installment_sold: totalSold,
    total_installment_received: totalReceived,
    total_installment_remaining: totalRemaining,
    active_installment_remaining_breakeven: activeRemainingBreakEven,
    installment_breakeven_progress: installmentBreakevenProgress,
    overall_installment_collection_progress: overallCollectionProgress,
    completed_installment_received: completedReceived,
    frozen_installment_received: frozenReceived,
    frozen_installment_amount: frozenInstallmentAmount,
    actual_capital: actualCapital,
    total_net_with_frozen: totalNetWithFrozen,
    expected_projected_equity: expectedProjectedEquity,
    net_after_unfinished_installments: actualCapital,
    new_capital: actualCapital,
    shop_total_expenses: shopTotalExpenses,
    shop_total_profits: shopTotalProfits,
    shop_breakeven_progress: shopBreakevenProgress,
    total_historical_profit: totalHistoricalProfit,
    lbp_rate: lbpRate,
    money_locations: await (async () => {
      try {
        return await dbAll('SELECT * FROM capital_money_locations ORDER BY id DESC');
      } catch (e) {
        await dbRun(`
          CREATE TABLE IF NOT EXISTS capital_money_locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fund_type TEXT NOT NULL DEFAULT 'main_net',
            location_name TEXT NOT NULL,
            amount REAL NOT NULL DEFAULT 0,
            notes TEXT
          );
        `);
        return await dbAll('SELECT * FROM capital_money_locations ORDER BY id DESC');
      }
    })()
  };
}

// ---------------- REST API ROUTES ----------------

// Dashboard Summary API
app.get('/api/dashboard/summary', async (req, res) => {
  try {
    const summary = await getSummaryMetrics();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Capital Settings API
app.get('/api/capital', async (req, res) => {
  try {
    const capital = await dbGet('SELECT * FROM capital_settings WHERE id = 1');
    res.json(capital);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/capital', async (req, res) => {
  try {
    const { initial_capital, shop_allocated_capital, lbp_rate } = req.body;
    await dbRun(
      'UPDATE capital_settings SET initial_capital = ?, shop_allocated_capital = ?, lbp_rate = ? WHERE id = 1',
      [initial_capital, shop_allocated_capital || 1400, lbp_rate || 89000]
    );
    res.json({ message: 'Capital settings updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function ensureMoneyLocationsTable() {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS capital_money_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fund_type TEXT NOT NULL DEFAULT 'main_net',
      location_name TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      notes TEXT
    );
  `);
}

// Money Locations API
app.get(['/api/capital/locations', '/api/locations'], async (req, res) => {
  try {
    await ensureMoneyLocationsTable();
    const locations = await dbAll('SELECT * FROM capital_money_locations ORDER BY id DESC');
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post(['/api/capital/locations', '/api/locations'], async (req, res) => {
  try {
    await ensureMoneyLocationsTable();
    const { fund_type, location_name, amount, notes } = req.body;
    const result = await dbRun(
      'INSERT INTO capital_money_locations (fund_type, location_name, amount, notes) VALUES (?, ?, ?, ?)',
      [fund_type || 'main_net', location_name, amount || 0, notes || '']
    );
    res.json({ id: result.lastID, message: 'Money location added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put(['/api/capital/locations/:id', '/api/locations/:id'], async (req, res) => {
  try {
    await ensureMoneyLocationsTable();
    const { fund_type, location_name, amount, notes } = req.body;
    await dbRun(
      'UPDATE capital_money_locations SET fund_type = ?, location_name = ?, amount = ?, notes = ? WHERE id = ?',
      [fund_type || 'main_net', location_name, amount || 0, notes || '', req.params.id]
    );
    res.json({ message: 'Money location updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete(['/api/capital/locations/:id', '/api/locations/:id'], async (req, res) => {
  try {
    await ensureMoneyLocationsTable();
    await dbRun('DELETE FROM capital_money_locations WHERE id = ?', [req.params.id]);
    res.json({ message: 'Money location deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Capital Deposits (Salary & Top-ups) API
app.get('/api/capital/deposits', async (req, res) => {
  try {
    const deposits = await dbAll('SELECT * FROM capital_deposits ORDER BY id DESC');
    const total = deposits.reduce((sum, d) => sum + (d.amount || 0), 0);
    res.json({ deposits, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/capital/deposits', async (req, res) => {
  try {
    const { amount, source, date, notes } = req.body;
    const result = await dbRun(
      'INSERT INTO capital_deposits (amount, source, date, notes) VALUES (?, ?, ?, ?)',
      [amount || 0, source || 'Salary', date || new Date().toISOString().split('T')[0], notes || '']
    );
    res.json({ id: result.lastID, message: 'Capital deposit added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/capital/deposits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM capital_deposits WHERE id = ?', [id]);
    res.json({ message: 'Capital deposit deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Daily Personal Expenses API
app.get('/api/daily-expenses', async (req, res) => {
  try {
    const expenses = await dbAll('SELECT * FROM daily_expenses ORDER BY id DESC');
    const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    res.json({ expenses, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/daily-expenses', async (req, res) => {
  try {
    const { amount, category, date, description } = req.body;
    const result = await dbRun(
      'INSERT INTO daily_expenses (amount, category, date, description) VALUES (?, ?, ?, ?)',
      [amount || 0, category || 'General', date || new Date().toISOString().split('T')[0], description || '']
    );
    res.json({ id: result.lastID, message: 'Daily expense recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/daily-expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM daily_expenses WHERE id = ?', [id]);
    res.json({ message: 'Daily expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Installments API
app.get('/api/installments', async (req, res) => {
  try {
    const plans = await dbAll('SELECT * FROM installment_plans ORDER BY id ASC');
    const result = [];

    for (const plan of plans) {
      const payments = await dbAll('SELECT * FROM installment_payments WHERE plan_id = ? ORDER BY id ASC', [plan.id]);
      const totalReceived = payments.reduce((acc, p) => acc + (p.amount_received || 0), 0);
      const remainingBalance = Math.max(0, plan.sold_price - totalReceived);
      const expectedProfit = plan.sold_price - plan.wholesale_price;
      const earnedProfit = totalReceived - plan.wholesale_price;
      const hasUnpaid = payments.some(p => p.is_paid === 0);
      const isFullyPaid = (remainingBalance === 0 && plan.sold_price > 0) || (payments.length > 0 && !hasUnpaid) || plan.status === 'completed';

      result.push({
        ...plan,
        total_received: totalReceived,
        remaining_balance: remainingBalance,
        expected_profit: expectedProfit,
        earned_profit: earnedProfit,
        is_fully_paid: isFullyPaid,
        payments
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/installments', async (req, res) => {
  try {
    const { customer_name, item_name, wholesale_price, sold_price, location, comment, payments } = req.body;
    
    const result = await dbRun(
      'INSERT INTO installment_plans (customer_name, item_name, wholesale_price, sold_price, location, comment, status) VALUES (?, ?, ?, ?, ?, ?, "active")',
      [customer_name, item_name, wholesale_price || 0, sold_price || 0, location || '', comment || '']
    );
    const planId = result.lastID;

    if (payments && Array.isArray(payments)) {
      for (const p of payments) {
        await dbRun(
          'INSERT INTO installment_payments (plan_id, date_label, amount_due, amount_received, is_paid, notes) VALUES (?, ?, ?, ?, ?, ?)',
          [planId, p.date_label, p.amount_due || 0, p.amount_received || 0, p.is_paid ? 1 : 0, p.notes || '']
        );
      }
    }

    res.json({ id: planId, message: 'Installment plan created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/installments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_name, item_name, wholesale_price, sold_price, location, comment, status } = req.body;
    await dbRun(
      'UPDATE installment_plans SET customer_name = ?, item_name = ?, wholesale_price = ?, sold_price = ?, location = ?, comment = ?, status = ? WHERE id = ?',
      [customer_name, item_name, wholesale_price, sold_price, location, comment, status || 'active', id]
    );
    
    res.json({ message: 'Plan updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/installments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM installment_payments WHERE plan_id = ?', [id]);
    await dbRun('DELETE FROM installment_plans WHERE id = ?', [id]);
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Installment Payments Update Route
app.post('/api/installments/:planId/payments', async (req, res) => {
  try {
    const { planId } = req.params;
    const { paymentId, date_label, amount_due, amount_received, is_paid, notes } = req.body;

    if (paymentId) {
      await dbRun(
        'UPDATE installment_payments SET date_label = ?, amount_due = ?, amount_received = ?, is_paid = ?, notes = ? WHERE id = ? AND plan_id = ?',
        [date_label, amount_due, amount_received, is_paid ? 1 : 0, notes || '', paymentId, planId]
      );
    } else {
      await dbRun(
        'INSERT INTO installment_payments (plan_id, date_label, amount_due, amount_received, is_paid, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [planId, date_label, amount_due, amount_received, is_paid ? 1 : 0, notes || '']
      );
    }

    res.json({ message: 'Payment recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Quick toggle payment route
app.put('/api/payments/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await dbGet('SELECT * FROM installment_payments WHERE id = ?', [id]);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const newPaidStatus = payment.is_paid ? 0 : 1;
    let newAmountReceived = 0;
    if (newPaidStatus === 1) {
      newAmountReceived = (payment.amount_received && payment.amount_received > 0) ? payment.amount_received : (payment.amount_due || 0);
    } else {
      newAmountReceived = 0;
    }

    const paidAt = newPaidStatus ? new Date().toISOString() : null;

    await dbRun(
      'UPDATE installment_payments SET is_paid = ?, amount_received = ?, paid_at = ? WHERE id = ?',
      [newPaidStatus, newAmountReceived, paidAt, id]
    );

    res.json({ message: 'Payment status toggled', is_paid: newPaidStatus, amount_received: newAmountReceived });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete single payment route
app.delete('/api/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM installment_payments WHERE id = ?', [id]);
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Shop Expenses API
app.get('/api/shop-expenses', async (req, res) => {
  try {
    const expenses = await dbAll('SELECT * FROM shop_expenses ORDER BY id ASC');
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.price || 0), 0);
    res.json({ expenses, total: totalExpenses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shop-expenses', async (req, res) => {
  try {
    const { item, price, comment, category, purchased } = req.body;
    const result = await dbRun(
      'INSERT INTO shop_expenses (item, price, comment, category, purchased) VALUES (?, ?, ?, ?, ?)',
      [item, price || 0, comment || '', category || 'General', purchased !== undefined ? purchased : 1]
    );

    res.json({ id: result.lastID, message: 'Expense item added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/shop-expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { item, price, comment, category, purchased } = req.body;
    await dbRun(
      'UPDATE shop_expenses SET item = ?, price = ?, comment = ?, category = ?, purchased = ? WHERE id = ?',
      [item, price, comment, category, purchased !== undefined ? purchased : 1, id]
    );

    res.json({ message: 'Expense item updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/shop-expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM shop_expenses WHERE id = ?', [id]);
    res.json({ message: 'Expense item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Shop Profits API (CS 1.6 Daily Profits)
app.get('/api/shop-profits', async (req, res) => {
  try {
    const profits = await dbAll('SELECT * FROM shop_profits ORDER BY id DESC');
    const total = profits.reduce((sum, p) => sum + (p.amount || 0), 0);
    res.json({ profits, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shop-profits', async (req, res) => {
  try {
    const { date, amount, notes } = req.body;
    const result = await dbRun(
      'INSERT INTO shop_profits (date, amount, notes) VALUES (?, ?, ?)',
      [date || new Date().toISOString().split('T')[0], amount || 0, notes || '']
    );

    res.json({ id: result.lastID, message: 'Shop profit entry added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/shop-profits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, amount, notes } = req.body;
    await dbRun(
      'UPDATE shop_profits SET date = ?, amount = ?, notes = ? WHERE id = ?',
      [date || new Date().toISOString().split('T')[0], amount || 0, notes || '', id]
    );

    res.json({ message: 'Shop profit entry updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/shop-profits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM shop_profits WHERE id = ?', [id]);
    res.json({ message: 'Shop profit entry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sales History API ('old' sheet & direct sales)
app.get('/api/sales-history', async (req, res) => {
  try {
    const sales = await dbAll('SELECT * FROM sales_history ORDER BY id DESC');
    const totalProfit = sales.reduce((sum, s) => sum + (s.profit || 0), 0);
    const totalEarned = sales.reduce((sum, s) => sum + (s.earned_amount || 0), 0);
    res.json({ sales, totalProfit, totalEarned });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sales-history', async (req, res) => {
  try {
    const { item_name, wholesale_price, sold_price, earned_amount, remaining_balance, profit, bought_by, location, comment, sale_date } = req.body;
    const calcProfit = profit !== undefined ? profit : ((sold_price || 0) - (wholesale_price || 0));
    const calcRemaining = remaining_balance !== undefined ? remaining_balance : Math.max(0, (sold_price || 0) - (earned_amount || 0));

    const result = await dbRun(
      'INSERT INTO sales_history (item_name, wholesale_price, sold_price, earned_amount, remaining_balance, profit, bought_by, location, comment, sale_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [item_name, wholesale_price || 0, sold_price || 0, earned_amount || 0, calcRemaining, calcProfit, bought_by || '', location || '', comment || '', sale_date || new Date().toISOString().split('T')[0]]
    );

    res.json({ id: result.lastID, message: 'Sales history item created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/sales-history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM sales_history WHERE id = ?', [id]);
    res.json({ message: 'Sales history entry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pricing Catalog & Guide API
app.get('/api/pricing-catalog', async (req, res) => {
  try {
    const items = await dbAll('SELECT * FROM pricing_catalog ORDER BY id DESC');
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pricing-catalog', async (req, res) => {
  try {
    const { item_name, category, buy_price_guide, sell_price_guide, notes } = req.body;
    const result = await dbRun(
      'INSERT INTO pricing_catalog (item_name, category, buy_price_guide, sell_price_guide, notes) VALUES (?, ?, ?, ?, ?)',
      [item_name, category || 'General', buy_price_guide || 0, sell_price_guide || 0, notes || '']
    );

    res.json({ id: result.lastID, message: 'Pricing catalog entry created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/pricing-catalog/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { item_name, category, buy_price_guide, sell_price_guide, notes } = req.body;
    await dbRun(
      'UPDATE pricing_catalog SET item_name = ?, category = ?, buy_price_guide = ?, sell_price_guide = ?, notes = ? WHERE id = ?',
      [item_name, category || 'General', buy_price_guide || 0, sell_price_guide || 0, notes || '', id]
    );

    res.json({ message: 'Pricing catalog entry updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/pricing-catalog/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM pricing_catalog WHERE id = ?', [id]);
    res.json({ message: 'Pricing catalog entry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 404 Fallback Middleware (Prevents API routes from returning HTML)
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Fallback SPA middleware
app.use((req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Financial Tracker Server running on http://localhost:${PORT}`);
});
