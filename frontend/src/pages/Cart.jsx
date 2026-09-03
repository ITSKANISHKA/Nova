import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Tag, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { couponApi } from '../api/endpoints';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cart, fetchCart, updateItem, removeItem } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const items = cart.items || [];
  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.discountPrice || item.product?.price || item.priceAtAdd;
    return sum + price * item.quantity;
  }, 0);

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shippingFee = subtotal > 500 ? 0 : 49;
  const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidating(true);
    try {
      const res = await couponApi.validate(couponCode.trim(), subtotal);
      setAppliedCoupon(res.data);
      toast.success(res.data.message || 'Coupon applied!');
    } catch (err) {
      setAppliedCoupon(null);
      toast.error(err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setValidating(false);
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout', {
      state: {
        appliedCoupon: appliedCoupon
          ? { code: appliedCoupon.code, discountAmount: appliedCoupon.discountAmount }
          : null,
      },
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-slate-800 text-indigo-600 rounded-full flex items-center justify-center mb-4">
          <Tag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6 max-w-sm">
          Looks like you haven't added any products to your cart yet.
        </p>
        <Link
          to="/"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition-all"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8">
        Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const p = item.product;
            if (!p) return null;
            const price = p.discountPrice || p.price;
            return (
              <div
                key={p._id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex gap-4 items-center shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
              >
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src={p.images?.[0] || `https://picsum.photos/seed/${p._id}/200/200`}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${p._id}`}
                    className="font-semibold text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-1"
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs text-slate-400 mt-0.5">{p.category}</p>
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                    ${price.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                  <button
                    onClick={() => updateItem(p._id, Math.max(1, item.quantity - 1))}
                    className="w-7 h-7 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateItem(p._id, Math.min(p.stock, item.quantity + 1))}
                    className="w-7 h-7 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeItem(p._id)}
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="space-y-6">
          {/* Coupon Promo Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Apply Discount Coupon</span>
            </h3>

            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. NOVA10, WELCOME20"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 dark:bg-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white uppercase font-mono font-bold"
              />
              <button
                type="submit"
                disabled={validating || !couponCode.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-50 shrink-0"
              >
                {validating ? 'Applying...' : 'Apply'}
              </button>
            </form>

            {appliedCoupon && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Code <strong>{appliedCoupon.code}</strong> Applied</span>
                </div>
                <span>-${appliedCoupon.discountAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Checkout Summary Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Order Summary</h2>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">${subtotal.toLocaleString()}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `$${shippingFee}`}</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Total Amount</span>
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                ${totalAmount.toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
