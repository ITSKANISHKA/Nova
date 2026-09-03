import React from 'react';
import { Package, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';

const STEPS = [
  { key: 'placed', label: 'Order Placed', icon: Package, description: 'Order received and confirmed' },
  { key: 'processing', label: 'Processing', icon: Clock, description: 'Item is being packed & prepared' },
  { key: 'shipped', label: 'Shipped', icon: Truck, description: 'On the way with courier' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2, description: 'Package delivered successfully' },
];

export default function OrderTracker({ orderStatus, statusHistory = [] }) {
  if (orderStatus === 'cancelled') {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl p-4 flex items-center gap-3">
        <XCircle className="w-6 h-6 shrink-0" />
        <div>
          <h4 className="font-semibold">Order Cancelled</h4>
          <p className="text-xs text-rose-600/80 dark:text-rose-400/80">This order was cancelled and will not be delivered.</p>
        </div>
      </div>
    );
  }

  // Get index of current status
  const currentStepIndex = STEPS.findIndex((s) => s.key === orderStatus);
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 my-4">
      <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-4">
        Order Tracking Timeline
      </h4>

      <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-2">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx <= activeIndex;
          const isCurrent = idx === activeIndex;

          // Find history entry if available
          const historyEntry = statusHistory.find(
            (h) => h.status === step.key || (step.key === 'processing' && h.status === 'confirmed')
          );

          return (
            <div key={step.key} className="flex-1 flex md:flex-col items-start md:items-center relative group">
              {/* Connector line for desktop */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`hidden md:block absolute top-5 left-1/2 w-full h-1 -translate-y-1/2 z-0 ${
                    idx < activeIndex ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              )}

              {/* Status Circle */}
              <div
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/40 shadow-lg scale-110'
                    : isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Text Info */}
              <div className="ml-4 md:ml-0 md:mt-3 md:text-center">
                <p className={`text-sm font-semibold ${isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[140px]">
                  {step.description}
                </p>
                {historyEntry && (
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                    {new Date(historyEntry.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
