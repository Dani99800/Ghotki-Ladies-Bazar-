
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Store, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, User, Phone, MapPin } from 'lucide-react';
import { CartItem, User as UserType, Order, Shop } from '../types';
import { PLATFORM_FEE_PKR, NOTIFICATION_SOUND } from '../constants';

interface CheckoutViewProps {
  cart: CartItem[];
  clearCart: () => void;
  user: UserType | null;
  lang: 'EN' | 'UR';
  onPlaceOrder: (o: Order) => void;
  shops: Shop[];
}

const CheckoutView: React.FC<CheckoutViewProps> = ({ cart, clearCart, user, lang, onPlaceOrder, shops }) => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [payment, setPayment] = useState<'EasyPaisa' | 'JazzCash' | 'COD'>('EasyPaisa');
  const [orderComplete, setOrderComplete] = useState(false);
  
  const [guestInfo, setGuestInfo] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    address: user?.address || ''
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = method === 'DELIVERY' ? 150 : 0;
  const total = subtotal + deliveryFee;

  const playNotification = () => {
    const audio = new Audio(NOTIFICATION_SOUND);
    audio.play().catch(e => console.log("Audio play blocked", e));
  };

  const handlePlaceOrder = async () => {
    if (!guestInfo.name || !guestInfo.mobile || !guestInfo.address) {
      alert("Please fill in your delivery details.");
      return;
    }

    const sellersInCart: string[] = Array.from(new Set(cart.map(item => item.shopId)));
    
    try {
      for (const shopId of sellersInCart) {
        const shop = shops.find(s => s.id === shopId);
        if (!shop) continue;

        const sellerItems = cart.filter(item => item.shopId === shopId);
        const sellerSubtotal = sellerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        
        const order: Order = {
          id: 'ord_' + Math.random().toString(36).substr(2, 9),
          buyerId: user?.id || 'guest_' + Date.now(),
          sellerId: shop.id, // CRITICAL FIX: Use shop.id (UUID) to satisfy database foreign key and ensure visibility in seller dashboard
          items: sellerItems,
          subtotal: sellerSubtotal,
          deliveryFee: method === 'DELIVERY' ? 150 : 0,
          platformFee: PLATFORM_FEE_PKR,
          total: sellerSubtotal + (method === 'DELIVERY' ? 150 : 0),
          deliveryType: method,
          status: 'PENDING',
          paymentMethod: payment,
          buyerName: guestInfo.name,
          buyerMobile: guestInfo.mobile,
          buyerAddress: guestInfo.address,
          createdAt: new Date().toISOString()
        };
        await onPlaceOrder(order);
      }

      playNotification();
      setOrderComplete(true);
      setTimeout(() => {
        clearCart();
        navigate('/');
      }, 3500);
    } catch (err: any) {
      console.error("Cart checkout error:", err);
      alert(`Failed to place order: ${err.message || 'Unknown error'}`);
    }
  };

  if (orderComplete) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold uppercase italic tracking-tighter text-gray-900">Orders Confirmed!</h1>
        <p className="text-gray-500 text-sm">Your order has been sent to the sellers. They will contact you shortly to confirm the delivery.</p>
        <p className="text-pink-600 font-bold animate-pulse text-xs mt-4 uppercase">Redirecting to marketplace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8 pb-32 animate-in fade-in duration-500">
      <h1 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">Checkout Details</h1>

      <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Delivery Info</h2>
        <div className="space-y-3">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input required placeholder="Full Name" className="w-full pl-10 pr-4 py-4 bg-gray-50 rounded-2xl font-bold text-sm text-gray-900 border border-transparent focus:border-pink-200 outline-none transition-all" value={guestInfo.name} onChange={e => setGuestInfo({...guestInfo, name: e.target.value})} />
          </div>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input required placeholder="Mobile Number" className="w-full pl-10 pr-4 py-4 bg-gray-50 rounded-2xl font-bold text-sm text-gray-900 border border-transparent focus:border-pink-200 outline-none transition-all" value={guestInfo.mobile} onChange={e => setGuestInfo({...guestInfo, mobile: e.target.value})} />
          </div>
          <div className="relative">
            <MapPin className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
            <textarea required placeholder="Full Delivery Address" className="w-full pl-10 pr-4 py-4 bg-gray-50 rounded-2xl font-bold text-sm text-gray-900 h-24 border border-transparent focus:border-pink-200 outline-none transition-all" value={guestInfo.address} onChange={e => setGuestInfo({...guestInfo, address: e.target.value})} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-gray-900">Fulfillment</h2>
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
        <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden divide-y divide-gray-50 shadow-sm">
          {['EasyPaisa', 'JazzCash', 'COD'].map((p) => (
            <div key={p} onClick={() => setPayment(p as any)} className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <CreditCard className={`w-5 h-5 ${payment === p ? 'text-pink-600' : 'text-gray-300'}`} />
                <span className={`font-bold text-sm ${payment === p ? 'text-gray-900' : 'text-gray-400'}`}>{p}</span>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${payment === p ? 'border-pink-600 bg-pink-600 shadow-sm' : 'border-gray-200'}`}>
                {payment === p && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-900 rounded-[3rem] p-8 text-white space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-600/10 rounded-full blur-3xl"></div>
        <div className="space-y-3 relative z-10">
          <div className="flex justify-between text-white/50 text-xs font-black uppercase tracking-widest"><span>Subtotal</span><span>PKR {subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between text-white/50 text-xs font-black uppercase tracking-widest"><span>Delivery</span><span>PKR {deliveryFee}</span></div>
          <div className="flex justify-between text-2xl font-black pt-4 border-t border-white/10 italic tracking-tighter"><span>Total Due</span><span className="text-pink-500">PKR {total.toLocaleString()}</span></div>
        </div>
        
        <button onClick={handlePlaceOrder} className="w-full bg-pink-600 text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all uppercase tracking-widest text-[11px] relative z-10">
          <ShieldCheck className="w-5 h-5" /> Confirm All Orders
        </button>
      </section>
    </div>
  );
};

export default CheckoutView;
