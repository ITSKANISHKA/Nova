import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { paymentApi, orderApi } from '../api/endpoints';
import { loadRazorpayScript } from '../utils/razorpay';
import { ShieldCheck, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cart, fetchCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const appliedCoupon = location.state?.appliedCoupon || null;

  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
    country: 'India',
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const items = cart.items || [];
  const itemsTotal = items.reduce((sum, item) => {
    const price = item.product?.discountPrice || item.product?.price || item.priceAtAdd;
    return sum + price * item.quantity;
  }, 0);

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shippingFee = itemsTotal > 500 ? 0 : 49;
  const totalAmount = Math.max(0, itemsTotal + shippingFee - discountAmount);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!address.street || !address.city || !address.state || !address.pincode) {
      toast.error('Please fill in your complete address');
      return;
    }

    setProcessing(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Could not load payment gateway. Check your connection.');
        setProcessing(false);
        return;
      }

      const { data: orderData } = await paymentApi.createOrder(totalAmount);

      const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'Nova Marketplace',
        description: 'Order Payment',
        order_id: orderData.order.id,
        handler: async (response) => {
          try {
            await paymentApi.verify(response);
            const { data } = await orderApi.place({
              shippingAddress: address,
              paymentInfo: response,
              couponCode: appliedCoupon?.code || '',
              discountAmount: discountAmount,
            });
            await clearCart();
            toast.success('Order placed successfully!');
            navigate(`/orders`, { state: { newOrderId: data.order._id } });
          } catch (err) {
            toast.error(err.response?.data?.message || 'Order placement failed');
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => setProcessing(false),
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: '#4F46E5' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
        setProcessing(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment');
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-sm">
        Your cart is empty
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Address Form */}
        <form onSubmit={handlePayment} className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Shipping Address</span>
            </h2>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Street Address *
              </label>
              <input
                required
                className="w-full bg-slate-50 dark:bg-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  City *
                </label>
                <input
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  State *
                </label>
                <input
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Pincode *
                </label>
                <input
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Country
                </label>
                <input
                  disabled
                  className="w-full bg-slate-100 dark:bg-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500"
                  value={address.country}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-4 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {processing ? 'Processing Payment...' : `Pay $${totalAmount.toLocaleString()} with Razorpay`}
          </button>
        </form>

        {/* Order Summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-fit space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Order Items</h2>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.product._id} className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="line-clamp-1 flex-1 pr-2">{item.product.name} × {item.quantity}</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ${((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${itemsTotal.toLocaleString()}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Coupon ({appliedCoupon.code})</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span>{shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `$${shippingFee}`}</span>
            </div>

            <div className="flex justify-between font-extrabold text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Total Payable</span>
              <span className="text-indigo-600 dark:text-indigo-400">${totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
