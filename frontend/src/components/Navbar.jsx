import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, LogOut, Store, LayoutDashboard, Search } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(keyword.trim() ? `/?keyword=${encodeURIComponent(keyword.trim())}` : '/');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-ink/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-6">
        <Link to="/" className="font-display font-800 text-xl text-teal shrink-0">
          Nova
        </Link>

        <form onSubmit={handleSearch} className="flex-1 hidden md:flex">
          <div className="relative w-full max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search products..."
              className="w-full border border-ink/15 rounded-card pl-9 pr-3 py-2 text-sm focus:border-teal outline-none"
            />
          </div>
        </form>

        <nav className="flex items-center gap-4 ml-auto">
          {user?.role === 'buyer' && (
            <>
              <Link to="/wishlist" className="text-ink/70 hover:text-teal" title="Wishlist">
                <Heart size={20} />
              </Link>
              <Link to="/cart" className="relative text-ink/70 hover:text-teal" title="Cart">
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-coral text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {user?.role === 'seller' && (
            <Link to="/seller/dashboard" className="text-ink/70 hover:text-teal flex items-center gap-1 text-sm font-medium" title="Seller Dashboard">
              <Store size={18} /> <span className="hidden sm:inline">Seller</span>
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link to="/admin/dashboard" className="text-ink/70 hover:text-teal flex items-center gap-1 text-sm font-medium" title="Admin Dashboard">
              <LayoutDashboard size={18} /> <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="text-ink/70 hover:text-teal flex items-center gap-1 text-sm">
                <User size={18} />
                <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="text-ink/50 hover:text-coral" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-ink/70 hover:text-teal">
                Log in
              </Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
