import React from 'react';
import { TrendingUp, ShoppingCart, DollarSign, Package } from 'lucide-react';

export function StatCard({ title, value, change, icon: Icon, color = 'indigo' }) {
  const colorMap = {
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
          {change && (
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.indigo}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

export function RevenueChart({ data = [] }) {
  // Sample revenue monthly bar data if empty
  const defaultBars = [
    { label: 'Jan', value: 1200 },
    { label: 'Feb', value: 2100 },
    { label: 'Mar', value: 1800 },
    { label: 'Apr', value: 3200 },
    { label: 'May', value: 2900 },
    { label: 'Jun', value: 4500 },
    { label: 'Jul', value: 3800 },
  ];

  const bars = data.length > 0 ? data : defaultBars;
  const maxValue = Math.max(...bars.map((b) => b.value), 100);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center justify-between">
        <span>Revenue Growth Overview</span>
        <span className="text-xs text-slate-400 font-normal">Last 7 Periods</span>
      </h3>

      <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-slate-100 dark:border-slate-800">
        {bars.map((bar, i) => {
          const heightPercent = Math.round((bar.value / maxValue) * 100);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="text-[10px] text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-medium transition-colors">
                ${bar.value}
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg h-36 flex items-end p-1">
                <div
                  style={{ height: `${Math.max(10, heightPercent)}%` }}
                  className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-md group-hover:brightness-110 transition-all"
                />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{bar.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OrderStatusBreakdown({ counts = {} }) {
  const statuses = [
    { key: 'placed', label: 'Placed', color: 'bg-sky-500' },
    { key: 'confirmed', label: 'Confirmed', color: 'bg-indigo-500' },
    { key: 'shipped', label: 'Shipped', color: 'bg-amber-500' },
    { key: 'delivered', label: 'Delivered', color: 'bg-emerald-500' },
    { key: 'cancelled', label: 'Cancelled', color: 'bg-rose-500' },
  ];

  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
        Order Status Breakdown
      </h3>

      <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex my-4">
        {statuses.map((s) => {
          const val = counts[s.key] || 0;
          const pct = (val / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={s.key}
              style={{ width: `${pct}%` }}
              className={`${s.color} h-full transition-all`}
              title={`${s.label}: ${val}`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
        {statuses.map((s) => {
          const val = counts[s.key] || 0;
          return (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
              <span className="text-xs text-slate-600 dark:text-slate-400 capitalize">{s.label}:</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
