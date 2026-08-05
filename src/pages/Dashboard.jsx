import { useState, useEffect, useMemo } from 'react';
import {
  Wallet, ArrowDownRight, ArrowUpRight, TrendingUp,
  TrendingDown, Target, ChevronRight, CalendarDays,
  PiggyBank, ReceiptText, Loader2, Trash2, Plus
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// All backend calls (base URL, endpoints, response shapes) live in lib/api.js
import { getTransactions, addTransaction, deleteTransaction } from '../lib/api';

// Category colours for the spending donut
const CATEGORY_COLORS = [
  '#0D9488', '#6366F1', '#F59E0B', '#EC4899',
  '#10B981', '#3B82F6', '#8B5CF6', '#64748B',
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Format a number as currency */
const fmt = (n) => {
  if (n == null) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
};

/** Percentage change between two values (returns e.g. +12.5 or -3.1) */
const pctChange = (current, previous) => {
  if (!previous) return null;
  return (((current - previous) / Math.abs(previous)) * 100).toFixed(1);
};

/** Group transactions by month key "YYYY-MM" */
const groupByMonth = (transactions) => {
  const months = {};
  transactions.forEach((tx) => {
    const d = new Date(tx.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!months[key]) months[key] = { deposits: 0, withdrawals: 0, transfers: 0 };
    if (tx.type === 'deposit') months[key].deposits += tx.amount;
    else if (tx.type === 'withdraw') months[key].withdrawals += tx.amount;
    else if (tx.type === 'transfer') months[key].transfers += tx.amount;
  });
  return months;
};

/** Group transactions by day-of-week (0=Sun … 6=Sat) */
const groupByDayOfWeek = (transactions) => {
  const days = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  transactions.forEach((tx) => {
    if (tx.type === 'withdraw') {
      const d = new Date(tx.timestamp);
      days[labels[d.getDay()]] += tx.amount;
    }
  });
  return labels.map((day) => ({ day, amount: days[day] }));
};

/** Group withdraw transactions by description keyword as "category" */
const groupByCategory = (transactions) => {
  const cats = {};
  transactions
    .filter((tx) => tx.type === 'withdraw')
    .forEach((tx) => {
      const cat = tx.category || tx.description?.split(' ')[0] || 'Other';
      cats[cat] = (cats[cat] || 0) + tx.amount;
    });
  return Object.entries(cats)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({
      name,
      value,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));
};

// ─── CUSTOM TOOLTIP ──────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
      <p style={{ color: '#8B9EC0', fontSize: 11, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color, fontSize: 13, fontWeight: 600, margin: '2px 0' }}>
          {entry.name.charAt(0).toUpperCase() + entry.name.slice(1)}: <span style={{ color: '#F0F6FF' }}>{fmt(entry.value)}</span>
        </p>
      ))}
    </div>
  );
};

// ─── LOADING SKELETON ────────────────────────────────────────────────────────

const SkeletonCard = ({ height = 120 }) => (
  <div className="dash-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: height }}>
    <Loader2 size={22} style={{ color: '#4A5C7A', animation: 'spin 1s linear infinite' }} />
  </div>
);

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────

