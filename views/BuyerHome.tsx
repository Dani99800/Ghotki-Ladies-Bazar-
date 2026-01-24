
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

  // Filter products by Bazaar and Category
  const filteredProducts = products.filter(p => {
    const shop = shops.find(s => s.id === p.shopId);
    const bazaarMatch = selectedBazaar === 'All' || (shop && shop.bazaar === selectedBazaar);
    const categoryMatch = selectedCategory === 'All' || p.category === selectedCategory;
    return bazaarMatch && categoryMatch;
  });

  // Trending = Admin marked "Featured" shops' products
  const trendingProducts = filteredProducts.filter(p => {
    const shop = shops.find(s => s.id === p.shopId);
    return shop?.featured; // Only Admin can toggle this flag
  });

  const newArrivals = filteredProducts.filter(p => p.tags.includes('New'));

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      {/* Search Header */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search items, shops, or categories..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* Bazaar Filter */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-pink-500" />
          <h2 className="font-black text-[10px] uppercase tracking-widest text-gray-400">Filter by Bazaar</h2>
        </div>
        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
          <button onClick={() => setSelectedBazaar('All')} className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${selectedBazaar === 'All' ? 'bg-pink-600 text-white' : 'bg-white text-gray-500 border'}`}>All Shops</button>
          {BAZAARS.map(b => (
            <button key={b} onClick={() => setSelectedBazaar(b)} className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${selectedBazaar === b ? 'bg-pink-600 text-white' : 'bg-white text-gray-500 border'}`}>{b}</button>
          ))}
        </div>
      </section>

      {/* Categories Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-pink-500" />
            <h2 className="font-bold text-lg text-gray-900">Categories</h2>
          </div>
          {selectedCategory !== 'All' && (
            <button onClick={() => setSelectedCategory('All')} className="text-[10px] font-black uppercase text-pink-600 flex items-center gap-1">
              <FilterX className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {CATEGORIES.map(cat => (
            <div 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`relative aspect-square rounded-[2rem] overflow-hidden cursor-pointer group border-2 transition-all ${selectedCategory === cat.name ? 'border-pink-500 scale-95 shadow-inner' : 'border-transparent'}`}
            >
              <img src={cat.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={cat.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex items-end p-4">
                <span className="text-white font-black text-[11px] uppercase tracking-tighter leading-tight">{cat.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Admin Controlled Trending Section */}
      {trendingProducts.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-pink-500" />
            <h2 className="font-bold text-lg text-gray-900">Admin Featured Trending</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {trendingProducts.map(product => (
              <div key={product.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 group flex flex-col">
                <div className="relative aspect-[3/4] overflow-hidden" onClick={() => navigate(`/product/${product.id}`)}>
                  <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 right-2 bg-pink-600 text-white text-[7px] font-black px-2 py-1 rounded-full uppercase shadow-lg">Featured</div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 truncate mb-1">{product.name}</h3>
                    <p className="text-pink-600 font-black text-sm">PKR {product.price.toLocaleString()}</p>
                  </div>
                  <button onClick={() => setCheckoutProduct(product)} className="mt-3 w-full bg-pink-50 text-pink-600 font-black py-2 rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">Buy Now</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals Feed */}
      {newArrivals.length > 0 && (
        <section className="pb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <h2 className="font-bold text-lg text-gray-900">New Arrivals</h2>
          </div>
          <div className="space-y-4">
            {newArrivals.map(product => (
              <div key={product.id} className="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm group">
                <div className="relative shrink-0 cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                  <img src={product.images[0]} className="w-24 h-24 object-cover rounded-2xl group-hover:scale-95 transition-transform" />
                </div>
                <div className="flex-1 cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                  <h4 className="font-bold text-sm text-gray-900 leading-tight mb-1">{product.name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">{shops.find(s => s.id === product.shopId)?.name}</p>
                  <span className="text-pink-600 font-black text-sm">PKR {product.price.toLocaleString()}</span>
                </div>
                <button onClick={() => setCheckoutProduct(product)} className="bg-pink-600 text-white px-6 py-4 rounded-2xl text-[10px] font-black shadow-lg active:scale-90 transition-transform uppercase tracking-widest">Buy</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {filteredProducts.length === 0 && (
        <div className="py-20 text-center space-y-4 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
           <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">No matching items found</p>
        </div>
      )}

      {checkoutProduct && (
        <InstantCheckout 
          product={checkoutProduct} 
          shopOwnerId={shops.find(s => s.id === checkoutProduct.shopId)?.owner_id || ''}
          onClose={() => setCheckoutProduct(null)} 
          onPlaceOrder={onPlaceOrder || (() => {})} 
          user={user || null} 
        />
      )}
    </div>
  );
};

export default BuyerHome;
