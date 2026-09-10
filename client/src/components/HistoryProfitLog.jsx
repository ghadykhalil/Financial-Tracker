import React, { useState } from 'react';
import { History, TrendingUp, DollarSign, Calendar, Plus, Trash2, Edit2, Award, Search, ArrowUpDown } from 'lucide-react';

export default function HistoryProfitLog({
  salesHistory,
  shopProfits,
  totalSalesProfit,
  totalShopProfits,
  onOpenNewSale,
  onOpenNewShopProfit,
  onOpenEditShopProfit,
  onDeleteSale,
  onDeleteShopProfit,
  summary
}) {
  // Sales History Search & Sort State
  const [salesSearch, setSalesSearch] = useState('');
  const [salesSortField, setSalesSortField] = useState('id');
  const [salesSortAsc, setSalesSortAsc] = useState(false);

  // Shop Profits Search & Sort State
  const [profitSearch, setProfitSearch] = useState('');
  const [profitSortField, setProfitSortField] = useState('id');
  const [profitSortAsc, setProfitSortAsc] = useState(false);

  const combinedTotalProfits = (totalSalesProfit || 0) + (totalShopProfits || 0);

  // Filter & Sort Sales History
  const filteredSales = (salesHistory || []).filter(sale => {
    const q = salesSearch.toLowerCase();
    return (
      (sale.item_name && sale.item_name.toLowerCase().includes(q)) ||
      (sale.bought_by && sale.bought_by.toLowerCase().includes(q)) ||
      (sale.location && sale.location.toLowerCase().includes(q)) ||
      (sale.comment && sale.comment.toLowerCase().includes(q)) ||
      (sale.profit && sale.profit.toString().includes(q))
    );
  }).sort((a, b) => {
    let valA = a[salesSortField];
    let valB = b[salesSortField];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return salesSortAsc ? -1 : 1;
    if (valA > valB) return salesSortAsc ? 1 : -1;
    return 0;
  });

  const handleSalesSort = (field) => {
    if (salesSortField === field) {
      setSalesSortAsc(!salesSortAsc);
    } else {
      setSalesSortField(field);
      setSalesSortAsc(true);
    }
  };

  // Filter & Sort Shop Profits
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

  return (
    <div className="history-profit-log-container">
      {/* Top Profit Summary Cards */}
      <div className="grid-4">
        <div className="glass-card">
          <div className="metric-label">All-Time Direct Sales Profits</div>
          <div className="metric-value" style={{ color: '#34d399' }}>
            ${totalSalesProfit?.toLocaleString()}
          </div>
          <div className="metric-sub">
            <Award size={14} color="#34d399" /> From past laptop & PC flips
          </div>
        </div>

        <div className="glass-card">
          <div className="metric-label">CS 1.6 Shop Accumulated Profits</div>
          <div className="metric-value" style={{ color: '#60a5fa' }}>
            ${totalShopProfits?.toLocaleString()}
          </div>
          <div className="metric-sub">
            <TrendingUp size={14} color="#60a5fa" /> Daily shop gaming revenue
          </div>
        </div>

        <div className="glass-card">
          <div className="metric-label">Total Realized Revenue Profit</div>
          <div className="metric-value" style={{ color: '#fbbf24' }}>
            ${combinedTotalProfits?.toLocaleString()}
          </div>
          <div className="metric-sub">
            <DollarSign size={14} color="#fbbf24" /> Combined historical profit total
          </div>
        </div>

        <div className="glass-card">
          <div className="metric-label">Completed Sales Count</div>
          <div className="metric-value">
            {salesHistory?.length || 0} Transactions
          </div>
          <div className="metric-sub">Recorded in database</div>
        </div>
      </div>

      {/* CS 1.6 Shop Daily Profit Logger Section */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="#60a5fa" />
            <span>CS 1.6 Shop Daily & Periodic Profit Log</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="badge badge-blue" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
              🇱🇧 1$ = {(summary?.lbp_rate || 89000).toLocaleString()} LBP
            </span>
            <button className="btn btn-emerald btn-sm" onClick={onOpenNewShopProfit}>
              <Plus size={14} /> Log Daily Earnings
            </button>
          </div>
        </div>

        {/* Search Filter Bar */}
        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2rem', fontSize: '0.82rem' }}
            placeholder="Search shop profits by date or notes..."
            value={profitSearch}
            onChange={e => setProfitSearch(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => handleProfitSort('date')}>
                  Date {profitSortField === 'date' ? (profitSortAsc ? '▲' : '▼') : <ArrowUpDown size={11} />}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleProfitSort('amount')}>
                  Profit Amount ($) {profitSortField === 'amount' ? (profitSortAsc ? '▲' : '▼') : <ArrowUpDown size={11} />}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleProfitSort('notes')}>
                  Notes / Revenue Source {profitSortField === 'notes' ? (profitSortAsc ? '▲' : '▼') : <ArrowUpDown size={11} />}
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
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
                    <td style={{ color: 'var(--text-secondary)' }}>{entry.notes || 'Gaming session profits'}</td>
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
                    No daily CS shop earnings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Sales Log Section */}
      <div className="glass-card">
        <div className="card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} color="#34d399" />
            <span>Past Sales History & Flip Log</span>
          </div>

          <button className="btn btn-primary btn-sm" onClick={onOpenNewSale}>
            <Plus size={14} /> Log New Direct Sale
          </button>
        </div>

        {/* Search Filter Bar */}
        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2rem', fontSize: '0.82rem' }}
            placeholder="Search past sales by item, customer, or location..."
            value={salesSearch}
            onChange={e => setSalesSearch(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSalesSort('item_name')}>
                  Item Sold {salesSortField === 'item_name' ? (salesSortAsc ? '▲' : '▼') : <ArrowUpDown size={11} />}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSalesSort('bought_by')}>
                  Customer {salesSortField === 'bought_by' ? (salesSortAsc ? '▲' : '▼') : <ArrowUpDown size={11} />}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSalesSort('location')}>
                  Location {salesSortField === 'location' ? (salesSortAsc ? '▲' : '▼') : <ArrowUpDown size={11} />}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSalesSort('wholesale_price')}>
                  Wholesale {salesSortField === 'wholesale_price' ? (salesSortAsc ? '▲' : '▼') : <ArrowUpDown size={11} />}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSalesSort('sold_price')}>
                  Sold For {salesSortField === 'sold_price' ? (salesSortAsc ? '▲' : '▼') : <ArrowUpDown size={11} />}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSalesSort('profit')}>
                  Profit ($) {salesSortField === 'profit' ? (salesSortAsc ? '▲' : '▼') : <ArrowUpDown size={11} />}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSalesSort('comment')}>
                  Comments {salesSortField === 'comment' ? (salesSortAsc ? '▲' : '▼') : <ArrowUpDown size={11} />}
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales && filteredSales.length > 0 ? (
                filteredSales.map(sale => (
                  <tr key={sale.id}>
                    <td><strong style={{ color: '#fff' }}>{sale.item_name}</strong></td>
                    <td>{sale.bought_by || '-'}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{sale.location || 'Sold'}</td>
                    <td>${sale.wholesale_price}</td>
                    <td>${sale.sold_price}</td>
                    <td>
                      <strong style={{ color: sale.profit >= 100 ? '#34d399' : '#60a5fa' }}>
                        +${sale.profit}
                      </strong>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{sale.comment || '-'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => onDeleteSale(sale.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No sales history entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
