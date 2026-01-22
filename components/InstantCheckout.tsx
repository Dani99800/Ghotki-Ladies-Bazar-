
import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Product, Order, User as UserType } from '../types';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const order: Order = {
      id: 'ord_' + Math.random().toString(36).substr(2, 9),
      buyerId: user?.id || 'guest',
      sellerId: product.shopId,
      items: [{ ...product, quantity: 1 }],
      subtotal: product.price,
      deliveryFee: formData.method === 'DELIVERY' ? 150 : 0,
      platformFee: 50,
      total: product.price + (formData.method === 'DELIVERY' ? 150 : 0),
      deliveryType: formData.method,
      status: 'PENDING',
      paymentMethod: formData.payment as any,
      isDeliveryPaidAdvance: formData.payment === 'COD',
      buyerName: formData.name,
      buyerMobile: formData.mobile,
      buyerAddress: formData.address,
      createdAt: new Date().toISOString()
    };

    onPlaceOrder(order);
    setStep('SUCCESS');
    setTimeout(() => onClose(), 2500);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
       <div className="bg-white w-full max-w-lg rounded-t-[3rem] md:rounded-[3rem] p-8 space-y-6 animate-in slide-in-from-bottom-full duration-500 pb-12 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
          
          {step === 'FORM' ? (
            <>
              <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter">Quick Buy</h2>
                 <button onClick={onClose} className="p-4 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                   <X className="w-6 h-6 text-gray-400" />
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                 <div className="space-y-4">
                    <input required type="text" placeholder="Full Name" className="w-full px-6 py-4.5 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-pink-500 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <input required type="tel" placeholder="Mobile Number" className="w-full px-6 py-4.5 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-pink-500 transition-all" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                    <textarea required placeholder="Delivery Address" className="w-full px-6 py-4.5 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-pink-500 transition-all h-24" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                 </div>

                 <div className="flex gap-2">
                    {['DELIVERY', 'PICKUP'].map(m => (
                      <button key={m} type="button" onClick={() => setFormData({...formData, method: m as any})} className={`flex-1 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${formData.method === m ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-gray-100 text-gray-400'}`}>
                        {m === 'DELIVERY' ? 'Home Delivery' : 'Store Pickup'}
                      </button>
                    ))}
                 </div>

                 <div className="grid grid-cols-3 gap-2">
                    {['EasyPaisa', 'JazzCash', 'COD'].map(m => (
                      <button key={m} type="button" onClick={() => setFormData({...formData, payment: m as any})} className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${formData.payment === m ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-gray-100 text-gray-400'}`}>
                        {m}
                      </button>
                    ))}
                 </div>

                 {formData.payment === 'COD' && (
                    <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex gap-3 items-start">
                       <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
                       <p className="text-[10px] font-bold text-yellow-800">
                         <span className="block font-black uppercase mb-1">Advance Required</span>
                         For COD, you must pay PKR 150 delivery fee in advance to confirm your order.
                       </p>
                    </div>
                 )}

                 <div className="p-6 bg-gray-900 rounded-3xl text-white flex justify-between items-center shadow-xl">
                    <span className="text-[10px] font-black uppercase opacity-50 tracking-widest">Total Bill</span>
                    <span className="text-xl font-black italic">PKR {(product.price + (formData.method === 'DELIVERY' ? 150 : 0)).toLocaleString()}</span>
                 </div>

                 <button type="submit" className="w-full bg-pink-600 text-white font-black py-5 rounded-[2rem] shadow-2xl uppercase tracking-widest text-[11px] active:scale-95 transition-all">
                   Confirm Order Request
                 </button>
              </form>
            </>
          ) : (
            <div className="py-20 text-center space-y-4 animate-in zoom-in duration-300">
               <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
               <h2 className="text-3xl font-black uppercase italic tracking-tighter">Order Sent!</h2>
               <p className="text-gray-400 text-xs font-bold px-8">The shopkeeper will contact you on WhatsApp to confirm the delivery payment.</p>
            </div>
          )}
       </div>
    </div>
  );
};

export default InstantCheckout;
