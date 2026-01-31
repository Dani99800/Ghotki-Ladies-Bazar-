
import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2, Smartphone, CreditCard, ShieldCheck, MessageCircle, Building2 } from 'lucide-react';
import { Product, Order, User as UserType, Shop } from '../types';
import { PLATFORM_FEE_PKR, NOTIFICATION_SOUND } from '../constants';
import { supabase } from '../services/supabase';

interface InstantCheckoutProps {
  product: Product;
  onClose: () => void;
  onPlaceOrder: (o: Order) => void;
  user: UserType | null;
  shopId: string;
}

const InstantCheckout: React.FC<InstantCheckoutProps> = ({ product, onClose, onPlaceOrder, user, shopId }) => {
  const [step, setStep] = useState<'FORM' | 'SUCCESS'>('FORM');
  const [loading, setLoading] = useState(false);
  const [sellerShop, setSellerShop] = useState<Shop | null>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    address: user?.address || '',
    method: 'DELIVERY' as 'DELIVERY' | 'PICKUP',
    payment: 'COD' as 'EasyPaisa' | 'JazzCash' | 'COD'
  });

  useEffect(() => {
    const fetchShop = async () => {
      if (!supabase) return;
      const { data } = await supabase.from('shops').select('*').eq('id', shopId).maybeSingle();
      if (data) setSellerShop(data);
    };
    fetchShop();
  }, [shopId]);

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
      sellerId: shopId,
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
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.play().catch(() => {});
      setStep('SUCCESS');
    } catch (err: any) {
      alert(`Checkout Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppScreenshot = () => {
    if (!sellerShop) return;
    const sellerWhatsApp = sellerShop.whatsapp || sellerShop.mobile || '923000000000';
    const cleanNumber = sellerWhatsApp.replace(/^0/, '92');
    const message = encodeURIComponent(`Hi ${sellerShop.name}, I just placed an order for "${product.name}" (Order Total: PKR ${product.price.toLocaleString()}). Here is my payment screenshot:`);
    window.open(`https://wa.me/${cleanNumber}?text=${message}`);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
       <div className="bg-white w-full max-w-lg rounded-t-[3rem] p-8 space-y-6 animate-in slide-in-from-bottom-full duration-500 shadow-2xl relative max-h-[95vh] overflow-y-auto no-scrollbar border-t-8 border-pink-600">
          {step === 'FORM' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center justify-between">
                 <div>
                   <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">Checkout Form</h2>
                   <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest mt-1">Direct Bazaar Order</p>
                 </div>
                 <button onClick={onClose} type="button" className="p-3 bg-gray-100 rounded-full hover:bg-gray-200">
                   <X className="text-gray-500 w-5 h-5" />
                 </button>
              </div>

              <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100 flex gap-4">
                 <img src={product.images[0]} className="w-20 h-20 rounded-2xl object-cover shadow-sm" />
                 <div className="space-y-1">
                    <h3 className="font-black text-sm text-gray-900 leading-tight line-clamp-2">{product.name}</h3>
                    <p className="text-pink-600 font-black text-lg">PKR {product.price.toLocaleString()}</p>
                 </div>
              </div>

              <div className="space-y-3">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Payment Method</p>
                 <div className="grid grid-cols-3 gap-2">
                   {['EasyPaisa', 'JazzCash', 'COD'].map(p => (
                     <button key={p} type="button" onClick={() => setFormData({...formData, payment: p as any})} className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${formData.payment === p ? 'border-pink-600 bg-pink-50 text-pink-600 shadow-inner' : 'border-gray-50 bg-white text-gray-400 hover:border-gray-200'}`}>{p}</button>
                   ))}
                 </div>
              </div>

              <div className="space-y-3">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Buyer Details</p>
                 <input required placeholder="Full Name" className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm text-gray-900 border-none outline-none focus:ring-2 focus:ring-pink-500/20" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 <input required placeholder="Mobile (03xx...)" className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm text-gray-900 border-none outline-none focus:ring-2 focus:ring-pink-500/20" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                 <textarea required placeholder="Full Delivery Address" className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm text-gray-900 h-24 border-none outline-none focus:ring-2 focus:ring-pink-500/20" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>

              <div className="p-6 bg-gray-900 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xl">
                 <div className="text-center md:text-left">
                    <p className="text-[9px] font-black uppercase text-white/40 tracking-widest">Total Payable</p>
                    <span className="text-2xl font-black italic text-pink-500">PKR {(product.price + (formData.method === 'DELIVERY' ? 150 : 0)).toLocaleString()}</span>
                 </div>
                 <button type="submit" disabled={loading} className="w-full md:w-auto bg-pink-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                   {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Confirm Order</>}
                 </button>
              </div>
            </form>
          ) : (
            <div className="py-10 space-y-8">
               <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 shadow-inner">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h2 className="text-3xl font-black uppercase italic text-gray-900 tracking-tighter leading-none">Order Sent!</h2>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Your order has been registered.</p>
               </div>

               {formData.payment !== 'COD' && (
                 <div className="bg-gray-50 p-8 rounded-[3rem] border-2 border-pink-100 space-y-6">
                    <div className="text-center space-y-1">
                       <h3 className="font-black text-pink-600 uppercase text-xs tracking-widest">Pay to Merchant</h3>
                       <p className="text-[10px] text-gray-400 font-bold uppercase italic">Transfer money to the account below</p>
                    </div>

                    <div className="space-y-4">
                       {formData.payment === 'EasyPaisa' && sellerShop?.easypaisa_number && (
                          <div className="bg-white p-5 rounded-3xl shadow-sm border flex items-center gap-4">
                             <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600"><Smartphone className="w-5 h-5" /></div>
                             <div className="flex-1">
                                <p className="text-[8px] font-black uppercase text-gray-400">EasyPaisa Account</p>
                                <p className="font-black text-gray-900 text-lg">{sellerShop.easypaisa_number}</p>
                             </div>
                          </div>
                       )}
                       {formData.payment === 'JazzCash' && sellerShop?.jazzcash_number && (
                          <div className="bg-white p-5 rounded-3xl shadow-sm border flex items-center gap-4">
                             <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Smartphone className="w-5 h-5" /></div>
                             <div className="flex-1">
                                <p className="text-[8px] font-black uppercase text-gray-400">JazzCash Account</p>
                                <p className="font-black text-gray-900 text-lg">{sellerShop.jazzcash_number}</p>
                             </div>
                          </div>
                       )}
                       {!sellerShop?.easypaisa_number && !sellerShop?.jazzcash_number && sellerShop?.bank_details && (
                          <div className="bg-white p-5 rounded-3xl shadow-sm border flex items-center gap-4">
                             <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><Building2 className="w-5 h-5" /></div>
                             <div className="flex-1">
                                <p className="text-[8px] font-black uppercase text-gray-400">Bank Details</p>
                                <p className="font-black text-gray-900 text-xs whitespace-pre-line">{sellerShop.bank_details}</p>
                             </div>
                          </div>
                       )}
                    </div>

                    <button onClick={handleWhatsAppScreenshot} className="w-full py-5 bg-green-600 text-white font-black rounded-3xl uppercase tracking-widest text-[11px] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                       <MessageCircle className="w-6 h-6" /> Send Screenshot to Seller
                    </button>
                 </div>
               )}

               {formData.payment === 'COD' && (
                 <div className="text-center py-6">
                    <p className="text-sm font-bold text-gray-500">The seller will contact you on WhatsApp to confirm delivery.</p>
                 </div>
               )}

               <button onClick={onClose} className="w-full text-center text-pink-600 font-black uppercase text-[10px] tracking-[0.3em] underline">Return to Shopping</button>
            </div>
          )}
       </div>
    </div>
  );
};

export default InstantCheckout;
