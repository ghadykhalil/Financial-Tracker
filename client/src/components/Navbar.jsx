import React, { useState } from 'react';
import { Users, ShoppingBag, History, Coins, GripVertical, PieChart, BookOpen } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const [tabOrder, setTabOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('financial_tracker_tab_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse tab order from localStorage:', e);
    }
    return ['capital', 'installments', 'shop', 'history', 'catalog'];
  });

  const [draggedIdx, setDraggedIdx] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    const newOrder = [...tabOrder];
    const item = newOrder[draggedIdx];
    newOrder.splice(draggedIdx, 1);
    newOrder.splice(index, 0, item);
    setDraggedIdx(index);
    setTabOrder(newOrder);
    try {
      localStorage.setItem('financial_tracker_tab_order', JSON.stringify(newOrder));
    } catch (e) {
      console.warn('Failed to save tab order:', e);
    }
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const getTabData = (id) => {
    switch (id) {
      case 'capital':
        return {
          id: 'capital',
          label: 'Capital Overview',
          subLabel: 'Net Cash & Formulas',
          icon: <PieChart size={17} color="#60a5fa" />,
          accentColor: '#3b82f6'
        };
      case 'installments':
        return {
          id: 'installments',
          label: 'Installment Plans',
          subLabel: 'Active Customer Dues',
          icon: <Users size={17} color="#fbbf24" />,
          accentColor: '#f59e0b'
        };
      case 'shop':
        return {
          id: 'shop',
          label: 'CS 1.6 Shop',
          subLabel: 'Hardware & Profits',
          icon: <ShoppingBag size={17} color="#34d399" />,
          accentColor: '#10b981'
        };
      case 'history':
        return {
          id: 'history',
          label: 'History & Profits',
          subLabel: 'Past Sales & Logs',
          icon: <History size={17} color="#c084fc" />,
          accentColor: '#a855f7'
        };
      case 'catalog':
        return {
          id: 'catalog',
          label: 'Pricing Catalog',
          subLabel: 'Buy & Sell Guide',
          icon: <BookOpen size={17} color="#38bdf8" />,
          accentColor: '#0284c7'
        };
      default:
        return {
          id: 'capital',
          label: 'Capital Overview',
          subLabel: 'Net Cash & Formulas',
          icon: <PieChart size={17} color="#60a5fa" />,
          accentColor: '#3b82f6'
        };
    }
  };

  const safeTabOrder = Array.isArray(tabOrder) ? tabOrder : ['capital', 'installments', 'shop', 'history', 'catalog'];

  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-icon">
          <Coins size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <h1 className="brand-title">Financial Tracker</h1>
            <span style={{ fontSize: '0.65rem', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '0.1rem 0.45rem', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.3)', fontWeight: 700 }}>PRO</span>
          </div>
          <p className="brand-subtitle">Capital Manager • Installments • CS 1.6 Shop</p>
        </div>
      </div>

      {/* Clear, High-Contrast Navigation Bar */}
      <nav className="nav-tabs">
        {safeTabOrder.map((tabId, index) => {
          const data = getTabData(tabId);
          const isActive = activeTab === data.id;
          const isDragging = draggedIdx === index;

          return (
            <div
              key={tabId}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`nav-tab-draggable ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''}`}
              onClick={() => setActiveTab(data.id)}
              style={isActive ? {
                background: `linear-gradient(135deg, ${data.accentColor}dd, ${data.accentColor}88)`,
                boxShadow: `0 4px 18px ${data.accentColor}55`,
                borderColor: 'rgba(255, 255, 255, 0.3)'
              } : {}}
              title="Click to switch tab • Drag to reorder position"
            >
              <GripVertical size={13} style={{ opacity: 0.35, cursor: 'grab' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                {data.icon}
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', lineHeight: 1.15 }}>{data.label}</span>
                  <span style={{ fontSize: '0.68rem', color: isActive ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)', fontWeight: 500 }}>{data.subLabel}</span>
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </header>
  );
}
