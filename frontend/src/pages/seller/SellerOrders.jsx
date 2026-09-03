import { useState, useEffect } from 'react';
import { orderApi } from '../../api/endpoints';
import OrderTracker from '../../components/OrderTracker';
import { Package, Truck, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    orderApi.getSellerOrders()
      .then(({ data }) => setOrders(data.orders))
      .catch(() => toast.error('Could not load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await orderApi.updateStatus(orderId, status, `Seller updated status to ${status}`);
      setOrders(orders.map((o) => (o._id === orderId ? { ...o, orderStatus: status } : o)));
      toast.success(`Order status updated to ${status}`);
    } catch (err) {
      toast.error('Could not update status');
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-xs">Loading orders...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8">Customer Fulfillment Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
          <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p>No customer orders placed yet for your items.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Placed: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Update Status:</span>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none uppercase tracking-wider cursor-pointer"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Order Tracking */}
              <OrderTracker orderStatus={order.orderStatus} statusHistory={order.statusHistory} />

              {/* Items list */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ordered Items</h4>
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="font-semibold text-slate-900 dark:text-white">{item.name} × {item.quantity}</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
