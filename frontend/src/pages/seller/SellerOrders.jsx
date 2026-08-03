import { useState, useEffect } from 'react';
import { orderApi } from '../../api/endpoints';
import toast from 'react-hot-toast';

const STATUSES = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];

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
      await orderApi.updateStatus(orderId, status);
      setOrders(orders.map((o) => (o._id === orderId ? { ...o, orderStatus: status } : o)));
      toast.success('Order status updated');
    } catch (err) {
      toast.error('Could not update status');
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-ink/40">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Orders for Your Products</h1>
      {orders.length === 0 ? (
        <p className="text-ink/40">No orders yet</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs text-ink/40">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-ink/40">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <select
                  value={order.orderStatus}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="text-xs border border-ink/15 rounded-full px-3 py-1.5 capitalize outline-none"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm text-ink/60">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
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
