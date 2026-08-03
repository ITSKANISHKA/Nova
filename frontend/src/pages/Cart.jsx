import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, fetchCart, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const items = cart.items || [];
  const total = items.reduce((sum, item) => {
    const price = item.product?.discountPrice || item.product?.price || item.priceAtAdd;
    return sum + price * item.quantity;
  }, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-lg font-medium text-ink/60">Your cart is empty</p>
        <p className="text-sm text-ink/40 mt-1 mb-4">Browse products and add something you like</p>
        <Link to="/" className="btn-primary">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Your Cart</h1>

      <div className="space-y-4">
        {items.map((item) => {
          const p = item.product;
          if (!p) return null;
          const price = p.discountPrice || p.price;
          return (
            <div key={p._id} className="card p-4 flex gap-4 items-center">
              <div className="w-20 h-20 bg-sand rounded-card flex items-center justify-center shrink-0 overflow-hidden">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-ink/20">No image</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${p._id}`} className="font-medium text-sm hover:text-teal line-clamp-1">
                  {p.name}
                </Link>
                <p className="text-sm font-semibold mt-1">₹{price.toLocaleString('en-IN')}</p>
              </div>
              <div className="flex items-center border border-ink/15 rounded-card">
                <button
                  onClick={() => updateItem(p._id, Math.max(1, item.quantity - 1))}
                  className="px-2.5 py-1.5 text-ink/60"
                >
                  -
                </button>
                <span className="px-2 text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateItem(p._id, Math.min(p.stock, item.quantity + 1))}
                  className="px-2.5 py-1.5 text-ink/60"
                >
                  +
                </button>
              </div>
              <button onClick={() => removeItem(p._id)} className="text-ink/30 hover:text-red-500">
                <Trash2 size={18} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="card p-4 mt-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-ink/50">Total ({items.length} items)</p>
          <p className="text-2xl font-bold">₹{total.toLocaleString('en-IN')}</p>
        </div>
        <button onClick={() => navigate('/checkout')} className="btn-coral">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
