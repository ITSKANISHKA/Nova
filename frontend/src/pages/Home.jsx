import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productApi, userApi } from '../api/endpoints';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';
import { Sparkles, SlidersHorizontal, ArrowRight, Tag, Star, RotateCcw } from 'lucide-react';
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

  // Filters state
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';

  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: searchParams.get('page') || 1 };
      if (keyword) params.keyword = keyword;
      if (category) params.category = category;
      if (sort) params.sort = sort;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (minRating) params.minRating = minRating;

      const { data } = await productApi.getAll(params);
      setProducts(data.products);
      setPagination({ page: data.page, pages: data.pages });
    } catch (err) {
      toast.error('Could not load products');
    } finally {
      setLoading(false);
    }
  }, [keyword, category, sort, minPrice, maxPrice, minRating, searchParams]);

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

  const handleApplyPrice = () => {
    const next = new URLSearchParams(searchParams);
    if (localMinPrice) next.set('minPrice', localMinPrice);
    else next.delete('minPrice');
    if (localMaxPrice) next.set('maxPrice', localMaxPrice);
    else next.delete('maxPrice');
    next.delete('page');
    setSearchParams(next);
  };

  const handleClearFilters = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setSearchParams(new URLSearchParams());
  };

  const handleWishlistToggle = async (productId) => {
    if (!user) {
      toast.error('Please log in to save items to wishlist');
      return;
    }
    try {
      if (wishlistIds.includes(productId)) {
        await userApi.removeFromWishlist(productId);
        setWishlistIds(wishlistIds.filter((id) => id !== productId));
        toast.success('Removed from Wishlist');
      } else {
        await userApi.addToWishlist(productId);
        setWishlistIds([...wishlistIds, productId]);
        toast.success('Saved to Wishlist');
      }
    } catch (err) {
      toast.error('Could not update wishlist');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-16 transition-colors">
      {/* Hero Banner Section */}
      {!keyword && !category && (
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white py-16 lg:py-20 mb-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Use Coupon Code <strong className="text-white underline font-mono">NOVA10</strong> for 10% Off</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  Shop Smarter with <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">Nova Marketplace</span>
                </h1>

                <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                  Discover thousands of quality products from verified sellers with fast shipping, secure Razorpay checkout, and live order tracking.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <a
                    href="#catalog"
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                  >
                    <span>Explore Products</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  {user?.role === 'seller' ? (
                    <Link
                      to="/seller/products/new"
                      className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-6 py-3 rounded-xl border border-white/20 backdrop-blur-md transition-all"
                    >
                      <span>List New Product</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 text-xs text-slate-400 self-center">
                      <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-emerald-400" /> Verified Sellers</span>
                      <span>•</span>
                      <span>Express Shipping</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Decorative Hero Graphic */}
              <div className="hidden lg:block relative">
                <div className="w-full aspect-[4/3] rounded-3xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-white/10 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 text-center">
                      <div className="text-3xl font-extrabold text-white">1000+</div>
                      <div className="text-xs text-slate-300 mt-1">Quality Products</div>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 text-center">
                      <div className="text-3xl font-extrabold text-emerald-400">100%</div>
                      <div className="text-xs text-slate-300 mt-1">Verified Orders</div>
                    </div>
                    <div className="col-span-2 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 flex items-center justify-between">
                      <div className="text-xs text-slate-200 font-medium">Coupon Promo Active</div>
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                        SAVE10 AVAILABLE
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Catalog Container */}
      <div id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Category Pills & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => updateParam('category', '')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                !category
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => updateParam('category', c)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  category === c
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Filter Toggle Mobile */}
            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="lg:hidden flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
            >
              <option value="">Sort By: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Content Layout with Filter Sidebar & Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Sidebar */}
          <aside className={`lg:block ${showMobileFilter ? 'block' : 'hidden'} space-y-6`}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Filter Products</span>
                </h3>
                {(minPrice || maxPrice || minRating || category || keyword) && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-medium"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Clear All
                  </button>
                )}
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  Price Range ($)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localMinPrice}
                    onChange={(e) => setLocalMinPrice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                  <span className="text-slate-400 text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={handleApplyPrice}
                  className="w-full mt-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-indigo-600 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
                >
                  Apply Price Filter
                </button>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  Minimum Rating
                </label>
                <div className="space-y-1.5">
                  {[4, 3, 2].map((stars) => (
                    <button
                      key={stars}
                      onClick={() => updateParam('minRating', minRating === String(stars) ? '' : String(stars))}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                        minRating === String(stars)
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: stars }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                        <span className="text-slate-700 dark:text-slate-300 font-medium ml-1">& Up</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-3">
            {keyword && (
              <div className="mb-4 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Showing search results for "<strong className="text-slate-900 dark:text-white">{keyword}</strong>"</span>
                <button onClick={() => updateParam('keyword', '')} className="text-indigo-600 hover:underline">
                  Clear search
                </button>
              </div>
            )}

            {loading ? (
              <ProductGridSkeleton count={9} />
            ) : products.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center my-6">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SlidersHorizontal className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No products found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  We couldn't find any products matching your current filters or search query. Try clearing your filters.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-indigo-500 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                {Array.from({ length: pagination.pages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => updateParam('page', String(i + 1))}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      pagination.page === i + 1
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Home;
