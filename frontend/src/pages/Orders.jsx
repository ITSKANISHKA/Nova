import { useState, useEffect } from 'react';
import { orderApi } from '../api/endpoints';
import OrderTracker from '../components/OrderTracker';
import { Package, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_BADGES = {
  placed: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800',
  confirmed: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  processing: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  shipped: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  delivered: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  cancelled: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    orderApi.getMy()
      .then(({ data }) => {
        setOrders(data.orders);
        if (data.orders.length > 0) setExpandedId(data.orders[0]._id);
      })
      .catch(() => toast.error('Could not load orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-xs">
        Loading order details...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Orders Placed Yet</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          When you place an order, its real-time tracking timeline will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => {
          const isExpanded = expandedId === order._id;
          return (
            <div
              key={order._id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
            >
              {/* Header summary */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : order._id)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${STATUS_BADGES[order.orderStatus]}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Total Paid</p>
                    <p className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                      ${order.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Order Status Tracking Timeline */}
              {isExpanded && (
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
                  <OrderTracker orderStatus={order.orderStatus} statusHistory={order.statusHistory} />

                  {/* Items List */}
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-3">
                      Order Items
                    </h4>
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image || `https://picsum.photos/seed/${item.product}/100/100`}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded-lg shrink-0 bg-slate-200"
                            />
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                                {item.name}
                              </p>
                              <p className="text-slate-400">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            ${(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Coupon & Payment Details */}
                  {order.couponDiscount?.amount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-700 dark:text-emerald-400">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Tag className="w-4 h-4" /> Coupon ({order.couponDiscount.code}) Discount Applied
                      </span>
                      <span className="font-bold">-${order.couponDiscount.amount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Shipping Address */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 text-xs space-y-1">
                    <p className="font-semibold text-slate-900 dark:text-white">Shipping Address:</p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
