import React, { useState } from 'react';
import { ShoppingBag, DollarSign, ShieldCheck, Plus, Trash2, Edit2, Tag, TrendingUp, Calendar, Search, ArrowUpDown, LayoutGrid, List, CheckCircle2, Clock, Cpu, Sofa, Home, Tv, Box, Filter, Zap, Coffee } from 'lucide-react';

export default function ShopExpenses({
  expenses,
  totalExpenses,
  allocatedCapital,
  shopProfits,
  totalShopProfits,
  onOpenAddExpense,
  onOpenLogShopProfit,
  onOpenEditShopProfit,
  onOpenEditExpense,
  onUpdatePurchased,
  onRequestUnsecure,
  onDeleteExpense,
  onDeleteShopProfit,
  summary
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all'); // 'all' | 'paid' | 'pending'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards' (Default view is Table!)
  
  // Equipment Search & Sort State
  const [itemSearch, setItemSearch] = useState('');
  const [itemSortField, setItemSortField] = useState('id');
  const [itemSortAsc, setItemSortAsc] = useState(true);

  // Shop Revenue Search & Sort State
  const [profitSearch, setProfitSearch] = useState('');
  const [profitSortField, setProfitSortField] = useState('id');
  const [profitSortAsc, setProfitSortAsc] = useState(false);

  const categories = ['All', 'Hardware', 'Furniture', 'Rent & Electricity', 'Drinks & Refreshments', 'Appliances', 'General'];

  // Filter & Sort Equipment Items
  const filteredExpenses = (expenses || []).filter(e => {
    if (selectedStatusFilter === 'paid' && e.purchased !== 1) return false;
    if (selectedStatusFilter === 'pending' && e.purchased !== 0) return false;
    if (selectedCategory !== 'All' && e.category !== selectedCategory) return false;
    
    const q = itemSearch.toLowerCase();
    return (
      (e.item && e.item.toLowerCase().includes(q)) ||
      (e.comment && e.comment.toLowerCase().includes(q)) ||
      (e.category && e.category.toLowerCase().includes(q)) ||
      (e.price && e.price.toString().includes(q))
    );
  }).sort((a, b) => {
    // Primary sort: Paid items (purchased === 1) ALWAYS come first!
    const statusA = a.purchased === 1 ? 0 : 1;
    const statusB = b.purchased === 1 ? 0 : 1;
    if (statusA !== statusB) {
      return statusA - statusB;
    }

    let valA = a[itemSortField];
    let valB = b[itemSortField];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return itemSortAsc ? -1 : 1;
    if (valA > valB) return itemSortAsc ? 1 : -1;
    return 0;
  });

  // Filter & Sort Shop Revenue Log
  const filteredProfits = (shopProfits || []).filter(entry => {
    const q = profitSearch.toLowerCase();
    return (
      (entry.notes && entry.notes.toLowerCase().includes(q)) ||
      (entry.date && entry.date.toLowerCase().includes(q)) ||
      (entry.amount && entry.amount.toString().includes(q))
    );
  }).sort((a, b) => {
    let valA = a[profitSortField];
    let valB = b[profitSortField];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return profitSortAsc ? -1 : 1;
    if (valA > valB) return profitSortAsc ? 1 : -1;
    return 0;
  });

  const handleProfitSort = (field) => {
    if (profitSortField === field) {
      setProfitSortAsc(!profitSortAsc);
    } else {
      setProfitSortField(field);
      setProfitSortAsc(true);
    }
  };

  const handleItemSort = (field) => {
    if (itemSortField === field) {
      setItemSortAsc(!itemSortAsc);
    } else {
      setItemSortField(field);
      setItemSortAsc(true);
    }
  };

  const targetCapital = totalExpenses > 0
    ? totalExpenses
    : (allocatedCapital > 0 ? allocatedCapital : 1400);

  const breakEvenProgress = targetCapital > 0
    ? Math.round(((totalShopProfits || 0) / targetCapital) * 100)
    : 0;

  const remainingToBreakEven = Math.max(0, targetCapital - (totalShopProfits || 0));
  const pendingToPay = Math.max(0, totalExpenses - allocatedCapital);

  // Category Totals
  const rentElectricityTotal = (expenses || [])
    .filter(e => e.category === 'Rent & Electricity' || e.category === 'Rent')
    .reduce((sum, e) => sum + (e.price || 0), 0);

  const drinksTotal = (expenses || [])
    .filter(e => e.category === 'Drinks & Refreshments')
    .reduce((sum, e) => sum + (e.price || 0), 0);

  return (
    <div className="shop-expenses-container">
      {/* Top Metrics Cards */}
      <div className="grid-5">
        <div className="glass-card">
          <div className="metric-label">Paid PC Capital</div>
          <div className="metric-value" style={{ color: '#60a5fa' }}>
            ${allocatedCapital.toLocaleString()}
          </div>
          <div className="metric-sub">
            <DollarSign size={13} color="#60a5fa" /> Target capital to break even
          </div>
        </div>

        <div className="glass-card">
          <div className="metric-label">Shop Profits Collected</div>
          <div className="metric-value" style={{ color: '#34d399' }}>
            +${(totalShopProfits || 0).toLocaleString()}
          </div>
          <div className="metric-sub">
            <TrendingUp size={13} color="#34d399" /> Realized shop earnings
          </div>
        </div>

        <div className="glass-card">
          <div className="metric-label">Remaining to Break Even</div>
          <div className="metric-value" style={{ color: remainingToBreakEven === 0 ? '#34d399' : '#f87171' }}>
            ${remainingToBreakEven.toLocaleString()}
          </div>
          <div className="metric-sub">
            <ShieldCheck size={13} color={remainingToBreakEven === 0 ? '#34d399' : '#f87171'} />
            {remainingToBreakEven === 0 ? 'Break-Even Achieved!' : 'Profits needed to break even'}
          </div>
        </div>

        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(15, 23, 42, 0.9))', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          <div className="metric-label">Pending Expenses to Pay</div>
          <div className="metric-value" style={{ color: '#fbbf24' }}>
            ${pendingToPay.toLocaleString()}
          </div>
          <div className="metric-sub">
            <Clock size={13} color="#fbbf24" /> Unfunded / pending shop items
          </div>
        </div>

        <div className="glass-card">
          <div className="metric-label">Total Setup & Operational</div>
          <div className="metric-value" style={{ color: '#fff' }}>
            ${totalExpenses.toLocaleString()}
          </div>
          <div className="metric-sub">
            <ShoppingBag size={13} /> All pending + paid shop items & bills
          </div>
        </div>
      </div>

      {/* Quick Operational Expenses Quick-Add Banner (Rent/Electricity & Drinks/Nescafe) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* Rent & Electricity Bills Banner */}
        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(16, 23, 38, 0.95))', borderColor: 'rgba(239, 68, 68, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', fontWeight: 600, fontSize: '0.9rem' }}>
              <Zap size={16} /> Rent & Electricity Bills
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Logged Bills: <strong style={{ color: '#fff' }}>${rentElectricityTotal.toLocaleString()}</strong> (Adds with total table)
            </p>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
            onClick={() => onOpenAddExpense && onOpenAddExpense('Rent & Electricity')}
          >
            <Plus size={13} /> Add Bill
          </button>
        </div>

        {/* Drinks & Nescafe Banner */}
        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(16, 23, 38, 0.95))', borderColor: 'rgba(245, 158, 11, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: 600, fontSize: '0.9rem' }}>
              <Coffee size={16} /> Drinks, Teas & Nescafe Stock
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Logged Stock: <strong style={{ color: '#fff' }}>${drinksTotal.toLocaleString()}</strong> (Adds with total table)
            </p>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.4)' }}
            onClick={() => onOpenAddExpense && onOpenAddExpense('Drinks & Refreshments')}
          >
            <Plus size={13} /> Add Stock
          </button>
        </div>
      </div>

      {/* CS Shop Break-Even Progress Gauge */}
      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={18} color="#3b82f6" />
            <span>CS 1.6 Shop Break-Even Progress Gauge</span>
          </div>

          <button className="btn btn-primary" onClick={onOpenLogShopProfit}>
            <Plus size={14} /> Log Shop Earnings
          </button>
        </div>

        <div style={{ margin: '0.75rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span>Earnings Collected: <strong style={{ color: '#34d399' }}>${(totalShopProfits || 0).toLocaleString()}</strong></span>
            <span>Total Setup Target: <strong style={{ color: '#60a5fa' }}>${targetCapital.toLocaleString()}</strong></span>
          </div>

          <div className="progress-bar-container">
            <div
              className="progress-bar-fill fill-blue"
              style={{ width: `${Math.min(100, Math.max(0, breakEvenProgress))}%` }}
            ></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            <span>Progress: {breakEvenProgress}%</span>
            <span>Remaining to recover: ${remainingToBreakEven}</span>
          </div>
        </div>
      </div>

      {/* Shop Daily Profits / Earnings Table */}
      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={16} color="#34d399" />
            <span>Shop Earnings & Revenue Log</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="badge badge-blue" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
              🇱🇧 1$ = {(summary?.lbp_rate || 89000).toLocaleString()} LBP
            </span>
            <button className="btn btn-emerald btn-sm" onClick={onOpenLogShopProfit}>
              + Log Daily Revenue
            </button>
          </div>
        </div>

        {/* Search Filter Bar */}
        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
          <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '1.8rem', fontSize: '0.8rem' }}
            placeholder="Search earnings by date or notes..."
            value={profitSearch}
            onChange={e => setProfitSearch(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => handleProfitSort('date')}>
                  Date {profitSortField === 'date' ? (profitSortAsc ? '▲' : '▼') : <ArrowUpDown size={10} />}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleProfitSort('amount')}>
                  Amount ($) {profitSortField === 'amount' ? (profitSortAsc ? '▲' : '▼') : <ArrowUpDown size={10} />}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleProfitSort('notes')}>
                  Notes / Revenue Source {profitSortField === 'notes' ? (profitSortAsc ? '▲' : '▼') : <ArrowUpDown size={10} />}
                </th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfits && filteredProfits.length > 0 ? (
                filteredProfits.map(entry => (
                  <tr key={entry.id}>
                    <td><strong>{entry.date}</strong></td>
                    <td>
                      <strong style={{ color: '#34d399' }}>+${entry.amount}</strong>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{entry.notes || 'Gaming session revenue'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onOpenEditShopProfit && onOpenEditShopProfit(entry)}
                          title="Edit Log"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => onDeleteShopProfit(entry.id)}
                          title="Delete Log"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No shop earnings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Equipment & Setup Expenses Main Section */}
      <div className="glass-card">
        <div className="card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShoppingBag size={16} color="#60a5fa" />
            <span>CS 1.6 Shop Expenses & Bills Table</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* View Mode Toggle */}
            <div style={{ display: 'flex', gap: '2px', padding: '2px', background: '#080c14', borderRadius: '6px', border: '1px solid var(--bg-card-border)' }}>
              <button
                className={`filter-btn ${viewMode === 'table' ? 'active-category' : ''}`}
                style={{ padding: '0.25rem 0.55rem', fontSize: '0.78rem' }}
                onClick={() => setViewMode('table')}
              >
                <List size={12} /> Table (Default)
              </button>
              <button
                className={`filter-btn ${viewMode === 'cards' ? 'active-category' : ''}`}
                style={{ padding: '0.25rem 0.55rem', fontSize: '0.78rem' }}
                onClick={() => setViewMode('cards')}
              >
                <LayoutGrid size={12} /> Cards
              </button>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onOpenAddExpense && onOpenAddExpense('Rent & Electricity')}
              style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
            >
              <Zap size={13} /> + Rent/Electric
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onOpenAddExpense && onOpenAddExpense('Drinks & Refreshments')}
              style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}
            >
              <Coffee size={13} /> + Drinks
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => onOpenAddExpense && onOpenAddExpense('Hardware')}>
              <Plus size={13} /> Add Expense
            </button>
          </div>
        </div>

        {/* Filter Controls Bar (STATUS FIRST, THEN CATEGORY SECOND) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* 1. STATUS FILTER BUTTONS (FIRST) */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              <button
                className={`filter-btn ${selectedStatusFilter === 'all' ? 'active-category' : ''}`}
                onClick={() => setSelectedStatusFilter('all')}
              >
                <Filter size={10} /> All Statuses
              </button>
              <button
                className={`filter-btn ${selectedStatusFilter === 'paid' ? 'active-secured' : ''}`}
                onClick={() => setSelectedStatusFilter('paid')}
              >
                🟢 Paid Only
              </button>
              <button
                className={`filter-btn ${selectedStatusFilter === 'pending' ? 'active-pending' : ''}`}
                onClick={() => setSelectedStatusFilter('pending')}
              >
                ⏳ Pending Only
              </button>
            </div>

            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>•</span>

            {/* 2. CATEGORY FILTER BUTTONS (SECOND) */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`filter-btn ${selectedCategory === cat ? 'active-category' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '1.8rem', fontSize: '0.8rem' }}
              placeholder="Search expenses, drinks, or bills..."
              value={itemSearch}
              onChange={e => setItemSearch(e.target.value)}
            />
          </div>
        </div>

        {/* VIEW MODE 1: Detailed Table View (DEFAULT) */}
        {viewMode === 'table' && (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleItemSort('purchased')}>
                    Status {itemSortField === 'purchased' ? (itemSortAsc ? '▲' : '▼') : <ArrowUpDown size={10} />}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleItemSort('item')}>
                    Item / Bill Description {itemSortField === 'item' ? (itemSortAsc ? '▲' : '▼') : <ArrowUpDown size={10} />}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleItemSort('category')}>
                    Category {itemSortField === 'category' ? (itemSortAsc ? '▲' : '▼') : <ArrowUpDown size={10} />}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleItemSort('price')}>
                    Price ($) {itemSortField === 'price' ? (itemSortAsc ? '▲' : '▼') : <ArrowUpDown size={10} />}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleItemSort('comment')}>
                    Notes / Details {itemSortField === 'comment' ? (itemSortAsc ? '▲' : '▼') : <ArrowUpDown size={10} />}
                  </th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses && filteredExpenses.length > 0 ? (
                  filteredExpenses.map(item => (
                    <tr key={item.id}>
                      <td>
                        {item.purchased ? (
                          <button
                            className="human-status-btn secured"
                            onClick={() => onRequestUnsecure(item)}
                            title="Click to mark as pending"
                          >
                            <CheckCircle2 size={11} /> Paid
                          </button>
                        ) : (
                          <button
                            className="human-status-btn pending"
                            onClick={() => onUpdatePurchased(item, 1)}
                            title="Click to mark as paid (1-click instant upgrade)"
                          >
                            <Clock size={11} /> Pending
                          </button>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: '#fff' }}>{item.item}</strong>
                      </td>
                      <td>
                        <span className="badge badge-blue">
                          <Tag size={9} /> {item.category || 'General'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: item.price > 0 ? '#60a5fa' : 'var(--text-muted)' }}>
                          {item.price > 0 ? `$${item.price}` : 'Free / Provided'}
                        </strong>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {item.comment || '-'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onOpenEditExpense(item)}
                            title="Edit item details"
                          >
                            <Edit2 size={11} /> Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => onDeleteExpense(item.id)}
                            title="Remove item"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No expenses or bills found matching your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW MODE 2: Clean Equipment Cards Grid */}
        {viewMode === 'cards' && (
          <div className="equipment-grid">
            {filteredExpenses && filteredExpenses.length > 0 ? (
              filteredExpenses.map(item => (
                <div
                  key={item.id}
                  className={`equipment-card ${item.purchased ? 'is-secured' : 'is-planned'}`}
                >
                  <div>
                    <div className="equipment-card-top">
                      <span className="badge badge-blue">
                        <Tag size={9} /> {item.category || 'General'}
                      </span>

                      <div style={{ display: 'flex', gap: '0.2rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.4rem' }}
                          onClick={() => onOpenEditExpense(item)}
                          title="Edit item"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.2rem 0.4rem' }}
                          onClick={() => onDeleteExpense(item.id)}
                          title="Delete item"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    <div className="equipment-title">{item.item}</div>
                    
                    <div className="equipment-price">
                      {item.price > 0 ? `$${item.price}` : 'Free / Provided'}
                    </div>

                    {item.comment && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.45rem', background: '#080c14', padding: '0.35rem 0.5rem', borderRadius: '5px' }}>
                        📝 {item.comment}
                      </p>
                    )}
                  </div>

                  <div className="equipment-footer">
                    {/* Status Button Pill */}
                    {item.purchased ? (
                      <button
                        className="human-status-btn secured"
                        onClick={() => onRequestUnsecure(item)}
                        title="Click to mark as pending (opens confirmation window)"
                      >
                        <CheckCircle2 size={12} /> Paid
                      </button>
                    ) : (
                      <button
                        className="human-status-btn pending"
                        onClick={() => onUpdatePurchased(item, 1)}
                        title="Click to mark as paid (1-click instant upgrade)"
                      >
                        <Clock size={12} /> Pending (Click to Pay)
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                No expense items match your search and status filter.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

