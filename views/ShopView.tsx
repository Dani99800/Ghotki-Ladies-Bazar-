
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, MessageCircle, MapPin, Phone, Star, Info, LayoutGrid, ArrowLeft, Building, Navigation } from 'lucide-react';
import { Shop, Product, Order, User as UserType } from '../types';
import InstantCheckout from '../components/InstantCheckout';

interface ShopViewProps {
  shops: Shop[];
  products: Product[];
  addToCart: (p: Product) => void;
  lang: 'EN' | 'UR';
  user: UserType | null;
  onPlaceOrder: (o: Order) => void;
}

const ShopView: React.FC<ShopViewProps> = ({ shops, products, addToCart, lang, user, onPlaceOrder }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const shop = shops.find(s => s.id === id);
  const shopProducts = products.filter(p => p.shopId === id);
  const [activeTab, setActiveTab] = useState<'Products' | 'About'>('Products');
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);

  if (!shop) return <div className="h-screen flex items-center justify-center font-black uppercase text-gray-400">Shop not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-in fade-in duration-500">
      {/* Banner */}
      <div className="relative h-56 md:h-72 overflow-hidden">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-4 left-4 z-20 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg active:scale-90"
        >
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </button>
        <img src={shop.banner} className="w-full h-full object-cover" alt={shop.name} />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Shop Info Header */}
      <div className="px-4 -mt-16 relative z-10 max-w-2xl mx-auto">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl shadow-pink-100/50 border border-white">
          <div className="flex items-start gap-5">
            <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-white -mt-12 flex-shrink-0">
              <img src={shop.logo} className="w-full h-full object-cover" alt={shop.name} />
            </div>
            <div className="flex-1 space-y-1">
              <h1 className="text-2xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">{shop.name}</h1>
              <div className="flex items-center gap-2 pt-1">
                <Star className="w-4 h-4 text-pink-500 fill-pink-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-600">Verified Marketplace Boutique</span>
              </div>
              <div className="flex items-center gap-2 pt-2 text-gray-400 font-bold text-[10px] uppercase truncate max-w-[200px]">
                <MapPin className="w-3.5 h-3.5 text-pink-500" />
                <span className="truncate">{shop.address || 'Address not added yet'}</span>
              </div>
            </div>
            <button 
              onClick={() => window.open(`https://wa.me/${shop.whatsapp || shop.mobile}`)}
              className="p-4 bg-green-50 text-green-600 rounded-2xl shadow-lg shadow-green-100 active:scale-90 transition-all flex-shrink-0"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-10 px-6 mt-10 border-b border-gray-100 justify-center">
        {['Products', 'About'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-pink-600' : 'text-gray-400'}`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-pink-600 rounded-t-full shadow-lg" />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 max-w-4xl mx-auto">
        {activeTab === 'Products' ? (
          <div className="grid grid-cols-2 gap-4">
            {shopProducts.map(product => (
              <div key={product.id} className="bg-white rounded-2xl md:rounded-[2rem] overflow-hidden shadow-md border border-gray-100 group flex flex-col">
                <div className="relative aspect-[4/5] overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                  <img src={product.images[0]} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  {product.discount_percentage ? <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase">SALE</span> : null}
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-2 md:space-y-4">
                  <div onClick={() => navigate(`/product/${product.id}`)}>
                    <h3 className="font-bold text-sm md:text-xl text-gray-900 truncate mb-1 uppercase tracking-tight">{product.name}</h3>
                    <span className="text-pink-600 font-black text-lg md:text-3xl italic leading-none">PKR {product.price.toLocaleString()}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setCheckoutProduct(product); }} className="w-full bg-pink-600 text-white py-4 md:py-8 rounded-xl md:rounded-2xl text-xs md:text-base font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">ORDER</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-8 animate-in slide-in-from-bottom-4">
            <div className="space-y-4">
              <h3 className="font-black text-gray-900 uppercase text-[10px] tracking-widest flex items-center gap-2"><Info className="w-4 h-4 text-pink-500" /> Merchant Story</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium italic">{shop.bio || 'Premium collections representing the authentic style of Ghotki.'}</p>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-50">
               <h3 className="font-black text-gray-900 uppercase text-[10px] tracking-widest flex items-center gap-2"><Building className="w-4 h-4 text-pink-500" /> Physical Location</h3>
               <div className="bg-pink-50/30 p-8 rounded-[2.5rem] border-2 border-pink-100 space-y-6">
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center flex-shrink-0 text-pink-600 border border-pink-100"><MapPin className="w-6 h-6" /></div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Bazaar Name</p>
                      <p className="font-black text-gray-900 uppercase italic text-lg">{shop.bazaar}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center flex-shrink-0 text-pink-600 border border-pink-100"><Navigation className="w-6 h-6" /></div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Exact Address</p>
                      <p className={`font-bold leading-relaxed text-sm bg-white/50 p-4 rounded-2xl border border-pink-50 min-w-[200px] ${shop.address ? 'text-gray-700' : 'text-gray-400 italic'}`}>
                        {shop.address || 'Address not added yet by shop owner'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center flex-shrink-0 text-green-600 border border-green-100"><Phone className="w-6 h-6" /></div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">WhatsApp Support</p>
                      <p className={`font-bold leading-relaxed text-sm bg-white/50 p-4 rounded-2xl border border-green-50 min-w-[200px] ${shop.whatsapp || shop.mobile ? 'text-gray-700' : 'text-gray-400 italic'}`}>
                        {shop.whatsapp || shop.mobile || 'WhatsApp number not provided'}
                      </p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {checkoutProduct && <InstantCheckout product={checkoutProduct} shopId={shop.id} onClose={() => setCheckoutProduct(null)} onPlaceOrder={onPlaceOrder} user={user} />}
    </div>
  );
};

export default ShopView;
