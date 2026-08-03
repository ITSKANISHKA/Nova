import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Store, Package, ShoppingBag, IndianRupee } from 'lucide-react';
import { adminApi } from '../../api/endpoints';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminApi.getStats().then(({ data }) => setStats(data.stats)).catch(() => toast.error('Could not load stats'));
  }, []);

  const cards = stats ? [
    { label: 'Buyers', value: stats.totalUsers, icon: Users },
    { label: 'Sellers', value: stats.totalSellers, icon: Store },
    { label: 'Products', value: stats.totalProducts, icon: Package },
    { label: 'Orders', value: stats.totalOrders, icon: ShoppingBag },
    { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee },
  ] : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-4">
            <Icon size={18} className="text-teal mb-2" />
            <p className="text-xl font-bold">{value ?? '—'}</p>
            <p className="text-xs text-ink/50">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link to="/admin/users" className="btn-outline text-sm">Manage Users</Link>
        <Link to="/admin/products" className="btn-outline text-sm">Manage Products</Link>
        <Link to="/admin/orders" className="btn-outline text-sm">View Orders</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
