
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Sparkles, TrendingUp, LayoutGrid, Store, ChevronRight, ShoppingBag, Flame, Clock, Star, Trophy, BellRing } from 'lucide-react';
import { Shop, Product, Order, User as UserType, Category, AppEvent } from '../types';
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

  const trendingShops = useMemo(() => {
    return [...shops]
      .filter(s => s.status === 'APPROVED' && s.featured)
      .sort((a, b) => (Number(b.sort_priority) || 0) - (Number(a.sort_priority) || 0))
      .slice(0, 10);
  }, [shops]);

  const newArrivals = useMemo(() => {
    return [...products]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 10);
  }, [products]);

  const filteredProducts = products.filter(p => {
    const categoryMatch = selectedCategory === 'All' || p.category === selectedCategory;
    const searchMatch = searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-12 pb-32 animate-in fade-in duration-700">
      
      {/* Dynamic Theme Announcement Bar */}
      {activeEvent.id !== 'NORMAL' && (
        <div 
          className="rounded-[2.5rem] p-6 flex items-center justify-between text-white shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-700"
          style={{ background: `linear-gradient(135deg, ${activeEvent.primaryColor}, ${activeEvent.accentColor})` }}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 scale-150">
            <span className="text-9xl">{activeEvent.emoji}</span>
          </div>
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner">
               {activeEvent.emoji}
            </div>
            <div>
               <h3 className="font-black text-xl italic uppercase tracking-tighter leading-none">{activeEvent.name}</h3>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 mt-1">{activeEvent.bannerText}</p>
            </div>
          </div>
          <div className="urdu-font text-3xl font-black text-white/90 drop-shadow-md">
            {activeEvent.urduName}
          </div>
        </div>
      )}

      {/* Search Header */}
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-pink-600 transition-colors" />
        <input
          type="text"
          placeholder="Search boutiques or items..."
          className="w-full pl-16 pr-6 py-5 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm outline-none font-bold text-gray-800 focus:ring-4 focus:ring-pink-600/10 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Horizontal Categories */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h2 className="font-black text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-2">
             <LayoutGrid className="w-3 h-3" /> Boutique Categories
           </h2>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar px-2">
          <div 
            onClick={() => setSelectedCategory('All')}
            className={`flex-shrink-0 px-8 py-4 rounded-[2rem] border transition-all cursor-pointer font-black text-[10px] uppercase tracking-widest ${selectedCategory === 'All' ? 'bg-pink-600 border-pink-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-500 hover:border-pink-200'}`}
          >
            All Bazar
          </div>
          {categories.map(cat => (
            <div 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex-shrink-0 flex items-center gap-3 px-6 py-4 rounded-[2rem] border transition-all cursor-pointer ${selectedCategory === cat.name ? 'bg-pink-600 border-pink-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-500 hover:border-pink-200'}`}
            >
              <img src={cat.image_url} className="w-7 h-7 rounded-full object-cover shadow-sm" />
              <span className="font-black text-[10px] uppercase tracking-widest whitespace-nowrap">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Boutiques */}
      {trendingShops.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
             <h2 className="font-black text-xl text-gray-900 uppercase italic tracking-tighter flex items-center gap-2">
               <Flame className="w-6 h-6 text-orange-500" /> Trending Boutiques
             </h2>
          </div>
          <div className="flex gap-5 overflow-x-auto no-scrollbar pb-6 px-2">
            {trendingShops.map((shop) => (
              <div key={shop.id} onClick={() => navigate(`/shop/${shop.id}`)} className="flex-shrink-0 w-36 space-y-3 group cursor-pointer text-center">
                <div className="relative aspect-square rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl bg-white group-hover:scale-105 transition-transform duration-500">
                  <img src={shop.logo} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-pink-600 p-2 rounded-2xl shadow-xl shadow-pink-200/50">
                    {shop.is_top_seller ? <Trophy className="w-4 h-4 text-white fill-white" /> : <Star className="w-4 h-4 text-white fill-white" />}
                  </div>
                </div>
                <div>
                   <p className="text-[11px] font-black uppercase text-gray-900 truncate italic tracking-tight">{shop.name}</p>
                   <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest mt-0.5">{shop.category}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals Scroll */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h2 className="font-black text-xl text-gray-900 uppercase italic tracking-tighter flex items-center gap-2">
             <Clock className="w-6 h-6 text-pink-600" /> New Arrivals
           </h2>
        </div>
        <div className="flex gap-5 overflow-x-auto no-scrollbar pb-6 px-2">
          {newArrivals.map(product => (
            <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="flex-shrink-0 w-48 bg-white rounded-[2.5rem] border border-gray-100 p-4 shadow-sm group cursor-pointer transition-all hover:shadow-lg">
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-4">
                <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                {product.discount_percentage ? <div className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-black px-3 py-1.5 rounded-xl shadow-lg uppercase">-{product.discount_percentage}%</div> : null}
                {product.event_name && <div className="absolute bottom-3 right-3 bg-pink-600 text-white text-[7px] font-black px-2 py-1 rounded-lg uppercase shadow-xl animate-pulse">{product.event_name}</div>}
              </div>
              <h4 className="font-black text-xs uppercase text-gray-900 truncate leading-none mb-2 italic">{product.name}</h4>
              <p className="text-pink-600 font-black text-sm italic">PKR {product.price.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Marketplace Grid */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2 border-b border-gray-100 pb-6">
          <h2 className="font-black text-2xl text-gray-900 uppercase italic tracking-tighter">Marketplace</h2>
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{filteredProducts.length} Items Available</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 md:gap-8">
          {filteredProducts.map(product => {
            const hasOff = product.discount_percentage && product.discount_percentage > 0;
            return (
              <div key={product.id} className="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col group transition-all hover:shadow-2xl hover:border-pink-50">
                <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                  <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                  
                  {/* Custom Event Badge (Eid Sale etc) */}
                  {product.event_name && (
                    <div className="absolute top-4 right-4 z-10 animate-in zoom-in-50 duration-500">
                      <div className="bg-white/80 backdrop-blur-md text-pink-600 text-[8px] font-black px-4 py-2 rounded-2xl uppercase tracking-widest shadow-2xl border border-pink-100 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 animate-pulse" /> {product.event_name}
                      </div>
                    </div>
                  )}

                  {hasOff && <div className="absolute top-4 left-4 bg-red-600 text-white text-[9px] font-black px-3 py-1.5 rounded-xl shadow-xl uppercase italic">Flash Sale</div>}
                </div>
                
                <div className="p-6 flex-1 space-y-4 flex flex-col justify-between bg-white relative">
                  <div onClick={() => navigate(`/product/${product.id}`)}>
                    <h3 className="font-black text-sm text-gray-900 truncate italic uppercase tracking-tight">{product.name}</h3>
                    <div className="flex items-baseline gap-2 mt-2">
                       <p className="text-pink-600 font-black text-xl italic leading-none">PKR {product.price.toLocaleString()}</p>
                       {hasOff && <p className="text-[11px] text-gray-300 line-through font-bold">PKR {product.original_price}</p>}
                    </div>
                  </div>
                  <button onClick={() => setCheckoutProduct(product)} className="w-full bg-gray-900 text-white font-black py-4.5 rounded-[2rem] text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all hover:bg-pink-600 hover:shadow-pink-200">Instant Buy</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {checkoutProduct && (
        <InstantCheckout 
          product={checkoutProduct} 
          shopId={checkoutProduct.shopId}
          onClose={() => setCheckoutProduct(null)} 
          onPlaceOrder={onPlaceOrder || (() => {})} 
          user={user || null} 
        />
      )}
    </div>
  );
};

export default BuyerHome;
