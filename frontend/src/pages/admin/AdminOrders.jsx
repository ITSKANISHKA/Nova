import { useState, useEffect } from 'react';
import { adminApi } from '../../api/endpoints';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getOrders().then(({ data }) => setOrders(data.orders)).catch(() => toast.error('Could not load orders')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-ink/40">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">All Orders ({orders.length})</h1>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-sand text-left">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Buyer</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Payment</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-t border-ink/10">
                <td className="p-3 font-mono text-xs">{o._id.slice(-8).toUpperCase()}</td>
                <td className="p-3 text-ink/50">{o.buyer?.name}</td>
                <td className="p-3">{o.items.length}</td>
                <td className="p-3">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                <td className="p-3 capitalize">{o.orderStatus}</td>
                <td className="p-3 capitalize">{o.paymentInfo?.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
