import React, { useState } from 'react';
import { Tag, Plus, Trash2, Edit2, Search, ArrowUpDown, LayoutGrid, List, DollarSign, TrendingUp, BookOpen, ShieldCheck, Award } from 'lucide-react';

export default function PricingCatalog({
  catalogItems = [],
  onOpenNewCatalogModal,
  onOpenEditCatalogModal,
  onDeleteCatalogItem
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [catalogSearch, setCatalogSearch] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortAsc, setSortAsc] = useState(false);

  const categories = ['All', 'Laptops', 'Gaming PCs', 'Consoles', 'Monitors & Displays', 'Components & Parts', 'Beverages & Snacks', 'General'];

  // Filter & Sort Items
  const filteredItems = (catalogItems || []).filter(item => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    const q = catalogSearch.toLowerCase().trim();
    if (!q) return true;

    return (
      (item.item_name && item.item_name.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.notes && item.notes.toLowerCase().includes(q)) ||
      (item.buy_price_guide && item.buy_price_guide.toString().includes(q)) ||
      (item.sell_price_guide && item.sell_price_guide.toString().includes(q))
    );
  }).sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Metrics
  const totalItems = catalogItems.length;
  const totalAvgBuy = totalItems > 0 ? catalogItems.reduce((acc, i) => acc + (i.buy_price_guide || 0), 0) / totalItems : 0;
  const totalAvgSell = totalItems > 0 ? catalogItems.reduce((acc, i) => acc + (i.sell_price_guide || 0), 0) / totalItems : 0;
  const avgMargin = totalAvgSell - totalAvgBuy;

  return (
    <div className="pricing-catalog-container">
      {/* Top Metrics Cards */}
      <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
        <div className="glass-card">
          <div className="metric-label">Pricing Catalog Models</div>
          <div className="metric-value">{totalItems} Models</div>
          <div className="metric-sub">
            <BookOpen size={13} color="#60a5fa" /> High-level buy & sell reference
          </div>
        </div>

        <div className="glass-card">
          <div className="metric-label">Average Buy Target</div>
          <div className="metric-value" style={{ color: '#60a5fa' }}>
            ${Math.round(totalAvgBuy).toLocaleString()}
          </div>
          <div className="metric-sub">
            <DollarSign size={13} color="#60a5fa" /> Target wholesale buy range
          </div>
        </div>

        <div className="glass-card">
          <div className="metric-label">Average Target Selling</div>
          <div className="metric-value" style={{ color: '#34d399' }}>
            ${Math.round(totalAvgSell).toLocaleString()}
          </div>
          <div className="metric-sub">
            <TrendingUp size={13} color="#34d399" /> Expected resale price
          </div>
        </div>

        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(15, 23, 42, 0.95))', borderColor: 'rgba(245, 158, 11, 0.35)' }}>
          <div className="metric-label">Average Profit Margin</div>
          <div className="metric-value" style={{ color: '#fbbf24' }}>
            +${Math.round(avgMargin).toLocaleString()}
          </div>
          <div className="metric-sub">
            <Award size={13} color="#fbbf24" /> Profit margin per product guide
          </div>
        </div>
      </div>

      {/* Main Catalog Section Card */}
      <div className="glass-card">
        <div className="card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={18} color="#60a5fa" />
            <div>
              <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>Product Pricing & Valuation Catalog Guide</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Quick reference catalog for standard buy & sell price targets without serial-by-serial tracking</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* View Mode Switcher */}
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

            <button className="btn btn-primary btn-sm" onClick={onOpenNewCatalogModal}>
              <Plus size={14} /> + Add Catalog Model
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
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

          <div style={{ position: 'relative', width: '230px' }}>
            <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '1.8rem', fontSize: '0.8rem' }}
              placeholder="Search catalog models or notes..."
              value={catalogSearch}
              onChange={e => setCatalogSearch(e.target.value)}
            />
          </div>
        </div>

        {/* VIEW 1: Table View (Default) */}
        {viewMode === 'table' && (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('item_name')}>
                    Item / Model Description {sortField === 'item_name' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown size={10} />}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('category')}>
                    Category {sortField === 'category' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown size={10} />}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('buy_price_guide')}>
                    Target Buy Price ($) {sortField === 'buy_price_guide' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown size={10} />}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('sell_price_guide')}>
                    Target Sell Price ($) {sortField === 'sell_price_guide' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown size={10} />}
                  </th>
                  <th>Expected Margin ($)</th>
                  <th>Pricing Guidelines & Condition Notes</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems && filteredItems.length > 0 ? (
                  filteredItems.map(item => {
                    const margin = (item.sell_price_guide || 0) - (item.buy_price_guide || 0);
                    const marginPct = item.buy_price_guide > 0 ? Math.round((margin / item.buy_price_guide) * 100) : 0;

                    return (
                      <tr key={item.id}>
                        <td>
                          <strong style={{ color: '#fff' }}>{item.item_name}</strong>
                        </td>
                        <td>
                          <span className="badge badge-blue">
                            <Tag size={9} /> {item.category || 'General'}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: '#60a5fa' }}>${item.buy_price_guide}</strong>
                        </td>
                        <td>
                          <strong style={{ color: '#34d399' }}>${item.sell_price_guide}</strong>
                        </td>
                        <td>
                          <span className="badge badge-amber" style={{ fontWeight: 700 }}>
                            +${margin} ({marginPct}%)
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {item.notes || '-'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => onOpenEditCatalogModal(item)}
                              title="Edit item guide"
                            >
                              <Edit2 size={11} /> Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => onDeleteCatalogItem(item.id)}
                              title="Delete entry"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No pricing catalog entries match your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 2: Grid Cards View */}
        {viewMode === 'cards' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {filteredItems && filteredItems.length > 0 ? (
              filteredItems.map(item => {
                const margin = (item.sell_price_guide || 0) - (item.buy_price_guide || 0);

                return (
                  <div
                    key={item.id}
                    className="equipment-card"
                    style={{ background: '#0a0f1d', border: '1px solid var(--bg-card-border)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span className="badge badge-blue">
                          <Tag size={9} /> {item.category || 'General'}
                        </span>

                        <div style={{ display: 'flex', gap: '0.2rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.2rem 0.4rem' }}
                            onClick={() => onOpenEditCatalogModal(item)}
                            title="Edit"
                          >
                            <Edit2 size={11} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.2rem 0.4rem' }}
                            onClick={() => onDeleteCatalogItem(item.id)}
                            title="Delete"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>

                      <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.75rem' }}>{item.item_name}</h4>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#080c14', padding: '0.6rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
                        <div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Target Buy</span>
                          <strong style={{ color: '#60a5fa', fontSize: '1rem' }}>${item.buy_price_guide}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Target Sell</span>
                          <strong style={{ color: '#34d399', fontSize: '1rem' }}>${item.sell_price_guide}</strong>
                        </div>
                      </div>

                      {item.notes && (
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.6rem', borderRadius: '6px' }}>
                          📝 {item.notes}
                        </p>
                      )}
                    </div>

                    <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Target Profit:</span>
                      <span className="badge badge-amber" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                        +${margin} Margin
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                No pricing catalog items found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
