
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Sparkles, LayoutGrid, Flame, Clock, Star, Trophy, Map, Box } from 'lucide-react';
import { Shop, Product, Order, User as UserType, Category, AppEvent } from '../types';
import { BAZAARS } from '../constants';
import InstantCheckout from '../components/InstantCheckout';

interface BuyerHomeProps {
  shops: Shop[];
  products: Product[];
  categories: Category[];
  addToCart: (p: Product) => void;
  lang: 'EN' | 'UR';
  user?: UserType | null;
  onPlaceOrder?: (o: Order) => void;
  activeEvent: AppEvent;
}

const BuyerHome: React.FC<BuyerHomeProps> = ({ shops, products, categories = [], addToCart, lang, user, onPlaceOrder, activeEvent }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);

  const isShopActive = (shopId: string) => {
    const shop = shops.find(s => s.id === shopId);
    return shop?.status === 'APPROVED';
  };

  const featuredShops = useMemo(() => {
    return [...shops]
      .filter(s => s.status === 'APPROVED' && s.featured)
      .sort((a, b) => (Number(b.sort_priority) || 0) - (Number(a.sort_priority) || 0));
  }, [shops]);

  const newArrivals = useMemo(() => {
    return products
      .filter(p => p.is_new_arrival && isShopActive(p.shopId))
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [products, shops]);

  const normalize = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();

  const filteredProducts = products.filter(p => {
    if (!isShopActive(p.shopId)) return false;
    
    const pCatNorm = normalize(p.category || '');
    const selectedCatNorm = normalize(selectedCategory);
    const selectedCatObj = categories.find(c => c.id === selectedCategory || c.name === selectedCategory);
    const selectedCatNameNorm = selectedCatObj ? normalize(selectedCatObj.name) : '';

    const categoryMatch = selectedCategory === 'All' || 
                          pCatNorm === selectedCatNorm ||
                          (selectedCatNameNorm && pCatNorm === selectedCatNameNorm);

    const searchMatch = searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-12 pb-32 animate-in fade-in duration-700">
      
      {/* Event Banner */}
      {activeEvent.id !== 'NORMAL' && (
        <div className="rounded-[2.5rem] p-8 flex items-center justify-between text-white shadow-2xl relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${activeEvent.primaryColor}, ${activeEvent.accentColor})` }}>
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-2xl rounded-[1.8rem] flex items-center justify-center text-4xl shadow-inner border border-white/30">{activeEvent.emoji}</div>
            <div>
               <h3 className="font-black text-2xl italic uppercase tracking-tighter leading-none">{activeEvent.name}</h3>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90 mt-2 bg-black/10 px-3 py-1 rounded-full inline-block">{activeEvent.bannerText}</p>
            </div>
          </div>
          <div className="relative z-10 text-right"><div className="urdu-font text-4xl font-black text-white drop-shadow-lg">{activeEvent.urduName}</div></div>
        </div>
      )}

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-pink-600 transition-colors" />
        <input type="text" placeholder="Search brands or collections..." className="w-full pl-16 pr-6 py-5 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm outline-none font-bold text-gray-800 focus:ring-4 focus:ring-pink-600/10 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {/* Categories Scroller */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h2 className="font-black text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-2"><LayoutGrid className="w-3 h-3" /> Collections</h2>
        </div>
        <div className="flex gap-6 overflow-x-auto no-scrollbar px-2 pb-2">
          <div onClick={() => setSelectedCategory('All')} className="flex flex-col items-center gap-3 cursor-pointer group flex-shrink-0">
            <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-all ${selectedCategory === 'All' ? 'bg-pink-600 text-white shadow-xl scale-110' : 'bg-white border-2 border-gray-100 text-gray-400'}`}>
              <LayoutGrid className="w-7 h-7" />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${selectedCategory === 'All' ? 'text-pink-600' : 'text-gray-400'}`}>All</span>
          </div>
          {categories.map((cat) => (
            <div key={cat.id} onClick={() => setSelectedCategory(cat.id)} className="flex flex-col items-center gap-3 cursor-pointer group flex-shrink-0">
              <div className={`w-16 h-16 rounded-[1.8rem] overflow-hidden transition-all border-4 ${selectedCategory === cat.id ? 'border-pink-600 shadow-xl scale-110' : 'border-white shadow-md'}`}>
                <img src={cat.image_url} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${selectedCategory === cat.id ? 'text-pink-600' : 'text-gray-400'}`}>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Shops */}
      {featuredShops.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
             <h2 className="font-black text-xl text-gray-900 uppercase italic tracking-tighter flex items-center gap-2">
               <Flame className="w-6 h-6 text-orange-500" /> Top Choice
             </h2>
             <button onClick={() => navigate('/shops')} className="text-[10px] font-black uppercase text-pink-600 tracking-widest">View All</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 px-1 snap-x">
            {featuredShops.map((shop) => (
              <div key={shop.id} onClick={() => navigate(`/shop/${shop.id}`)} className="flex-shrink-0 w-32 space-y-2 group cursor-pointer text-center snap-start">
                <div className="relative aspect-square rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-white group-hover:scale-105 transition-transform duration-500">
                  <img src={shop.logo} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  <div className="absolute top-1.5 right-1.5">
                    {shop.is_top_seller && <div className="bg-pink-600 p-1 rounded-full shadow-lg border border-white"><Trophy className="w-3 h-3 text-white" /></div>}
                  </div>
                </div>
                <div className="px-1">
                   <p className="text-[10px] font-black uppercase text-gray-900 truncate italic tracking-tight mb-1 leading-tight">{shop.name}</p>
                   <p className="text-[7px] font-black uppercase text-gray-400 tracking-widest truncate">{shop.bazaar}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals with % Off Badge */}
      {newArrivals.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
             <h2 className="font-black text-2xl text-gray-900 uppercase italic tracking-tighter flex items-center gap-3">
               <Clock className="w-8 h-8 text-pink-600" /> New Arrivals
             </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 px-1 snap-x">
            {newArrivals.map((product) => (
              <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="flex-shrink-0 w-40 md:w-56 space-y-3 group cursor-pointer snap-start">
                <div className="relative aspect-[3/4] rounded-2xl md:rounded-[3rem] overflow-hidden border border-gray-100 shadow-xl bg-gray-50 group-hover:scale-[1.02] transition-transform duration-500">
                  <img src={product.images[0]} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                     {product.event_name && (
                       <span className="bg-pink-600 text-white text-[7px] md:text-[9px] font-black px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl uppercase shadow-xl border border-pink-500 flex items-center gap-2">
                         <Sparkles className="w-2 md:w-3 h-2 md:h-3" /> {product.event_name}
                       </span>
                     )}
                     {product.discount_percentage && product.discount_percentage > 0 && (
                       <span className="bg-red-600 text-white text-[7px] md:text-[9px] font-black px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl uppercase shadow-xl border border-red-500 w-fit">
                         {product.discount_percentage}% OFF
                       </span>
                     )}
                  </div>
                </div>
                <div className="px-1">
                   <h3 className="text-[11px] md:text-sm font-black uppercase text-gray-900 truncate tracking-tight italic">{product.name}</h3>
                   <div className="flex items-center justify-between mt-1">
                     <p className="text-pink-600 font-black text-sm md:text-lg italic leading-none">PKR {product.price.toLocaleString()}</p>
                     <span className="text-[7px] md:text-[8px] font-black text-gray-300 uppercase">Qty: {product.stock || 0}</span>
                   </div>
                   <button onClick={(e) => { e.stopPropagation(); setCheckoutProduct(product); }} className="w-full mt-2 bg-gray-900 text-white py-3 md:py-6 rounded-xl md:rounded-2xl font-black uppercase text-[8px] md:text-[10px] tracking-widest shadow-xl">BUY NOW</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Marketplace Grid */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2 border-b border-gray-100 pb-6">
          <h2 className="font-black text-2xl text-gray-900 uppercase italic tracking-tighter">Marketplace</h2>
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{filteredProducts.length} items</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:gap-8">
          {filteredProducts.map(product => {
            const hasOff = product.discount_percentage && product.discount_percentage > 0;
            return (
              <div key={product.id} className="bg-white rounded-2xl md:rounded-[3rem] overflow-hidden shadow-md border border-gray-100 flex flex-col group transition-all hover:shadow-2xl">
                <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                  <img src={product.images[0]} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                    {product.event_name && (
                      <div className="bg-white/90 backdrop-blur-md text-pink-600 text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-lg border border-pink-100 flex items-center gap-1">
                        <Sparkles className="w-2 h-2 animate-pulse" /> {product.event_name}
                      </div>
                    )}
                    {hasOff && (
                      <div className="bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-xl uppercase italic text-center">
                        {product.discount_percentage}% OFF
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 md:p-7 flex-1 space-y-2 md:space-y-4 flex flex-col justify-between bg-white">
                  <div onClick={() => navigate(`/product/${product.id}`)}>
                    <h3 className="font-bold text-xs md:text-lg text-gray-900 truncate uppercase tracking-tight mb-1 hover:text-pink-600 transition-colors">{product.name}</h3>
                    <div className="flex items-center justify-between">
                       <p className="text-pink-600 font-black text-sm md:text-2xl italic leading-none whitespace-nowrap">PKR {product.price.toLocaleString()}</p>
                       <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase">Stock: {product.stock || 0}</span>
                    </div>
                  </div>
                  <button onClick={() => setCheckoutProduct(product)} className="w-full bg-gray-900 text-white font-black py-3 md:py-6 rounded-xl md:rounded-2xl text-[10px] md:text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all hover:bg-pink-600">ORDER NOW</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {checkoutProduct && <InstantCheckout product={checkoutProduct} shopId={checkoutProduct.shopId} onClose={() => setCheckoutProduct(null)} onPlaceOrder={onPlaceOrder || (() => {})} user={user || null} />}
    </div>
  );
};

export default BuyerHome;
