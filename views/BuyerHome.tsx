
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Sparkles, TrendingUp, LayoutGrid, ShoppingCart, FilterX } from 'lucide-react';
import { Shop, Product, Order, User as UserType } from '../types';
import { BAZAARS, CATEGORIES } from '../constants';
import InstantCheckout from '../components/InstantCheckout';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);

  const filteredShops = shops.filter(s => s.status === 'APPROVED' && (selectedBazaar === 'All' || s.bazaar === selectedBazaar));
  
  // Advanced filtering logic
  const filteredProducts = products.filter(p => {
    const shop = shops.find(s => s.id === p.shopId);
    const bazaarMatch = selectedBazaar === 'All' || (shop && shop.bazaar === selectedBazaar);
    const categoryMatch = selectedCategory === 'All' || p.category === selectedCategory;
    return bazaarMatch && categoryMatch;
  });

  const trendingProducts = filteredProducts.filter(p => {
    const shop = shops.find(s => s.id === p.shopId);
    return shop?.featured || p.tags.includes('Trending');
  });

  const newArrivals = filteredProducts.filter(p => p.tags.includes('New'));

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Search Header */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search items or shops..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* Filter Chips - Combined */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-pink-500" />
          <h2 className="font-black text-[10px] uppercase tracking-widest text-gray-400">Location</h2>
        </div>
        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
          <button onClick={() => setSelectedBazaar('All')} className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${selectedBazaar === 'All' ? 'bg-pink-600 text-white' : 'bg-white text-gray-500 border'}`}>All Bazaars</button>
          {BAZAARS.map(b => (
            <button key={b} onClick={() => setSelectedBazaar(b)} className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${selectedBazaar === b ? 'bg-pink-600 text-white' : 'bg-white text-gray-500 border'}`}>{b}</button>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-pink-500" />
            <h2 className="font-bold text-lg">Categories</h2>
          </div>
          {selectedCategory !== 'All' && (
            <button onClick={() => setSelectedCategory('All')} className="text-[10px] font-black uppercase text-pink-600 flex items-center gap-1">
              <FilterX className="w-3 h-3" /> Clear Filter
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {CATEGORIES.map(cat => (
            <div 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer group border-2 transition-all ${selectedCategory === cat.name ? 'border-pink-500 scale-95 shadow-inner' : 'border-transparent'}`}
            >
              <img src={cat.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={cat.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-white font-black text-[10px] uppercase tracking-tighter leading-tight">{cat.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Product Feed */}
      {trendingProducts.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-pink-500" />
            <h2 className="font-bold text-lg">Featured Collections</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {trendingProducts.map(product => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
                <div className="relative aspect-[3/4] overflow-hidden" onClick={() => navigate(`/product/${product.id}`)}>
                  <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  {shops.find(s => s.id === product.shopId)?.featured && (
                    <span className="absolute top-2 right-2 bg-pink-600 text-white text-[7px] font-black px-2 py-1 rounded-full uppercase">Verified Shop</span>
                  )}
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
      )}

      {newArrivals.length > 0 && (
        <section className="pb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <h2 className="font-bold text-lg">New Arrivals</h2>
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
                <button onClick={() => setCheckoutProduct(product)} className="bg-pink-600 text-white px-5 py-3 rounded-xl text-xs font-black shadow-md active:scale-90 transition-transform uppercase tracking-widest">Buy</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {filteredProducts.length === 0 && (
        <div className="py-20 text-center space-y-4 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
           <p className="text-gray-400 font-black uppercase text-[10px]">No products found in this selection</p>
        </div>
      )}

      {checkoutProduct && (
        <InstantCheckout 
          product={checkoutProduct} 
          onClose={() => setCheckoutProduct(null)} 
          onPlaceOrder={onPlaceOrder || (() => {})} 
          user={user || null} 
        />
      )}
    </div>
  );
};

export default BuyerHome;
