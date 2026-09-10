import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  ShieldCheck, 
  PieChart, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers, 
  TrendingUp, 
  PlusCircle, 
  Edit3, 
  Receipt, 
  Wallet, 
  CheckCircle2, 
  Clock,
  Edit2
} from 'lucide-react';

// Helper: Safely close modal ONLY when both mousedown AND mouseup/click originate on the backdrop itself!
// Prevents accidentally closing popups when selecting text inside modal content!
let backdropMouseDownTarget = null;

const handleOverlayMouseDown = (e) => {
  backdropMouseDownTarget = e.target;
};

const handleOverlayClick = (e, onClose) => {
  if (backdropMouseDownTarget === e.currentTarget && e.target === e.currentTarget) {
    onClose();
  }
  backdropMouseDownTarget = null;
};

export function UnsecureConfirmModal({ targetExpense, isOpen, onClose, onConfirm }) {
  if (!isOpen || !targetExpense) return null;

  const handleConfirm = () => {
    onConfirm(targetExpense.id, {
      ...targetExpense,
      purchased: 0
    });
    onClose();
  };

  return (
    <div 
      className="modal-overlay" 
      onMouseDown={handleOverlayMouseDown} 
      onClick={(e) => handleOverlayClick(e, onClose)}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} color="#ef4444" />
            <h3 className="modal-title">Confirm Pending Status</h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>

        <div style={{ margin: '0.85rem 0' }}>
          <div style={{ background: '#080c14', padding: '0.75rem', borderRadius: '6px', marginBottom: '0.85rem', border: '1px solid var(--bg-card-border)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Target Expense</div>
            <strong style={{ fontSize: '0.95rem', color: '#fff' }}>{targetExpense.item}</strong>
            <div style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: 'bold', marginTop: '0.15rem' }}>
              Price: ${targetExpense.price}
            </div>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Are you sure you want to mark this item as <strong>Pending</strong>?
            <br />
            This will mark the expense as unpaid and remove <strong>${targetExpense.price}</strong> from Paid Shop Capital.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={handleConfirm}>
            Yes, Mark as Pending
          </button>
        </div>
      </div>
    </div>
  );
}

