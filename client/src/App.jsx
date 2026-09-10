import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CapitalOverview from './components/CapitalOverview';
import InstallmentTracker from './components/InstallmentTracker';
import ShopExpenses from './components/ShopExpenses';
import HistoryProfitLog from './components/HistoryProfitLog';
import { UndoProvider, useUndo } from './components/UndoContext';
import { AlertCircle, RefreshCw } from 'lucide-react';

import {
  EditCapitalModal,
  NewDepositModal,
  NewDailyExpenseModal,
  NewInstallmentModal,
  PaymentModal,
  NewExpenseModal,
  EditExpenseModal,
  UnsecureConfirmModal,
  NewSaleModal,
  NewShopProfitModal,
  EditShopProfitModal,
  NewPricingCatalogModal,
  EditPricingCatalogModal,
  ShopBreakEvenDetailModal
} from './components/Modals/ModalManager';

import PricingCatalog from './components/PricingCatalog';
import MoneyLocationModal from './components/Modals/MoneyLocationModal';

import {
  fetchSummary,
  fetchCapitalDeposits,
  createCapitalDeposit,
  deleteCapitalDeposit,
  fetchDailyExpenses,
  createDailyExpense,
  deleteDailyExpense,
  fetchInstallments,
  fetchShopExpenses,
  fetchShopProfits,
  fetchSalesHistory,
  updateCapital,
  createInstallment,
  updateInstallment,
  deleteInstallment,
  recordPayment,
  togglePayment,
  deletePayment,
  createShopExpense,
  updateShopExpense,
  deleteShopExpense,
  createShopProfit,
  updateShopProfit,
  deleteShopProfit,
  createSaleHistory,
  deleteSaleHistory,
  fetchPricingCatalog,
  createPricingCatalog,
  updatePricingCatalog,
  deletePricingCatalog,
  fetchMoneyLocations,
  createMoneyLocation,
  updateMoneyLocation,
  deleteMoneyLocation
} from './utils/api';

