import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';

const ProductCard = ({ product, onWishlistToggle, isWishlisted }) => {
  const price = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="card group relative overflow-hidden hover:shadow-md transition-shadow">
      {onWishlistToggle && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onWishlistToggle(product._id);
          }}
          className="absolute top-2 right-2 z-10 bg-white/90 rounded-full p-1.5 hover:bg-white"
        >
          <Heart
            size={16}
            className={isWishlisted ? 'fill-coral text-coral' : 'text-ink/40'}
          />
        </button>
      )}
      <Link to={`/product/${product._id}`}>
        <div className="aspect-square bg-sand flex items-center justify-center overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <span className="text-ink/20 text-xs">No image</span>
          )}
        </div>
        <div className="p-3">
          <p className="text-xs text-ink/40 uppercase tracking-wide">{product.category}</p>
          <h3 className="font-medium text-sm mt-0.5 line-clamp-2 min-h-[2.5em]">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-xs text-ink/50">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            {product.ratingsAverage?.toFixed(1) || 'New'} ({product.numReviews || 0})
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="font-semibold">₹{price.toLocaleString('en-IN')}</span>
            {hasDiscount && (
              <>
                <span className="text-xs text-ink/40 line-through">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-coral font-medium">{discountPct}% off</span>
              </>
            )}
          </div>
          {product.stock === 0 && (
            <p className="text-xs text-red-500 mt-1">Out of stock</p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
