import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, LogOut, Store, LayoutDashboard, Search, Moon, Sun, Tag, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productApi } from '../api/endpoints';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const searchRef = useRef(null);

  // Handle Dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Handle search autocomplete debouncing
  useEffect(() => {
    if (keyword.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await productApi.getSuggestions(keyword.trim());
        setSuggestions(res.data.suggestions || []);
        setShowSuggestions(true);
      } catch (err) {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    navigate(keyword.trim() ? `/?keyword=${encodeURIComponent(keyword.trim())}` : '/');
  };

  const handleSuggestionClick = (id) => {
    setShowSuggestions(false);
    setKeyword('');
    navigate(`/product/${id}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-600 dark:from-white dark:via-slate-200 dark:to-indigo-400 bg-clip-text text-transparent">
            Nova
          </span>
        </Link>

        {/* Search Bar with Instant Autocomplete */}
        <div ref={searchRef} className="flex-1 max-w-md hidden md:block relative">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onFocus={() => keyword.length >= 2 && setShowSuggestions(true)}
                placeholder="Search products, brands, categories..."
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm pl-10 pr-9 py-2 rounded-xl border border-transparent focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => {
                    setKeyword('');
                    setSuggestions([]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Matching Suggestions
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-80 overflow-y-auto">
                {suggestions.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleSuggestionClick(item._id)}
                    className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer flex items-center gap-3 transition-colors"
                  >
                    <img
                      src={item.images?.[0] || `https://picsum.photos/seed/${item._id}/100/100`}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{item.category}</span>
                        {item.brand && <span>• {item.brand}</span>}
                      </p>
                    </div>
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      ${(item.discountPrice || item.price).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Role specific links */}
          {user?.role === 'buyer' && (
            <>
              <Link
                to="/wishlist"
                className="p-2 text-slate-600 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                title="Saved Wishlist"
              >
                <Heart className="w-5 h-5" />
              </Link>

              <Link
                to="/cart"
                className="relative p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                    {itemCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {user?.role === 'seller' && (
            <Link
              to="/seller/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all"
            >
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Seller Portal</span>
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Admin Portal</span>
            </Link>
          )}

          {/* User Auth Info */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <Link
                to="/profile"
                className="flex items-center gap-2 p-1.5 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                  {user.name[0]?.toUpperCase()}
                </div>
                <span className="text-xs font-semibold hidden md:inline">{user.name.split(' ')[0]}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-xl transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl shadow-md hover:shadow-indigo-500/20 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
