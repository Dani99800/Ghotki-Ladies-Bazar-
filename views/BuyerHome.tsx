
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Sparkles, TrendingUp, LayoutGrid, Store, ChevronRight, FilterX, Clock, Star, Flame } from 'lucide-react';
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
  const [selectedBazaar, setSelectedBazaar] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);

  const isNormalDay = activeEvent.id === 'NORMAL';

  // Filter for Trending Shops based on priority and featured status
  const trendingShops = useMemo(() => {
    return [...shops]
      .filter(s => s.status === 'APPROVED' && (s.featured || (Number(s.sort_priority) || 0) > 0))
      .sort((a, b) => (Number(b.sort_priority) || 0) - (Number(a.sort_priority) || 0))
      .slice(0, 6);
  }, [shops]);

  // Sort products by date for New Arrivals (Top 10)
  const newArrivals = useMemo(() => {
    return [...products].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    }).slice(0, 10);
  }, [products]);

  const filteredProducts = products.filter(p => {
    const shop = shops.find(s => s.id === p.shopId);
    const bazaarMatch = selectedBazaar === 'All' || (shop && shop.bazaar === selectedBazaar);
    const categoryMatch = selectedCategory === 'All' || p.category === selectedCategory;
    const searchMatch = searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return bazaarMatch && categoryMatch && searchMatch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-10 pb-32">
      {/* Dynamic Hero Banner */}
      <div 
        className={`relative overflow-hidden rounded-[3rem] p-8 text-white shadow-2xl transition-all duration-700 ${isNormalDay ? 'bg-gray-900' : ''}`} 
        style={!isNormalDay ? { background: `linear-gradient(135deg, ${activeEvent.primaryColor}, ${activeEvent.accentColor})` } : {}}
      >
        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 scale-150 pointer-events-none">
           <span className="text-9xl">{activeEvent.emoji}</span>
        </div>
        
        <div className="relative z-10 space-y-3">
           {!isNormalDay && (
             <div className="flex items-center gap-2">
               <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">Featured Event</span>
               <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
             </div>
           )}
           
           <div className="space-y-1">
             <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
               {isNormalDay ? 'Premium Boutique Marketplace' : activeEvent.name}
             </h2>
             {!isNormalDay && <p className="urdu-font text-2xl font-medium opacity-90">{activeEvent.urduName}</p>}
             {isNormalDay && <p className="text-pink-500 font-black text-xs uppercase tracking-[0.3em]">Digitizing Ghotki Legacy</p>}
           </div>

           <p className="text-sm font-bold uppercase tracking-widest pt-2 opacity-80">
             {isNormalDay ? 'Discover the best local fashion from Ghotki' : activeEvent.bannerText}
           </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-pink-600 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search items, categories or shops..."
          className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[2.2rem] shadow-sm focus:ring-4 focus:ring-pink-600/10 focus:border-pink-600/30 outline-none font-bold text-gray-800 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Categories block */}
      <section>
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="font-black text-lg text-gray-900 uppercase italic tracking-tight">Categories</h2>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{categories.length} Styles</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x">
          {categories.map(cat => (
            <div 
              key={cat.id} 
              onClick={() => setSelectedCategory(selectedCategory === cat.name ? 'All' : cat.name)} 
              className={`flex-shrink-0 w-32 aspect-square rounded-[2rem] overflow-hidden cursor-pointer border-4 transition-all snap-start relative ${selectedCategory === cat.name ? 'border-pink-600 scale-95 shadow-xl shadow-pink-100' : 'border-transparent shadow-sm'}`}
            >
              <img src={cat.image_url} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                <span className="text-white font-black text-[10px] uppercase tracking-tighter leading-none">{cat.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Section */}
      {trendingShops.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-black text-lg text-gray-900 uppercase italic tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" /> Trending Now
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {trendingShops.map(shop => (
              <div 
                key={shop.id} 
                onClick={() => navigate(`/shop/${shop.id}`)}
                className="bg-white p-4 rounded-[2.5rem] border border-gray-50 shadow-sm flex items-center gap-3 active:scale-95 transition-all cursor-pointer group"
              >
                  <div className="relative">
                    <img src={shop.logo} className="w-12 h-12 rounded-xl object-cover bg-gray-50 border border-gray-100" />
                    <div className="absolute -top-1 -right-1 bg-orange-500 text-white p-0.5 rounded-full shadow-sm"><TrendingUp className="w-2.5 h-2.5" /></div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-black text-[10px] text-gray-900 uppercase italic truncate leading-tight">{shop.name}</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{shop.bazaar}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-pink-600 transition-colors" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-black text-lg text-gray-900 uppercase italic tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-pink-600" /> New Arrivals
            </h2>
            <button onClick={() => navigate('/shops')} className="text-[10px] font-black text-pink-600 uppercase tracking-widest flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x">
            {newArrivals.map(product => (
              <div 
                key={product.id} 
                onClick={() => navigate(`/product/${product.id}`)}
                className="flex-shrink-0 w-44 bg-white rounded-[2rem] overflow-hidden border border-gray-50 shadow-sm snap-start group"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-pink-600 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg">NEW</div>
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="font-black text-[11px] text-gray-900 uppercase italic truncate leading-tight">{product.name}</h3>
                  <p className="text-pink-600 font-black text-sm italic">PKR {product.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Products Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-pink-600" />
            <h2 className="font-black text-lg text-gray-900 uppercase italic tracking-tight">
              {searchTerm ? 'Search Results' : 'Full Catalog'}
            </h2>
          </div>
          {selectedCategory !== 'All' && (
             <button onClick={() => setSelectedCategory('All')} className="text-[9px] font-black text-gray-400 uppercase bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
               Clear Filter <FilterX className="w-3 h-3" />
             </button>
          )}
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
             <FilterX className="w-12 h-12 text-gray-200 mx-auto" />
             <div className="space-y-1">
               <p className="font-black uppercase text-xs text-gray-400 tracking-widest">No matching items found</p>
               <p className="text-[9px] text-gray-300 font-bold px-10">Try changing your search keywords or filters.</p>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col group">
                <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                  <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  {product.tags.includes('Sale') && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-lg shadow-lg">SALE</div>
                  )}
                  <div className="absolute bottom-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Star className="w-4 h-4 fill-white" />
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div onClick={() => navigate(`/product/${product.id}`)} className="cursor-pointer">
                    <h3 className="font-black text-sm text-gray-900 truncate leading-tight italic">{product.name}</h3>
                    <p className="text-pink-600 font-black text-lg italic mt-1">PKR {product.price.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-2">
                       <Store className="w-3 h-3 text-gray-300" />
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                         {shops.find(s => s.id === product.shopId)?.name || 'Merchant'}
                       </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setCheckoutProduct(product)} 
                    className="w-full bg-gray-900 text-white font-black py-4 rounded-[1.5rem] text-[10px] uppercase tracking-widest shadow-xl shadow-gray-200 active:scale-95 transition-all hover:bg-pink-600"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
