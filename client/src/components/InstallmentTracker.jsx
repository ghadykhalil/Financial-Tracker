import React, { useState } from 'react';
import { CheckCircle2, Clock, MapPin, Plus, Trash2, Edit2, ChevronDown, ChevronUp, Search, ArrowUpDown, Lock, Unlock, ShieldCheck, DollarSign, TrendingUp } from 'lucide-react';

export default function InstallmentTracker({
  plans,
  onTogglePayment,
  onToggleEndPlan,
  onOpenPaymentModal,
  onOpenNewPlanModal,
  onDeletePlan,
  onEditPlan,
  onOpenEditPaymentModal,
  onDeletePayment
}) {
  const [expandedPlanId, setExpandedPlanId] = useState(plans?.[0]?.id || null);
  const [planSearch, setPlanSearch] = useState('');
  const [planSortField, setPlanSortField] = useState('id');
  const [planSortAsc, setPlanSortAsc] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active'); // 'active' | 'closed' | 'all'

  if (!plans || plans.length === 0) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem' }}>
        <h3>No Customer Installment Plans Found</h3>
        <p style={{ color: 'var(--text-secondary)', margin: '0.75rem 0' }}>Add customer plans to track monthly payment schedules and expected profits.</p>
        <button className="btn btn-primary" onClick={onOpenNewPlanModal}>
          <Plus size={15} /> Create Installment Plan
        </button>
      </div>
    );
  }

  // Active vs Closed Grouping
  const activePlans = (plans || []).filter(p => p.status !== 'completed');
  const closedPlans = (plans || []).filter(p => p.status === 'completed');

  // Active Plans Financial Metrics
  const activeWholesaleSpent = activePlans.reduce((acc, p) => acc + (p.wholesale_price || 0), 0);
  const activeSoldTotal = activePlans.reduce((acc, p) => acc + (p.sold_price || 0), 0);
  const activeReceivedTotal = activePlans.reduce((acc, p) => acc + (p.total_received || 0), 0);
  const activeRemainingBreakEven = activePlans.reduce((acc, p) => acc + Math.max(0, (p.wholesale_price || 0) - (p.total_received || 0)), 0);
  const activeExpectedProfit = activePlans.reduce((acc, p) => acc + ((p.sold_price || 0) - (p.wholesale_price || 0)), 0);

  // Closed / Finalized Plans Financial Metrics
  const closedWholesaleSpent = closedPlans.reduce((acc, p) => acc + (p.wholesale_price || 0), 0);
  const closedSoldTotal = closedPlans.reduce((acc, p) => acc + (p.sold_price || 0), 0);
  const closedReceivedTotal = closedPlans.reduce((acc, p) => acc + (p.total_received || 0), 0);
  const closedRealizedProfit = closedPlans.reduce((acc, p) => acc + Math.max(0, (p.total_received || 0) - (p.wholesale_price || 0)), 0);

  // Filter & Sort Plans
  const filteredPlans = (plans || []).filter(plan => {
    // Status tab filter
    if (statusFilter === 'active' && plan.status === 'completed') return false;
    if (statusFilter === 'closed' && plan.status !== 'completed') return false;

    // Search query filter
    const q = planSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (plan.customer_name && plan.customer_name.toLowerCase().includes(q)) ||
      (plan.item_name && plan.item_name.toLowerCase().includes(q)) ||
      (plan.location && plan.location.toLowerCase().includes(q)) ||
      (plan.comment && plan.comment.toLowerCase().includes(q))
    );
  }).sort((a, b) => {
    let valA = a[planSortField];
    let valB = b[planSortField];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return planSortAsc ? -1 : 1;
    if (valA > valB) return planSortAsc ? 1 : -1;
    return 0;
  });

  const handlePlanSort = (field) => {
    if (planSortField === field) {
      setPlanSortAsc(!planSortAsc);
    } else {
      setPlanSortField(field);
      setPlanSortAsc(true);
    }
  };

  return (
    <div className="installment-tracker-container">
      {/* Divided Overview Cards (Active vs Closed) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(15, 23, 42, 0.95))', borderColor: 'rgba(239, 68, 68, 0.35)' }}>
          <div className="metric-label">Active Wholesale Spent</div>
          <div className="metric-value" style={{ color: '#f87171' }}>${activeWholesaleSpent.toLocaleString()}</div>
          <div className="metric-sub" style={{ color: 'var(--text-secondary)' }}>
            Wholesale spent on {activePlans.length} active customer deals
          </div>
        </div>

        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.14), rgba(15, 23, 42, 0.95))', borderColor: 'rgba(192, 132, 252, 0.35)' }}>
          <div className="metric-label">Active Expected Profit</div>
          <div className="metric-value" style={{ color: '#c084fc' }}>+${activeExpectedProfit.toLocaleString()}</div>
          <div className="metric-sub" style={{ color: 'var(--text-secondary)' }}>
            Expected profit from active plans
          </div>
        </div>

        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.14), rgba(15, 23, 42, 0.95))', borderColor: 'rgba(6, 182, 212, 0.35)' }}>
          <div className="metric-label">Overall Expected Return</div>
          <div className="metric-value" style={{ color: '#38bdf8' }}>${activeSoldTotal.toLocaleString()}</div>
          <div className="metric-sub" style={{ color: 'var(--text-secondary)' }}>
            Wholesale (${activeWholesaleSpent.toLocaleString()}) + Profit (+${activeExpectedProfit.toLocaleString()})
          </div>
        </div>

        <div className="glass-card">
          <div className="metric-label">Active Cash Collected</div>
          <div className="metric-value" style={{ color: '#34d399' }}>${activeReceivedTotal.toLocaleString()}</div>
          <div className="metric-sub" style={{ color: '#fbbf24' }}>
            Frozen alone until active deals 100% finished
          </div>
        </div>

        <div className="glass-card">
          <div className="metric-label">Active Needed to Break Even</div>
          <div className="metric-value" style={{ color: activeRemainingBreakEven === 0 ? '#34d399' : '#fbbf24' }}>
            ${activeRemainingBreakEven.toLocaleString()}
          </div>
          <div className="metric-sub">Unrecovered active wholesale cost</div>
        </div>

        <div className="glass-card" style={{ background: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(148, 163, 184, 0.25)' }}>
          <div className="metric-label">Old / Closed Wholesale</div>
          <div className="metric-value" style={{ color: '#94a3b8' }}>${closedWholesaleSpent.toLocaleString()}</div>
          <div className="metric-sub" style={{ color: 'var(--text-muted)' }}>
            {closedPlans.length} finalized & archived deals
          </div>
        </div>

        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(15, 23, 42, 0.95))', borderColor: 'rgba(245, 158, 11, 0.35)' }}>
          <div className="metric-label">Closed Deals Net Profit</div>
          <div className="metric-value" style={{ color: '#fbbf24' }}>+${closedRealizedProfit.toLocaleString()}</div>
          <div className="metric-sub">Realized profit from finalized deals</div>
        </div>
      </div>

      {/* Filter & Sort Controls for Customer Plans */}
      <div className="glass-card" style={{ marginBottom: '1rem', padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {/* Status Tab Filters */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <button
              className={`filter-btn ${statusFilter === 'active' ? 'active-category' : ''}`}
              onClick={() => setStatusFilter('active')}
              style={{ fontWeight: 600 }}
            >
              ⚡ Active Plans ({activePlans.length})
            </button>
            <button
              className={`filter-btn ${statusFilter === 'closed' ? 'active-category' : ''}`}
              onClick={() => setStatusFilter('closed')}
              style={{ fontWeight: 600 }}
            >
              🔒 Closed & Finalized ({closedPlans.length})
            </button>
            <button
              className={`filter-btn ${statusFilter === 'all' ? 'active-category' : ''}`}
              onClick={() => setStatusFilter('all')}
              style={{ fontWeight: 600 }}
            >
              📁 All Plans ({plans.length})
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
            <div style={{ position: 'relative', minWidth: '200px' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2rem', fontSize: '0.85rem' }}
                placeholder="Search customers, products..."
                value={planSearch}
                onChange={e => setPlanSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Sort:</span>
              <button className="btn btn-secondary btn-sm" onClick={() => handlePlanSort('customer_name')}>
                Customer {planSortField === 'customer_name' ? (planSortAsc ? '▲' : '▼') : ''}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => handlePlanSort('total_received')}>
                Received {planSortField === 'total_received' ? (planSortAsc ? '▲' : '▼') : ''}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => handlePlanSort('sold_price')}>
                Sold {planSortField === 'sold_price' ? (planSortAsc ? '▲' : '▼') : ''}
              </button>
            </div>

            <button
              className="btn btn-primary btn-sm"
              onClick={onOpenNewPlanModal}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={14} /> New Installment Plan
            </button>
          </div>
        </div>
      </div>

      {/* Plans List Accordion / Card View */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredPlans.map(plan => {
          const isExpanded = expandedPlanId === plan.id;
          const isClosed = plan.status === 'completed';
          const progressPercent = plan.sold_price > 0 ? Math.min(100, Math.round((plan.total_received / plan.sold_price) * 100)) : 0;
          const planBreakEvenRemaining = Math.max(0, (plan.wholesale_price || 0) - (plan.total_received || 0));
          const planExpectedProfit = (plan.sold_price || 0) - (plan.wholesale_price || 0);
          const planRealizedProfit = plan.total_received > plan.wholesale_price ? (plan.total_received - plan.wholesale_price) : 0;

          return (
            <div key={plan.id} className="accordion-item" style={{ opacity: isClosed ? 0.92 : 1, border: isClosed ? '1px solid rgba(16, 185, 129, 0.35)' : undefined }}>
              {/* Plan Card Header */}
              <div
                className="accordion-header"
                onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: isClosed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.15)',
                      color: isClosed ? '#34d399' : '#60a5fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }}
                  >
                    {isClosed ? <Lock size={18} /> : (plan.customer_name ? plan.customer_name.charAt(0) : 'C')}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', color: '#fff' }}>
                        {plan.customer_name}
                      </h3>

                      {isClosed ? (
                        <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(16, 185, 129, 0.25)', border: '1px solid #10b981', color: '#34d399' }}>
                          <Lock size={10} /> Closed & Finalized (Locked)
                        </span>
                      ) : (
                        <span className={`badge ${plan.is_fully_paid ? 'badge-emerald' : 'badge-blue'}`}>
                          {plan.is_fully_paid ? 'Fully Paid' : `${progressPercent}% Paid`}
                        </span>
                      )}

                      {plan.location && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <MapPin size={11} /> {plan.location}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      <strong>{plan.item_name}</strong> • Spent: <strong style={{ color: '#fff' }}>${plan.wholesale_price}</strong> • Sold: <strong style={{ color: '#fff' }}>${plan.sold_price}</strong> • Exp. Profit: <span style={{ color: '#c084fc', fontWeight: 600 }}>+${planExpectedProfit}</span> • Earned: <span style={{ color: '#34d399', fontWeight: 600 }}>${plan.total_received || 0}</span> • Break-Even Needed: <strong style={{ color: planBreakEvenRemaining === 0 ? '#34d399' : '#fbbf24' }}>{planBreakEvenRemaining === 0 ? '✓ Met' : `$${planBreakEvenRemaining}`}</strong>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Spent (Wholesale)</div>
                    <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>
                      ${plan.wholesale_price || 0}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expected Profit</div>
                    <div style={{ fontWeight: '700', color: '#c084fc', fontSize: '0.95rem' }}>
                      +${planExpectedProfit}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Earned (Received)</div>
                    <div style={{ fontWeight: '700', color: '#34d399', fontSize: '0.95rem' }}>
                      ${plan.total_received || 0}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>To Break Even</div>
                    <div style={{ fontWeight: '700', color: planBreakEvenRemaining === 0 ? '#34d399' : '#fb7185', fontSize: '0.95rem' }}>
                      {planBreakEvenRemaining === 0 ? '✓ Met' : `$${planBreakEvenRemaining}`}
                    </div>
                  </div>

                  {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </div>
              </div>

              {/* Progress Bar inside Header */}
              <div style={{ padding: '0 1.25rem', marginBottom: '0.4rem' }}>
                <div className="progress-bar-container" style={{ height: '5px', margin: 0 }}>
                  <div
                    className={`progress-bar-fill ${isClosed ? 'fill-emerald' : 'fill-blue'}`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Plan Card Expanded Body */}
              {isExpanded && (
                <div className="accordion-body">
                  {/* --- PER-PLAN FINANCIAL BREAKDOWN BANNER --- */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem', background: '#080c14', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--bg-card-border)' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>💳 Wholesale Cost</span>
                      <strong style={{ color: '#fff', fontSize: '1.1rem' }}>${(plan.wholesale_price || 0).toLocaleString()}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>🏷️ Total Sold Price</span>
                      <strong style={{ color: '#fff', fontSize: '1.1rem' }}>${(plan.sold_price || 0).toLocaleString()}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>🎯 Expected Profit</span>
                      <strong style={{ color: '#c084fc', fontSize: '1.1rem' }}>+${planExpectedProfit.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>💵 Cash Received</span>
                      <strong style={{ color: '#34d399', fontSize: '1.1rem' }}>${(plan.total_received || 0).toLocaleString()}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>⚖️ Remaining Break-Even</span>
                      <strong style={{ color: planBreakEvenRemaining === 0 ? '#34d399' : '#fb7185', fontSize: '1.1rem' }}>
                        {planBreakEvenRemaining === 0 ? '✓ Met!' : `$${planBreakEvenRemaining.toLocaleString()}`}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>📈 Realized Profit</span>
                      <strong style={{ color: '#fbbf24', fontSize: '1.1rem' }}>
                        {planRealizedProfit > 0 ? `+$${planRealizedProfit.toLocaleString()}` : '$0'}
                      </strong>
                    </div>
                  </div>

                  {/* Header & Lock Action Controls */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.85rem 0 0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        Monthly Payment Schedule
                      </h4>
                      {isClosed && (
                        <span style={{ fontSize: '0.78rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Lock size={12} /> Editing is locked (End Payment active)
                        </span>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                      {/* End Payment Toggle Button */}
                      <button
                        className={`btn btn-sm ${isClosed ? 'btn-secondary' : 'btn-emerald'}`}
                        onClick={(e) => { e.stopPropagation(); onToggleEndPlan && onToggleEndPlan(plan); }}
                        title={isClosed ? 'Reopen plan for editing' : 'End payment & lock editing on this plan'}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}
                      >
                        {isClosed ? <><Unlock size={13} /> Reopen Plan</> : <><Lock size={13} /> End Payment (Lock Editing)</>}
                      </button>

                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={isClosed}
                        onClick={(e) => { e.stopPropagation(); !isClosed && onOpenPaymentModal(plan); }}
                        title={isClosed ? 'Payment ended - unlock to edit' : 'Custom Payment'}
                        style={{ opacity: isClosed ? 0.45 : 1, cursor: isClosed ? 'not-allowed' : 'pointer' }}
                      >
                        <Plus size={13} /> Custom Payment
                      </button>
                      
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={isClosed}
                        onClick={(e) => { e.stopPropagation(); !isClosed && onEditPlan(plan); }}
                        title={isClosed ? 'Payment ended - unlock to edit' : 'Edit Plan'}
                        style={{ opacity: isClosed ? 0.45 : 1, cursor: isClosed ? 'not-allowed' : 'pointer' }}
                      >
                        <Edit2 size={13} /> Edit Plan
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={(e) => { e.stopPropagation(); onDeletePlan(plan.id); }}
                        title="Delete Plan"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Payments Table */}
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Month / Date</th>
                          <th>Amount Due</th>
                          <th>Amount Received</th>
                          <th>Status</th>
                          <th>Notes / Milestone</th>
                          <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plan.payments && plan.payments.length > 0 ? (
                          plan.payments.map(payment => (
                            <tr key={payment.id} style={{ opacity: isClosed ? 0.8 : 1 }}>
                              <td><strong>{payment.date_label}</strong></td>
                              <td>${payment.amount_due}</td>
                              <td style={{ color: payment.amount_received > 0 ? '#34d399' : 'inherit' }}>
                                ${payment.amount_received}
                              </td>
                              <td>
                                {payment.is_paid ? (
                                  <span className="badge badge-emerald">
                                    <CheckCircle2 size={11} /> Paid
                                  </span>
                                ) : (
                                  <span className="badge badge-amber">
                                    <Clock size={11} /> Due
                                  </span>
                                )}
                              </td>
                              <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                {payment.notes || '-'}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                  <button
                                    className={`btn btn-sm ${payment.is_paid ? 'btn-secondary' : 'btn-emerald'}`}
                                    disabled={isClosed}
                                    onClick={() => !isClosed && onTogglePayment(payment.id)}
                                    title={isClosed ? 'Plan ended - unlock to change status' : (payment.is_paid ? 'Mark Unpaid' : 'Mark Paid')}
                                    style={{ opacity: isClosed ? 0.45 : 1, cursor: isClosed ? 'not-allowed' : 'pointer' }}
                                  >
                                    {payment.is_paid ? 'Mark Unpaid' : 'Mark Paid'}
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    disabled={isClosed}
                                    onClick={() => !isClosed && onOpenEditPaymentModal && onOpenEditPaymentModal(plan, payment)}
                                    title={isClosed ? 'Plan ended - unlock to edit payment' : 'Edit Payment'}
                                    style={{ opacity: isClosed ? 0.45 : 1, cursor: isClosed ? 'not-allowed' : 'pointer' }}
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    disabled={isClosed}
                                    onClick={() => !isClosed && onDeletePayment && onDeletePayment(payment.id)}
                                    title={isClosed ? 'Plan ended - unlock to delete payment' : 'Delete Payment'}
                                    style={{ opacity: isClosed ? 0.45 : 1, cursor: isClosed ? 'not-allowed' : 'pointer' }}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                              No monthly schedule entries recorded yet. Click 'Custom Payment' to add.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {plan.comment && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      📝 <strong>Comment:</strong> {plan.comment}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