const EmptyState = ({ icon: Icon, message }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: 10, opacity: 0.6 }}>
    <Icon size={28} style={{ color: '#4A5C7A' }} />
    <p style={{ fontSize: '0.8125rem', color: '#4A5C7A', textAlign: 'center' }}>{message}</p>
  </div>
);

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  // ── State ────────────────────────────────────────────
  const [transactions, setTransactions] = useState([]);
  const [vaults, setVaults] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Add-transaction form state
  const [newTx, setNewTx] = useState({ description: '', amount: '', type: 'withdraw', vaultId: '' });
  const [txError, setTxError] = useState('');
  const [txSaving, setTxSaving] = useState(false);

  // Shared helper: the backend replies with the full { vaults, transactions,
  // settings } object on GET, POST and DELETE, so every call below can reuse this.
  // (Still handles a plain array too, in case the backend shape ever changes.)
  const applyData = (data) => {
    if (Array.isArray(data)) {
      setTransactions(data);
    } else {
      setTransactions(data.transactions || []);
      setVaults(data.vaults || []);
      setSettings(data.settings || null);
    }
  };

  // ── Fetch data from backend ──────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        applyData(await getTransactions());
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── Add transaction ──────────────────────────────────
  async function handleAddTransaction(e) {
    e.preventDefault();
    setTxError('');

    if (!newTx.description.trim() || !newTx.amount || !newTx.vaultId) {
      setTxError('Fill in description, amount and vault.');
      return;
    }

    setTxSaving(true);
    try {
      const tx = {
        id: `tx_${Date.now()}`,
        type: newTx.type,
        vaultId: newTx.vaultId,
        amount: parseFloat(newTx.amount),
        description: newTx.description.trim(),
        timestamp: new Date().toISOString(),
      };
      applyData(await addTransaction(tx));
      setNewTx({ description: '', amount: '', type: 'withdraw', vaultId: newTx.vaultId });
    } catch (err) {
      setTxError(err.message);
    } finally {
      setTxSaving(false);
    }
  }

  // ── Delete transaction ───────────────────────────────
  async function handleDeleteTransaction(id) {
    try {
      applyData(await deleteTransaction(id));
    } catch (err) {
      console.error('Delete transaction error:', err);
      setTxError(err.message);
    }
  }

  // ── Derived data (computed from fetched transactions) ─────────
  const monthlyData = useMemo(() => groupByMonth(transactions), [transactions]);
  const weeklySpending = useMemo(() => groupByDayOfWeek(transactions), [transactions]);
  const categoryBreakdown = useMemo(() => groupByCategory(transactions), [transactions]);

  // Monthly chart data sorted by date
  const monthlyChartData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, data]) => {
        const [, m] = key.split('-');
        return {
          month: monthNames[parseInt(m, 10) - 1],
          key,
          income: data.deposits,
          expenses: data.withdrawals,
          transfers: data.transfers,
        };
      });
  }, [monthlyData]);

  // Current & previous month totals for KPI deltas
  const kpiData = useMemo(() => {
    const now = new Date();
    const curKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    const cur = monthlyData[curKey] || { deposits: 0, withdrawals: 0 };
    const prev = monthlyData[prevKey] || { deposits: 0, withdrawals: 0 };

    const totalBalance = vaults.reduce((sum, v) => sum + (v.balance || 0), 0);
    const monthlyIncome = cur.deposits;
    const monthlyExpenses = cur.withdrawals;
    const netSavings = monthlyIncome - monthlyExpenses;

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      netSavings,
      incomeDelta: pctChange(cur.deposits, prev.deposits),
      expenseDelta: pctChange(cur.withdrawals, prev.withdrawals),
      savingsDelta: pctChange(
        cur.deposits - cur.withdrawals,
        prev.deposits - prev.withdrawals
      ),
    };
  }, [monthlyData, vaults]);

  // Recent transactions (last 8, sorted newest first)
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 8);
  }, [transactions]);

  // Budget plans from vaults that have a target set
  const budgetPlans = useMemo(() => {
    return vaults.filter((v) => v.target != null);
  }, [vaults]);

  // Highest spending day
  const highestSpendingDay = useMemo(() => {
    return weeklySpending.reduce((max, d) => (d.amount > max.amount ? d : max), { day: '-', amount: 0 });
  }, [weeklySpending]);

  // ── Transaction icon by type ─────────────────────────
  const txIcon = (type) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'withdraw': return '🧾';
      case 'transfer': return '🔄';
      default: return '📄';
    }
  };

  const txTypeLabel = (type) => {
    switch (type) {
      case 'deposit': return 'Income';
      case 'withdraw': return 'Expense';
      case 'transfer': return 'Transfer';
      default: return type;
    }
  };

  // ── Error state ──────────────────────────────────────
  if (error) {
    return (
      <div className="dash-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 8 }}>Unable to load dashboard</h2>
          <p style={{ color: '#8B9EC0', fontSize: '0.875rem', marginBottom: 20 }}>{error}</p>
          <button onClick={() => window.location.reload()} style={styles.primaryBtn}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-wrap">

      {/* HEADER */}
      <div className="dash-header">
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            Expense Overview
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#8B9EC0', marginTop: 4 }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {settings && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8125rem', color: '#4A5C7A' }}>Welcome,</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F0F6FF' }}>{settings.userName}</span>
          </div>
        )}
      </div>

      {/* KPI CARDS */}
      {loading ? (
        <div className="dash-kpi-grid">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} height={110} />)}
        </div>
      ) : (
        <div className="dash-kpi-grid">
          {[
            { label: 'Total Balance', value: fmt(kpiData.totalBalance), delta: null, up: true, icon: <Wallet size={18} />, accent: '#0D9488' },
            { label: 'Monthly Income', value: fmt(kpiData.monthlyIncome), delta: kpiData.incomeDelta, up: kpiData.incomeDelta > 0, icon: <TrendingUp size={18} />, accent: '#10B981' },
            { label: 'Monthly Expenses', value: fmt(kpiData.monthlyExpenses), delta: kpiData.expenseDelta, up: false, icon: <TrendingDown size={18} />, accent: '#EF4444' },
            { label: 'Net Savings', value: fmt(kpiData.netSavings), delta: kpiData.savingsDelta, up: kpiData.netSavings >= 0, icon: <Target size={18} />, accent: '#6366F1' },
          ].map((card) => (
            <div key={card.label} className="dash-card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <p style={{ fontSize: '0.8125rem', color: '#8B9EC0', fontWeight: 500, margin: 0 }}>{card.label}</p>
                <div style={{ ...styles.iconBox, background: card.accent + '18', color: card.accent }}>{card.icon}</div>
              </div>
              <p className="dash-kpi-value">{card.value}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {card.delta != null ? (
                  <>
                    {card.up ? <ArrowUpRight size={14} color="#10B981" /> : <ArrowDownRight size={14} color="#EF4444" />}
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: card.up ? '#10B981' : '#EF4444' }}>
                      {card.delta > 0 ? '+' : ''}{card.delta}%
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: '#4A5C7A', marginLeft: 2 }}>vs last month</span>
                  </>
                ) : (
                  <span style={{ fontSize: '0.8125rem', color: '#4A5C7A' }}>Across all vaults</span>
                )}
              </div>
              <div style={{ position: 'absolute', right: -20, bottom: -20, width: 80, height: 80, borderRadius: '50%', background: card.accent, opacity: 0.07, filter: 'blur(16px)', pointerEvents: 'none' }} />
            </div>
          ))}
        </div>
      )}

      {/* ROW 2: Monthly Cash Flow + Weekly Spending Habits */}
      <div className="dash-row2">

        {/* Cash Flow Chart */}
        <div className="dash-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ minWidth: 0 }}>
              <h2 className="dash-card-title">Monthly Overview</h2>
              <p className="dash-card-sub">Income vs expenses by month</p>
            </div>
            <div style={{ ...styles.iconBox, background: 'rgba(13,148,136,0.12)', color: '#0D9488' }}>
              <CalendarDays size={16} />
            </div>
          </div>
          {loading ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={22} style={{ color: '#4A5C7A', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : monthlyChartData.length === 0 ? (
            <EmptyState icon={CalendarDays} message="No monthly data yet. Transactions from the mobile app will appear here." />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyChartData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.20} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#4A5C7A', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#4A5C7A', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="income" stroke="#0D9488" strokeWidth={2.5} fill="url(#incomeGrad)" dot={false} />
                  <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2.5} fill="url(#expenseGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
                {[{ color: '#0D9488', label: 'Income' }, { color: '#EF4444', label: 'Expenses' }].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                    <span style={{ fontSize: '0.75rem', color: '#8B9EC0' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Weekly Spending Habits */}
        <div className="dash-card">
          <div style={{ marginBottom: 20 }}>
            <h2 className="dash-card-title">Spending Habits</h2>
            <p className="dash-card-sub">Spending by day of week</p>
          </div>
          {loading ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={22} style={{ color: '#4A5C7A', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : weeklySpending.every(d => d.amount === 0) ? (
            <EmptyState icon={ReceiptText} message="No spending data yet. Track expenses from the mobile app to see weekly patterns." />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklySpending} margin={{ top: 5, right: 0, bottom: 0, left: -20 }} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#4A5C7A', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#4A5C7A', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="amount" radius={[5, 5, 0, 0]}>
                    {weeklySpending.map((entry, i) => (
                      <Cell key={i} fill={entry.day === highestSpendingDay.day && entry.amount > 0 ? '#0D9488' : 'rgba(13,148,136,0.25)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {highestSpendingDay.amount > 0 && (
                <p style={{ fontSize: '0.75rem', color: '#4A5C7A', marginTop: 14, textAlign: 'center' }}>
                  Highest: <span style={{ color: '#0D9488', fontWeight: 600 }}>{highestSpendingDay.day} ({fmt(highestSpendingDay.amount)})</span>
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* ROW 3: Recent Transactions + Spending by Category */}
      <div className="dash-row3">

        {/* Recent Transactions */}
        <div className="dash-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ minWidth: 0 }}>
              <h2 className="dash-card-title">Recent Transactions</h2>
              <p className="dash-card-sub">{transactions.length > 0 ? `Last ${recentTransactions.length} entries` : 'No transactions yet'}</p>
            </div>
            {transactions.length > 0 && (
              <button style={styles.linkBtn}>View all <ChevronRight size={14} /></button>
            )}
          </div>

          {/* Add transaction form - posts to the backend's POST /transactions route */}
          {!loading && (
            <form onSubmit={handleAddTransaction} style={styles.addTxForm}>
              <input
                type="text"
                placeholder="Description"
                value={newTx.description}
                onChange={e => setNewTx({ ...newTx, description: e.target.value })}
                style={{ ...styles.addTxInput, flex: 2 }}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={newTx.amount}
                onChange={e => setNewTx({ ...newTx, amount: e.target.value })}
                style={{ ...styles.addTxInput, flex: 1 }}
              />
              <select
                value={newTx.type}
                onChange={e => setNewTx({ ...newTx, type: e.target.value })}
                style={styles.addTxInput}
              >
                <option value="withdraw">Expense</option>
                <option value="deposit">Income</option>
                <option value="transfer">Transfer</option>
              </select>
              <select
                value={newTx.vaultId}
                onChange={e => setNewTx({ ...newTx, vaultId: e.target.value })}
                style={styles.addTxInput}
              >
                <option value="">Vault…</option>
                {vaults.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
              <button type="submit" disabled={txSaving} style={styles.addTxBtn}>
                <Plus size={16} />
              </button>
            </form>
          )}
          {txError && <p style={{ fontSize: '0.75rem', color: '#EF4444', margin: '0 0 12px' }}>{txError}</p>}

          {loading ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={22} style={{ color: '#4A5C7A', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : recentTransactions.length === 0 ? (
            <EmptyState icon={ReceiptText} message="No transactions recorded yet. They will appear here once users start tracking expenses in the mobile app." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="dash-tx-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 18, width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {txIcon(tx.type)}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F0F6FF', margin: 0 }}>{tx.description || 'Untitled'}</p>
                      <p style={{ fontSize: '0.75rem', color: '#4A5C7A', margin: '2px 0 0' }}>
                        {txTypeLabel(tx.type)} · {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: tx.type === 'deposit' ? '#10B981' : tx.type === 'withdraw' ? '#EF4444' : '#F59E0B', whiteSpace: 'nowrap' }}>
                      {tx.type === 'deposit' ? '+' : tx.type === 'withdraw' ? '-' : ''}{fmt(tx.amount)}
                    </span>
                    {/* Deletes via the backend's DELETE /transactions/:id route */}
                    <button
                      type="button"
                      onClick={() => handleDeleteTransaction(tx.id)}
                      style={styles.deleteBtn}
                      aria-label="Delete transaction"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Spending by Category */}
        <div className="dash-card">
          <div style={{ marginBottom: 16 }}>
            <h2 className="dash-card-title">By Category</h2>
            <p className="dash-card-sub">Expense breakdown</p>
          </div>
          {loading ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={22} style={{ color: '#4A5C7A', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : categoryBreakdown.length === 0 ? (
            <EmptyState icon={PiggyBank} message="No expense categories yet. Categorise your expenses in the mobile app." />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={46} outerRadius={68} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {categoryBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [fmt(v), '']} contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#F0F6FF', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>
                {categoryBreakdown.slice(0, 5).map((c) => (
                  <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.75rem', color: '#8B9EC0' }}>{c.name}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#F0F6FF' }}>{fmt(c.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ROW 4: Budget / Savings Goals + Vaults Overview */}
      <div className="dash-row4">

        {/* Budget Plans / Savings Goals */}
        <div className="dash-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <h2 className="dash-card-title">Budget Plans</h2>
              <p className="dash-card-sub">Progress toward savings targets</p>
            </div>
            <div style={{ ...styles.iconBox, background: 'rgba(99,102,241,0.12)', color: '#6366F1' }}>
              <PiggyBank size={16} />
            </div>
          </div>
          {loading ? (
            <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={22} style={{ color: '#4A5C7A', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : budgetPlans.length === 0 ? (
            <EmptyState icon={Target} message="No budget plans set. Users can create savings targets in the mobile app." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {budgetPlans.map((g) => {
                const pct = Math.round((g.balance / g.target) * 100);
                const barColor = g.color || '#0D9488';
                return (
                  <div key={g.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F0F6FF' }}>{g.name}</span>
                      <span style={{ fontSize: '0.8125rem', color: '#8B9EC0' }}>
                        {fmt(g.balance)} <span style={{ color: '#4A5C7A' }}>/ {fmt(g.target)}</span>
                      </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, borderRadius: 4, background: barColor, transition: 'width 500ms ease' }} />
                    </div>
                    <p style={{ fontSize: '0.6875rem', color: '#4A5C7A', marginTop: 4 }}>{pct}% complete</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Vaults Overview */}
        <div className="dash-card">
          <div style={{ marginBottom: 20 }}>
            <h2 className="dash-card-title">Vaults</h2>
            <p className="dash-card-sub">User wallets & accounts</p>
          </div>
          {loading ? (
            <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={22} style={{ color: '#4A5C7A', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : vaults.length === 0 ? (
            <EmptyState icon={Wallet} message="No vaults created yet. Users can set up vaults in the mobile app." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {vaults.map((vault) => (
                <div key={vault.id} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: vault.color || '#0D9488', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F0F6FF' }}>{vault.name}</span>
                  </div>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#F0F6FF' }}>{fmt(vault.balance)}</span>
                </div>
              ))}
              {/* Total across vaults */}
              <div style={{ marginTop: 6, padding: '12px 16px', borderRadius: 10, background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0D9488' }}>Total</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0D9488' }}>
                  {fmt(vaults.reduce((sum, v) => sum + (v.balance || 0), 0))}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = {
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 16px',
    background: '#0D9488',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  linkBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#0D9488',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  addTxForm: {
    display: 'flex',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  addTxInput: {
    minWidth: 0,
    padding: '8px 10px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    color: '#F0F6FF',
    fontSize: '0.8125rem',
  },
  addTxBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    padding: '8px 10px',
    background: '#0D9488',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    flexShrink: 0,
  },
  deleteBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    color: '#4A5C7A',
    cursor: 'pointer',
    padding: 4,
  },
};
