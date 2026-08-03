import { createContext, useContext, useState, useCallback } from 'react';
import { cartApi } from '../api/endpoints';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await cartApi.get();
      setCart(data.cart);
    } catch (err) {
      // silently ignore - user might not be logged in yet
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(async (productId, quantity = 1) => {
    try {
      const { data } = await cartApi.add(productId, quantity);
      setCart(data.cart);
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart');
    }
  }, []);

  const updateItem = useCallback(async (productId, quantity) => {
    try {
      const { data } = await cartApi.update(productId, quantity);
      setCart(data.cart);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update cart');
    }
  }, []);

  const removeItem = useCallback(async (productId) => {
    try {
      const { data } = await cartApi.remove(productId);
      setCart(data.cart);
      toast.success('Removed from cart');
    } catch (err) {
      toast.error('Could not remove item');
    }
  }, []);

  const clearCart = useCallback(async () => {
    await cartApi.clear();
    setCart({ items: [] });
  }, []);

  const itemCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  const value = { cart, loading, fetchCart, addItem, updateItem, removeItem, clearCart, itemCount };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
