import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { productApi } from '../../api/endpoints';
import toast from 'react-hot-toast';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    productApi.getMine()
      .then(({ data }) => setProducts(data.products))
      .catch(() => toast.error('Could not load your products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Seller Dashboard</h1>
          <p className="text-sm text-ink/50">{products.length} products listed</p>
        </div>
        <div className="flex gap-2">
          <Link to="/seller/orders" className="btn-outline flex items-center gap-2 text-sm">
            <Package size={16} /> Orders
          </Link>
          <Link to="/seller/products/new" className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Product
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-ink/40">Loading...</p>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-ink/40">
          <p>You haven't listed any products yet</p>
          <Link to="/seller/products/new" className="btn-primary inline-block mt-4">Add your first product</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand text-left">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Rating</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t border-ink/10">
                  <td className="p-3 font-medium max-w-xs truncate">{p.name}</td>
                  <td className="p-3 text-ink/50">{p.category}</td>
                  <td className="p-3">₹{p.price.toLocaleString('en-IN')}</td>
                  <td className="p-3">
                    <span className={p.stock === 0 ? 'text-red-500' : ''}>{p.stock}</span>
                  </td>
                  <td className="p-3 text-ink/50">{p.ratingsAverage?.toFixed(1) || '—'}</td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-end">
                      <Link to={`/seller/products/${p._id}/edit`} className="text-ink/40 hover:text-teal">
                        <Edit size={16} />
                      </Link>
                      <button onClick={() => handleDelete(p._id)} className="text-ink/40 hover:text-red-500">
                        <Trash2 size={16} />
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
  );
};

export default SellerDashboard;