import './App.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught React UI error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          maxWidth: '750px',
          margin: '4rem auto',
          padding: '2rem',
          background: '#101726',
          border: '1px solid #ef4444',
          borderRadius: '14px',
          color: '#fff',
          boxShadow: '0 12px 36px rgba(0,0,0,0.6)'
        }}>
          <h2 style={{ color: '#ef4444', marginBottom: '0.6rem', fontSize: '1.25rem' }}>Application Diagnostic Warning</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '1rem' }}>
            A rendering error occurred. You can click below to reset cached state and reload:
          </p>
          <pre style={{
            background: '#080c14',
            padding: '1rem',
            borderRadius: '8px',
            color: '#fb7185',
            overflowX: 'auto',
            fontSize: '0.82rem',
            whiteSpace: 'pre-wrap'
          }}>
            {this.state.error?.toString() || 'Unknown UI Error'}
          </pre>
          <button
            onClick={() => {
              try {
                localStorage.removeItem('financial_tracker_tab_order');
              } catch (e) {}
              window.location.reload();
            }}
            style={{
              marginTop: '1.25rem',
              padding: '0.6rem 1.25rem',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reset Application & Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainAppContent() {
  const [activeTab, setActiveTab] = useState('capital');
  const { pushUndoAction } = useUndo();

  // Application Data States
  const [summary, setSummary] = useState(null);
  const [capitalDeposits, setCapitalDeposits] = useState([]);
  const [dailyExpenses, setDailyExpenses] = useState([]);
  const [moneyLocations, setMoneyLocations] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [shopExpensesData, setShopExpensesData] = useState({ expenses: [], total: 0 });
  const [shopProfitsData, setShopProfitsData] = useState({ profits: [], total: 0 });
  const [salesHistoryData, setSalesHistoryData] = useState({ sales: [], totalProfit: 0 });
  const [pricingCatalogData, setPricingCatalogData] = useState({ items: [] });
  const [loadError, setLoadError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal States
  const [activeModal, setActiveModal] = useState(null);
  const [targetPlanForPayment, setTargetPlanForPayment] = useState(null);
  const [targetPaymentForEdit, setTargetPaymentForEdit] = useState(null);
  const [targetPlanForEdit, setTargetPlanForEdit] = useState(null);
  const [targetExpenseForEdit, setTargetExpenseForEdit] = useState(null);
  const [targetExpenseForUnsecure, setTargetExpenseForUnsecure] = useState(null);
  const [targetProfitForEdit, setTargetProfitForEdit] = useState(null);
  const [targetCatalogItemForEdit, setTargetCatalogItemForEdit] = useState(null);
  const [targetMoneyLocationForEdit, setTargetMoneyLocationForEdit] = useState(null);
  const [targetFundForLocations, setTargetFundForLocations] = useState(null);
  const [initialExpenseCategory, setInitialExpenseCategory] = useState('Hardware');

  // Load all database state
  const refreshAllData = async () => {
    setIsRefreshing(true);
    setLoadError(null);
    try {
      const [sum, dep, daily, inst, exp, prof, sales, catalog, locs] = await Promise.all([
        fetchSummary(),
        fetchCapitalDeposits(),
        fetchDailyExpenses(),
        fetchInstallments(),
        fetchShopExpenses(),
        fetchShopProfits(),
        fetchSalesHistory(),
        fetchPricingCatalog(),
        fetchMoneyLocations()
      ]);
      setSummary(sum);
      setCapitalDeposits(dep.deposits || []);
      setDailyExpenses(daily.expenses || []);
      setInstallments(inst || []);
      setShopExpensesData(exp || { expenses: [], total: 0 });
      setShopProfitsData(prof || { profits: [], total: 0 });
      setSalesHistoryData(sales || { sales: [], totalProfit: 0 });
      setPricingCatalogData(catalog || { items: [] });
      setMoneyLocations(locs || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setLoadError(err.message || 'Unable to connect to financial server');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Handlers for Money Locations
  const handleSaveMoneyLocation = async (locationData) => {
    if (locationData.id) {
      const prevLoc = moneyLocations.find(l => l.id === locationData.id);
      await updateMoneyLocation(locationData.id, locationData);
      await refreshAllData();

      if (prevLoc) {
        pushUndoAction({
          description: `Updated money location: ${locationData.location_name} ($${locationData.amount})`,
          undo: async () => {
            await updateMoneyLocation(locationData.id, prevLoc);
            await refreshAllData();
          }
        });
      }
    } else {
      const res = await createMoneyLocation(locationData);
      await refreshAllData();

      if (res && res.id) {
        pushUndoAction({
          description: `Added money location: ${locationData.location_name} ($${locationData.amount})`,
          undo: async () => {
            await deleteMoneyLocation(res.id);
            await refreshAllData();
          }
        });
      }
    }
  };

  const handleDeleteMoneyLocation = async (id) => {
    const target = moneyLocations.find(l => l.id === id);
    await deleteMoneyLocation(id);
    await refreshAllData();

    if (target) {
      pushUndoAction({
        description: `Deleted money location: ${target.location_name}`,
        undo: async () => {
          await createMoneyLocation(target);
          await refreshAllData();
        }
      });
    }
  };

  // Handlers for Capital & Deposits/Salary
  const handleSaveCapital = async (initial, shop, lbpRate) => {
    const prevInitial = summary?.initial_capital;
    const prevShop = summary?.shop_allocated_capital;
    const prevLbpRate = summary?.lbp_rate;
    
    await updateCapital(initial, shop, lbpRate);
    await refreshAllData();

    pushUndoAction({
      description: `Updated base capital ($${initial}) & Exchange rate (1$=${lbpRate} LBP)`,
      undo: async () => {
        await updateCapital(prevInitial, prevShop, prevLbpRate);
        await refreshAllData();
      }
    });
  };

  const handleUpdateLbpRate = async (rate) => {
    if (!summary) return;
    await updateCapital(summary.initial_capital, summary.shop_allocated_capital, rate);
    await refreshAllData();
  };

  const handleCreateDeposit = async (depositData) => {
    const res = await createCapitalDeposit(depositData);
    await refreshAllData();

    if (res && res.id) {
      pushUndoAction({
        description: `Added deposit/salary: +$${depositData.amount} (${depositData.source})`,
        undo: async () => {
          await deleteCapitalDeposit(res.id);
          await refreshAllData();
        }
      });
    }
  };

  const handleDeleteDeposit = async (id) => {
    const target = capitalDeposits.find(d => d.id === id);
    await deleteCapitalDeposit(id);
    await refreshAllData();

    if (target) {
      pushUndoAction({
        description: `Deleted deposit: +$${target.amount} (${target.source})`,
        undo: async () => {
          await createCapitalDeposit({
            amount: target.amount,
            source: target.source,
            date: target.date,
            notes: target.notes
          });
          await refreshAllData();
        }
      });
    }
  };

  // Handlers for Personal Daily Expenses
  const handleCreateDailyExpense = async (expenseData) => {
    const res = await createDailyExpense(expenseData);
    await refreshAllData();

    if (res && res.id) {
      pushUndoAction({
        description: `Recorded daily expense: -$${expenseData.amount} (${expenseData.category})`,
        undo: async () => {
          await deleteDailyExpense(res.id);
          await refreshAllData();
        }
      });
    }
  };

  const handleDeleteDailyExpense = async (id) => {
    const target = dailyExpenses.find(e => e.id === id);
    await deleteDailyExpense(id);
    await refreshAllData();

    if (target) {
      pushUndoAction({
        description: `Deleted daily expense: -$${target.amount} (${target.category})`,
        undo: async () => {
          await createDailyExpense({
            amount: target.amount,
            category: target.category,
            date: target.date,
            description: target.description
          });
          await refreshAllData();
        }
      });
    }
  };

  // Handlers for Installments
  const handleTogglePayment = async (paymentId) => {
    await togglePayment(paymentId);
    await refreshAllData();

    pushUndoAction({
      description: 'Toggled installment payment status',
      undo: async () => {
        await togglePayment(paymentId);
        await refreshAllData();
      }
    });
  };

  const handleRecordPayment = async (planId, paymentData) => {
    await recordPayment(planId, paymentData);
    await refreshAllData();

    pushUndoAction({
      description: paymentData.paymentId ? 'Updated installment payment record' : `Recorded payment of $${paymentData.amount_received || paymentData.amount_due}`,
      undo: async () => {
        await refreshAllData();
      }
    });
  };

  const handleDeletePayment = async (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment entry?')) {
      await deletePayment(paymentId);
      await refreshAllData();

      pushUndoAction({
        description: 'Deleted payment entry',
        undo: async () => {
          await refreshAllData();
        }
      });
    }
  };

  const handleToggleEndPlan = async (plan) => {
    const newStatus = plan.status === 'completed' ? 'active' : 'completed';
    await updateInstallment(plan.id, {
      ...plan,
      status: newStatus
    });
    await refreshAllData();

    pushUndoAction({
      description: newStatus === 'completed' ? `Ended & locked payment plan for ${plan.customer_name}` : `Reopened payment plan for ${plan.customer_name}`,
      undo: async () => {
        await updateInstallment(plan.id, { ...plan, status: plan.status || 'active' });
        await refreshAllData();
      }
    });
  };

  const handleSaveInstallmentPlan = async (planData) => {
    if (planData.id) {
      await updateInstallment(planData.id, planData);
      await refreshAllData();

      pushUndoAction({
        description: `Updated installment plan for ${planData.customer_name}`,
        undo: async () => {
          await refreshAllData();
        }
      });
    } else {
      const res = await createInstallment(planData);
      await refreshAllData();

      if (res && res.id) {
        pushUndoAction({
          description: `Created installment plan for ${planData.customer_name}`,
          undo: async () => {
            await deleteInstallment(res.id);
            await refreshAllData();
          }
        });
      }
    }
  };

  const handleDeleteInstallment = async (planId) => {
    const target = installments.find(p => p.id === planId);

    if (window.confirm('Are you sure you want to delete this installment plan?')) {
      await deleteInstallment(planId);
      await refreshAllData();

      if (target) {
        pushUndoAction({
          description: `Deleted installment plan: ${target.customer_name}`,
          undo: async () => {
            await createInstallment(target);
            await refreshAllData();
          }
        });
      }
    }
  };

  // Handlers for CS Shop Expenses
  const handleCreateShopExpense = async (expenseData) => {
    const res = await createShopExpense(expenseData);
    await refreshAllData();

    if (res && res.id) {
      pushUndoAction({
        description: `Added shop item: ${expenseData.item}`,
        undo: async () => {
          await deleteShopExpense(res.id);
          await refreshAllData();
        }
      });
    }
  };

  const handleUpdateShopExpense = async (id, data) => {
    const target = (shopExpensesData.expenses || []).find(e => e.id === id);
    await updateShopExpense(id, data);
    await refreshAllData();

    if (target) {
      pushUndoAction({
        description: `Updated shop item status: ${data.item || target.item}`,
        undo: async () => {
          await updateShopExpense(id, target);
          await refreshAllData();
        }
      });
    }
  };

  const handleDeleteShopExpense = async (id) => {
    const target = (shopExpensesData.expenses || []).find(e => e.id === id);
    await deleteShopExpense(id);
    await refreshAllData();

    if (target) {
      pushUndoAction({
        description: `Deleted shop item: ${target.item}`,
        undo: async () => {
          await createShopExpense(target);
          await refreshAllData();
        }
      });
    }
  };

  // Handlers for CS Shop Profits
  const handleCreateShopProfit = async (profitData) => {
    const res = await createShopProfit(profitData);
    await refreshAllData();

    if (res && res.id) {
      pushUndoAction({
        description: `Added CS Shop profit: +$${profitData.amount}`,
        undo: async () => {
          await deleteShopProfit(res.id);
          await refreshAllData();
        }
      });
    }
  };

  const handleUpdateShopProfit = async (id, data) => {
    const target = (shopProfitsData.profits || []).find(p => p.id === id);
    await updateShopProfit(id, data);
    await refreshAllData();

    if (target) {
      pushUndoAction({
        description: `Updated shop profit entry (+$${data.amount || target.amount})`,
        undo: async () => {
          await updateShopProfit(id, target);
          await refreshAllData();
        }
      });
    }
  };

  const handleDeleteShopProfit = async (id) => {
    const target = (shopProfitsData.profits || []).find(p => p.id === id);
    await deleteShopProfit(id);
    await refreshAllData();

    if (target) {
      pushUndoAction({
        description: `Deleted shop profit entry of +$${target.amount}`,
        undo: async () => {
          await createShopProfit({
            date: target.date,
            amount: target.amount,
            notes: target.notes
          });
          await refreshAllData();
        }
      });
    }
  };

  // Handlers for Sales History
  const handleCreateSale = async (saleData) => {
    const res = await createSaleHistory(saleData);
    await refreshAllData();

    if (res && res.id) {
      pushUndoAction({
        description: `Added sale record: ${saleData.item_name}`,
        undo: async () => {
          await deleteSaleHistory(res.id);
          await refreshAllData();
        }
      });
    }
  };

  const handleDeleteSale = async (id) => {
    const target = (salesHistoryData.sales || []).find(s => s.id === id);
    await deleteSaleHistory(id);
    await refreshAllData();

    if (target) {
      pushUndoAction({
        description: `Deleted sale record: ${target.item_name}`,
        undo: async () => {
          await createSaleHistory(target);
          await refreshAllData();
        }
      });
    }
  };

  // Handlers for Pricing Catalog
  const handleCreatePricingCatalog = async (itemData) => {
    const res = await createPricingCatalog(itemData);
    await refreshAllData();

    if (res && res.id) {
      pushUndoAction({
        description: `Added pricing guide item: ${itemData.item_name}`,
        undo: async () => {
          await deletePricingCatalog(res.id);
          await refreshAllData();
        }
      });
    }
  };

  const handleUpdatePricingCatalog = async (id, itemData) => {
    const target = (pricingCatalogData.items || []).find(i => i.id === id);
    await updatePricingCatalog(id, itemData);
    await refreshAllData();

    if (target) {
      pushUndoAction({
        description: `Updated pricing guide item: ${itemData.item_name || target.item_name}`,
        undo: async () => {
          await updatePricingCatalog(id, target);
          await refreshAllData();
        }
      });
    }
  };

  const handleDeletePricingCatalog = async (id) => {
    const target = (pricingCatalogData.items || []).find(i => i.id === id);
    await deletePricingCatalog(id);
    await refreshAllData();

    if (target) {
      pushUndoAction({
        description: `Deleted pricing guide item: ${target.item_name}`,
        undo: async () => {
          await createPricingCatalog(target);
          await refreshAllData();
        }
      });
    }
  };

  return (
    <div className="app-container">
      {/* Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenModal={(modalName) => setActiveModal(modalName)}
      />

      {loadError && (
        <div style={{
          margin: '1rem 0',
          padding: '1rem 1.25rem',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#f87171'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <AlertCircle size={20} />
            <div>
              <strong style={{ display: 'block', color: '#fff', fontSize: '0.92rem' }}>Connection Error</strong>
              <span style={{ fontSize: '0.82rem', color: '#fca5a5' }}>{loadError}</span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={refreshAllData} disabled={isRefreshing}>
            <RefreshCw size={14} className={isRefreshing ? 'spin-once' : ''} /> Retry Connection
          </button>
        </div>
      )}

      {/* Main View Content */}
      <main>
        {activeTab === 'capital' && (
          <CapitalOverview
            summary={summary}
            capitalDeposits={capitalDeposits}
            dailyExpenses={dailyExpenses}
            moneyLocations={moneyLocations}
            onEditCapital={() => setActiveModal('edit-capital')}
            onOpenDepositModal={() => setActiveModal('new-deposit')}
            onOpenDailyExpenseModal={() => setActiveModal('new-daily-expense')}
            onDeleteDeposit={handleDeleteDeposit}
            onDeleteDailyExpense={handleDeleteDailyExpense}
            onOpenBreakEvenDetail={() => setActiveModal('breakeven-detail')}
            onOpenCardLocations={(fund) => {
              setTargetFundForLocations(fund);
              setActiveModal('card-money-locations');
            }}
          />
        )}

        {activeTab === 'installments' && (
          <InstallmentTracker
            plans={installments}
            onTogglePayment={handleTogglePayment}
            onToggleEndPlan={handleToggleEndPlan}
            onOpenPaymentModal={(plan) => {
              setTargetPlanForPayment(plan);
              setTargetPaymentForEdit(null);
              setActiveModal('payment');
            }}
            onOpenEditPaymentModal={(plan, payment) => {
              setTargetPlanForPayment(plan);
              setTargetPaymentForEdit(payment);
              setActiveModal('payment');
            }}
            onDeletePayment={handleDeletePayment}
            onOpenNewPlanModal={() => {
              setTargetPlanForEdit(null);
              setActiveModal('new-installment');
            }}
            onDeletePlan={handleDeleteInstallment}
            onEditPlan={(plan) => {
              setTargetPlanForEdit(plan);
              setActiveModal('new-installment');
            }}
          />
        )}

        {activeTab === 'shop' && (
          <ShopExpenses
            expenses={shopExpensesData.expenses}
            totalExpenses={shopExpensesData.total}
            allocatedCapital={summary?.shop_allocated_capital || 0}
            shopProfits={shopProfitsData.profits}
            totalShopProfits={shopProfitsData.total}
            onOpenAddExpense={(category) => {
              if (category) setInitialExpenseCategory(category);
              else setInitialExpenseCategory('Hardware');
              setActiveModal('new-expense');
            }}
            onOpenLogShopProfit={() => setActiveModal('new-shop-profit')}
            onOpenEditShopProfit={(entry) => {
              setTargetProfitForEdit(entry);
              setActiveModal('edit-shop-profit');
            }}
            onOpenEditExpense={(item) => {
              setTargetExpenseForEdit(item);
              setActiveModal('edit-expense');
            }}
            onUpdatePurchased={(item, newStatus) => handleUpdateShopExpense(item.id, { ...item, purchased: newStatus })}
            onRequestUnsecure={(item) => {
              setTargetExpenseForUnsecure(item);
              setActiveModal('unsecure-confirm');
            }}
            onDeleteExpense={handleDeleteShopExpense}
            onDeleteShopProfit={handleDeleteShopProfit}
            summary={summary}
          />
        )}

        {activeTab === 'history' && (
          <HistoryProfitLog
            salesHistory={salesHistoryData.sales}
            shopProfits={shopProfitsData.profits}
            totalSalesProfit={salesHistoryData.totalProfit}
            totalShopProfits={shopProfitsData.total}
            onOpenNewSale={() => setActiveModal('new-sale')}
            onOpenNewShopProfit={() => setActiveModal('new-shop-profit')}
            onOpenEditShopProfit={(entry) => {
              setTargetProfitForEdit(entry);
              setActiveModal('edit-shop-profit');
            }}
            onDeleteSale={handleDeleteSale}
            onDeleteShopProfit={handleDeleteShopProfit}
            summary={summary}
          />
        )}

        {activeTab === 'catalog' && (
          <PricingCatalog
            catalogItems={pricingCatalogData.items}
            onOpenNewCatalogModal={() => setActiveModal('new-catalog-item')}
            onOpenEditCatalogModal={(item) => {
              setTargetCatalogItemForEdit(item);
              setActiveModal('edit-catalog-item');
            }}
            onDeleteCatalogItem={handleDeletePricingCatalog}
          />
        )}
      </main>

      <EditCapitalModal
        summary={summary}
        isOpen={activeModal === 'edit-capital'}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveCapital}
      />

      <MoneyLocationModal
        isOpen={activeModal === 'card-money-locations'}
        onClose={() => {
          setActiveModal(null);
          setTargetFundForLocations(null);
        }}
        targetFund={targetFundForLocations}
        moneyLocations={moneyLocations}
        onSaveLocation={handleSaveMoneyLocation}
        onDeleteLocation={handleDeleteMoneyLocation}
      />

      <NewDepositModal
        isOpen={activeModal === 'new-deposit'}
        onClose={() => setActiveModal(null)}
        onSave={handleCreateDeposit}
      />

      <NewDailyExpenseModal
        summary={summary}
        isOpen={activeModal === 'new-daily-expense'}
        onClose={() => setActiveModal(null)}
        onSave={handleCreateDailyExpense}
      />

      <NewInstallmentModal
        targetPlan={targetPlanForEdit}
        isOpen={activeModal === 'new-installment'}
        onClose={() => {
          setActiveModal(null);
          setTargetPlanForEdit(null);
        }}
        onSave={handleSaveInstallmentPlan}
      />

      <PaymentModal
        targetPlan={targetPlanForPayment}
        targetPayment={targetPaymentForEdit}
        isOpen={activeModal === 'payment'}
        onClose={() => {
          setActiveModal(null);
          setTargetPlanForPayment(null);
          setTargetPaymentForEdit(null);
        }}
        onSave={handleRecordPayment}
        onDelete={handleDeletePayment}
      />

      <NewExpenseModal
        isOpen={activeModal === 'new-expense'}
        initialCategory={initialExpenseCategory}
        onClose={() => setActiveModal(null)}
        onSave={handleCreateShopExpense}
      />

      <EditExpenseModal
        targetExpense={targetExpenseForEdit}
        isOpen={activeModal === 'edit-expense'}
        onClose={() => {
          setActiveModal(null);
          setTargetExpenseForEdit(null);
        }}
        onSave={handleUpdateShopExpense}
      />

      <UnsecureConfirmModal
        targetExpense={targetExpenseForUnsecure}
        isOpen={activeModal === 'unsecure-confirm'}
        onClose={() => {
          setActiveModal(null);
          setTargetExpenseForUnsecure(null);
        }}
        onConfirm={handleUpdateShopExpense}
      />

      <NewSaleModal
        isOpen={activeModal === 'new-sale'}
        onClose={() => setActiveModal(null)}
        onSave={handleCreateSale}
      />

      <NewShopProfitModal
        summary={summary}
        isOpen={activeModal === 'new-shop-profit'}
        onClose={() => setActiveModal(null)}
        onSave={handleCreateShopProfit}
        onUpdateLbpRate={handleUpdateLbpRate}
      />

      <EditShopProfitModal
        targetProfit={targetProfitForEdit}
        summary={summary}
        isOpen={activeModal === 'edit-shop-profit'}
        onClose={() => setActiveModal(null)}
        onSave={handleUpdateShopProfit}
        onUpdateLbpRate={handleUpdateLbpRate}
      />

      <NewPricingCatalogModal
        isOpen={activeModal === 'new-catalog-item'}
        onClose={() => setActiveModal(null)}
        onSave={handleCreatePricingCatalog}
      />

      <EditPricingCatalogModal
        targetItem={targetCatalogItemForEdit}
        isOpen={activeModal === 'edit-catalog-item'}
        onClose={() => setActiveModal(null)}
        onSave={handleUpdatePricingCatalog}
      />

      {/* Interactive Detailed View Modals */}
      <ShopBreakEvenDetailModal
        summary={summary}
        shopProfits={shopProfitsData.profits}
        isOpen={activeModal === 'breakeven-detail'}
        onClose={() => setActiveModal(null)}
        onOpenLogShopProfit={() => setActiveModal('new-shop-profit')}
        onOpenEditShopProfit={(entry) => {
          setTargetProfitForEdit(entry);
          setActiveModal('edit-shop-profit');
        }}
      />


    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <UndoProvider>
        <MainAppContent />
      </UndoProvider>
    </ErrorBoundary>
  );
}
