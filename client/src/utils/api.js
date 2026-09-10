const API_BASE = '/api';

async function safeJsonFetch(url, options = {}, defaultVal = null) {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    
    if (!res.ok) {
      if (defaultVal !== null) return defaultVal;
      let errMsg = `Server returned HTTP ${res.status}`;
      try {
        const errJson = JSON.parse(text);
        if (errJson.error) errMsg = errJson.error;
      } catch (e) {}
      throw new Error(errMsg);
    }

    if (!text || text.trim().startsWith('<')) {
      if (defaultVal !== null) return defaultVal;
      throw new Error('API server returned HTML response instead of JSON. Ensure the backend server is running on port 5000.');
    }
    return JSON.parse(text);
  } catch (err) {
    if (defaultVal !== null) return defaultVal;
    throw err;
  }
}

export async function fetchSummary() {
  return safeJsonFetch(`${API_BASE}/dashboard/summary`);
}

export async function fetchCapital() {
  return safeJsonFetch(`${API_BASE}/capital`);
}

export async function updateCapital(initial_capital, shop_allocated_capital, lbp_rate) {
  const res = await fetch(`${API_BASE}/capital`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initial_capital, shop_allocated_capital, lbp_rate })
  });
  if (!res.ok) throw new Error('Failed to update capital');
  return res.json();
}

// Money Locations API
export async function fetchMoneyLocations() {
  return safeJsonFetch(`${API_BASE}/capital/locations`, {}, []);
}

export async function createMoneyLocation(data) {
  return safeJsonFetch(`${API_BASE}/capital/locations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function updateMoneyLocation(id, data) {
  return safeJsonFetch(`${API_BASE}/capital/locations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function deleteMoneyLocation(id) {
  return safeJsonFetch(`${API_BASE}/capital/locations/${id}`, {
    method: 'DELETE'
  });
}

// Capital Deposits (Salary & Top-ups)
export async function fetchCapitalDeposits() {
  return safeJsonFetch(`${API_BASE}/capital/deposits`, {}, { deposits: [], total: 0 });
}

export async function createCapitalDeposit(data) {
  const res = await fetch(`${API_BASE}/capital/deposits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to add capital deposit');
  return res.json();
}

export async function deleteCapitalDeposit(id) {
  const res = await fetch(`${API_BASE}/capital/deposits/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete capital deposit');
  return res.json();
}

// Daily Personal Expenses (Deductions from Capital)
export async function fetchDailyExpenses() {
  return safeJsonFetch(`${API_BASE}/daily-expenses`, {}, { expenses: [], total: 0 });
}

export async function createDailyExpense(data) {
  const res = await fetch(`${API_BASE}/daily-expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to record daily expense');
  return res.json();
}

export async function deleteDailyExpense(id) {
  const res = await fetch(`${API_BASE}/daily-expenses/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete daily expense');
  return res.json();
}

export async function fetchInstallments() {
  return safeJsonFetch(`${API_BASE}/installments`, {}, []);
}

export async function createInstallment(planData) {
  const res = await fetch(`${API_BASE}/installments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(planData)
  });
  if (!res.ok) throw new Error('Failed to create installment plan');
  return res.json();
}

export async function updateInstallment(id, planData) {
  const res = await fetch(`${API_BASE}/installments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(planData)
  });
  if (!res.ok) throw new Error('Failed to update installment plan');
  return res.json();
}

export async function deleteInstallment(id) {
  const res = await fetch(`${API_BASE}/installments/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete installment plan');
  return res.json();
}

export async function recordPayment(planId, paymentData) {
  const res = await fetch(`${API_BASE}/installments/${planId}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData)
  });
  if (!res.ok) throw new Error('Failed to record payment');
  return res.json();
}

export async function togglePayment(paymentId) {
  const res = await fetch(`${API_BASE}/payments/${paymentId}/toggle`, {
    method: 'PUT'
  });
  if (!res.ok) throw new Error('Failed to toggle payment status');
  return res.json();
}

export async function deletePayment(paymentId) {
  const res = await fetch(`${API_BASE}/payments/${paymentId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete payment');
  return res.json();
}

export async function fetchShopExpenses() {
  return safeJsonFetch(`${API_BASE}/shop-expenses`, {}, { expenses: [], total: 0 });
}

export async function createShopExpense(data) {
  const res = await fetch(`${API_BASE}/shop-expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create shop expense');
  return res.json();
}

export async function updateShopExpense(id, data) {
  const res = await fetch(`${API_BASE}/shop-expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update shop expense');
  return res.json();
}

export async function deleteShopExpense(id) {
  const res = await fetch(`${API_BASE}/shop-expenses/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete shop expense');
  return res.json();
}

export async function fetchShopProfits() {
  return safeJsonFetch(`${API_BASE}/shop-profits`, {}, { profits: [], total: 0 });
}

export async function createShopProfit(data) {
  const res = await fetch(`${API_BASE}/shop-profits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create shop profit entry');
  return res.json();
}

export async function updateShopProfit(id, data) {
  const res = await fetch(`${API_BASE}/shop-profits/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update shop profit entry');
  return res.json();
}

export async function deleteShopProfit(id) {
  const res = await fetch(`${API_BASE}/shop-profits/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete shop profit entry');
  return res.json();
}

export async function fetchSalesHistory() {
  return safeJsonFetch(`${API_BASE}/sales-history`, {}, { sales: [], totalProfit: 0 });
}

export async function createSaleHistory(data) {
  const res = await fetch(`${API_BASE}/sales-history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to record sales history');
  return res.json();
}

export async function deleteSaleHistory(id) {
  const res = await fetch(`${API_BASE}/sales-history/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete sales history entry');
  return res.json();
}

// Pricing Catalog & Guide API
export async function fetchPricingCatalog() {
  return safeJsonFetch(`${API_BASE}/pricing-catalog`, {}, { items: [] });
}

export async function createPricingCatalog(data) {
  const res = await fetch(`${API_BASE}/pricing-catalog`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create pricing catalog entry');
  return res.json();
}

export async function updatePricingCatalog(id, data) {
  const res = await fetch(`${API_BASE}/pricing-catalog/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update pricing catalog entry');
  return res.json();
}

export async function deletePricingCatalog(id) {
  const res = await fetch(`${API_BASE}/pricing-catalog/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete pricing catalog entry');
  return res.json();
}
