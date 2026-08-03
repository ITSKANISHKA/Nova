import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../../api/endpoints';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Beauty', 'Sports', 'Toys', 'Grocery', 'Other',
];

const emptyForm = {
  name: '', description: '', price: '', discountPrice: '', category: 'Electronics',
  brand: '', stock: '', images: [''],
};

const ManageProduct = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      productApi.getById(id).then(({ data }) => {
        const p = data.product;
        setForm({
          name: p.name, description: p.description, price: p.price,
          discountPrice: p.discountPrice || '', category: p.category,
          brand: p.brand || '', stock: p.stock, images: p.images?.length ? p.images : [''],
        });
      }).catch(() => toast.error('Could not load product'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        stock: Number(form.stock),
        images: form.images.filter((img) => img.trim()),
      };
      if (isEdit) {
        await productApi.update(id, payload);
        toast.success('Product updated');
      } else {
        await productApi.create(payload);
        toast.success('Product created');
      }
      navigate('/seller/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-ink/40">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">Product name</label>
          <input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Description</label>
          <textarea required rows={4} className="input-field resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Price (₹)</label>
            <input required type="number" min="0" className="input-field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Discount price (₹, optional)</label>
            <input type="number" min="0" className="input-field" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Category</label>
            <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Stock quantity</label>
            <input required type="number" min="0" className="input-field" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Brand (optional)</label>
          <input className="input-field" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Image URL (optional)</label>
          <input
            className="input-field"
            placeholder="https://..."
            value={form.images[0]}
            onChange={(e) => setForm({ ...form, images: [e.target.value] })}
          />
          <p className="text-xs text-ink/40 mt-1">Paste a hosted image link. Leave blank to show a placeholder.</p>
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
        </button>
      </form>
    </div>
  );
};

export default ManageProduct;
