
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Store, CreditCard, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CartItem, User, Order } from '../types';

interface CheckoutViewProps {
  cart: CartItem[];
  clearCart: () => void;
  user: User | null;
  lang: 'EN' | 'UR';
  onPlaceOrder: (o: Order) => void;
}

const CheckoutView: React.FC<CheckoutViewProps> = ({ cart, clearCart, user, lang, onPlaceOrder }) => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [payment, setPayment] = useState<'EasyPaisa' | 'JazzCash' | 'COD'>('EasyPaisa');
  const [orderComplete, setOrderComplete] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = method === 'DELIVERY' ? 150 : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    const sellersInCart: string[] = Array.from(new Set(cart.map(item => item.shopId)));
    
    sellersInCart.forEach(sellerId => {
      const sellerItems = cart.filter(item => item.shopId === sellerId);
      const sellerSubtotal = sellerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      
      const order: Order = {
        id: 'ord_' + Math.random().toString(36).substr(2, 9),
        buyerId: user?.id || 'guest',
        sellerId: sellerId,
        items: sellerItems,
        subtotal: sellerSubtotal,
        deliveryFee: method === 'DELIVERY' ? 150 : 0,
        platformFee: 50,
        total: sellerSubtotal + (method === 'DELIVERY' ? 150 : 0),
        deliveryType: method,
        status: 'PENDING',
        paymentMethod: payment as any,
        isDeliveryPaidAdvance: payment === 'COD',
        buyerName: user?.name || 'Guest Buyer',
        buyerMobile: user?.mobile || '0000000000',
        // Fixed: added missing required buyerAddress property
        buyerAddress: user?.address || 'N/A',
        createdAt: new Date().toISOString()
      };
      onPlaceOrder(order);
    });

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
        <h1 className="text-2xl font-bold uppercase italic">Order Confirmed!</h1>
        <p className="text-gray-500 text-sm">Your order has been sent to the sellers. If you chose COD, please pay 150 PKR advance to the shopkeeper's WhatsApp number.</p>
        <p className="text-pink-600 font-bold animate-pulse text-xs mt-4">Redirecting home...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8 pb-32">
      <h1 className="text-2xl font-black uppercase italic tracking-tighter">Checkout</h1>

      <section className="space-y-3">
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fulfillment</h2>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setMethod('DELIVERY')} className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'DELIVERY' ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-gray-200 bg-white text-gray-400'}`}>
            <Truck className="w-6 h-6" /><span className="text-[10px] font-black uppercase">Home Delivery</span>
          </button>
          <button onClick={() => setMethod('PICKUP')} className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'PICKUP' ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-gray-200 bg-white text-gray-400'}`}>
            <Store className="w-6 h-6" /><span className="text-[10px] font-black uppercase">Store Pickup</span>
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment Method</h2>
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden divide-y">
          {['EasyPaisa', 'JazzCash', 'COD'].map((p) => (
            <div key={p} onClick={() => setPayment(p as any)} className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <CreditCard className={`w-5 h-5 ${payment === p ? 'text-pink-600' : 'text-gray-300'}`} />
                <span className={`font-bold text-sm ${payment === p ? 'text-gray-900' : 'text-gray-400'}`}>{p}</span>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${payment === p ? 'border-pink-600 bg-pink-600' : 'border-gray-300'}`}>
                {payment === p && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </div>
          ))}
        </div>
      </section>

      {payment === 'COD' && (
        <div className="bg-yellow-50 p-5 rounded-3xl border border-yellow-100 flex gap-4 items-start shadow-sm">
           <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0" />
           <p className="text-xs font-bold text-yellow-800 leading-relaxed">
              <span className="block font-black uppercase mb-1">Advance Delivery Fee (PKR 150)</span>
              To prevent fake orders, you must pay the delivery fee in advance via EasyPaisa to the shopkeeper. The remaining amount is payable on delivery.
           </p>
        </div>
      )}

      <section className="bg-gray-900 rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl">
        <div className="space-y-3">
          <div className="flex justify-between text-white/50 text-xs font-bold uppercase tracking-widest"><span>Subtotal</span><span>PKR {subtotal}</span></div>
          <div className="flex justify-between text-white/50 text-xs font-bold uppercase tracking-widest"><span>Delivery</span><span>PKR {deliveryFee}</span></div>
          <div className="flex justify-between text-2xl font-black pt-4 border-t border-white/10 italic tracking-tighter"><span>Total Due</span><span className="text-pink-500">PKR {total.toLocaleString()}</span></div>
        </div>
        
        <button onClick={handlePlaceOrder} className="w-full bg-pink-600 text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all uppercase tracking-widest text-[11px]">
          <ShieldCheck className="w-5 h-5" /> Confirm Checkout
        </button>
      </section>
    </div>
  );
};

export default CheckoutView;