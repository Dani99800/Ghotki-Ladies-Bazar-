
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Sparkles, TrendingUp, Star, LayoutGrid, Heart, ShoppingCart, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Shop, Product, Order, User as UserType } from '../types';
import { BAZAARS, CATEGORIES } from '../constants';

interface BuyerHomeProps {
  shops: Shop[];
  products: Product[];
  addToCart: (p: Product) => void;
  lang: 'EN' | 'UR';
  user?: UserType | null;
  onPlaceOrder?: (o: Order) => void;
}

const BuyerHome: React.FC<BuyerHomeProps> = ({ shops, products, addToCart, lang, user, onPlaceOrder }) => {
  const navigate = useNavigate();
  const [selectedBazaar, setSelectedBazaar] = useState<string>('All');
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);

  const filteredShops = shops.filter(s => s.status === 'APPROVED' && (selectedBazaar === 'All' || s.bazaar === selectedBazaar));
  const trendingProducts = products.filter(p => p.tags.includes('Trending'));
  const newArrivals = products.filter(p => p.tags.includes('New'));

  const t = {
    EN: {
      search: 'Search for dress, shoes, shops...',
      bazaars: 'Explore Bazaars',
      trending: 'Trending Now',
      new: 'New Arrivals',
      featured: 'Featured Shops',
      categories: 'Categories',
    },
    UR: {
      search: 'لباس، جوتے یا دکانیں تلاش کریں...',
      bazaars: 'بازار دیکھیں',
      trending: 'آج کل کے ٹرینڈز',
      new: 'نئی کلیکشن',
      featured: 'نمایاں دکانیں',
      categories: 'اقسام',
    }
  }[lang];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Search Header */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={t.search}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* Bazaar Scroll */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-pink-500" />
          <h2 className="font-bold text-lg">{t.bazaars}</h2>
        </div>
        <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
          <button 
            onClick={() => setSelectedBazaar('All')}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedBazaar === 'All' ? 'bg-pink-600 text-white shadow-lg' : 'bg-white text-gray-600 border'}`}
          >
            All Cities
          </button>
          {BAZAARS.map(b => (
            <button 
              key={b}
              onClick={() => setSelectedBazaar(b)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedBazaar === b ? 'bg-pink-600 text-white shadow-lg' : 'bg-white text-gray-600 border'}`}
            >
              {b}
            </button>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <LayoutGrid className="w-5 h-5 text-pink-500" />
          <h2 className="font-bold text-lg">{t.categories}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CATEGORIES.map(cat => (
            <div 
              key={cat.id}
              onClick={() => navigate('/explore')}
              className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group"
            >
              <img src={(cat as any).image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={cat.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                <span className="text-white font-bold text-sm">{cat.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-pink-500" />
          <h2 className="font-bold text-lg">{t.trending}</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {trendingProducts.map(product => (
            <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
              <div className="relative aspect-[3/4] overflow-hidden" onClick={() => navigate(`/product/${product.id}`)}>
                <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                {product.tags.map(tag => (
                   <span key={tag} className="absolute top-2 left-2 bg-pink-600 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-tighter">{tag}</span>
                ))}
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm truncate mb-1">{product.name}</h3>
                <div className="flex items-center justify-between">
                   <span className="text-pink-600 font-bold text-sm">PKR {product.price.toLocaleString()}</span>
                   <button onClick={() => setCheckoutProduct(product)} className="bg-pink-50 text-pink-600 p-2 rounded-lg active:scale-90 transition-transform">
                      <ShoppingCart className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals with Instant Form Trigger */}
      <section className="pb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-pink-500" />
          <h2 className="font-bold text-lg">{t.new}</h2>
        </div>
        <div className="space-y-4">
          {newArrivals.map(product => (
            <div key={product.id} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
              <img onClick={() => navigate(`/product/${product.id}`)} src={product.images[0]} className="w-20 h-20 object-cover rounded-xl cursor-pointer" />
              <div onClick={() => navigate(`/product/${product.id}`)} className="flex-1 cursor-pointer">
                <h4 className="font-bold text-sm">{product.name}</h4>
                <p className="text-xs text-gray-500 mb-1">{shops.find(s => s.id === product.shopId)?.name}</p>
                <span className="text-pink-600 font-bold">PKR {product.price.toLocaleString()}</span>
              </div>
              <button 
                onClick={() => setCheckoutProduct(product)}
                className="bg-pink-600 text-white px-5 py-3 rounded-xl text-xs font-black shadow-md active:scale-90 transition-transform uppercase tracking-widest"
              >
                Buy
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Instant Checkout Modal */}
      {checkoutProduct && (
        <InstantCheckout 
          product={checkoutProduct} 
          onClose={() => setCheckoutProduct(null)} 
          onPlaceOrder={onPlaceOrder || (() => {})} 
          user={user} 
        />
      )}
    </div>
  );
};

const InstantCheckout: React.FC<{ product: Product, onClose: () => void, onPlaceOrder: (o: Order) => void, user?: UserType | null }> = ({ product, onClose, onPlaceOrder, user }) => {
  const [step, setStep] = useState<'FORM' | 'SUCCESS'>('FORM');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    address: '',
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
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
       <div className="bg-white w-full max-w-lg rounded-[3rem] p-8 space-y-6 animate-in slide-in-from-bottom-full duration-500 pb-12 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
          {step === 'FORM' ? (
            <>
              <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter">Instant Buy</h2>
                 <button onClick={onClose} className="p-4 bg-gray-50 rounded-full"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                 <input required type="text" placeholder="Full Name" className="w-full px-6 py-4.5 bg-gray-50 rounded-2xl font-bold outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 <input required type="tel" placeholder="Mobile" className="w-full px-6 py-4.5 bg-gray-50 rounded-2xl font-bold outline-none" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                 <textarea required placeholder="Shipping Address" className="w-full px-6 py-4.5 bg-gray-50 rounded-2xl font-bold outline-none h-24" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                 
                 <div className="flex gap-2">
                    {['DELIVERY', 'PICKUP'].map(m => (
                      <button key={m} type="button" onClick={() => setFormData({...formData, method: m as any})} className={`flex-1 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${formData.method === m ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-gray-100 text-gray-400'}`}>{m}</button>
                    ))}
                 </div>

                 <div className="grid grid-cols-3 gap-2">
                    {['EasyPaisa', 'JazzCash', 'COD'].map(m => (
                      <button key={m} type="button" onClick={() => setFormData({...formData, payment: m as any})} className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${formData.payment === m ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-gray-100 text-gray-400'}`}>{m}</button>
                    ))}
                 </div>

                 {formData.payment === 'COD' && (
                    <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex gap-3">
                       <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
                       <p className="text-[9px] font-bold text-yellow-800">For COD, 150 PKR delivery fee must be paid in advance via WhatsApp confirmation.</p>
                    </div>
                 )}

                 <div className="p-6 bg-gray-900 rounded-3xl text-white flex justify-between items-center shadow-xl">
                    <span className="text-[10px] font-black uppercase opacity-50">Total Bill</span>
                    <span className="text-xl font-black italic">PKR {(product.price + (formData.method === 'DELIVERY' ? 150 : 0)).toLocaleString()}</span>
                 </div>
                 <button type="submit" className="w-full bg-pink-600 text-white font-black py-5 rounded-[2rem] shadow-2xl uppercase tracking-widest text-[11px]">Send Order Request</button>
              </form>
            </>
          ) : (
            <div className="py-20 text-center space-y-4">
               <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
               <h2 className="text-2xl font-black uppercase italic">Order Sent!</h2>
               <p className="text-gray-400 text-xs font-bold">The shopkeeper will contact you shortly.</p>
            </div>
          )}
       </div>
    </div>
  );
};

export default BuyerHome;
