import { useState, useEffect } from 'react';
import { orderApi } from '../api/endpoints';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  placed: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-purple-100 text-purple-700',
  shipped: 'bg-amber-100 text-amber-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getMy()
      .then(({ data }) => setOrders(data.orders))
      .catch(() => toast.error('Could not load orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-ink/40">Loading...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-ink/40">
        You haven't placed any orders yet
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Your Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="card p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs text-ink/40">Order #{order._id.slice(-8).toUpperCase()}</p>
                <p className="text-xs text-ink/40">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[order.orderStatus]}`}>
                {order.orderStatus}
              </span>
            </div>
            <div className="space-y-1">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-ink/60">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-ink/10 mt-3 pt-3 flex justify-between font-semibold text-sm">
              <span>Total</span>
              <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
