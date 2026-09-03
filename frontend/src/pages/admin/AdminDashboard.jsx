import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Store, Package, ShoppingBag, DollarSign, Download, Tag, Plus, Trash2 } from 'lucide-react';
import { adminApi, couponApi } from '../../api/endpoints';
import { StatCard, RevenueChart, OrderStatusBreakdown } from '../../components/AnalyticsChart';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // New coupon modal / form
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountPercent: '10',
    minPurchase: '500',
    maxDiscount: '200',
    expiresInDays: '30',
  });

  const loadData = () => {
    Promise.all([adminApi.getStats(), couponApi.getAll(), adminApi.getOrders()])
      .then(([statsRes, couponRes, ordersRes]) => {
        setStats(statsRes.data.stats);
        setCoupons(couponRes.data.coupons || []);
        setOrders(ordersRes.data.orders || []);
      })
      .catch(() => toast.error('Could not load admin stats'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) return;
    try {
      const expiresAt = new Date(Date.now() + Number(newCoupon.expiresInDays) * 24 * 60 * 60 * 1000);
      await couponApi.create({
        code: newCoupon.code.trim().toUpperCase(),
        discountPercent: Number(newCoupon.discountPercent),
        minPurchase: Number(newCoupon.minPurchase),
        maxDiscount: newCoupon.maxDiscount ? Number(newCoupon.maxDiscount) : null,
        expiresAt,
      });
      toast.success('Coupon created successfully!');
      setShowCouponModal(false);
      setNewCoupon({ code: '', discountPercent: '10', minPurchase: '500', maxDiscount: '200', expiresInDays: '30' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create coupon');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!confirm('Delete this coupon code?')) return;
    try {
      await couponApi.remove(id);
      setCoupons(coupons.filter((c) => c._id !== id));
      toast.success('Coupon deleted');
    } catch (err) {
      toast.error('Could not delete coupon');
    }
  };

  const handleToggleCoupon = async (id) => {
    try {
      const res = await couponApi.toggleStatus(id);
      setCoupons(coupons.map((c) => (c._id === id ? res.data.coupon : c)));
      toast.success('Coupon status updated');
    } catch (err) {
      toast.error('Could not update status');
    }
  };

  const exportToCSV = () => {
    if (orders.length === 0) {
      toast.error('No orders available to export');
      return;
    }
    const headers = ['Order ID,Buyer Email,Date,Status,Total Amount\n'];
    const rows = orders.map(
      (o) =>
        `"${o._id}","${o.buyer?.email || 'N/A'}","${new Date(o.createdAt).toLocaleDateString()}","${o.orderStatus}",${o.totalAmount}`
    );
    const blob = new Blob([headers.concat(rows.join('\n'))], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nova-admin-sales-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success('CSV Platform Report downloaded successfully!');
  };

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Admin Portal</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Platform-wide metrics, sales analytics, coupon management, and user controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Sales CSV</span>
          </button>
          <button
            onClick={() => setShowCouponModal(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/admin/users"
          className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold hover:border-indigo-500 transition-all shadow-sm"
        >
          <Users className="w-4 h-4 text-indigo-500" />
          <span>Manage Users</span>
        </Link>
        <Link
          to="/admin/products"
          className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold hover:border-indigo-500 transition-all shadow-sm"
        >
          <Package className="w-4 h-4 text-purple-500" />
          <span>Manage Products</span>
        </Link>
        <Link
          to="/admin/orders"
          className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold hover:border-indigo-500 transition-all shadow-sm"
        >
          <ShoppingBag className="w-4 h-4 text-emerald-500" />
          <span>All Orders ({stats?.totalOrders || 0})</span>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Platform Revenue" value={`$${(stats?.totalRevenue || 0).toLocaleString()}`} change="Gross Volume" icon={DollarSign} color="emerald" />
        <StatCard title="Registered Buyers" value={stats?.totalUsers || 0} icon={Users} color="indigo" />
        <StatCard title="Active Sellers" value={stats?.totalSellers || 0} icon={Store} color="purple" />
        <StatCard title="Platform Products" value={stats?.totalProducts || 0} icon={Package} color="amber" />
      </div>

      {/* Analytics Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RevenueChart />
        <OrderStatusBreakdown counts={statusCounts} />
      </div>

      {/* Coupon Codes Management */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Active Discount Coupons</span>
          </h3>
          <span className="text-xs text-slate-400">{coupons.length} coupons</span>
        </div>

        {coupons.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No active coupons created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3">Coupon Code</th>
                  <th className="p-3">Discount</th>
                  <th className="p-3">Min Purchase</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {coupons.map((c) => (
                  <tr key={c._id}>
                    <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{c.code}</td>
                    <td className="p-3 font-semibold">{c.discountPercent}% OFF</td>
                    <td className="p-3">${c.minPurchase}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleCoupon(c._id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase cursor-pointer ${
                          c.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleDeleteCoupon(c._id)} className="p-1 text-slate-400 hover:text-rose-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Coupon Code</h3>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Coupon Code Name
                </label>
                <input
                  required
                  placeholder="e.g. SUMMER25"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 uppercase font-mono font-bold text-slate-900 dark:text-white"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Discount (%)
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="100"
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    value={newCoupon.discountPercent}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountPercent: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Min Purchase ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    value={newCoupon.minPurchase}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minPurchase: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-xl"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