export function EditCapitalModal({ summary, isOpen, onClose, onSave }) {
  const [initialCapital, setInitialCapital] = useState(summary?.initial_capital || 6900);
  const [shopCapital, setShopCapital] = useState(summary?.shop_allocated_capital || 1400);
  const [lbpRate, setLbpRate] = useState(summary?.lbp_rate || 89000);

  useEffect(() => {
    if (summary) {
      setInitialCapital(summary.initial_capital || 6900);
      setShopCapital(summary.shop_allocated_capital || 1400);
      setLbpRate(summary.lbp_rate || 89000);
    }
  }, [summary]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(parseFloat(initialCapital), parseFloat(shopCapital), parseFloat(lbpRate) || 89000);
    onClose();
  };

  return (
    <div 
      className="modal-overlay" 
      onMouseDown={handleOverlayMouseDown} 
      onClick={(e) => handleOverlayClick(e, onClose)}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Adjust Base Capital & Exchange Settings</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Initial Base Starting Capital ($)</label>
            <input
              type="number"
              className="form-input"
              value={initialCapital}
              onChange={e => setInitialCapital(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">CS Shop Allocated Capital ($)</label>
            <input
              type="number"
              className="form-input"
              value={shopCapital}
              onChange={e => setShopCapital(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              ðŸ‡±ðŸ‡§ LBP Exchange Rate ($1 USD = X LBP)
            </label>
            <input
              type="number"
              className="form-input"
              placeholder="89000"
              value={lbpRate}
              onChange={e => setLbpRate(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
              Default exchange rate used for converting LBP daily earnings into USD ($).
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Settings</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function NewDepositModal({ isOpen, onClose, onSave }) {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('Salary');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      amount: parseFloat(amount) || 0,
      source,
      date,
      notes
    });
    onClose();
  };

  return (
    <div 
      className="modal-overlay" 
      onMouseDown={handleOverlayMouseDown} 
      onClick={(e) => handleOverlayClick(e, onClose)}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add Salary or Capital Deposit</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Amount ($)</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 1500"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Source</label>
              <select
                className="form-select"
                value={source}
                onChange={e => setSource(e.target.value)}
              >
                <option value="Salary">Monthly Salary</option>
                <option value="Freelance">Freelance / Gig</option>
                <option value="Bonus">Bonus</option>
                <option value="Top-up">Capital Top-up</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes / Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. July Salary payment"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-emerald">Add to Capital</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function NewDailyExpenseModal({ summary, defaultLbpRate, isOpen, onClose, onSave }) {
  const currentDefaultRate = summary?.lbp_rate || defaultLbpRate || 89000;
  const [currencyMode, setCurrencyMode] = useState('USD'); // 'USD' or 'LBP'
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [lbpAmount, setLbpAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const rateVal = currentDefaultRate;
  const rawLbp = parseFloat(String(lbpAmount).replace(/,/g, '')) || 0;
  const rawUsd = parseFloat(amount) || 0;
  const calculatedUsd = currencyMode === 'LBP' ? (rateVal > 0 ? (rawLbp / rateVal) : 0) : rawUsd;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalAmount = Math.round(calculatedUsd * 100) / 100;
    let finalDesc = description.trim();
    if (currencyMode === 'LBP' && rawLbp > 0) {
      finalDesc += ` (${rawLbp.toLocaleString()} LBP)`;
    }

    onSave({
      description: finalDesc,
      amount: finalAmount,
      category,
      date
    });
    onClose();
  };

  return (
    <div 
      className="modal-overlay" 
      onMouseDown={handleOverlayMouseDown} 
      onClick={(e) => handleOverlayClick(e, onClose)}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Deduct Personal Daily Expense</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${currencyMode === 'USD' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCurrencyMode('USD')}
            style={{ flex: 1 }}
          >
            ðŸ’µ $ USD
          </button>
          <button
            type="button"
            className={`btn btn-sm ${currencyMode === 'LBP' ? 'btn-emerald' : 'btn-secondary'}`}
            onClick={() => setCurrencyMode('LBP')}
            style={{ flex: 1 }}
          >
            ðŸ‡±ðŸ‡§ LBP
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Groceries / Fuel / Coffee"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {currencyMode === 'USD' ? (
              <div className="form-group">
                <label className="form-label">Amount ($)</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder="25"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Amount in LBP</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 2,225,000"
                  value={lbpAmount}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setLbpAmount(val ? Number(val).toLocaleString() : '');
                  }}
                  required
                />
                <span style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '0.2rem', display: 'block' }}>
                  = ${calculatedUsd.toFixed(2)} USD (@ {rateVal.toLocaleString()})
                </span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="Food">Food & Groceries</option>
                <option value="Transport">Transport / Fuel</option>
                <option value="Bills">Bills & Utilities</option>
                <option value="Shopping">Personal Shopping</option>
                <option value="Misc">Misc / General</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-danger">Deduct from Capital</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function NewInstallmentModal({ targetPlan, isOpen, onClose, onSave }) {
  const [customerName, setCustomerName] = useState('');
  const [itemName, setItemName] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [soldPrice, setSoldPrice] = useState('');
  const [location, setLocation] = useState('Beirut');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('active');

  useEffect(() => {
    if (isOpen) {
      if (targetPlan) {
        setCustomerName(targetPlan.customer_name || '');
        setItemName(targetPlan.item_name || '');
        setWholesalePrice(targetPlan.wholesale_price ?? '');
        setSoldPrice(targetPlan.sold_price ?? '');
        setLocation(targetPlan.location || 'Beirut');
        setComment(targetPlan.comment || '');
        setStatus(targetPlan.status || 'active');
      } else {
        setCustomerName('');
        setItemName('');
        setWholesalePrice('');
        setSoldPrice('');
        setLocation('Beirut');
        setComment('');
        setStatus('active');
      }
    }
  }, [isOpen, targetPlan]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: targetPlan ? targetPlan.id : undefined,
      customer_name: customerName,
      item_name: itemName,
      wholesale_price: parseFloat(wholesalePrice) || 0,
      sold_price: parseFloat(soldPrice) || 0,
      location,
      comment,
      status
    });
    onClose();
  };

  return (
    <div 
      className="modal-overlay" 
      onMouseDown={handleOverlayMouseDown} 
      onClick={(e) => handleOverlayClick(e, onClose)}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {targetPlan ? `Edit Installment Plan: ${targetPlan.customer_name}` : 'Create New Installment Plan'}
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Customer Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Mohamad / Manal"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Item / Product Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Gaming Laptop / PC Setup"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Wholesale Cost ($)</label>
              <input
                type="number"
                step="any"
                className="form-input"
                placeholder="250"
                value={wholesalePrice}
                onChange={e => setWholesalePrice(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Sold Price ($)</label>
              <input
                type="number"
                step="any"
                className="form-input"
                placeholder="400"
                value={soldPrice}
                onChange={e => setSoldPrice(e.target.value)}
                required
              />
            </div>
          </div>
          {wholesalePrice && soldPrice && (
            <div style={{ background: 'rgba(192, 132, 252, 0.12)', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(192, 132, 252, 0.3)', marginBottom: '0.85rem', fontSize: '0.82rem', color: '#c084fc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Expected Plan Profit:</span>
              <strong style={{ fontSize: '1rem', fontWeight: 700 }}>+${((parseFloat(soldPrice) || 0) - (parseFloat(wholesalePrice) || 0)).toLocaleString()}</strong>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Customer Location</label>
            <input
              type="text"
              className="form-input"
              placeholder="Beirut / Fakiha"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Comment / Notes</label>
            <input
              type="text"
              className="form-input"
              placeholder="Payment notes"
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </div>
          {targetPlan && (
            <div className="form-group">
              <label className="form-label">Plan Status</label>
              <select
                className="form-input"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="active">Active Plan</option>
                <option value="completed">Completed / Fully Paid</option>
              </select>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {targetPlan ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PaymentModal({ targetPlan, targetPayment, isOpen, onClose, onSave, onDelete }) {
  const [dateLabel, setDateLabel] = useState('');
  const [amountDue, setAmountDue] = useState('');
  const [amountReceived, setAmountReceived] = useState('');
  const [notes, setNotes] = useState('');
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (targetPayment) {
        setDateLabel(targetPayment.date_label || '');
        setAmountDue(targetPayment.amount_due ?? '');
        setAmountReceived(targetPayment.amount_received ?? '');
        setNotes(targetPayment.notes || '');
        setIsPaid(!!targetPayment.is_paid);
      } else {
        setDateLabel('');
        setAmountDue('');
        setAmountReceived('');
        setNotes('');
        setIsPaid(false);
      }
    }
  }, [isOpen, targetPayment]);

  if (!isOpen || !targetPlan) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const due = parseFloat(amountDue) || 0;
    const rec = parseFloat(amountReceived) || 0;
    const finalPaid = isPaid || (rec >= due && due > 0);

    onSave(targetPlan.id, {
      paymentId: targetPayment ? targetPayment.id : undefined,
      date_label: dateLabel,
      amount_due: due,
      amount_received: rec,
      is_paid: finalPaid ? 1 : 0,
      notes
    });
    onClose();
  };

  const handleDelete = () => {
    if (targetPayment && onDelete) {
      onDelete(targetPayment.id);
      onClose();
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onMouseDown={handleOverlayMouseDown} 
      onClick={(e) => handleOverlayClick(e, onClose)}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {targetPayment ? 'Edit Payment' : 'Record Payment'} for {targetPlan.customer_name}
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Date / Month Label</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. August / Installment 2"
              value={dateLabel}
              onChange={e => setDateLabel(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Amount Due ($)</label>
              <input
                type="number"
                step="any"
                className="form-input"
                placeholder="150"
                value={amountDue}
                onChange={e => setAmountDue(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Amount Received ($)</label>
              <input
                type="number"
                step="any"
                className="form-input"
                placeholder="150"
                value={amountReceived}
                onChange={e => setAmountReceived(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes / Milestone</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 1st Profit / Partial payment"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ margin: '0.75rem 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
              <input
                type="checkbox"
                checked={isPaid}
                onChange={e => setIsPaid(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
              />
              Mark as Fully Paid
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
            {targetPayment ? (
              <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete}>
                Delete Payment
              </button>
            ) : <div />}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-emerald">
                {targetPayment ? 'Update Payment' : 'Save Payment'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function NewExpenseModal({ isOpen, onClose, onSave, initialCategory }) {
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(initialCategory || 'Hardware');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCategory(initialCategory || 'Hardware');
    }
  }, [isOpen, initialCategory]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      item,
      price: parseFloat(price) || 0,
      category,
      comment,
      purchased: 1
    });
    onClose();
  };

  return (
    <div 
      className="modal-overlay" 
      onMouseDown={handleOverlayMouseDown} 
      onClick={(e) => handleOverlayClick(e, onClose)}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add CS Shop Expense / Item</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Item / Bill Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Electricity Bill / Nescafe & Tea Stock / Switch"
              value={item}
              onChange={e => setItem(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Price ($)</label>
              <input
                type="number"
                className="form-input"
                placeholder="120"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="Hardware">Hardware</option>
                <option value="Furniture">Furniture</option>
                <option value="Rent & Electricity">Rent & Electricity</option>
                <option value="Drinks & Refreshments">Drinks & Refreshments</option>
                <option value="Appliances">Appliances</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes / Source / Details</label>
            <input
              type="text"
              className="form-input"
              placeholder="Notes or seller info"
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-emerald">Add Expense</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditExpenseModal({ targetExpense, isOpen, onClose, onSave }) {
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [comment, setComment] = useState('');
  const [purchased, setPurchased] = useState(1);

  useEffect(() => {
    if (targetExpense) {
      setItem(targetExpense.item || '');
      setPrice(targetExpense.price !== undefined ? targetExpense.price : '');
      setCategory(targetExpense.category || 'General');
      setComment(targetExpense.comment || '');
      setPurchased(targetExpense.purchased !== undefined ? targetExpense.purchased : 1);
    }
  }, [targetExpense]);

  if (!isOpen || !targetExpense) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(targetExpense.id, {
      item,
      price: parseFloat(price) || 0,
      category,
      comment,
      purchased: purchased ? 1 : 0
    });
    onClose();
  };

  return (
    <div 
      className="modal-overlay" 
      onMouseDown={handleOverlayMouseDown} 
      onClick={(e) => handleOverlayClick(e, onClose)}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Edit CS Shop Expense Item</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Item / Bill Description</label>
            <input
              type="text"
              className="form-input"
              value={item}
              onChange={e => setItem(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Price ($)</label>
              <input
                type="number"
                className="form-input"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="Hardware">Hardware</option>
                <option value="Furniture">Furniture</option>
                <option value="Rent & Electricity">Rent & Electricity</option>
                <option value="Drinks & Refreshments">Drinks & Refreshments</option>
                <option value="Appliances">Appliances</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Expense Status</label>
            <select
              className="form-select"
              value={purchased}
              onChange={e => setPurchased(parseInt(e.target.value))}
            >
              <option value={1}>Paid & Funded (Committed to Shop Capital)</option>
              <option value={0}>Pending (Unpaid Expense)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Notes / Source / Details</label>
            <input
              type="text"
              className="form-input"
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function NewSaleModal({ isOpen, onClose, onSave }) {
  const [itemName, setItemName] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [soldPrice, setSoldPrice] = useState('');
  const [boughtBy, setBoughtBy] = useState('');
  const [location, setLocation] = useState('');
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const wholesale = parseFloat(wholesalePrice) || 0;
    const sold = parseFloat(soldPrice) || 0;
    const profit = sold - wholesale;

    onSave({
      item_name: itemName,
      wholesale_price: wholesale,
      sold_price: sold,
      earned_amount: sold,
      remaining_balance: 0,
      profit,
      bought_by: boughtBy,
      location,
      comment,
      sale_date: new Date().toISOString().split('T')[0]
    });
    onClose();
  };

  return (
    <div 
      className="modal-overlay" 
      onMouseDown={handleOverlayMouseDown} 
      onClick={(e) => handleOverlayClick(e, onClose)}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Log Completed Direct Sale</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Item Sold</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Macbook Air M2 2022"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Wholesale Cost ($)</label>
              <input
                type="number"
                className="form-input"
                placeholder="400"
                value={wholesalePrice}
                onChange={e => setWholesalePrice(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Sold For ($)</label>
              <input
                type="number"
                className="form-input"
                placeholder="550"
                value={soldPrice}
                onChange={e => setSoldPrice(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Customer Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Customer name"
              value={boughtBy}
              onChange={e => setBoughtBy(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Location / Status</label>
            <input
              type="text"
              className="form-input"
              placeholder="Sold / Beirut"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Record Sale</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function NewShopProfitModal({ summary, defaultLbpRate, isOpen, onClose, onSave, onUpdateLbpRate }) {
  const currentDefaultRate = summary?.lbp_rate || defaultLbpRate || 89000;
  
  const [currencyMode, setCurrencyMode] = useState('LBP'); // 'LBP' or 'USD'
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [lbpAmount, setLbpAmount] = useState('');
  const [usdAmount, setUsdAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(currentDefaultRate);
  const [updateDefaultRate, setUpdateDefaultRate] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      const rate = summary?.lbp_rate || defaultLbpRate || 89000;
      setExchangeRate(rate);
      setDate(new Date().toISOString().split('T')[0]);
      setLbpAmount('');
      setUsdAmount('');
      setNotes('');
      setUpdateDefaultRate(false);
    }
  }, [isOpen, summary, defaultLbpRate]);

  if (!isOpen) return null;

  // Real-time calculation helpers
  const rateVal = parseFloat(exchangeRate) || 89000;
  const rawLbp = parseFloat(String(lbpAmount).replace(/,/g, '')) || 0;
  const rawUsd = parseFloat(usdAmount) || 0;

  const calculatedUsd = currencyMode === 'LBP' 
    ? (rateVal > 0 ? (rawLbp / rateVal) : 0)
    : rawUsd;

  const calculatedLbpEquivalent = currencyMode === 'USD'
    ? Math.round(rawUsd * rateVal)
    : rawLbp;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalUsdAmount = Math.round(calculatedUsd * 100) / 100;
    
    // Auto-annotate notes with LBP breakdown if logged via LBP
    let finalNotes = notes.trim();
    if (currencyMode === 'LBP' && rawLbp > 0) {
      const lbpTag = `(Logged: ${rawLbp.toLocaleString()} LBP @ ${rateVal.toLocaleString()} LBP/$)`;
      if (!finalNotes) {
        finalNotes = `Daily revenue ${lbpTag}`;
      } else if (!finalNotes.includes('LBP')) {
        finalNotes = `${finalNotes} ${lbpTag}`;
      }
    }

    if (updateDefaultRate && onUpdateLbpRate && rateVal > 0) {
      onUpdateLbpRate(rateVal);
    }

    onSave({
      date,
      amount: finalUsdAmount,
      notes: finalNotes
    });
    onClose();
  };

  return (
    <div 
      className="modal-overlay" 
      onMouseDown={handleOverlayMouseDown} 
      onClick={(e) => handleOverlayClick(e, onClose)}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="#34d399" />
            <h3 className="modal-title">Log Daily Shop Earnings</h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>

        {/* Currency Mode Selection Pills */}
        <div style={{ margin: '0.85rem 0' }}>
          <label className="form-label" style={{ marginBottom: '0.4rem' }}>Entry Currency</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#080c14', padding: '0.3rem', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
            <button
              type="button"
              className={`btn btn-sm ${currencyMode === 'LBP' ? 'btn-emerald' : 'btn-secondary'}`}
              onClick={() => setCurrencyMode('LBP')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: 600 }}
            >
              <span>ðŸ‡±ðŸ‡§ Log in LBP</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm ${currencyMode === 'USD' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCurrencyMode('USD')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: 600 }}
            >
              <span>ðŸ’µ Log in USD ($)</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          {/* LBP Entry Mode Fields */}
          {currencyMode === 'LBP' ? (
            <div>
              <div className="form-group">
                <label className="form-label">Amount in Lebanese Pounds (LBP)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 8,900,000"
                    value={lbpAmount}
                    onChange={e => {
                      // Allow digits and commas
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setLbpAmount(val ? Number(val).toLocaleString() : '');
                    }}
                    required
                    style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399' }}
                  />
                  <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem', pointerEvents: 'none' }}>
                    LBP
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">Exchange Rate (1$ = X LBP)</label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Editable</span>
                  </div>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="89000"
                    value={exchangeRate}
                    onChange={e => setExchangeRate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Conversion Result Highlight Box */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(15, 23, 42, 0.95))',
                border: '1px solid rgba(52, 211, 153, 0.35)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Direct USD Conversion Result</span>
                  <strong style={{ fontSize: '1.25rem', color: '#34d399' }}>
                    ${calculatedUsd.toFixed(2)} USD
                  </strong>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span>Rate: {rateVal.toLocaleString()} LBP/$</span>
                </div>
              </div>

              {/* Checkbox to update global default exchange rate */}
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={updateDefaultRate}
                    onChange={e => setUpdateDefaultRate(e.target.checked)}
                    style={{ accentColor: '#10b981', width: '15px', height: '15px' }}
                  />
                  Save {rateVal.toLocaleString()} LBP/$ as app default exchange rate
                </label>
              </div>
            </div>
          ) : (
            /* USD Entry Mode Fields */
            <div>
              <div className="form-group">
                <label className="form-label">Net Profit Amount ($ USD)</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder="e.g. 100"
                  value={usdAmount}
                  onChange={e => setUsdAmount(e.target.value)}
                  required
                  style={{ fontSize: '1.1rem', fontWeight: 700, color: '#60a5fa' }}
                />
              </div>

              <div style={{
                background: '#080c14',
                border: '1px solid var(--bg-card-border)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                marginBottom: '1rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center'
              }}>
                <span>Equivalent in LBP (@ {rateVal.toLocaleString()}):</span>
                <strong style={{ color: '#fff' }}>~{calculatedLbpEquivalent.toLocaleString()} LBP</strong>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Notes / Breakdown</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Gaming session + cafeteria drinks"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-emerald">
              Log +${calculatedUsd.toFixed(2)} Earnings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditShopProfitModal({ targetProfit, summary, defaultLbpRate, isOpen, onClose, onSave, onUpdateLbpRate }) {
  const currentDefaultRate = summary?.lbp_rate || defaultLbpRate || 89000;
  
  const [currencyMode, setCurrencyMode] = useState('USD');
  const [date, setDate] = useState('');
  const [lbpAmount, setLbpAmount] = useState('');
  const [usdAmount, setUsdAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(currentDefaultRate);
  const [updateDefaultRate, setUpdateDefaultRate] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen && targetProfit) {
      const rate = summary?.lbp_rate || defaultLbpRate || 89000;
      setExchangeRate(rate);
      setDate(targetProfit.date || new Date().toISOString().split('T')[0]);
      setUsdAmount(targetProfit.amount !== undefined ? targetProfit.amount : '');
      setLbpAmount('');
      setNotes(targetProfit.notes || '');
      setUpdateDefaultRate(false);
      setCurrencyMode('USD');
    }
  }, [isOpen, targetProfit, summary, defaultLbpRate]);

  if (!isOpen || !targetProfit) return null;

  const rateVal = parseFloat(exchangeRate) || 89000;
  const rawLbp = parseFloat(String(lbpAmount).replace(/,/g, '')) || 0;
  const rawUsd = parseFloat(usdAmount) || 0;

  const calculatedUsd = currencyMode === 'LBP' 
    ? (rateVal > 0 ? (rawLbp / rateVal) : 0)
    : rawUsd;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalUsdAmount = Math.round(calculatedUsd * 100) / 100;
    
    let finalNotes = notes.trim();
    if (currencyMode === 'LBP' && rawLbp > 0) {
      const lbpTag = `(Logged: ${rawLbp.toLocaleString()} LBP @ ${rateVal.toLocaleString()} LBP/$)`;
      if (!finalNotes) {
        finalNotes = `Daily revenue ${lbpTag}`;
      } else if (!finalNotes.includes('LBP')) {
        finalNotes = `${finalNotes} ${lbpTag}`;
      }
    }

    if (updateDefaultRate && onUpdateLbpRate && rateVal > 0) {
      onUpdateLbpRate(rateVal);
    }

    onSave(targetProfit.id, {
      date,
      amount: finalUsdAmount,
      notes: finalNotes
    });
    onClose();
  };

  return (
    <div 
      className="modal-overlay" 
      onMouseDown={handleOverlayMouseDown} 
      onClick={(e) => handleOverlayClick(e, onClose)}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="#34d399" />
            <h3 className="modal-title">Edit CS Shop Profit Entry</h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>

        <div style={{ margin: '0.85rem 0' }}>
          <label className="form-label" style={{ marginBottom: '0.4rem' }}>Edit Mode</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#080c14', padding: '0.3rem', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
            <button
              type="button"
              className={`btn btn-sm ${currencyMode === 'USD' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCurrencyMode('USD')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: 600 }}
            >
              <span>ðŸ’µ Edit in USD ($)</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm ${currencyMode === 'LBP' ? 'btn-emerald' : 'btn-secondary'}`}
              onClick={() => setCurrencyMode('LBP')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: 600 }}
            >
              <span>ðŸ‡±ðŸ‡§ Edit in LBP</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          {currencyMode === 'USD' ? (
            <div className="form-group">
              <label className="form-label">Amount in USD ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={usdAmount}
                onChange={e => setUsdAmount(e.target.value)}
                required
                style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399' }}
              />
            </div>
          ) : (
            <div>
              <div className="form-group">
                <label className="form-label">Amount in Lebanese Pounds (LBP)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 8,900,000"
                    value={lbpAmount}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setLbpAmount(val ? Number(val).toLocaleString() : '');
                    }}
                    required
                    style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399' }}
                  />
                  <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem', pointerEvents: 'none' }}>
                    LBP
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Exchange Rate (1$ = X LBP)</label>
                <input
                  type="number"
                  className="form-input"
                  value={exchangeRate}
                  onChange={e => setExchangeRate(e.target.value)}
                  required
                />
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(15, 23, 42, 0.95))',
                border: '1px solid rgba(52, 211, 153, 0.35)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Direct USD Conversion Result</span>
                  <strong style={{ fontSize: '1.25rem', color: '#34d399' }}>
                    ${calculatedUsd.toFixed(2)} USD
                  </strong>
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Notes / Revenue Source</label>
            <input
              type="text"
              className="form-input"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Notes or source"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function NewPricingCatalogModal({ isOpen, onClose, onSave }) {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Laptops');
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      item_name: itemName,
      category,
      buy_price_guide: parseFloat(buyPrice) || 0,
      sell_price_guide: parseFloat(sellPrice) || 0,
      notes
    });
    onClose();
  };

  return (
    <div 
      className="modal-overlay" 
      onMouseDown={handleOverlayMouseDown} 
      onClick={(e) => handleOverlayClick(e, onClose)}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add Pricing Catalog Model / Guide</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Item / Model Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Lenovo Legion 5 (RTX 3060)"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Target Buy Price ($)</label>
              <input
                type="number"
                className="form-input"
                placeholder="650"
                value={buyPrice}
                onChange={e => setBuyPrice(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Sell Price ($)</label>
              <input
                type="number"
                className="form-input"
                placeholder="820"
                value={sellPrice}
                onChange={e => setSellPrice(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="Laptops">Laptops</option>
              <option value="Gaming PCs">Gaming PCs</option>
              <option value="Consoles">Consoles</option>
              <option value="Monitors & Displays">Monitors & Displays</option>
              <option value="Components & Parts">Components & Parts</option>
              <option value="Beverages & Snacks">Beverages & Snacks</option>
              <option value="General">General</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Guidelines / Notes</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Target clean condition with original charger"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Catalog Item</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditPricingCatalogModal({ targetItem, isOpen, onClose, onSave }) {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('General');
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen && targetItem) {
      setItemName(targetItem.item_name || '');
      setCategory(targetItem.category || 'General');
      setBuyPrice(targetItem.buy_price_guide !== undefined ? targetItem.buy_price_guide : '');
      setSellPrice(targetItem.sell_price_guide !== undefined ? targetItem.sell_price_guide : '');
      setNotes(targetItem.notes || '');
    }
  }, [isOpen, targetItem]);

  if (!isOpen || !targetItem) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(targetItem.id, {
      item_name: itemName,
      category,
      buy_price_guide: parseFloat(buyPrice) || 0,
      sell_price_guide: parseFloat(sellPrice) || 0,
      notes
    });
    onClose();
  };

  return (
    <div 
      className="modal-overlay" 
      onMouseDown={handleOverlayMouseDown} 
      onClick={(e) => handleOverlayClick(e, onClose)}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Edit Pricing Catalog Model / Guide</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Item / Model Description</label>
            <input
              type="text"
              className="form-input"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Target Buy Price ($)</label>
              <input
                type="number"
                className="form-input"
                value={buyPrice}
                onChange={e => setBuyPrice(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Sell Price ($)</label>
              <input
                type="number"
                className="form-input"
                value={sellPrice}
                onChange={e => setSellPrice(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="Laptops">Laptops</option>
              <option value="Gaming PCs">Gaming PCs</option>
              <option value="Consoles">Consoles</option>
              <option value="Monitors & Displays">Monitors & Displays</option>
              <option value="Components & Parts">Components & Parts</option>
              <option value="Beverages & Snacks">Beverages & Snacks</option>
              <option value="General">General</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Guidelines / Notes</label>
            <input
              type="text"
              className="form-input"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

{/* --- NEW INTERACTIVE DETAILED VIEW MODALS --- */}

// 1. CS 1.6 Shop Break-Even Progress Detailed View Modal
export function ShopBreakEvenDetailModal({ summary, shopProfits = [], isOpen, onClose, onOpenLogShopProfit, onOpenEditShopProfit }) {
  if (!isOpen) return null;

  const {
    shop_allocated_capital = 0,
    shop_total_expenses = 0,
    shop_total_profits = 0,
    shop_breakeven_progress = 0
  } = summary || {};

  const targetCapital = shop_total_expenses > 0 ? shop_total_expenses : (shop_allocated_capital > 0 ? shop_allocated_capital : 1400);
  const remainingToBreakEven = Math.max(0, targetCapital - shop_total_profits);

  return (
    <div 
      className="modal-overlay" 
      onMouseDown={handleOverlayMouseDown} 
      onClick={(e) => handleOverlayClick(e, onClose)}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px', padding: '1.5rem' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="log-icon-badge bg-blue-gradient" style={{ width: 36, height: 36 }}>
              <ShieldCheck size={20} color="#fff" />
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '1.1rem' }}>CS 1.6 Shop Break-Even Analysis</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Detailed breakdown of setup capital vs collected earnings</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>

        {/* Overview Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', margin: '1rem 0' }}>
          <div style={{ background: '#080c14', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Total Setup Cost</span>
            <strong style={{ color: '#fff', fontSize: '1.05rem' }}>${shop_total_expenses.toLocaleString()}</strong>
          </div>
          <div style={{ background: '#080c14', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Paid Capital Target</span>
            <strong style={{ color: '#60a5fa', fontSize: '1.05rem' }}>${shop_allocated_capital.toLocaleString()}</strong>
          </div>
          <div style={{ background: '#080c14', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Profits Collected</span>
            <strong style={{ color: '#34d399', fontSize: '1.05rem' }}>+${shop_total_profits.toLocaleString()}</strong>
          </div>
          <div style={{ background: '#080c14', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Remaining to Break Even</span>
            <strong style={{ color: remainingToBreakEven === 0 ? '#34d399' : '#fb7185', fontSize: '1.05rem' }}>
              ${remainingToBreakEven.toLocaleString()}
            </strong>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <span style={{ fontSize: '0.72rem', color: '#fbbf24', display: 'block', fontWeight: 600 }}>Pending Equipment to Pay</span>
            <strong style={{ color: '#fbbf24', fontSize: '1.05rem' }}>
              ${Math.max(0, shop_total_expenses - shop_allocated_capital).toLocaleString()}
            </strong>
          </div>
        </div>

        {/* Progress Bar & Equation Box */}
        <div style={{ background: 'rgba(59, 130, 246, 0.06)', padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Break-Even Recovery Status</span>
            <span className="badge badge-blue" style={{ fontSize: '0.8rem' }}>{shop_breakeven_progress}% Recovered</span>
          </div>

          <div className="progress-bar-container" style={{ height: '12px' }}>
            <div className="progress-bar-fill fill-blue" style={{ width: `${Math.min(100, shop_breakeven_progress)}%` }}></div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.65rem', lineHeight: 1.4 }}>
            ðŸ’¡ <strong>Formula</strong>: Secured Equipment Capital (${shop_allocated_capital}) âˆ’ CS Shop Profits Collected (${shop_total_profits}) = <strong>${remainingToBreakEven}</strong> remaining until initial investment is fully returned to Net Capital.
          </p>
        </div>

        {/* History of Shop Profits Table */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#fff' }}>History of CS Shop Profit Logs ({shopProfits.length})</h4>
            <button 
              className="btn btn-emerald btn-sm" 
              onClick={() => { onClose(); onOpenLogShopProfit(); }}
            >
              <PlusCircle size={13} /> Log New Profit
            </button>
          </div>

          <div className="table-container" style={{ maxHeight: '220px', overflowY: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>Date</th>
                  <th>Notes / Source</th>
                  <th style={{ textAlign: 'right', width: '120px' }}>Amount ($)</th>
                  <th style={{ textAlign: 'right', width: '80px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {shopProfits && shopProfits.length > 0 ? (
                  shopProfits.map(prof => (
                    <tr key={prof.id}>
                      <td><strong>{prof.date}</strong></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{prof.notes || 'CS 1.6 Daily Gaming Earnings'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <strong style={{ color: '#34d399' }}>+${Number(prof.amount).toLocaleString()}</strong>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => { onClose(); onOpenEditShopProfit && onOpenEditShopProfit(prof); }}
                          title="Edit Log"
                        >
                          <Edit2 size={11} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                      No CS Shop profits logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close Detail View</button>
        </div>
      </div>
    </div>
  );
}
