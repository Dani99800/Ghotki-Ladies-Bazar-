
import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    address: user?.address || '',
    method: 'DELIVERY' as 'DELIVERY' | 'PICKUP',
    payment: 'EasyPaisa' as 'EasyPaisa' | 'JazzCash' | 'COD'
  });

  const playNotification = () => {
    const audio = new Audio(NOTIFICATION_SOUND);
    audio.play().catch(e => console.log("Audio play blocked", e));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const order: Order = {
      id: 'ord_' + Math.random().toString(36).substr(2, 9),
      buyerId: user?.id || 'guest',
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
    onPlaceOrder(order);
    playNotification();
    setStep('SUCCESS');
    setTimeout(() => onClose(), 2500);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
       <div className="bg-white w-full max-w-lg rounded-t-[3rem] p-8 space-y-6 animate-in slide-in-from-bottom-full duration-500 shadow-2xl relative max-h-[90vh] overflow-y-auto">
          {step === 'FORM' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter">Instant Buy</h2>
                 <button onClick={onClose} type="button"><X className="text-gray-400" /></button>
              </div>
              <input required type="text" placeholder="Your Name" className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required type="tel" placeholder="Mobile Number" className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
              <textarea required placeholder="Complete Delivery Address" className="w-full p-4 bg-gray-50 rounded-2xl font-bold h-24" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              
              <div className="p-6 bg-gray-900 rounded-3xl text-white flex justify-between items-center">
                 <span className="text-[10px] font-black uppercase opacity-50">Total Amount</span>
                 <span className="text-xl font-black italic">PKR {(product.price + (formData.method === 'DELIVERY' ? 150 : 0)).toLocaleString()}</span>
              </div>
              <button type="submit" className="w-full bg-pink-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-[11px] active:scale-95 transition-all">Place Order</button>
            </form>
          ) : (
            <div className="py-20 text-center space-y-4">
               <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto animate-bounce" />
               <h2 className="text-3xl font-black uppercase italic">Order Confirmed!</h2>
               <p className="text-gray-400 text-xs font-bold uppercase">The shopkeeper has been notified</p>
            </div>
          )}
       </div>
    </div>
  );
};

export default InstantCheckout;
