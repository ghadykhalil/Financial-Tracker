import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { RotateCcw, CheckCircle2, AlertCircle, X } from 'lucide-react';

const UndoContext = createContext(null);

export function UndoProvider({ children }) {
  const [undoStack, setUndoStack] = useState([]);
  const [lastNotice, setLastNotice] = useState(null);

  const canUndo = undoStack.length > 0;

  const pushUndoAction = useCallback((action) => {
    if (!action || typeof action.undo !== 'function') return;
    setUndoStack(prev => [...prev, action]);
    setLastNotice({
      id: Date.now(),
      message: action.description || 'Action performed',
      type: 'success'
    });
  }, []);

  const undoLastAction = useCallback(async () => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      const newStack = [...prev];
      const lastAction = newStack.pop();

      if (lastAction && typeof lastAction.undo === 'function') {
        Promise.resolve()
          .then(() => lastAction.undo())
          .then(() => {
            setLastNotice({
              id: Date.now(),
              message: `Undid: ${lastAction.description || 'Action'}`,
              type: 'undo'
            });
          })
          .catch((err) => {
            console.error('Error executing undo:', err);
            setLastNotice({
              id: Date.now(),
              message: `Failed to undo: ${err?.message || 'Unknown error'}`,
              type: 'error'
            });
          });
      }
      return newStack;
    });
  }, []);

  // Global Ctrl+Z / Cmd+Z Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCtrlZ = (e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey;
      if (!isCtrlZ) return;

      // Avoid triggering global undo when user is actively typing in editable input elements
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName ? activeEl.tagName.toUpperCase() : '';
        const isInput = tagName === 'INPUT' || tagName === 'TEXTAREA' || activeEl.isContentEditable;
        
        if (isInput && typeof activeEl.value === 'string' && activeEl.value.trim().length > 0) {
          return; // Let browser text editing undo handle active input typing
        }
      }

      if (undoStack.length > 0) {
        e.preventDefault();
        undoLastAction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, undoLastAction]);

  // Auto-hide toast notification after 5 seconds
  useEffect(() => {
    if (!lastNotice) return;
    const timer = setTimeout(() => setLastNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [lastNotice]);

  return (
    <UndoContext.Provider value={{ pushUndoAction, undoLastAction, undoStack, canUndo }}>
      {children}
      
      {/* Floating Undo Toast UI */}
      <div className="undo-toast-container">
        {lastNotice && (
          <div className={`undo-toast ${lastNotice.type}`}>
            <div className="toast-content">
              {lastNotice.type === 'undo' ? (
                <RotateCcw size={16} className="toast-icon" />
              ) : lastNotice.type === 'error' ? (
                <AlertCircle size={16} className="toast-icon text-rose" />
              ) : (
                <CheckCircle2 size={16} className="toast-icon text-emerald" />
              )}
              <span className="toast-message">{lastNotice.message}</span>
            </div>
            
            {canUndo && lastNotice.type !== 'undo' && (
              <button 
                className="btn-undo-shortcut" 
                onClick={undoLastAction}
                title="Press Ctrl+Z or click to undo this action"
              >
                <RotateCcw size={13} />
                <span>Undo</span>
                <kbd>Ctrl+Z</kbd>
              </button>
            )}

            <button className="toast-close" onClick={() => setLastNotice(null)}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Global Floating Undo Button when stack is non-empty but notice expired */}
        {!lastNotice && canUndo && (
          <button 
            className="floating-undo-btn" 
            onClick={undoLastAction}
            title={`Undo last action: ${undoStack[undoStack.length - 1]?.description || ''} (Ctrl+Z)`}
          >
            <RotateCcw size={15} />
            <span>Undo ({undoStack.length})</span>
            <kbd>Ctrl+Z</kbd>
          </button>
        )}
      </div>
    </UndoContext.Provider>
  );
}

export function useUndo() {
  const context = useContext(UndoContext);
  if (!context) {
    return {
      pushUndoAction: () => {},
      undoLastAction: () => {},
      undoStack: [],
      canUndo: false
    };
  }
  return context;
}
