import { useState, useEffect } from 'react';
import { adminApi } from '../../api/endpoints';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getProducts().then(({ data }) => setProducts(data.products)).catch(() => toast.error('Could not load products')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-ink/40">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">All Products ({products.length})</h1>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-sand text-left">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Seller</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-t border-ink/10">
                <td className="p-3 font-medium max-w-xs truncate">{p.name}</td>
                <td className="p-3 text-ink/50">{p.seller?.name}</td>
                <td className="p-3 text-ink/50">{p.category}</td>
                <td className="p-3">₹{p.price.toLocaleString('en-IN')}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
