import React, { useState } from 'react';
import {
  DollarSign,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Search,
  ArrowUpDown,
  Wallet,
  Receipt,
  Calendar,
  Layers,
  Filter,
  TrendingUp,
  Maximize2,
  Coins,
  Users,
  GripVertical,
  Eye,
  EyeOff,
  RotateCcw,
  Sliders,
  X,
  MapPin
} from 'lucide-react';
import SpendingDashboard from './SpendingDashboard';

const ALL_CARD_DEFINITIONS = [
  { id: 'initial_capital', label: 'Initial Base Capital' },
  { id: 'main_net', label: 'Main Net Capital' },
  { id: 'cs_shop_profit', label: 'CS Shop Net Profits' },
  { id: 'active_wholesale', label: 'Active Installments Wholesale' },
  { id: 'active_expected_profit', label: 'Active Expected Profit' },
  { id: 'frozen_vault', label: 'Frozen Installment Vault' },
  { id: 'actual_total_cash', label: 'Actual Total Net Cash' },
  { id: 'expected_total_capital', label: 'Expected Total Capital' },
  { id: 'expected_real_capital', label: 'Expected Real Capital' }
];

export default function CapitalOverview({
  summary,
  capitalDeposits = [],
  dailyExpenses = [],
  moneyLocations = [],
  onEditCapital,
  onOpenDepositModal,
  onOpenDailyExpenseModal,
  onDeleteDeposit,
  onDeleteDailyExpense,
  onOpenBreakEvenDetail,
  onOpenCardLocations
}) {
  // Active Log View Tab: 'all' | 'expenses' | 'deposits'
  const [logViewTab, setLogViewTab] = useState('all');

  // Filtering & Sorting State for Daily Expenses
  const [expSearch, setExpSearch] = useState('');
  const [expSortField, setExpSortField] = useState('id');
  const [expSortAsc, setExpSortAsc] = useState(false);
  const [selectedExpCategory, setSelectedExpCategory] = useState('ALL');

  // Filtering & Sorting State for Capital Deposits
  const [depSearch, setDepSearch] = useState('');
  const [depSortField, setDepSortField] = useState('id');
  const [depSortAsc, setDepSortAsc] = useState(false);

  // Dashboard Metric Cards Layout & Visibility State
  const [cardOrder, setCardOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('financial_tracker_card_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure all new card IDs are included
        const missing = ALL_CARD_DEFINITIONS.map(c => c.id).filter(id => !parsed.includes(id));
        return [...parsed, ...missing];
      }
      return ALL_CARD_DEFINITIONS.map(c => c.id);
    } catch (e) {
      return ALL_CARD_DEFINITIONS.map(c => c.id);
    }
  });

  const [hiddenCards, setHiddenCards] = useState(() => {
    try {
      const saved = localStorage.getItem('financial_tracker_hidden_cards');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [draggedCardId, setDraggedCardId] = useState(null);
  const [dragOverCardId, setDragOverCardId] = useState(null);

  if (!summary) return <div className="glass-card">Loading capital summary...</div>;

  const {
    initial_capital = 0,
    shop_allocated_capital = 0,
    total_capital_deposits = 0,
    total_daily_expenses = 0,
    active_plans_count = 0,
    active_installment_wholesale = 0,
    active_installment_sold = 0,
    active_installment_received = 0,
    total_installment_wholesale = 0,
    total_installment_sold = 0,
    total_installment_received = 0,
    total_installment_remaining = 0,
    active_installment_remaining_breakeven = 0,
    installment_breakeven_progress = 0,
    overall_installment_collection_progress = 0,
    completed_installment_received = 0,
    frozen_installment_received = 0,
    frozen_installment_amount = 0,
    actual_capital = 0,
    active_installment_expected_profit = 0,
    expected_capital_with_installments,
    total_net_with_frozen,
    expected_projected_equity,
    shop_total_expenses = 0,
    shop_total_profits = 0,
    shop_breakeven_progress = 0,
    lbp_rate = 89000,
  } = summary || {};

  const safeDailyExpenses = Array.isArray(dailyExpenses) ? dailyExpenses : [];
  const safeCapitalDeposits = Array.isArray(capitalDeposits) ? capitalDeposits : [];

  const effectiveFrozenAmount = frozen_installment_received !== undefined && frozen_installment_received !== null
    ? frozen_installment_received
    : (frozen_installment_amount || 0);

  const effectiveTotalNetWithFrozen = total_net_with_frozen !== undefined && total_net_with_frozen !== null
    ? total_net_with_frozen
    : (actual_capital + effectiveFrozenAmount);

  const effectiveActiveExpectedProfit = active_installment_expected_profit !== undefined && active_installment_expected_profit !== null
    ? active_installment_expected_profit
    : Math.max(0, active_installment_sold - active_installment_wholesale);

  // Expected Total Capital = Main Net Capital + Active Installments Wholesale + Expected Profits
  const effectiveExpectedCapitalWithInstallments = Number(actual_capital || 0) + Number(active_installment_wholesale || 0) + Number(effectiveActiveExpectedProfit || 0);

  const effectiveExpectedEquity = expected_projected_equity !== undefined && expected_projected_equity !== null
    ? expected_projected_equity
    : (effectiveTotalNetWithFrozen + total_installment_remaining + shop_allocated_capital);

  // Drag and Drop Handlers for Metric Cards
  const handleDragStart = (e, id) => {
    setDraggedCardId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    if (id !== dragOverCardId) {
      setDragOverCardId(id);
    }
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedCardId || draggedCardId === targetId) return;

    const newOrder = [...cardOrder];
    const fromIndex = newOrder.indexOf(draggedCardId);
    const toIndex = newOrder.indexOf(targetId);

    if (fromIndex !== -1 && toIndex !== -1) {
      newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, draggedCardId);
      setCardOrder(newOrder);
      try {
        localStorage.setItem('financial_tracker_card_order', JSON.stringify(newOrder));
      } catch (err) { }
    }
    setDraggedCardId(null);
    setDragOverCardId(null);
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
    setDragOverCardId(null);
  };

  const toggleCardVisibility = (id) => {
    let updated;
    if (hiddenCards.includes(id)) {
      updated = hiddenCards.filter(c => c !== id);
    } else {
      updated = [...hiddenCards, id];
    }
    setHiddenCards(updated);
    try {
      localStorage.setItem('financial_tracker_hidden_cards', JSON.stringify(updated));
    } catch (err) { }
  };

  const resetLayoutDefaults = () => {
    const defaultOrder = ALL_CARD_DEFINITIONS.map(c => c.id);
    setCardOrder(defaultOrder);
    setHiddenCards([]);
    try {
      localStorage.removeItem('financial_tracker_card_order');
      localStorage.removeItem('financial_tracker_hidden_cards');
    } catch (err) { }
  };

  // Filter & Sort Daily Expenses
  const categories = ['ALL', ...new Set(safeDailyExpenses.map(item => item?.category).filter(Boolean))];

  const filteredExpenses = safeDailyExpenses.filter(item => {
    if (!item) return false;
    const q = expSearch.toLowerCase().trim();
    const matchesCategory = selectedExpCategory === 'ALL' || item.category === selectedExpCategory;
    if (!q) return matchesCategory;

    const matchesQuery = (
      (item.description && String(item.description).toLowerCase().includes(q)) ||
      (item.category && String(item.category).toLowerCase().includes(q)) ||
      (item.date && String(item.date).toLowerCase().includes(q)) ||
      (item.amount && String(item.amount).includes(q))
    );
    return matchesCategory && matchesQuery;
  }).sort((a, b) => {
    let valA = a[expSortField];
    let valB = b[expSortField];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return expSortAsc ? -1 : 1;
    if (valA > valB) return expSortAsc ? 1 : -1;
    return 0;
  });

  // Filter & Sort Capital Deposits
  const filteredDeposits = safeCapitalDeposits.filter(item => {
    if (!item) return false;
    const q = depSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (item.description && String(item.description).toLowerCase().includes(q)) ||
      (item.date && String(item.date).toLowerCase().includes(q)) ||
      (item.amount && String(item.amount).includes(q))
    );
  }).sort((a, b) => {
    let valA = a[depSortField];
    let valB = b[depSortField];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return depSortAsc ? -1 : 1;
    if (valA > valB) return depSortAsc ? 1 : -1;
    return 0;
  });

  const handleExpSort = (field) => {
    if (expSortField === field) {
      setExpSortAsc(!expSortAsc);
    } else {
      setExpSortField(field);
      setExpSortAsc(true);
    }
  };

  const handleDepSort = (field) => {
    if (depSortField === field) {
      setDepSortAsc(!depSortAsc);
    } else {
      setDepSortField(field);
      setDepSortAsc(true);
    }
  };

  const targetCapital = shop_total_expenses > 0 ? shop_total_expenses : (shop_allocated_capital > 0 ? shop_allocated_capital : 1400);
  const remainingToBreakEven = Math.max(0, targetCapital - shop_total_profits);

  // Expense & Deposit helper stats for logs UI
  const expCount = safeDailyExpenses.length;
  const avgExpense = expCount > 0 ? ((total_daily_expenses || 0) / expCount).toFixed(2) : '0.00';
  const maxExpense = expCount > 0 ? safeDailyExpenses.reduce((max, e) => Math.max(max, Number(e?.amount) || 0), 0) : 0;

  const depCount = safeCapitalDeposits.length;
  const avgDeposit = depCount > 0 ? ((total_capital_deposits || 0) / depCount).toFixed(2) : '0.00';
  const latestDeposit = depCount > 0 ? safeCapitalDeposits[0] : null;

  // Render individual card by ID
  const renderCardContent = (cardId) => {
    switch (cardId) {
      case 'initial_capital':
        return (
          <div className="glass-card cool-metric-card" style={{ '--card-glow-color': '#3b82f6', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(15, 23, 42, 0.95))', borderColor: 'rgba(59, 130, 246, 0.3)', height: '100%' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Initial Base Capital</span>
              </div>
              <div className="cool-icon-badge">
                <DollarSign size={16} color="#60a5fa" />
              </div>
            </div>
            <div className="metric-value glow-value-white" style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.2rem 0' }}>
              ${initial_capital.toLocaleString()}
            </div>
            <div className="metric-sub" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Starting Baseline</span>
              <span style={{ color: '#34d399', fontWeight: 600 }}>🇱🇧 1$={lbp_rate.toLocaleString()}</span>
            </div>
          </div>
        );

      case 'main_net':
        const mainNetLocations = moneyLocations.filter(loc => loc.fund_type === 'main_net');
        return (
          <div
            className="glass-card cool-metric-card"
            style={{ '--card-glow-color': '#60a5fa', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.16), rgba(15, 23, 42, 0.95))', borderColor: 'rgba(96, 165, 250, 0.45)', height: '100%', cursor: 'pointer' }}
            onClick={() => onOpenCardLocations && onOpenCardLocations({ id: 'main_net', label: 'Main Net Capital', totalAmount: actual_capital })}
          >
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Main Net Capital</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCardLocations && onOpenCardLocations({ id: 'main_net', label: 'Main Net Capital', totalAmount: actual_capital });
                  }}
                  style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.35)', color: '#60a5fa' }}
                  title="Click to split and manage storage locations for Main Net Capital"
                >
                  <MapPin size={11} /> Split {mainNetLocations.length > 0 && `(${mainNetLocations.length})`}
                </button>
                <div className="cool-icon-badge" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                  <Wallet size={16} color="#60a5fa" />
                </div>
              </div>
            </div>
            <div className="metric-value glow-value-blue" style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.2rem 0' }}>
              ${actual_capital.toLocaleString()}
            </div>
            <div className="metric-sub" style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              💧 Currently available liquid cash
            </div>
            {mainNetLocations.length > 0 && (
              <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {mainNetLocations.map(loc => (
                  <span key={loc.id} style={{ background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.35)', color: '#60a5fa', padding: '0.12rem 0.45rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                    📍 {loc.location_name}: ${Number(loc.amount).toLocaleString()}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      case 'cs_shop_profit':
        const shopLocations = moneyLocations.filter(loc => loc.fund_type === 'cs_shop_profit');
        return (
          <div
            className="glass-card cool-metric-card"
            style={{ '--card-glow-color': '#34d399', background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.16), rgba(15, 23, 42, 0.95))', borderColor: 'rgba(52, 211, 153, 0.45)', height: '100%', cursor: 'pointer' }}
            onClick={() => onOpenCardLocations && onOpenCardLocations({ id: 'cs_shop_profit', label: 'CS Shop Net Profits', totalAmount: shop_total_profits })}
          >
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>CS Shop Net Profits</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCardLocations && onOpenCardLocations({ id: 'cs_shop_profit', label: 'CS Shop Net Profits', totalAmount: shop_total_profits });
                  }}
                  style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(52, 211, 153, 0.2)', border: '1px solid rgba(52, 211, 153, 0.35)', color: '#34d399' }}
                  title="Click to split and manage storage locations for CS Shop Net Profits"
                >
                  <MapPin size={11} /> Split {shopLocations.length > 0 && `(${shopLocations.length})`}
                </button>
                <div className="cool-icon-badge" style={{ background: 'rgba(52, 211, 153, 0.15)' }}>
                  <TrendingUp size={16} color="#34d399" />
                </div>
              </div>
            </div>
            <div className="metric-value glow-value-emerald" style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.2rem 0', color: '#34d399' }}>
              +${shop_total_profits.toLocaleString()}
            </div>
            <div className="metric-sub" style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              🎮 Net profits collected from CS 1.6 shop
            </div>
            {shopLocations.length > 0 && (
              <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {shopLocations.map(loc => (
                  <span key={loc.id} style={{ background: 'rgba(52, 211, 153, 0.2)', border: '1px solid rgba(52, 211, 153, 0.35)', color: '#34d399', padding: '0.12rem 0.45rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                    📍 {loc.location_name}: ${Number(loc.amount).toLocaleString()}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      case 'active_wholesale':
        return (
          <div className="glass-card cool-metric-card" style={{ '--card-glow-color': '#f87171', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.16), rgba(15, 23, 42, 0.95))', borderColor: 'rgba(248, 113, 113, 0.45)', height: '100%' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Installments Wholesale</span>
              <div className="cool-icon-badge" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
                <Users size={16} color="#f87171" />
              </div>
            </div>
            <div className="metric-value glow-value-rose" style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.2rem 0' }}>
              ${(active_installment_wholesale || 0).toLocaleString()}
            </div>
            <div className="metric-sub" style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              🏷️ Wholesale in {active_plans_count || 0} active deals
            </div>
          </div>
        );

      case 'active_expected_profit':
        return (
          <div className="glass-card cool-metric-card" style={{ '--card-glow-color': '#c084fc', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.16), rgba(15, 23, 42, 0.95))', borderColor: 'rgba(192, 132, 252, 0.45)', height: '100%' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Expected Profit</span>
              <div className="cool-icon-badge" style={{ background: 'rgba(168, 85, 247, 0.15)' }}>
                <TrendingUp size={16} color="#c084fc" />
              </div>
            </div>
            <div className="metric-value glow-value-purple" style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.2rem 0', color: '#c084fc' }}>
              +${(effectiveActiveExpectedProfit || 0).toLocaleString()}
            </div>
            <div className="metric-sub" style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              🎯 Expected profit from active installment plans
            </div>
          </div>
        );

      case 'frozen_vault':
        const frozenVaultLocations = moneyLocations.filter(loc => loc.fund_type === 'frozen_vault');
        return (
          <div
            className="glass-card cool-metric-card"
            style={{ '--card-glow-color': '#fbbf24', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(15, 23, 42, 0.95))', borderColor: 'rgba(251, 191, 36, 0.45)', height: '100%', cursor: 'pointer' }}
            onClick={() => onOpenCardLocations && onOpenCardLocations({ id: 'frozen_vault', label: 'Frozen Installment Vault', totalAmount: effectiveFrozenAmount })}
          >
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Frozen Installment Vault</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCardLocations && onOpenCardLocations({ id: 'frozen_vault', label: 'Frozen Installment Vault', totalAmount: effectiveFrozenAmount });
                  }}
                  style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.35)', color: '#fbbf24', borderRadius: '4px' }}
                  title="Click to split and manage storage locations for Frozen Vault"
                >
                  <MapPin size={11} /> Split {frozenVaultLocations.length > 0 && `(${frozenVaultLocations.length})`}
                </button>
                <div className="cool-icon-badge" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                  <Coins size={16} color="#fbbf24" />
                </div>
              </div>
            </div>
            <div className="metric-value glow-value-amber" style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.2rem 0', color: '#fbbf24' }}>
              ${effectiveFrozenAmount.toLocaleString()}
            </div>
            <div className="metric-sub" style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              🔒 Kept alone frozen until active deals complete
            </div>
            {frozenVaultLocations.length > 0 && (
              <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {frozenVaultLocations.map(loc => (
                  <span key={loc.id} style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.35)', color: '#fbbf24', padding: '0.12rem 0.45rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                    📍 {loc.location_name}: ${Number(loc.amount).toLocaleString()}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      case 'actual_total_cash':
        const cashLocations = moneyLocations.filter(loc => loc.fund_type === 'actual_total_cash');
        return (
          <div
            className="glass-card cool-metric-card"
            style={{ '--card-glow-color': '#34d399', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(15, 23, 42, 0.95))', borderColor: 'rgba(52, 211, 153, 0.45)', height: '100%', cursor: 'pointer' }}
            onClick={() => onOpenCardLocations && onOpenCardLocations({ id: 'actual_total_cash', label: 'Actual Total Net Cash', totalAmount: effectiveTotalNetWithFrozen })}
          >
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Actual Total Net Cash</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCardLocations && onOpenCardLocations({ id: 'actual_total_cash', label: 'Actual Total Net Cash', totalAmount: effectiveTotalNetWithFrozen });
                  }}
                  style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34d399' }}
                  title="Click to split and manage storage locations for Actual Total Net Cash"
                >
                  <MapPin size={11} /> Split {cashLocations.length > 0 && `(${cashLocations.length})`}
                </button>
                <div className="cool-icon-badge" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                  <DollarSign size={16} color="#34d399" />
                </div>
              </div>
            </div>
            <div className="metric-value glow-value-emerald" style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.2rem 0' }}>
              ${effectiveTotalNetWithFrozen.toLocaleString()}
            </div>
            <div className="metric-sub" style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              💵 Main (${actual_capital.toLocaleString()}) + Vault (${effectiveFrozenAmount.toLocaleString()})
            </div>
            {cashLocations.length > 0 && (
              <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {cashLocations.map(loc => (
                  <span key={loc.id} style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34d399', padding: '0.12rem 0.45rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                    📍 {loc.location_name}: ${Number(loc.amount).toLocaleString()}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      case 'expected_total_capital':
        return (
          <div className="glass-card cool-metric-card" style={{ '--card-glow-color': '#06b6d4', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.18), rgba(15, 23, 42, 0.95))', borderColor: 'rgba(6, 182, 212, 0.45)', height: '100%' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Expected Total Capital</span>
              <div className="cool-icon-badge" style={{ background: 'rgba(6, 182, 212, 0.15)' }}>
                <TrendingUp size={16} color="#38bdf8" />
              </div>
            </div>
            <div className="metric-value glow-value-blue" style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.2rem 0', color: '#38bdf8' }}>
              ${effectiveExpectedCapitalWithInstallments.toLocaleString()}
            </div>
            <div className="metric-sub" style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Main Capital (${actual_capital.toLocaleString()}) + Wholesale (${(active_installment_wholesale || 0).toLocaleString()}) + Expected Profits (+${(effectiveActiveExpectedProfit || 0).toLocaleString()})
            </div>
          </div>
        );

      case 'expected_real_capital':
        return (
          <div className="glass-card cool-metric-card" style={{ '--card-glow-color': '#c084fc', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(15, 23, 42, 0.95))', borderColor: 'rgba(192, 132, 252, 0.45)', height: '100%' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Expected Real Capital</span>
              <div className="cool-icon-badge" style={{ background: 'rgba(168, 85, 247, 0.15)' }}>
                <TrendingUp size={16} color="#c084fc" />
              </div>
            </div>
            <div className="metric-value glow-value-purple" style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.2rem 0' }}>
              ${effectiveExpectedEquity.toLocaleString()}
            </div>
            <div className="metric-sub" style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              📈 Total Assets & Projected Recoveries
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const visibleCardIds = cardOrder.filter(id => !hiddenCards.includes(id));

  return (
    <div className="capital-overview-container">
      {/* Cards Layout & Visibility Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <GripVertical size={15} color="#3b82f6" />
          <span>Drag metric cards to reorder • Config saved automatically</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
          >
            <Sliders size={13} /> Customize Cards {hiddenCards.length > 0 && `(${hiddenCards.length} Hidden)`}
          </button>
        </div>
      </div>

      {/* Visibility Toggle Controls Panel */}
      {isCustomizeOpen && (
        <div className="glass-card" style={{ marginBottom: '1.25rem', padding: '1rem', border: '1px solid rgba(59, 130, 246, 0.35)', background: '#0a101f' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
              <Eye size={16} color="#60a5fa" /> Show or Hide Metric Cards
            </h4>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={resetLayoutDefaults} style={{ fontSize: '0.75rem' }}>
                <RotateCcw size={12} /> Reset Defaults
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsCustomizeOpen(false)}>
                <X size={13} />
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
            {ALL_CARD_DEFINITIONS.map(card => {
              const isVisible = !hiddenCards.includes(card.id);
              return (
                <label
                  key={card.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    padding: '0.5rem 0.75rem',
                    background: isVisible ? 'rgba(59, 130, 246, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                    border: `1px solid ${isVisible ? 'rgba(59, 130, 246, 0.35)' : 'rgba(255, 255, 255, 0.06)'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    color: isVisible ? '#fff' : 'var(--text-muted)'
                  }}
                >
                  <span style={{ fontWeight: isVisible ? 600 : 400 }}>{card.label}</span>
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => toggleCardVisibility(card.id)}
                    style={{ accentColor: '#3b82f6', cursor: 'pointer' }}
                  />
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Main Cards Grid (Draggable & Reorderable) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {visibleCardIds.map(cardId => {
          const isDragging = draggedCardId === cardId;
          const isOver = dragOverCardId === cardId;

          return (
            <div
              key={cardId}
              draggable
              onDragStart={(e) => handleDragStart(e, cardId)}
              onDragOver={(e) => handleDragOver(e, cardId)}
              onDrop={(e) => handleDrop(e, cardId)}
              onDragEnd={handleDragEnd}
              style={{
                cursor: 'grab',
                opacity: isDragging ? 0.4 : 1,
                border: isOver ? '2px dashed #60a5fa' : undefined,
                borderRadius: '12px',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
                position: 'relative'
              }}
            >
              <div style={{ position: 'absolute', top: '8px', right: '8px', opacity: 0.3, pointerEvents: 'none', zIndex: 2 }}>
                <GripVertical size={14} color="#fff" />
              </div>
              {renderCardContent(cardId)}
            </div>
          );
        })}
      </div>



      {/* --- SEPARATE FULL-WIDTH SECTION 1: CS SHOP BREAK-EVEN PROGRESS --- */}
      <div className="glass-card full-width-overview-card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-title" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={20} color="#3b82f6" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>CS 1.6 Shop Break-Even Progress Analysis</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Capital recovery tracking against paid shop equipment investment</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-blue">{shop_breakeven_progress}% Recovered</span>
            <button className="btn btn-secondary btn-sm" onClick={onOpenBreakEvenDetail} title="Click to view detailed break-even breakdown and profit history log">
              <Maximize2 size={13} /> Detailed View
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
          <div style={{ background: '#080c14', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Paid Equipment Target</span>
            <strong style={{ color: '#60a5fa', fontSize: '1.2rem' }}>${shop_allocated_capital.toLocaleString()}</strong>
          </div>
          <div style={{ background: '#080c14', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Collected Shop Profits</span>
            <strong style={{ color: '#34d399', fontSize: '1.2rem' }}>+${shop_total_profits.toLocaleString()}</strong>
          </div>
          <div style={{ background: '#080c14', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Remaining to Break Even</span>
            <strong style={{ color: remainingToBreakEven === 0 ? '#34d399' : '#fb7185', fontSize: '1.2rem' }}>${remainingToBreakEven.toLocaleString()}</strong>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <span style={{ fontSize: '0.75rem', color: '#fbbf24', display: 'block', fontWeight: 600 }}>Pending Expenses to Pay</span>
            <strong style={{ color: '#fbbf24', fontSize: '1.2rem' }}>${Math.max(0, shop_total_expenses - shop_allocated_capital).toLocaleString()}</strong>
          </div>
          <div style={{ background: '#080c14', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Setup & Operational</span>
            <strong style={{ color: '#fff', fontSize: '1.2rem' }}>${shop_total_expenses.toLocaleString()}</strong>
          </div>
        </div>

        <div style={{ background: 'rgba(8, 12, 20, 0.6)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
            <span>Progress: <strong>${shop_total_profits.toLocaleString()}</strong> collected of <strong>${targetCapital.toLocaleString()}</strong> total setup target</span>
            <span style={{ color: '#60a5fa', fontWeight: 600 }}>{shop_breakeven_progress}%</span>
          </div>

          <div className="progress-bar-container" style={{ height: '10px' }}>
            <div
              className="progress-bar-fill fill-blue"
              style={{ width: `${Math.min(100, shop_breakeven_progress)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* --- SEPARATE FULL-WIDTH SECTION 2: INSTALLMENTS PORTFOLIO RECOVERY & BREAK-EVEN PROGRESS --- */}
      <div className="glass-card full-width-overview-card" style={{ marginBottom: '1.5rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <div className="card-title" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Users size={20} color="#fbbf24" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Installments Portfolio Recovery & Break-Even Progress</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Progress of recovering active wholesale capital across all customer installment plans</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-amber">{installment_breakeven_progress || 0}% Recovered</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
          <div style={{ background: '#080c14', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Active Wholesale Spent</span>
            <strong style={{ color: '#f87171', fontSize: '1.2rem' }}>${(active_installment_wholesale || 0).toLocaleString()}</strong>
          </div>

          <div style={{ background: '#080c14', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Active Cash Collected</span>
            <strong style={{ color: '#34d399', fontSize: '1.2rem' }}>${(active_installment_received || frozen_installment_received || 0).toLocaleString()}</strong>
          </div>

          <div style={{ background: '#080c14', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Remaining to Break Even</span>
            <strong style={{ color: (active_installment_remaining_breakeven || 0) === 0 ? '#34d399' : '#fb7185', fontSize: '1.2rem' }}>
              {(active_installment_remaining_breakeven || 0) === 0 ? '✓ Break-Even Met!' : `$${(active_installment_remaining_breakeven || 0).toLocaleString()}`}
            </strong>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <span style={{ fontSize: '0.75rem', color: '#fbbf24', display: 'block', fontWeight: 600 }}>Frozen Cash (Vault)</span>
            <strong style={{ color: '#fbbf24', fontSize: '1.2rem' }}>${(frozen_installment_received || 0).toLocaleString()}</strong>
          </div>
        </div>

        <div style={{ background: 'rgba(8, 12, 20, 0.6)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
            <span>Wholesale Break-Even Progress: <strong>${(active_installment_received || frozen_installment_received || 0).toLocaleString()}</strong> collected of <strong>${(active_installment_wholesale || 0).toLocaleString()}</strong> active wholesale target</span>
            <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem' }}>{installment_breakeven_progress || 0}%</span>
          </div>

          <div className="progress-bar-container" style={{ height: '10px' }}>
            <div
              className="progress-bar-fill fill-amber"
              style={{
                width: `${Math.min(100, Math.max(0, installment_breakeven_progress || 0))}%`,
                background: 'linear-gradient(90deg, #d97706, #fbbf24)',
                boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)'
              }}
            ></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.45rem' }}>
            <span>💡 Money collected on active plans (${(frozen_installment_received || 0).toLocaleString()}) is kept frozen alone until plans are 100% completed.</span>
            <span style={{ color: '#fbbf24', fontWeight: 600 }}>Remaining: ${(active_installment_remaining_breakeven || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* --- SEPARATE FULL-WIDTH SECTION 2: TIME-BASED SPENDING DASHBOARD --- */}
      <SpendingDashboard
        dailyExpenses={safeDailyExpenses}
        capitalDeposits={safeCapitalDeposits}
        actual_capital={actual_capital}
        total_daily_expenses={total_daily_expenses}
        total_capital_deposits={total_capital_deposits}
      />

      {/* --- SEPARATE FULL-WIDTH LOGS SECTION HEADER --- */}
      <div className="section-header-banner">
        <div className="section-header-title">
          <Receipt size={22} color="#60a5fa" />
          <div>
            <h2>Financial Inflows & Personal Expenses Logs</h2>
            <p>Clear, wide view of daily spending deductions and salary / top-up capital deposits</p>
          </div>
        </div>

        {/* View Switcher Sub-tabs */}
        <div className="sub-tab-group">
          <button
            className={`sub-tab ${logViewTab === 'all' ? 'active' : ''}`}
            onClick={() => setLogViewTab('all')}
          >
            <Layers size={14} />
            <span>Show Both Sections</span>
          </button>
          <button
            className={`sub-tab ${logViewTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setLogViewTab('expenses')}
          >
            <ArrowDownRight size={14} color="#fb7185" />
            <span>Personal Expenses ({expCount})</span>
          </button>
          <button
            className={`sub-tab ${logViewTab === 'deposits' ? 'active' : ''}`}
            onClick={() => setLogViewTab('deposits')}
          >
            <ArrowUpRight size={14} color="#34d399" />
            <span>Salary & Deposits ({depCount})</span>
          </button>
        </div>
      </div>

      {/* 1. PERSONAL DAILY EXPENSES LOG - FULL WIDTH DISTINCT SECTION */}
      {(logViewTab === 'all' || logViewTab === 'expenses') && (
        <div className="glass-card full-width-log-card exp-card-theme">
          <div className="log-card-header">
            <div className="log-header-left">
              <div className="log-icon-badge bg-rose-gradient">
                <ArrowDownRight size={22} color="#ffffff" />
              </div>
              <div>
                <h3 className="log-title">Personal Daily Expenses Log</h3>
                <p className="log-subtitle">Deducted directly from Net Cash Capital balance</p>
              </div>
            </div>

            <div className="log-header-actions">
              <button className="btn btn-danger" onClick={onOpenDailyExpenseModal}>
                <ArrowDownRight size={15} /> Deduct Personal Expense
              </button>
            </div>
          </div>

          {/* Key Expense Metrics Bar */}
          <div className="kpi-mini-grid">
            <div className="kpi-mini-item">
              <span className="kpi-label">Total Expenses Deducted</span>
              <span className="kpi-val text-rose">-${total_daily_expenses.toLocaleString()}</span>
            </div>
            <div className="kpi-mini-item">
              <span className="kpi-label">Record Count</span>
              <span className="kpi-val">{expCount} items</span>
            </div>
            <div className="kpi-mini-item">
              <span className="kpi-label">Average Expense</span>
              <span className="kpi-val">${avgExpense}</span>
            </div>
            <div className="kpi-mini-item">
              <span className="kpi-label">Highest Single Expense</span>
              <span className="kpi-val text-rose">${maxExpense.toLocaleString()}</span>
            </div>
          </div>

          {/* Search & Category Filter Controls Bar */}
          <div className="filter-controls-row">
            <div className="search-input-wrapper">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                className="form-input search-field"
                placeholder="Search daily expenses by category, description, date, or amount..."
                value={expSearch}
                onChange={e => setExpSearch(e.target.value)}
              />
            </div>

            {/* Category Filter Pills */}
            <div className="category-pills">
              <Filter size={13} style={{ opacity: 0.6, marginRight: 4 }} />
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`pill-btn ${selectedExpCategory === cat ? 'active-rose' : ''}`}
                  onClick={() => setSelectedExpCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Full-Width Spacious Expenses Table */}
          <div className="table-container wide-table-container">
            <table className="custom-table wide-table">
              <thead>
                <tr>
                  <th style={{ width: '130px', cursor: 'pointer' }} onClick={() => handleExpSort('date')}>
                    <div className="th-content">
                      <Calendar size={13} />
                      Date {expSortField === 'date' ? (expSortAsc ? '▲' : '▼') : <ArrowUpDown size={11} />}
                    </div>
                  </th>
                  <th style={{ width: '160px', cursor: 'pointer' }} onClick={() => handleExpSort('category')}>
                    <div className="th-content">
                      Category {expSortField === 'category' ? (expSortAsc ? '▲' : '▼') : <ArrowUpDown size={11} />}
                    </div>
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleExpSort('description')}>
                    <div className="th-content">
                      Description / Note {expSortField === 'description' ? (expSortAsc ? '▲' : '▼') : <ArrowUpDown size={11} />}
                    </div>
                  </th>
                  <th style={{ width: '150px', cursor: 'pointer', textAlign: 'right' }} onClick={() => handleExpSort('amount')}>
                    <div className="th-content" style={{ justifyContent: 'flex-end' }}>
                      Amount ($) {expSortField === 'amount' ? (expSortAsc ? '▲' : '▼') : <ArrowUpDown size={11} />}
                    </div>
                  </th>
                  <th style={{ width: '90px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses && filteredExpenses.length > 0 ? (
                  filteredExpenses.map(expense => (
                    <tr key={expense.id} className="table-row-hover">
                      <td><strong className="date-badge">{expense.date || '-'}</strong></td>
                      <td><span className="badge badge-rose text-uppercase">{expense.category || 'General'}</span></td>
                      <td className="desc-cell">{expense.description || <span className="text-muted">No description</span>}</td>
                      <td style={{ textAlign: 'right' }}>
                        <strong className="amount-text-rose">-${Number(expense.amount || 0).toLocaleString()}</strong>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-danger btn-sm icon-only-btn"
                          title="Delete expense entry"
                          onClick={() => onDeleteDailyExpense(expense.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-table-cell">
                      <div className="empty-state-box">
                        <Receipt size={32} style={{ opacity: 0.3 }} />
                        <p>No personal daily expenses found matching your filter.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. SALARY & CAPITAL DEPOSITS LOG - FULL WIDTH DISTINCT SECTION */}
      {(logViewTab === 'all' || logViewTab === 'deposits') && (
        <div className="glass-card full-width-log-card dep-card-theme">
          <div className="log-card-header">
            <div className="log-header-left">
              <div className="log-icon-badge bg-emerald-gradient">
                <ArrowUpRight size={22} color="#ffffff" />
              </div>
              <div>
                <h3 className="log-title">Salary & Capital Deposits Log</h3>
                <p className="log-subtitle">Direct capital top-ups, salary additions, and fund increases</p>
              </div>
            </div>

            <div className="log-header-actions">
              <button className="btn btn-emerald" onClick={onOpenDepositModal}>
                <ArrowUpRight size={15} /> Add Salary / Capital Deposit
              </button>
            </div>
          </div>

          {/* Key Deposit Metrics Bar */}
          <div className="kpi-mini-grid">
            <div className="kpi-mini-item">
              <span className="kpi-label">Total Deposits Added</span>
              <span className="kpi-val text-emerald">+${total_capital_deposits.toLocaleString()}</span>
            </div>
            <div className="kpi-mini-item">
              <span className="kpi-label">Deposit Entries</span>
              <span className="kpi-val">{depCount} entries</span>
            </div>
            <div className="kpi-mini-item">
              <span className="kpi-label">Average Deposit</span>
              <span className="kpi-val">${avgDeposit}</span>
            </div>
            <div className="kpi-mini-item">
              <span className="kpi-label">Latest Top-Up</span>
              <span className="kpi-val text-emerald">{latestDeposit ? `$${latestDeposit.amount} (${latestDeposit.date})` : 'N/A'}</span>
            </div>
          </div>

          {/* Search Filter Bar */}
          <div className="filter-controls-row">
            <div className="search-input-wrapper">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                className="form-input search-field"
                placeholder="Search deposits by source, notes, date, or amount..."
                value={depSearch}
                onChange={e => setDepSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Full-Width Spacious Deposits Table */}
          <div className="table-container wide-table-container">
            <table className="custom-table wide-table">
              <thead>
                <tr>
                  <th style={{ width: '130px', cursor: 'pointer' }} onClick={() => handleDepSort('date')}>
                    <div className="th-content">
                      <Calendar size={13} />
                      Date {depSortField === 'date' ? (depSortAsc ? '▲' : '▼') : <ArrowUpDown size={11} />}
                    </div>
                  </th>
                  <th style={{ width: '180px', cursor: 'pointer' }} onClick={() => handleDepSort('source')}>
                    <div className="th-content">
                      Deposit Source {depSortField === 'source' ? (depSortAsc ? '▲' : '▼') : <ArrowUpDown size={11} />}
                    </div>
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleDepSort('notes')}>
                    <div className="th-content">
                      Notes & References {depSortField === 'notes' ? (depSortAsc ? '▲' : '▼') : <ArrowUpDown size={11} />}
                    </div>
                  </th>
                  <th style={{ width: '160px', cursor: 'pointer', textAlign: 'right' }} onClick={() => handleDepSort('amount')}>
                    <div className="th-content" style={{ justifyContent: 'flex-end' }}>
                      Amount ($) {depSortField === 'amount' ? (depSortAsc ? '▲' : '▼') : <ArrowUpDown size={11} />}
                    </div>
                  </th>
                  <th style={{ width: '90px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeposits && filteredDeposits.length > 0 ? (
                  filteredDeposits.map(dep => (
                    <tr key={dep.id} className="table-row-hover">
                      <td><strong className="date-badge">{dep.date || '-'}</strong></td>
                      <td><span className="badge badge-emerald text-uppercase">{dep.source || 'Salary'}</span></td>
                      <td className="desc-cell">{dep.notes || <span className="text-muted">-</span>}</td>
                      <td style={{ textAlign: 'right' }}>
                        <strong className="amount-text-emerald">+${Number(dep.amount || 0).toLocaleString()}</strong>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-danger btn-sm icon-only-btn"
                          title="Delete capital deposit entry"
                          onClick={() => onDeleteDeposit(dep.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-table-cell">
                      <div className="empty-state-box">
                        <Wallet size={32} style={{ opacity: 0.3 }} />
                        <p>No capital deposits found matching your filter.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
