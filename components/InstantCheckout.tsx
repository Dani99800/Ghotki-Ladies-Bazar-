
import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Product, Order, User as UserType } from '../types';
import { PLATFORM_FEE_PKR, NOTIFICATION_SOUND } from '../constants';

interface InstantCheckoutProps {
  product: Product;
  onClose: () => void;
  onPlaceOrder: (o: Order) => void;
  user: UserType | null;
}

const InstantCheckout: React.FC<InstantCheckoutProps> = ({ product, onClose, onPlaceOrder, user }) => {
  const [step, setStep] = useState<'FORM' | 'SUCCESS'>('FORM');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    address: user?.address || '',
    method: 'DELIVERY' as 'DELIVERY' | 'PICKUP',
    payment: 'COD' as 'EasyPaisa' | 'JazzCash' | 'COD'
  });

  const playNotification = () => {
    const audio = new Audio(NOTIFICATION_SOUND);
    audio.play().catch(e => console.log("Audio play blocked", e));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.address) {
      alert("Please fill in all details for the delivery.");
      return;
    }
    setLoading(true);
    
    const order: Order = {
      id: 'ord_' + Math.random().toString(36).substr(2, 9),
      buyerId: user?.id || 'guest_' + Date.now(),
      sellerId: product.shopId,
      items: [{ ...product, quantity: 1 }],
      subtotal: product.price,
      deliveryFee: formData.method === 'DELIVERY' ? 150 : 0,
      platformFee: PLATFORM_FEE_PKR,
      total: product.price + (formData.method === 'DELIVERY' ? 150 : 0),
      status: 'PENDING',
      paymentMethod: formData.payment,
      buyerName: formData.name,
      buyerMobile: formData.mobile,
      buyerAddress: formData.address,
      createdAt: new Date().toISOString()
    };
    
    try {
      await onPlaceOrder(order);
      playNotification();
      setStep('SUCCESS');
      setTimeout(() => onClose(), 3500);
    } catch (err) {
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
       <div className="bg-white w-full max-w-lg rounded-t-[3rem] p-8 space-y-6 animate-in slide-in-from-bottom-full duration-500 shadow-2xl relative max-h-[90vh] overflow-y-auto">
          {step === 'FORM' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center justify-between">
                 <div>
                   <h2 className="text-2xl font-black uppercase italic tracking-tighter">Instant Buy</h2>
                   <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest">No Signup Required</p>
                 </div>
                 <button onClick={onClose} type="button" className="p-2"><X className="text-gray-400" /></button>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex gap-4">
                 <img src={product.images[0]} className="w-16 h-16 rounded-xl object-cover" />
                 <div>
                    <h3 className="font-bold text-sm leading-tight">{product.name}</h3>
                    <p className="text-pink-600 font-black">PKR {product.price.toLocaleString()}</p>
                 </div>
              </div>

              <div className="space-y-3">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Delivery Details</p>
                 <input required type="text" placeholder="Full Name" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm border border-transparent focus:border-pink-200 outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 <input required type="tel" placeholder="Active Mobile Number" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm border border-transparent focus:border-pink-200 outline-none transition-all" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                 <textarea required placeholder="Full Delivery Address in Ghotki" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm h-20 border border-transparent focus:border-pink-200 outline-none transition-all" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>

              <div className="p-6 bg-gray-900 rounded-3xl text-white flex justify-between items-center">
                 <div>
                   <span className="text-[10px] font-black uppercase opacity-50 block">Total Due</span>
                   <span className="text-xs text-white/40 italic">Incl. 150 Delivery Fee</span>
                 </div>
                 <span className="text-2xl font-black italic">PKR {(product.price + (formData.method === 'DELIVERY' ? 150 : 0)).toLocaleString()}</span>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-pink-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-[11px] active:scale-95 transition-all shadow-xl shadow-pink-100 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : 'Confirm & Place Order'}
              </button>
            </form>
          ) : (
            <div className="py-20 text-center space-y-4">
               <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto animate-bounce" />
               <h2 className="text-3xl font-black uppercase italic tracking-tighter">Order Sent!</h2>
               <p className="text-gray-400 text-xs font-bold uppercase px-6">The shop owner has been notified. They will call you on <span className="text-gray-900 font-black">{formData.mobile}</span> soon.</p>
               <button onClick={onClose} className="mt-8 text-pink-600 font-black uppercase text-[10px] tracking-[0.3em]">Continue Shopping</button>
            </div>
          )}
       </div>
    </div>
  );
};

export default InstantCheckout;
