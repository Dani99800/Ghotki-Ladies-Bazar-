
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Store, CreditCard, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { CartItem, User } from '../types';

interface CheckoutViewProps {
  cart: CartItem[];
  clearCart: () => void;
  user: User | null;
  lang: 'EN' | 'UR';
}

const CheckoutView: React.FC<CheckoutViewProps> = ({ cart, clearCart, user, lang }) => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [payment, setPayment] = useState<'EasyPaisa' | 'JazzCash' | 'Bank'>('EasyPaisa');
  const [orderComplete, setOrderComplete] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = method === 'DELIVERY' ? 150 : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    // In real app, API call here
    setOrderComplete(true);
    setTimeout(() => {
      clearCart();
      navigate('/');
    }, 3000);
  };

  if (orderComplete) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold">Order Placed Successfully!</h1>
        <p className="text-gray-500">Your order has been sent to the seller. You'll receive a confirmation on WhatsApp shortly.</p>
        <p className="text-pink-600 font-bold animate-pulse">Redirecting home...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8 pb-32">
      <h1 className="text-2xl font-bold">Checkout</h1>

      {/* Fulfillment */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Fulfillment Method</h2>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setMethod('DELIVERY')}
            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'DELIVERY' ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-gray-200 bg-white text-gray-400'}`}
          >
            <Truck className="w-6 h-6" />
            <span className="text-xs font-bold">Home Delivery</span>
          </button>
          <button 
            onClick={() => setMethod('PICKUP')}
            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'PICKUP' ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-gray-200 bg-white text-gray-400'}`}
          >
            <Store className="w-6 h-6" />
            <span className="text-xs font-bold">Store Pickup</span>
          </button>
        </div>
      </section>

      {/* Payment */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Payment Method</h2>
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden divide-y">
          {['EasyPaisa', 'JazzCash', 'Bank Transfer'].map((p) => (
            <div 
              key={p} 
              onClick={() => setPayment(p as any)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${payment === p ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-400'}`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className={`font-bold ${payment === p ? 'text-gray-900' : 'text-gray-500'}`}>{p}</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payment === p ? 'border-pink-600 bg-pink-600' : 'border-gray-300'}`}>
                {payment === p && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Totals */}
      <section className="bg-pink-600 rounded-3xl p-6 text-white space-y-4 shadow-xl shadow-pink-200">
        <div className="flex justify-between text-pink-100 text-sm">
          <span>Subtotal</span>
          <span>PKR {subtotal}</span>
        </div>
        <div className="flex justify-between text-pink-100 text-sm">
          <span>Delivery Fee</span>
          <span>PKR {deliveryFee}</span>
        </div>
        <div className="flex justify-between text-xl font-black pt-4 border-t border-white/20">
          <span>Total</span>
          <span>PKR {total.toLocaleString()}</span>
        </div>
        
        <button 
          onClick={handlePlaceOrder}
          className="w-full bg-white text-pink-600 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-pink-50 transition-colors mt-2"
        >
          <ShieldCheck className="w-5 h-5" />
          Place Order Now
        </button>
      </section>
    </div>
  );
};

export default CheckoutView;
