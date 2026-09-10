import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Wallet,
  Calendar,
  BarChart2,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';

function parseDate(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function formatShortDate(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return dateStr || '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function AreaChart({ data, height = 220 }) {
  const [hovered, setHovered] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        No data for the selected period
      </div>
    );
  }

  const padding = { top: 24, right: 20, bottom: 40, left: 64 };
  const viewW = 700;
  const W = viewW - padding.left - padding.right;
  const H = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map(d => Math.max(d.expenses, d.deposits)), 1);
  const range = maxVal || 1;

  const xScale = (i) => (i / Math.max(data.length - 1, 1)) * W;
  const yScale = (v) => H - (v / range) * H;

  const expPath = data.map((d, i) => (i === 0 ? 'M' : 'L') + ' ' + xScale(i) + ',' + yScale(d.expenses)).join(' ');
  const depPath = data.map((d, i) => (i === 0 ? 'M' : 'L') + ' ' + xScale(i) + ',' + yScale(d.deposits)).join(' ');

  const expArea = expPath + ' L ' + xScale(data.length - 1) + ',' + H + ' L 0,' + H + ' Z';
  const depArea = depPath + ' L ' + xScale(data.length - 1) + ',' + H + ' L 0,' + H + ' Z';

  const ticks = 5;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => (range / ticks) * i);

  const labelStep = Math.max(1, Math.floor(data.length / 8));

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <svg viewBox={'0 0 ' + viewW + ' ' + height} style={{ width: '100%', height, overflow: 'visible', display: 'block' }} onMouseLeave={() => setHovered(null)}>
        <defs>
          <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="depGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <g transform={'translate(' + padding.left + ',' + padding.top + ')'}>
          {yTicks.map((v, i) => (
            <g key={i}>
              <line x1={0} y1={yScale(v)} x2={W} y2={yScale(v)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <text x={-8} y={yScale(v) + 4} textAnchor="end" fontSize="10" fill="rgba(255,255,255,0.35)">
                {'$' + (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v.toFixed(0))}
              </text>
            </g>
          ))}
          <path d={depArea} fill="url(#depGrad)" />
          <path d={depPath} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinejoin="round" />
          <path d={expArea} fill="url(#expGrad)" />
          <path d={expPath} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinejoin="round" />
          {data.map((d, i) => {
            const x = xScale(i);
            const isHov = hovered === i;
            return (
              <g key={i}>
                <circle cx={x} cy={yScale(d.expenses)} r={isHov ? "6" : "4.5"} fill="#f43f5e" opacity="0.9" style={{ pointerEvents: 'none', transition: 'r 0.2s' }} />
                <circle cx={x} cy={yScale(d.deposits)} r={isHov ? "6" : "4.5"} fill="#34d399" opacity="0.9" style={{ pointerEvents: 'none', transition: 'r 0.2s' }} />
              </g>
            );
          })}
          {hovered !== null && data[hovered] && (
            <line x1={xScale(hovered)} y1={0} x2={xScale(hovered)} y2={H} stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="4 4" style={{ pointerEvents: 'none' }} />
          )}
          {data.map((d, i) => {
            const step = W / Math.max(data.length - 1, 1);
            return (
              <rect key={`hit-${i}`} x={xScale(i) - step/2} y={0} width={step} height={H} fill="transparent" style={{ cursor: 'pointer' }} onMouseEnter={() => setHovered(i)} />
            );
          })}
          {data.map((d, i) => {
            if (i % labelStep !== 0 && i !== data.length - 1) return null;
            return (
              <text key={i} x={xScale(i)} y={H + 18} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)">
                {formatShortDate(d.label)}
              </text>
            );
          })}
          <line x1={0} y1={0} x2={0} y2={H} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1={0} y1={H} x2={W} y2={H} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        </g>
      </svg>
      {hovered !== null && data[hovered] && (() => {
        const d = data[hovered];
        const x = xScale(hovered);
        const net = d.deposits - d.expenses;
        const netColor = net > 0 ? '#34d399' : net < 0 ? '#f43f5e' : 'var(--text-muted)';
        const netSign = net > 0 ? '+' : '';
        return (
          <div style={{
            position: 'absolute',
            left: `calc(${(x + padding.left) / viewW * 100}% - 75px)`,
            top: 5,
            width: 150,
            background: 'rgba(15,23,42,0.95)',
            border: `1px solid rgba(255,255,255,0.1)`,
            borderRadius: '6px',
            padding: '0.45rem',
            color: '#fff',
            fontSize: '0.75rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
            zIndex: 10
          }}>
            <div style={{ fontWeight: 600, textAlign: 'center', marginBottom: '0.35rem', paddingBottom: '0.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{formatShortDate(d.label)}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Deposits:</span>
              <span style={{ color: '#34d399', fontWeight: 600 }}>${d.deposits.toLocaleString(undefined, {maximumFractionDigits: 1})}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Expenses:</span>
              <span style={{ color: '#f43f5e', fontWeight: 600 }}>${d.expenses.toLocaleString(undefined, {maximumFractionDigits: 1})}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Net:</span>
              <span style={{ color: netColor, fontWeight: 700 }}>{netSign}${net.toLocaleString(undefined, {maximumFractionDigits: 1})}</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function SpendingDashboard({
  dailyExpenses = [],
  capitalDeposits = [],
  actual_capital = 0,
}) {
  const [period, setPeriod] = useState('30');
  const [chartMode, setChartMode] = useState(() => localStorage.getItem('spendingChartMode') || 'daily');
  const [idealSavingsRate, setIdealSavingsRate] = useState(() => {
    const saved = localStorage.getItem('spendingSavingsRate');
    return saved ? parseInt(saved, 10) : 80;
  });
  const [baselineSalary, setBaselineSalary] = useState(() => {
    const saved = localStorage.getItem('spendingBaselineSalary');
    return saved ? parseInt(saved, 10) : 1250;
  });

  useEffect(() => {
    localStorage.setItem('spendingChartMode', chartMode);
  }, [chartMode]);

  useEffect(() => {
    localStorage.setItem('spendingSavingsRate', idealSavingsRate);
  }, [idealSavingsRate]);

  useEffect(() => {
    localStorage.setItem('spendingBaselineSalary', baselineSalary);
  }, [baselineSalary]);

  const periods = [
    { id: '7', label: '7 Days' },
    { id: '30', label: '30 Days' },
    { id: '90', label: '90 Days' },
    { id: 'all', label: 'All Time' },
  ];

  const cutoff = useMemo(() => {
    if (period === 'all') return null;
    const d = new Date();
    d.setDate(d.getDate() - parseInt(period, 10));
    return d;
  }, [period]);

  const filteredExpenses = useMemo(() =>
    dailyExpenses.filter(e => {
      if (!cutoff) return true;
      const d = parseDate(e && e.date);
      return d && d >= cutoff;
    }), [dailyExpenses, cutoff]);

  const filteredDeposits = useMemo(() =>
    capitalDeposits.filter(d => {
      if (!cutoff) return true;
      const dt = parseDate(d && d.date);
      return dt && dt >= cutoff;
    }), [capitalDeposits, cutoff]);

  const periodSpent = filteredExpenses.reduce((s, e) => s + (Number(e && e.amount) || 0), 0);
  const periodDeposits = filteredDeposits.reduce((s, d) => s + (Number(d && d.amount) || 0), 0);
  const periodNet = periodDeposits - periodSpent;

  const dayCount = period === 'all' ? Math.max(1, (() => {
    const all = [
      ...dailyExpenses.map(e => parseDate(e && e.date)),
      ...capitalDeposits.map(d => parseDate(d && d.date)),
    ].filter(Boolean);
    if (!all.length) return 1;
    const mn = new Date(Math.min(...all));
    const mx = new Date(Math.max(...all));
    return Math.max(1, Math.round((mx - mn) / 86400000) + 1);
  })()) : parseInt(period, 10);

  const avgDailySpend = periodSpent / dayCount;
  const avgDailySave = periodNet / dayCount;
  const safeDailyBudget = actual_capital > 0 ? actual_capital / 30 : 0;
  const budgetStatus = avgDailySpend <= safeDailyBudget ? 'good' : avgDailySpend <= safeDailyBudget * 1.5 ? 'warning' : 'over';

  const chartData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach(e => {
      const d = e && e.date;
      if (!d) return;
      if (!map[d]) map[d] = { expenses: 0, deposits: 0 };
      map[d].expenses += Number(e.amount) || 0;
    });
    filteredDeposits.forEach(d => {
      const dt = d && d.date;
      if (!dt) return;
      if (!map[dt]) map[dt] = { expenses: 0, deposits: 0 };
      map[dt].deposits += Number(d.amount) || 0;
    });
    const sorted = Object.keys(map).sort().map(date => ({ label: date, ...map[date] }));
    if (chartMode === 'cumulative') {
      let ce = 0, cd = 0;
      return sorted.map(row => { ce += row.expenses; cd += row.deposits; return { label: row.label, expenses: ce, deposits: cd }; });
    }
    return sorted;
  }, [filteredExpenses, filteredDeposits, chartMode]);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    filteredExpenses.forEach(e => {
      const cat = (e && e.category) || 'General';
      map[cat] = (map[cat] || 0) + (Number(e && e.amount) || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [filteredExpenses]);

  const categoryTotal = categoryBreakdown.reduce((s, [, v]) => s + v, 0) || 1;
  const catColors = ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];
  const statusColors = { good: '#34d399', warning: '#fbbf24', over: '#f43f5e' };
  const statusLabels = {
    good: 'On track — spending is within your safe daily budget',
    warning: 'Slightly over budget — consider reducing daily spending',
    over: 'Over budget — spending significantly exceeds your safe daily limit',
  };
  const statusIcons = { good: '✅', warning: '⚠️', over: '🔴' };

  const savingsRate = periodDeposits > 0 ? Math.max(0, Math.min(100, ((periodDeposits - periodSpent) / periodDeposits) * 100)) : 0;
  const rateColor = savingsRate >= 20 ? '#34d399' : savingsRate >= 0 ? '#fbbf24' : '#f43f5e';

  // Smart Recommendations - Strict Baseline Strategy
  const targetDailySpend = (baselineSalary * (1 - idealSavingsRate / 100)) / 30;
  const proratedBaseline = baselineSalary * (dayCount / 30);
  const windfallAmount = Math.max(0, periodDeposits - proratedBaseline);
  const differenceToTarget = targetDailySpend - avgDailySpend;

  return (
    <div className="glass-card full-width-overview-card" style={{ marginBottom: '1.5rem', border: '1px solid rgba(59,130,246,0.25)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: '10px', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(99,102,241,0.4)' }}>
            <BarChart2 size={22} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>Spending &amp; Savings Dashboard</h3>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0.1rem 0 0' }}>Time-based analysis of expenses, deposits, and how much you can safely spend</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.25rem' }}>
          {periods.map(p => (
            <button key={p.id} onClick={() => setPeriod(p.id)} style={{ padding: '0.35rem 0.85rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.2s', background: period === p.id ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'transparent', color: period === p.id ? '#fff' : 'var(--text-muted)', boxShadow: period === p.id ? '0 0 12px rgba(99,102,241,0.4)' : 'none' }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Total Spent', value: '$' + periodSpent.toLocaleString(undefined, { maximumFractionDigits: 0 }), sub: 'in this period', color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.3)', icon: <TrendingDown size={16} color="#f43f5e" /> },
          { label: 'Deposited', value: '$' + periodDeposits.toLocaleString(undefined, { maximumFractionDigits: 0 }), sub: 'salary & capital added', color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)', icon: <TrendingUp size={16} color="#34d399" /> },
          { label: 'Net Saved', value: (periodNet >= 0 ? '+' : '') + '$' + Math.abs(periodNet).toLocaleString(undefined, { maximumFractionDigits: 0 }), sub: periodNet >= 0 ? 'positive cash flow' : 'net deficit', color: periodNet >= 0 ? '#a5b4fc' : '#f43f5e', bg: periodNet >= 0 ? 'rgba(99,102,241,0.12)' : 'rgba(244,63,94,0.08)', border: periodNet >= 0 ? 'rgba(99,102,241,0.35)' : 'rgba(244,63,94,0.25)', icon: <PiggyBank size={16} color={periodNet >= 0 ? '#818cf8' : '#f43f5e'} /> },
          { label: 'Avg Daily Spend', value: '$' + avgDailySpend.toLocaleString(undefined, { maximumFractionDigits: 1 }), sub: 'per day this period', color: '#fbbf24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.25)', icon: <Calendar size={16} color="#fbbf24" /> },
          { label: 'Net Capital', value: '$' + actual_capital.toLocaleString(undefined, { maximumFractionDigits: 0 }), sub: 'liquid available now', color: '#60a5fa', bg: 'rgba(59,130,246,0.14)', border: 'rgba(59,130,246,0.35)', icon: <Wallet size={16} color="#60a5fa" /> },
          { label: 'Safe Daily Budget', value: '$' + safeDailyBudget.toLocaleString(undefined, { maximumFractionDigits: 1 }), sub: 'cap/day for 30 days', color: statusColors[budgetStatus], bg: statusColors[budgetStatus] + '18', border: statusColors[budgetStatus] + '40', icon: <CreditCard size={16} color={statusColors[budgetStatus]} /> },
        ].map(card => (
          <div key={card.label} style={{ background: 'linear-gradient(135deg,' + card.bg + ',rgba(15,23,42,0.9))', border: '1px solid ' + card.border, borderRadius: '10px', padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{card.label}</span>
              {card.icon}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Budget Banner */}
      <div style={{ background: 'linear-gradient(135deg,' + statusColors[budgetStatus] + '15,rgba(15,23,42,0.85))', border: '1px solid ' + statusColors[budgetStatus] + '45', borderRadius: '10px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: statusColors[budgetStatus], fontWeight: 600, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '1.1rem' }}>{statusIcons[budgetStatus]}</span>
        <span>{statusLabels[budgetStatus]}</span>
        <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '0.88rem', color: '#fff', whiteSpace: 'nowrap' }}>
          Avg: ${avgDailySpend.toFixed(1)}/day &nbsp;|&nbsp; Budget: ${safeDailyBudget.toFixed(1)}/day
        </span>
      </div>

      {/* Smart Recommendations Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(15,23,42,0.85))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={18} color="#818cf8" />
              <strong style={{ color: '#818cf8', fontSize: '0.9rem' }}>Strict Baseline Strategy</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '6px', padding: '0.2rem 0.4rem', marginLeft: 'auto' }}>
              <span style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 600 }}>Monthly Baseline: $</span>
              <input 
                type="number"
                value={baselineSalary}
                onChange={(e) => setBaselineSalary(Number(e.target.value) || 0)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.75rem', fontWeight: 700, outline: 'none', width: '50px', cursor: 'text' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '6px', padding: '0.2rem 0.4rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 600 }}>Save:</span>
              <select 
                value={idealSavingsRate} 
                onChange={(e) => setIdealSavingsRate(Number(e.target.value))}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.75rem', fontWeight: 700, outline: 'none', cursor: 'pointer' }}
              >
                {[10,20,30,40,50,60,70,75,80,90,95].map(rate => (
                  <option key={rate} value={rate} style={{ background: '#1e293b', color: '#fff' }}>{rate}%</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Your safe limit is calculated strictly against your <strong>${baselineSalary.toLocaleString()}/mo</strong> baseline salary. 
            {windfallAmount > 0 && (
              <span style={{ color: '#fbbf24' }}> You have <strong>${windfallAmount.toLocaleString(undefined, {maximumFractionDigits: 0})}</strong> in Windfall Income this period! Allocate 100% of this to your Emergency Fund or Debt Payoff. Do not increase lifestyle spending!</span>
            )}
            <div style={{ marginTop: '0.5rem' }}>
              {differenceToTarget >= 0 ? (
                <div style={{ color: '#34d399', fontWeight: 600 }}> You are currently spending <strong>${differenceToTarget.toFixed(1)} LESS</strong> per day. Perfect!</div>
              ) : (
                <div style={{ color: '#f43f5e', fontWeight: 600 }}> You are currently spending <strong>${Math.abs(differenceToTarget).toFixed(1)} MORE</strong> per day. Reduce lifestyle expenses!</div>
              )}
            </div>
          </div>
        </div>
        <div style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '8px', padding: '1rem 1.5rem', textAlign: 'center', minWidth: '140px', boxShadow: '0 0 15px rgba(99,102,241,0.2)' }}>
          <div style={{ fontSize: '0.7rem', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.2rem' }}>Safe Daily Flag</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>${targetDailySpend.toFixed(0)}</div>
          <div style={{ fontSize: '0.7rem', color: '#818cf8', marginTop: '0.1rem' }}>maximum / day</div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ background: 'rgba(8,12,20,0.6)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', padding: '1.1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Spending vs Deposits — {period === 'all' ? 'All Time' : 'Last ' + period + ' Days'}
          </div>
          <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '0.2rem' }}>
            {[{ id: 'daily', label: 'Daily' }, { id: 'cumulative', label: 'Cumulative' }].map(m => (
              <button key={m.id} onClick={() => setChartMode(m.id)} style={{ padding: '0.22rem 0.6rem', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '0.71rem', fontWeight: 600, background: chartMode === m.id ? 'rgba(59,130,246,0.3)' : 'transparent', color: chartMode === m.id ? '#60a5fa' : 'var(--text-muted)' }}>
                {m.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.74rem', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f43f5e' }}><span style={{ width: 14, height: 3, background: '#f43f5e', borderRadius: 2, display: 'inline-block' }} />Expenses</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#34d399' }}><span style={{ width: 14, height: 3, background: '#34d399', borderRadius: 2, display: 'inline-block' }} />Deposits</span>
          </div>
        </div>
        <AreaChart data={chartData} height={220} />
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Category Breakdown */}
        <div style={{ background: 'rgba(8,12,20,0.6)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingDown size={14} color="#f43f5e" /> Spending by Category
          </div>
          {categoryBreakdown.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>No expense data for this period</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {categoryBreakdown.map(([cat, amt], i) => {
                const pct = Math.round((amt / categoryTotal) * 100);
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.77rem', marginBottom: '0.18rem' }}>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{cat}</span>
                      <span style={{ color: catColors[i % catColors.length], fontWeight: 700 }}>${amt.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({pct}%)</span></span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: pct + '%', background: catColors[i % catColors.length], borderRadius: 99, boxShadow: '0 0 8px ' + catColors[i % catColors.length] + '80', transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Savings Summary */}
        <div style={{ background: 'rgba(8,12,20,0.6)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PiggyBank size={14} color="#818cf8" /> Savings Summary
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.77rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Savings Rate (Period)</span>
              <span style={{ color: rateColor, fontWeight: 800, fontSize: '0.9rem' }}>{savingsRate.toFixed(1)}%</span>
            </div>
            <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: savingsRate + '%', background: 'linear-gradient(90deg,' + rateColor + '88,' + rateColor + ')', borderRadius: 99, boxShadow: '0 0 10px ' + rateColor + '60', transition: 'width 0.7s cubic-bezier(0.34,1.56,0.64,1)' }} />
            </div>
            <div style={{ fontSize: '0.69rem', color: 'var(--text-muted)', marginTop: '0.28rem' }}>
              {savingsRate >= 20 ? '🎯 Great! You are saving above 20%' : savingsRate >= 0 ? '📊 Moderate — try to reach 20%+ rate' : '⚠️ Spending exceeds income in this period'}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {[
              { label: 'Expense Entries', value: filteredExpenses.length, color: '#f43f5e' },
              { label: 'Deposit Entries', value: filteredDeposits.length, color: '#34d399' },
              { label: 'Max Single Expense', value: '$' + Math.max(0, ...filteredExpenses.map(e => Number(e && e.amount) || 0)).toLocaleString(), color: '#fbbf24' },
              { label: 'Avg Daily Save', value: (avgDailySave >= 0 ? '+' : '') + '$' + avgDailySave.toFixed(1), color: avgDailySave >= 0 ? '#a5b4fc' : '#f43f5e' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', padding: '0.55rem 0.7rem' }}>
                <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginBottom: '0.18rem' }}>{stat.label}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
