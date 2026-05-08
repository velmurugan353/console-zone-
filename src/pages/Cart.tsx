import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/utils';
import { Trash2, ShoppingBag, ArrowRight, CreditCard, ShieldCheck, RefreshCw } from 'lucide-react';
import { razorpayService } from '../services/razorpayService';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Cart() {
  const { items: cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      alert('Please login to complete your mission.');
      return;
    }

    if (cart.length === 0) return;

    // Proceed with Razorpay checkout
    razorpayService.openCheckout({
      amount: cartTotal * 100, // Razorpay expects amount in paise
      prefill: {
        name: user.name || '',
        email: user.email || ''
      },
      handler: async (response: any) => {
        try {
          setIsProcessing(true);
          
          const orderData = {
            userId: user.id,
            customer: user.name || user.email,
            email: user.email,
            items: cart.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image
            })),
            total: cartTotal,
            status: 'processing',
            paymentId: response.razorpay_payment_id,
            date: new Date().toISOString().split('T')[0]
          };

          const token = localStorage.getItem('consolezone_token');
          const apiRes = await fetch(`${API_URL}/api/orders`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
          });

          if (!apiRes.ok) {
            throw new Error('Failed to synchronize order with matrix');
          }

          const savedOrder = await apiRes.json().catch(() => ({}));
          clearCart();
          navigate('/dashboard/orders');
          alert(`MISSION ACCOMPLISHED: Order #${(savedOrder._id || savedOrder.id).slice(-8).toUpperCase()} logged in matrix.`);
        } catch (error) {
          console.error('Checkout error:', error);
          alert('COMMUNICATION ERROR: Protocol interrupted. Please contact support.');
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
          <ShoppingBag className="h-12 w-12 text-gray-600" />
        </div>
        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">Inventory Empty</h2>
        <p className="text-gray-500 font-mono text-sm uppercase tracking-widest mb-12">No gear detected in your current payload.</p>
        <Link to="/shop">
          <button className="px-12 py-5 bg-gaming-accent text-black font-black uppercase tracking-widest text-sm rounded-2xl hover:shadow-[0_0_30px_rgba(216, 102, 255,0.4)] transition-all">
            Return to Armory
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12 border-b border-white/10 pb-10">
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-1.5 bg-gaming-accent/20 rounded-md">
              <ShoppingBag className="h-4 w-4 text-gaming-accent" />
            </div>
            <span className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.3em] font-bold">Payload Manifest // Secure Terminal</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Your <span className="text-gaming-accent">Cart</span></h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Estimated Payload Value</p>
          <p className="text-4xl font-black text-gaming-accent italic tracking-tighter">{formatCurrency(cartTotal)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-6">
          {cart.map((item) => (
            <motion.div
              layout
              key={item.id}
              className="bg-[#080112] border border-white/5 rounded-3xl p-6 flex items-center gap-8 group hover:border-gaming-accent/30 transition-all shadow-xl"
            >
              <div className="w-24 h-24 rounded-2xl bg-black border border-white/10 p-2 shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
              </div>
              
              <div className="flex-grow space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight italic">{item.name}</h3>
                  <button
                    onClick={() => removeFromCart(item.id, item.type)}
                    className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-lg font-black text-white italic">{formatCurrency(item.price)}</span>
                  <div className="h-4 w-[1px] bg-white/10" />
                  <div className="flex items-center bg-black/60 rounded-xl border border-white/5 p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.type, Math.max(1, item.quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-black text-gaming-accent font-mono">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-4">
          <div className="bg-[#080112] border border-white/10 rounded-3xl p-8 sticky top-24 shadow-2xl space-y-8">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Order <span className="text-gaming-accent">Summary</span></h2>
            
            <div className="space-y-4 border-b border-white/5 pb-8">
              <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-gray-500">
                <span>Subtotal</span>
                <span className="text-white font-bold">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-gray-500">
                <span>Shipping</span>
                <span className="text-emerald-500 font-bold italic">FREE_SECURE_UPLINK</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-gray-500">
                <span>Tax</span>
                <span className="text-white font-bold">Inclusive</span>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-gaming-accent uppercase tracking-[0.3em]">Total Due</span>
              <span className="text-3xl font-black text-white italic tracking-tighter">{formatCurrency(cartTotal)}</span>
            </div>

            <div className="space-y-4 pt-4">
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full py-5 bg-gaming-accent text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:shadow-[0_0_40px_rgba(216, 102, 255,0.5)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <CreditCard size={18} />}
                {isProcessing ? 'SCANNING...' : 'Initiate Checkout'}
              </button>
              
              <div className="flex items-center justify-center gap-3 py-4 border border-white/5 rounded-2xl bg-white/[0.02]">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className="text-[8px] font-mono text-gray-500 uppercase tracking-[0.2em]">Secure checkout powered by Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
