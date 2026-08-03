import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi, userApi } from '../api/endpoints';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Beauty', 'Sports', 'Toys', 'Grocery', 'Other',
];

const Home = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: searchParams.get('page') || 1 };
      if (keyword) params.keyword = keyword;
      if (category) params.category = category;
      if (sort) params.sort = sort;

      const { data } = await productApi.getAll(params);
      setProducts(data.products);
      setPagination({ page: data.page, pages: data.pages });
    } catch (err) {
      toast.error('Could not load products');
    } finally {
      setLoading(false);
    }
  }, [keyword, category, sort, searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (user?.role === 'buyer') {
      userApi.getWishlist().then(({ data }) => {
        setWishlistIds(data.wishlist.map((p) => p._id));
      }).catch(() => {});
    }
  }, [user]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const handleWishlistToggle = async (productId) => {
    if (!user) {
      toast.error('Please log in to use wishlist');
      return;
    }
    try {
      if (wishlistIds.includes(productId)) {
        await userApi.removeFromWishlist(productId);
        setWishlistIds(wishlistIds.filter((id) => id !== productId));
      } else {
        await userApi.addToWishlist(productId);
        setWishlistIds([...wishlistIds, productId]);
      }
    } catch (err) {
      toast.error('Could not update wishlist');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {!keyword && !category && (
        <div className="bg-teal-light rounded-card p-8 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-teal-dark">
            Everything you need, one marketplace.
          </h1>
          <p className="text-teal-dark/70 mt-1 text-sm">
            Browse products from verified sellers across every category.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => updateParam('category', '')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
            !category ? 'bg-ink text-white border-ink' : 'border-ink/15 text-ink/60'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => updateParam('category', c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
              category === c ? 'bg-ink text-white border-ink' : 'border-ink/15 text-ink/60'
            }`}
          >
            {c}
          </button>
        ))}

        <select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="ml-auto text-xs border border-ink/15 rounded-full px-3 py-1.5 outline-none"
        >
          <option value="">Sort: Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {keyword && (
        <p className="text-sm text-ink/50 mb-4">
          Showing results for "<span className="font-medium text-ink">{keyword}</span>"
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square bg-sand rounded-card animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-ink/40">
          <p className="text-lg">No products found</p>
          <p className="text-sm mt-1">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onWishlistToggle={user?.role === 'buyer' ? handleWishlistToggle : undefined}
              isWishlisted={wishlistIds.includes(product._id)}
            />
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pagination.pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => updateParam('page', String(i + 1))}
              className={`w-8 h-8 rounded-full text-sm ${
                pagination.page === i + 1 ? 'bg-teal text-white' : 'text-ink/50 hover:bg-sand'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
