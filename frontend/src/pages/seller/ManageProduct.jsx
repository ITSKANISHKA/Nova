import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../../api/endpoints';
import { Image, Upload, CheckCircle, Info } from 'lucide-react';
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

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-xs">Loading...</div>;

  const currentImg = form.images[0]?.trim() || `https://picsum.photos/seed/${form.name || 'new'}/600/600`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8">
        {isEdit ? 'Edit Product Details' : 'List New Product'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form area */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Product Title *
            </label>
            <input
              required
              className="w-full bg-slate-50 dark:bg-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Detailed Description *
            </label>
            <textarea
              required
              rows={4}
              className="w-full bg-slate-50 dark:bg-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Regular Price ($) *
              </label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                className="w-full bg-slate-50 dark:bg-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Discount Price ($ optional)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full bg-slate-50 dark:bg-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                value={form.discountPrice}
                onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Category *
              </label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Stock Quantity *
              </label>
              <input
                required
                type="number"
                min="0"
                className="w-full bg-slate-50 dark:bg-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Brand Name (optional)
            </label>
            <input
              className="w-full bg-slate-50 dark:bg-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Primary Image URL
            </label>
            <input
              className="w-full bg-slate-50 dark:bg-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
              placeholder="https://images.unsplash.com/photo-..."
              value={form.images[0]}
              onChange={(e) => setForm({ ...form, images: [e.target.value] })}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create & Publish Product'}
          </button>
        </form>

        {/* Live Image & Specs Preview Card */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Image className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Live Image Preview</span>
            </h3>

            <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative border border-slate-200 dark:border-slate-700">
              <img
                src={currentImg}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `https://picsum.photos/seed/fallback/600/600`;
                }}
              />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-indigo-500" /> Image Specs Recommendation:
              </p>
              <p>• Recommended Aspect Ratio: 1:1 (Square)</p>
              <p>• High-resolution PNG or JPG format (min 600x600px)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageProduct;
