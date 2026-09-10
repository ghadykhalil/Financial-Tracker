import React, { useState, useEffect } from 'react';
import { X, MapPin, DollarSign, Wallet, Plus, Trash2, Edit3, Check, AlertCircle, PieChart } from 'lucide-react';

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

const PRESET_LOCATIONS = [
  'Whish Money',
  'BOB Finance',
  'Home Safe',
  'Bank Account',
  'CS Shop Cash Register',
  'Wallet / Pocket',
  'Lockbox Vault'
];

export default function MoneyLocationModal({
  isOpen,
  onClose,
  targetFund,
  moneyLocations = [],
  onSaveLocation,
  onDeleteLocation
}) {
  const [locationName, setLocationName] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset state when modal opens or targetFund changes
  useEffect(() => {
    setLocationName('Whish Money');
    setAmount('');
    setNotes('');
    setEditingId(null);
    setErrorMsg('');
  }, [isOpen, targetFund]);

  if (!isOpen || !targetFund) return null;

  const fundId = targetFund.id;
  const fundLabel = targetFund.label || 'Capital Fund';
  const totalAmount = Number(targetFund.totalAmount || 0);

  // Filter location allocations for this specific fund
  const fundLocations = (moneyLocations || []).filter(loc => loc.fund_type === fundId);
  const totalAllocated = fundLocations.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const unallocatedAmount = Math.max(0, totalAmount - totalAllocated);

  const startEdit = (loc) => {
    setEditingId(loc.id);
    setLocationName(loc.location_name || '');
    setAmount(String(loc.amount || ''));
    setNotes(loc.notes || '');
    setErrorMsg('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setLocationName('Whish Money');
    setAmount('');
    setNotes('');
    setErrorMsg('');
  };

  const handleFillRemaining = () => {
    if (unallocatedAmount > 0) {
      setAmount(String(unallocatedAmount));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanLocation = locationName.trim();
    if (!cleanLocation) {
      setErrorMsg('Please select or type a location name.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setErrorMsg('Please enter a valid positive dollar amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveLocation({
        id: editingId || undefined,
        fund_type: fundId,
        location_name: cleanLocation,
        amount: parsedAmount,
        notes: notes.trim()
      });

      // Reset input form
      cancelEdit();
    } catch (err) {
      console.error('Failed to save money location:', err);
      setErrorMsg(err.message || 'Failed to save storage location.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this location split?')) return;
    setIsSubmitting(true);
    try {
      await onDeleteLocation(id);
      if (editingId === id) cancelEdit();
    } catch (err) {
      console.error('Failed to delete location:', err);
      setErrorMsg(err.message || 'Failed to delete location.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={handleOverlayMouseDown}
      onClick={(e) => handleOverlayClick(e, onClose)}
    >
      <div className="modal-content glass-card" style={{ maxWidth: '580px', width: '94%', padding: '1.5rem' }}>
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontSize: '1.2rem', margin: 0 }}>
              <MapPin color="#60a5fa" size={22} />
              {fundLabel} — Money Locations Split
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
              Assign and track where your ${totalAmount.toLocaleString()} is physically stored
            </p>
          </div>
          <button className="btn btn-secondary btn-sm icon-only-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Summary Distribution Bar */}
        <div style={{ background: '#080c14', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.25)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Total Fund Balance: <strong style={{ color: '#fff' }}>${totalAmount.toLocaleString()}</strong>
            </span>
            <span style={{ color: unallocatedAmount === 0 ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
              {unallocatedAmount === 0 ? '✓ 100% Fully Distributed' : `$${unallocatedAmount.toLocaleString()} Unallocated`}
            </span>
          </div>

          {/* Allocation Progress Bar */}
          <div className="progress-bar-container" style={{ height: '8px', background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="progress-bar-fill fill-blue"
              style={{ width: `${totalAmount > 0 ? Math.min(100, Math.round((totalAllocated / totalAmount) * 100)) : 0}%` }}
            ></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.45rem' }}>
            <span>Allocated in locations: <strong style={{ color: '#60a5fa' }}>${totalAllocated.toLocaleString()}</strong></span>
            <span>Unallocated cash: <strong style={{ color: '#fbbf24' }}>${unallocatedAmount.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Current Location Allocations List */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PieChart size={14} color="#60a5fa" /> Configured Storage Locations ({fundLocations.length})
          </h4>

          {fundLocations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
              {fundLocations.map((loc) => {
                const isEditingThis = editingId === loc.id;
                const locPct = totalAmount > 0 ? Math.round((Number(loc.amount) / totalAmount) * 100) : 0;

                return (
                  <div
                    key={loc.id}
                    style={{
                      background: isEditingThis ? 'rgba(59, 130, 246, 0.15)' : 'rgba(15, 23, 42, 0.7)',
                      border: `1px solid ${isEditingThis ? 'rgba(59, 130, 246, 0.45)' : 'rgba(255, 255, 255, 0.07)'}`,
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ color: '#fff', fontSize: '0.9rem' }}>📍 {loc.location_name}</strong>
                        <span style={{ fontSize: '0.7rem', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '0.05rem 0.35rem', borderRadius: '4px', fontWeight: 600 }}>
                          {locPct}%
                        </span>
                      </div>
                      {loc.notes && <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{loc.notes}</div>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <strong style={{ color: '#34d399', fontSize: '1rem' }}>
                        ${Number(loc.amount || 0).toLocaleString()}
                      </strong>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm icon-only-btn"
                          style={{ padding: '0.25rem' }}
                          onClick={() => startEdit(loc)}
                          title="Edit location"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm icon-only-btn"
                          style={{ padding: '0.25rem' }}
                          onClick={() => handleDelete(loc.id)}
                          title="Delete location"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ background: '#080c14', padding: '0.85rem', borderRadius: '8px', textAlign: 'center', border: '1px dashed rgba(255, 255, 255, 0.1)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              No storage locations assigned for {fundLabel} yet. Add one below.
            </div>
          )}
        </div>

        {/* Add / Edit Form */}
        <form onSubmit={handleSubmit} style={{ background: 'rgba(8, 12, 20, 0.8)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h4 style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{editingId ? '✏️ Edit Location Split' : '➕ Add Storage Location Split'}</span>
            {editingId && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEdit} style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                Cancel Edit
              </button>
            )}
          </h4>

          {errorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fb7185', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertCircle size={14} /> {errorMsg}
            </div>
          )}

          {/* Preset Location Buttons */}
          <div style={{ marginBottom: '0.65rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Quick Preset Name:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {PRESET_LOCATIONS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setLocationName(preset)}
                  style={{
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    background: locationName === preset ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${locationName === preset ? '#60a5fa' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: locationName === preset ? '#60a5fa' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.65rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>Location Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Whish, Home Safe..."
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
                required
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', margin: 0 }}>Amount ($ USD)</label>
                {unallocatedAmount > 0 && !editingId && (
                  <button
                    type="button"
                    onClick={handleFillRemaining}
                    style={{ background: 'none', border: 'none', color: '#fbbf24', fontSize: '0.7rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                  >
                    Fill Remaining (${unallocatedAmount.toLocaleString()})
                  </button>
                )}
              </div>
              <input
                type="number"
                step="any"
                className="form-input"
                placeholder="e.g. 1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '0.85rem' }}>
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>Notes / Reference (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Reference number, compartment or details"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', fontSize: '0.82rem', padding: '0.45rem 1rem' }}
            >
              {isSubmitting ? 'Saving...' : (editingId ? 'Update Location Split' : 'Add Location Split')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
