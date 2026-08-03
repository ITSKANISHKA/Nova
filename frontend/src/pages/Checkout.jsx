import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { paymentApi, orderApi } from '../api/endpoints';
import { loadRazorpayScript } from '../utils/razorpay';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cart, fetchCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
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
  const shippingFee = itemsTotal > 500 ? 0 : 49;
  const totalAmount = itemsTotal + shippingFee;

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
        name: 'Nova',
        description: 'Order Payment',
        order_id: orderData.order.id,
        handler: async (response) => {
          try {
            await paymentApi.verify(response);
            const { data } = await orderApi.place({
              shippingAddress: address,
              paymentInfo: response,
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
        theme: { color: '#0F5257' },
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
      <div className="min-h-[60vh] flex items-center justify-center text-ink/40">
        Your cart is empty
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
      <form onSubmit={handlePayment} className="md:col-span-2 space-y-4">
        <h1 className="text-xl font-bold">Shipping Address</h1>
        <div>
          <label className="text-sm font-medium block mb-1">Street Address</label>
          <input
            required
            className="input-field"
            value={address.street}
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">City</label>
            <input
              required
              className="input-field"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">State</label>
            <input
              required
              className="input-field"
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Pincode</label>
            <input
              required
              className="input-field"
              value={address.pincode}
              onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Country</label>
            <input disabled className="input-field bg-sand" value={address.country} />
          </div>
        </div>

        <button type="submit" disabled={processing} className="btn-coral w-full mt-4">
          {processing ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString('en-IN')} with Razorpay`}
        </button>
        <p className="text-xs text-ink/40 text-center">
          Test mode — use Razorpay test card 4111 1111 1111 1111, any future date/CVV.
        </p>
      </form>

      <div className="card p-4 h-fit">
        <h2 className="font-bold mb-3">Order Summary</h2>
        <div className="space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.product._id} className="flex justify-between text-ink/60">
              <span className="line-clamp-1">{item.product.name} × {item.quantity}</span>
              <span>₹{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-ink/10 mt-3 pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-ink/60">
            <span>Subtotal</span>
            <span>₹{itemsTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-ink/60">
            <span>Shipping</span>
            <span>{shippingFee === 0 ? 'Free' : `₹${shippingFee}`}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-1">
            <span>Total</span>
            <span>₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
