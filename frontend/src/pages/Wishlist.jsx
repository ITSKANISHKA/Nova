import { useState, useEffect } from 'react';
import { userApi } from '../api/endpoints';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    userApi.getWishlist()
      .then(({ data }) => setWishlist(data.wishlist))
      .catch(() => toast.error('Could not load wishlist'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRemove = async (productId) => {
    try {
      await userApi.removeFromWishlist(productId);
      setWishlist(wishlist.filter((p) => p._id !== productId));
    } catch (err) {
      toast.error('Could not update wishlist');
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-ink/40">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Your Wishlist</h1>
      {wishlist.length === 0 ? (
        <p className="text-ink/40">Your wishlist is empty</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {wishlist.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onWishlistToggle={handleRemove}
              isWishlisted={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
