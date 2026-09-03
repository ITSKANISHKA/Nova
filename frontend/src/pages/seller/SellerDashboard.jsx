import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, Download, DollarSign, ShoppingBag } from 'lucide-react';
import { productApi, orderApi } from '../../api/endpoints';
import { StatCard, RevenueChart, OrderStatusBreakdown } from '../../components/AnalyticsChart';
import toast from 'react-hot-toast';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([productApi.getMine(), orderApi.getSellerOrders()])
      .then(([prodRes, orderRes]) => {
        setProducts(prodRes.data.products || []);
        setOrders(orderRes.data.orders || []);
      })
      .catch(() => toast.error('Could not load seller data'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await productApi.remove(id);
      setProducts(products.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error('Could not delete product');
    }
  };

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const statusCounts = orders.reduce((acc, o) => {
    acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
    return acc;
  }, {});

  // Export orders report to CSV
  const exportToCSV = () => {
    if (orders.length === 0) {
      toast.error('No orders available to export');
      return;
    }
    const headers = ['Order ID,Date,Status,Total Amount,Item Count\n'];
    const rows = orders.map(
      (o) =>
        `"${o._id}","${new Date(o.createdAt).toLocaleDateString()}","${o.orderStatus}",${o.totalAmount},${o.items.length}`
    );
    const blob = new Blob([headers.concat(rows.join('\n'))], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seller-orders-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success('CSV Report downloaded successfully!');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Seller Portal</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your store inventory, track order fulfillment, and review sales analytics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <Link
            to="/seller/orders"
            className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Package className="w-4 h-4" />
            <span>Fulfillment Orders</span>
          </Link>
          <Link
            to="/seller/products/new"
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Analytics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="Total Store Revenue" value={`$${totalRevenue.toLocaleString()}`} change="+14% this month" icon={DollarSign} color="emerald" />
        <StatCard title="Total Received Orders" value={orders.length} change="Live orders" icon={Package} color="indigo" />
        <StatCard title="Active Listed Products" value={products.length} icon={ShoppingBag} color="amber" />
      </div>

      {/* Analytics Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RevenueChart />
        <OrderStatusBreakdown counts={statusCounts} />
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Product Inventory</h3>
          <span className="text-xs text-slate-400">{products.length} products total</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading inventory data...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-3">
            <p>You haven't listed any products yet.</p>
            <Link to="/seller/products/new" className="inline-block bg-indigo-600 text-white font-semibold px-4 py-2 rounded-xl">
              Add your first product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                      <img src={p.images?.[0] || `https://picsum.photos/seed/${p._id}/100/100`} alt={p.name} className="w-8 h-8 rounded-lg object-cover bg-slate-100 shrink-0" />
                      <span className="truncate max-w-xs">{p.name}</span>
                    </td>
                    <td className="p-4 text-slate-400">{p.category}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">${p.price.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`font-semibold ${p.stock === 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">★ {p.ratingsAverage?.toFixed(1) || 'New'}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/seller/products/${p._id}/edit`} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(p._id)} className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
