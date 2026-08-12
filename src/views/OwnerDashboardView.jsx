import React, { useState, useMemo } from 'react';
import MobileAppFrame from '../components/MobileAppFrame';
import MobileAuthScreen from './MobileAuthScreen';
import { useApp } from '../context/AppContext';
import {
  TrendingUp, DollarSign, AlertTriangle, Package, Users,
  Bell, FileText, Download, Eye, CheckCircle, XCircle,
  ChevronRight, Activity, Banknote, BarChart2, ShieldCheck,
  ArrowUpRight, ArrowDownRight, Home, Building2, Star,
  Layers, MoreHorizontal, Clock, Receipt, LogOut
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Tooltip, Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Filler);

const fmt = n => '₱' + (n || 0).toLocaleString();

/* ── Multi-Branch Data ── */
const BRANCHES = [
  { id: 'main', name: 'Cyberzone Main', location: 'Metro Manila', badge: 'Main Store' },
  { id: 'branch2', name: 'SM North EDSA', location: 'Quezon City', badge: 'Branch 2' },
  { id: 'branch3', name: 'Robinsons Galleria', location: 'Ortigas', badge: 'Branch 3 (New)' },
];

const BRANCH_SALES = { main: null, branch2: 48200, branch3: 11900 };

export default function OwnerDashboardView() {
  const { products, transactions, cashLogs, setActiveModal, setSelectedTransaction, showToast, currentUser, isLoggedIn, logoutUser } = useApp();

  // Auth Guard: If not logged in as Owner, render MobileAuthScreen inside mobile app frame
  if (!isLoggedIn || currentUser.role !== 'owner') {
    return <MobileAuthScreen targetRole="owner" />;
  }

  const [activeTab, setActiveTab] = useState('home');
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [showBranchPicker, setShowBranchPicker] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, emoji: '💰', title: 'Big Sale Alert', body: 'Samsung Galaxy S24 Ultra sold — ₱74,990', time: '2h ago', read: false },
    { id: 2, emoji: '⚠️', title: 'Low Stock Warning', body: 'iPhone 15 Pro: only 2 units left — restock soon', time: '4h ago', read: false },
    { id: 3, emoji: '📊', title: 'End-of-Day Summary', body: 'Yesterday total: ₱92,880 · 5 transactions', time: '1d ago', read: true },
    { id: 4, emoji: '👤', title: 'Clerk Login', body: 'Alex Cruz started shift at 8:02 AM', time: '2d ago', read: true },
  ]);
  const [pendingApprovals, setPendingApprovals] = useState([
    { id: 1, type: 'Void Request', txNo: 'TX-20260811-002', clerk: 'Alex Cruz', amount: 69440, reason: 'Customer changed mind — wants different storage variant' },
    { id: 2, type: 'Large Discount', txNo: 'TX-NEW-005', clerk: 'Sarah Miller', amount: 2500, reason: 'Loyal customer request' },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  /* KPIs — from live DB */
  const totalSales = useMemo(() => transactions.reduce((s, t) => s + (t.total || 0), 0), [transactions]);
  const todayTxns = useMemo(() => transactions.filter(t => new Date(t.timestamp).toDateString() === new Date().toDateString()), [transactions]);
  const todaySales = useMemo(() => todayTxns.reduce((s, t) => s + (t.total || 0), 0), [todayTxns]);
  const cashIn = useMemo(() => cashLogs.filter(c => c.type === 'in').reduce((s, c) => s + c.amount, 0), [cashLogs]);
  const cashOut = useMemo(() => cashLogs.filter(c => c.type === 'out').reduce((s, c) => s + c.amount, 0), [cashLogs]);
  const cashBalance = cashIn - cashOut;
  const lowStockItems = useMemo(() => products.filter(p => p.stock <= 3), [products]);
  const netProfit = Math.round(totalSales * 0.22);
  const branchSales = selectedBranch === 'main' ? todaySales : (BRANCH_SALES[selectedBranch] || 0);

  const salesChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'],
    datasets: [{
      data: [45200, 58900, 71440, 34500, 92880, 85000, todaySales],
      fill: true,
      borderColor: 'rgb(6,182,212)',
      backgroundColor: 'rgba(6,182,212,0.08)',
      tension: 0.45,
      pointBackgroundColor: 'rgb(6,182,212)',
      pointRadius: 4,
      pointHoverRadius: 6,
    }]
  };

  const paymentData = {
    labels: ['Cash', 'GCash', 'Card'],
    datasets: [{
      data: [
        transactions.filter(t => t.paymentMethod === 'Cash').reduce((s, t) => s + t.total, 0) || 2440,
        transactions.filter(t => t.paymentMethod === 'GCash').reduce((s, t) => s + t.total, 0) || 69440,
        transactions.filter(t => t.paymentMethod === 'Card').reduce((s, t) => s + t.total, 0) || 21000,
      ],
      backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(6,182,212,0.8)', 'rgba(139,92,246,0.8)'],
      borderWidth: 0,
    }]
  };

  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ₱${ctx.raw.toLocaleString()}` }, backgroundColor: 'rgba(15,23,42,0.95)', titleColor: '#94a3b8', bodyColor: '#e2e8f0', borderColor: 'rgba(51,65,85,0.8)', borderWidth: 1 } },
    scales: {
      x: { grid: { color: 'rgba(51,65,85,0.25)' }, ticks: { color: '#475569', font: { size: 9 } } },
      y: { grid: { color: 'rgba(51,65,85,0.25)' }, ticks: { color: '#475569', font: { size: 9 }, callback: v => '₱' + (v / 1000).toFixed(0) + 'k' } }
    }
  };

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false, cutout: '70%',
    plugins: { legend: { position: 'bottom', labels: { color: '#64748b', font: { size: 9 }, padding: 10, boxWidth: 8 } } }
  };

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const approveAction = id => { setPendingApprovals(p => p.filter(a => a.id !== id)); showToast('Approved remotely ✓', 'success'); };
  const rejectAction = id => { setPendingApprovals(p => p.filter(a => a.id !== id)); showToast('Rejected — clerk notified', 'success'); };

  const bottomTabs = [
    { id: 'home', icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
    { id: 'sales', icon: <TrendingUp className="w-5 h-5" />, label: 'Sales' },
    { id: 'alerts', icon: <Bell className="w-5 h-5" />, label: 'Alerts', badge: unreadCount },
    { id: 'approvals', icon: <ShieldCheck className="w-5 h-5" />, label: 'Approve', badge: pendingApprovals.length },
    { id: 'reports', icon: <FileText className="w-5 h-5" />, label: 'Reports' },
  ];

  return (
    <MobileAppFrame statusLabel="Owner Dashboard" statusColor="amber">

      {/* ── App Header with branch picker ── */}
      <div className="px-4 pt-1 pb-3 border-b border-slate-800/80 bg-slate-950">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => setShowBranchPicker(true)} className="flex items-center space-x-1 mt-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-white">{BRANCHES.find(b => b.id === selectedBranch)?.name}</span>
              <ChevronRight className="w-3 h-3 text-slate-500 rotate-90" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setActiveTab('alerts')} className="relative w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-extrabold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button onClick={logoutUser} title="Sign Out" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── HOME / DASHBOARD ── */}
      {activeTab === 'home' && (
        <div className="flex-1 overflow-y-auto">
          {/* Branch sales context bar */}
          <div className="px-4 py-2 bg-amber-500/5 border-b border-amber-500/15 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-bold">Live · Synced</span>
            </div>
            <span className="text-[10px] text-slate-400">{new Date().toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>

          <div className="px-4 py-4 space-y-4">
            {/* Primary KPI card */}
            <div className="bg-gradient-to-br from-cyan-900/50 via-slate-900 to-slate-900 rounded-3xl border border-cyan-500/20 p-5 shadow-xl">
              <p className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">Today's Revenue</p>
              <p className="text-3xl font-extrabold text-white mt-1 tracking-tight">{fmt(branchSales)}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="flex items-center space-x-1 text-emerald-400 text-[11px] font-bold">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+18.5% vs yesterday</span>
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-cyan-500/15 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-base font-extrabold text-amber-400">{fmt(cashBalance)}</p>
                  <p className="text-[9px] text-slate-500 uppercase font-bold mt-0.5">Cash on Hand</p>
                </div>
                <div>
                  <p className="text-base font-extrabold text-violet-400">{todayTxns.length}</p>
                  <p className="text-[9px] text-slate-500 uppercase font-bold mt-0.5">Transactions</p>
                </div>
                <div>
                  <p className={`text-base font-extrabold ${lowStockItems.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{lowStockItems.length}</p>
                  <p className="text-[9px] text-slate-500 uppercase font-bold mt-0.5">Low Stock</p>
                </div>
              </div>
            </div>

            {/* Mini KPI grid */}
            <div className="grid grid-cols-2 gap-3">
              <MiniKpi label="Est. Net Profit" value={fmt(netProfit)} sub="~22% margin" icon={<DollarSign className="w-4 h-4" />} color="emerald" />
              <MiniKpi label="Total SKUs" value={products.length} sub={`${products.reduce((s, p) => s + p.stock, 0)} units`} icon={<Package className="w-4 h-4" />} color="violet" />
            </div>

            {/* 7-Day Sales Chart */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-white">7-Day Revenue Trend</p>
                <span className="text-[9px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">Live</span>
              </div>
              <div className="h-32"><Line data={salesChartData} options={lineOptions} /></div>
            </div>

            {/* Payment method split */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
              <p className="text-xs font-bold text-white mb-3">Payment Method Split</p>
              <div className="h-36"><Doughnut data={paymentData} options={doughnutOptions} /></div>
            </div>

            {/* Recent transactions mini feed */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-white">Recent Activity</p>
                <button onClick={() => setActiveTab('sales')} className="text-[10px] text-cyan-400 font-semibold flex items-center space-x-0.5">
                  <span>See all</span><ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {transactions.slice(0, 3).map(tx => (
                <button key={tx.id} onClick={() => { setSelectedTransaction(tx); setActiveModal('receipt'); }}
                  className="w-full flex items-center justify-between bg-slate-950 rounded-xl p-3 border border-slate-800/80 hover:border-cyan-500/30 transition text-left">
                  <div>
                    <p className="text-[10px] font-bold text-cyan-400 font-mono">{tx.transactionNo}</p>
                    <p className="text-[10px] text-slate-400">{tx.clerkName} · {tx.paymentMethod}</p>
                  </div>
                  <p className="text-sm font-extrabold text-white">{fmt(tx.total)}</p>
                </button>
              ))}
            </div>

            {/* Pending approvals preview */}
            {pendingApprovals.length > 0 && (
              <button onClick={() => setActiveTab('approvals')}
                className="w-full bg-rose-950/30 border border-rose-500/25 rounded-2xl p-4 flex items-center justify-between hover:border-rose-500/40 transition">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white">{pendingApprovals.length} Pending Approval{pendingApprovals.length > 1 ? 's' : ''}</p>
                    <p className="text-[10px] text-rose-300">Tap to review & approve remotely</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-400" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── SALES HISTORY ── */}
      {activeTab === 'sales' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-white">Sales History</h2>
            <span className="text-[10px] font-mono text-slate-400">{transactions.length} records</span>
          </div>

          {transactions.map(tx => (
            <button key={tx.id}
              onClick={() => { setSelectedTransaction(tx); setActiveModal('receipt'); }}
              className="w-full bg-slate-900 rounded-2xl border border-slate-800 p-4 text-left space-y-2 hover:border-cyan-500/30 transition active:scale-[0.98]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-cyan-400 font-mono">{tx.transactionNo}</span>
                <span className="text-sm font-extrabold text-white">{fmt(tx.total)}</span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">{(tx.items || []).map(i => i.name).join(', ')}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-400 font-semibold">{tx.paymentMethod}</span>
                  <span>· {tx.clerkName?.split(' ')[0]}</span>
                  {tx.receiptPhotoUrl && <span className="text-emerald-400 font-bold">✓ Photo</span>}
                </div>
                <span className="flex items-center space-x-1"><Eye className="w-3 h-3" /><span>Receipt</span></span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── NOTIFICATIONS / ALERTS ── */}
      {activeTab === 'alerts' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-white">Push Notifications</h2>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[10px] text-cyan-400 font-semibold">Mark all read</button>
            )}
          </div>

          {notifications.map(n => (
            <div key={n.id} className={`bg-slate-900 rounded-2xl border p-4 flex items-start space-x-3 transition ${n.read ? 'border-slate-800 opacity-70' : 'border-slate-700'}`}>
              <span className="text-xl leading-none shrink-0">{n.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white">{n.title}</p>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 ml-2" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{n.body}</p>
                <p className="text-[10px] text-slate-600 mt-1.5">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── REMOTE APPROVALS ── */}
      {activeTab === 'approvals' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div>
            <h2 className="text-sm font-extrabold text-white">Remote Approval Queue</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Review & approve sensitive clerk actions from anywhere</p>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-white">All Clear!</p>
              <p className="text-xs text-slate-500">No pending approvals right now.</p>
            </div>
          ) : (
            pendingApprovals.map(a => (
              <div key={a.id} className="bg-slate-900 rounded-2xl border border-rose-500/25 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">{a.type}</span>
                    <p className="text-[10px] font-mono text-cyan-400 mt-1">{a.txNo}</p>
                  </div>
                  <p className="text-base font-extrabold text-rose-300">₱{a.amount.toLocaleString()}</p>
                </div>
                <div className="bg-slate-950 rounded-xl p-3 space-y-1 text-[11px]">
                  <p><span className="text-slate-500">Clerk: </span><span className="text-slate-300 font-semibold">{a.clerk}</span></p>
                  <p><span className="text-slate-500">Reason: </span><span className="text-slate-300">{a.reason}</span></p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => approveAction(a.id)}
                    className="py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center justify-center space-x-1 active:scale-[0.97]">
                    <CheckCircle className="w-4 h-4" /><span>Approve</span>
                  </button>
                  <button onClick={() => rejectAction(a.id)}
                    className="py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center justify-center space-x-1 active:scale-[0.97]">
                    <XCircle className="w-4 h-4" /><span>Reject</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── REPORTS ── */}
      {activeTab === 'reports' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div>
            <h2 className="text-sm font-extrabold text-white">One-Tap Reports</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Pull any report on demand, from anywhere</p>
          </div>

          {[
            { icon: '📊', title: 'Daily Sales Summary', sub: `${transactions.length} txns · ${fmt(totalSales)}`, color: 'cyan' },
            { icon: '💵', title: 'Cash Flow Report', sub: `${fmt(cashIn)} in · ${fmt(cashOut)} out`, color: 'emerald' },
            { icon: '📦', title: 'Inventory Movement', sub: `${products.length} SKUs · ${products.reduce((s, p) => s + p.stock, 0)} units`, color: 'violet' },
            { icon: '⭐', title: 'Best Sellers Report', sub: `Top products by revenue`, color: 'amber' },
          ].map((r, i) => (
            <button key={i} onClick={() => setActiveModal('report')}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-4 hover:border-slate-700 transition active:scale-[0.98] text-left">
              <span className="text-2xl">{r.icon}</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-white">{r.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{r.sub}</p>
              </div>
              <div className="flex items-center space-x-1 text-cyan-400">
                <Download className="w-4 h-4" />
                <span className="text-[10px] font-bold">PDF</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="shrink-0 border-t border-slate-800 bg-slate-950 px-1 pb-1">
        <div className="flex">
          {bottomTabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 space-y-0.5 relative transition ${
                activeTab === tab.id ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
              }`}>
              {tab.icon}
              <span className="text-[8px] font-bold">{tab.label}</span>
              {tab.badge > 0 && (
                <span className="absolute top-1.5 right-1 w-4 h-4 bg-rose-500 text-[8px] text-white font-extrabold rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-amber-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Branch Picker Bottom Sheet */}
      {showBranchPicker && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowBranchPicker(false)} />
          <div className="relative bg-slate-900 rounded-t-3xl border-t border-slate-800 p-5 space-y-3 shadow-2xl">
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-2" />
            <h3 className="text-sm font-extrabold text-white">Select Branch</h3>
            <p className="text-[11px] text-slate-400">Multi-branch view — monitor all locations from this app</p>
            <div className="space-y-2">
              {BRANCHES.map(b => (
                <button key={b.id} onClick={() => { setSelectedBranch(b.id); setShowBranchPicker(false); showToast(`Switched to ${b.name}`); }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition ${
                    selectedBranch === b.id ? 'bg-amber-500/10 border-amber-500/40' : 'bg-slate-800 border-slate-700'
                  }`}>
                  <div className="flex items-center space-x-3">
                    <Building2 className={`w-5 h-5 ${selectedBranch === b.id ? 'text-amber-400' : 'text-slate-400'}`} />
                    <div className="text-left">
                      <p className="text-xs font-bold text-white">{b.name}</p>
                      <p className="text-[10px] text-slate-400">{b.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      selectedBranch === b.id ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {b.badge}
                    </span>
                    {selectedBranch === b.id && <p className="text-[9px] text-emerald-400 font-bold mt-1">● Active</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </MobileAppFrame>
  );
}

function MiniKpi({ label, value, sub, icon, color }) {
  const map = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  };
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-2">
      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${map[color]}`}>{icon}</div>
      <div>
        <p className="text-[9px] text-slate-500 uppercase font-bold">{label}</p>
        <p className="text-base font-extrabold text-white mt-0.5">{value}</p>
        <p className="text-[10px] text-slate-500">{sub}</p>
      </div>
    </div>
  );
}
