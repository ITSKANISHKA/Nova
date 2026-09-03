import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product, onWishlistToggle, isWishlisted }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [imgError, setImgError] = useState(false);

  const price = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const fallbackImg = `https://picsum.photos/seed/${product._id || 'nova'}/600/600`;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || user.role !== 'buyer') {
      toast.error('Please log in as a buyer to add items to cart');
      return;
    }
    if (product.stock === 0) {
      toast.error('Item is out of stock');
      return;
    }
    try {
      await addToCart(product._id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden group hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all flex flex-col relative">
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-3 left-3 z-10 bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
          {discountPct}% OFF
        </div>
      )}

      {/* Wishlist Button */}
      {onWishlistToggle && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onWishlistToggle(product._id);
          }}
          className="absolute top-3 right-3 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-2 hover:scale-110 shadow-md transition-all text-slate-400 hover:text-rose-500"
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart
            className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`}
          />
        </button>
      )}

      <Link to={`/product/${product._id}`} className="flex-1 flex flex-col">
        {/* Image Container */}
        <div className="aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden relative group">
          <img
            src={imgError || !product.images?.[0] ? fallbackImg : product.images[0]}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Quick Add Overlay */}
          {product.stock > 0 && user?.role === 'buyer' && (
            <button
              onClick={handleQuickAdd}
              className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 flex items-center gap-1.5 text-xs font-semibold"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mb-1">
              <span className="uppercase tracking-wider font-medium">{product.category}</span>
              {product.brand && <span className="font-semibold text-slate-500 dark:text-slate-400">{product.brand}</span>}
            </div>

            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm line-clamp-2 min-h-[2.5rem] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {product.name}
            </h3>

            <div className="flex items-center gap-1 mt-2 text-xs text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {product.ratingsAverage?.toFixed(1) || 'New'}
              </span>
              <span className="text-slate-400">({product.numReviews || 0})</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  ${price.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-slate-400 line-through">
                    ${product.price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {product.stock === 0 ? (
              <span className="text-[11px] font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-full">
                Out of stock
              </span>
            ) : (
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                In Stock ({product.stock})
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
