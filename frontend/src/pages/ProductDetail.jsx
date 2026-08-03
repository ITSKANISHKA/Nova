import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { productApi, reviewApi, userApi } from '../api/endpoints';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [{ data: productData }, { data: reviewData }] = await Promise.all([
          productApi.getById(id),
          reviewApi.getForProduct(id),
        ]);
        setProduct(productData.product);
        setReviews(reviewData.reviews);
      } catch (err) {
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (user?.role === 'buyer') {
      userApi.getWishlist().then(({ data }) => {
        setIsWishlisted(data.wishlist.some((p) => p._id === id));
      }).catch(() => {});
    }
  }, [user, id]);

  const handleWishlist = async () => {
    if (!user) return toast.error('Please log in first');
    try {
      if (isWishlisted) {
        await userApi.removeFromWishlist(id);
      } else {
        await userApi.addToWishlist(id);
      }
      setIsWishlisted(!isWishlisted);
    } catch (err) {
      toast.error('Could not update wishlist');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const { data } = await reviewApi.add(id, reviewForm);
      setReviews([data.review, ...reviews]);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Review added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-ink/40">Loading...</div>;
  }
  if (!product) return null;

  const price = product.discountPrice || product.price;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-sand rounded-card flex items-center justify-center overflow-hidden">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-ink/20">No image available</span>
          )}
        </div>

        <div>
          <p className="text-xs uppercase text-ink/40 tracking-wide">{product.category}</p>
          <h1 className="text-2xl font-bold mt-1">{product.name}</h1>
          <div className="flex items-center gap-1 mt-2 text-sm text-ink/50">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            {product.ratingsAverage?.toFixed(1) || 'New'} ({product.numReviews} reviews)
            <span className="mx-2">·</span>
            Sold by {product.seller?.name}
          </div>

          <div className="flex items-center gap-3 mt-4">
            <span className="text-3xl font-bold">₹{price.toLocaleString('en-IN')}</span>
            {product.discountPrice && (
              <span className="text-ink/40 line-through">₹{product.price.toLocaleString('en-IN')}</span>
            )}
          </div>

          <p className="text-sm text-ink/60 mt-4 leading-relaxed">{product.description}</p>

          <p className={`text-sm mt-3 font-medium ${product.stock > 0 ? 'text-teal' : 'text-red-500'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          {(!user || user.role === 'buyer') && (
            <div className="flex items-center gap-3 mt-6">
              <div className="flex items-center border border-ink/15 rounded-card">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-ink/60">-</button>
                <span className="px-3 text-sm">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-2 text-ink/60">+</button>
              </div>
              <button
                onClick={() => {
                  if (!user) return toast.error('Please log in to add to cart');
                  addItem(product._id, qty);
                }}
                disabled={product.stock === 0}
                className="btn-primary flex items-center gap-2 flex-1"
              >
                <ShoppingCart size={16} /> Add to cart
              </button>
              <button onClick={handleWishlist} className="btn-outline p-2.5">
                <Heart size={18} className={isWishlisted ? 'fill-coral text-coral' : ''} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 max-w-2xl">
        <h2 className="text-lg font-bold mb-4">Reviews ({reviews.length})</h2>

        {user?.role === 'buyer' && (
          <form onSubmit={handleReviewSubmit} className="card p-4 mb-6">
            <p className="text-sm font-medium mb-2">Write a review</p>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                >
                  <Star
                    size={20}
                    className={n <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-ink/20'}
                  />
                </button>
              ))}
            </div>
            <textarea
              required
              placeholder="Share your experience with this product..."
              className="input-field resize-none"
              rows={3}
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
            />
            <button type="submit" disabled={submittingReview} className="btn-primary mt-3 text-sm">
              {submittingReview ? 'Posting...' : 'Post review'}
            </button>
            <p className="text-xs text-ink/40 mt-2">
              You can only review products you've purchased and received.
            </p>
          </form>
        )}

        <div className="space-y-4">
          {reviews.length === 0 && (
            <p className="text-sm text-ink/40">No reviews yet. Be the first to review!</p>
          )}
          {reviews.map((r) => (
            <div key={r._id} className="border-b border-ink/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{r.user?.name || 'Anonymous'}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={12} className={n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-ink/15'} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-ink/60 mt-1">{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
