
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Sparkles, ShoppingCart, Heart, MapPin, ChevronRight } from 'lucide-react';
import { Product, Shop } from '../types';
import { CATEGORIES, BAZAARS } from '../constants';

interface ExploreViewProps {
  products: Product[];
  shops: Shop[];
  addToCart: (p: Product) => void;
  lang: 'EN' | 'UR';
}

const ExploreView: React.FC<ExploreViewProps> = ({ products, shops, addToCart, lang }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCat, setActiveCat] = useState('All');

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCat === 'All' || p.category === activeCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 animate-in fade-in duration-500 pb-24">
      <div className="flex items-center gap-2">
         <div className="relative flex-1">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
           <input 
             type="text" 
             placeholder="Search products or styles..."
             className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[2rem] shadow-sm focus:ring-2 focus:ring-pink-500 outline-none transition-all"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
         </div>
         <button className="p-4 bg-white border border-gray-100 rounded-full shadow-sm text-gray-500 active:scale-95 transition-transform">
           <Filter className="w-5 h-5" />
         </button>
      </div>

      {/* Bazaar Quick Links */}
      <section>
        <div className="flex items-center gap-2 mb-3 px-1">
          <MapPin className="w-4 h-4 text-pink-500" />
          <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-900">Trending Bazaars</h2>
        </div>
        <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
           {BAZAARS.map(b => (
             <div 
               key={b} 
               onClick={() => navigate('/shops')}
               className="flex-shrink-0 w-32 h-20 bg-gradient-to-br from-pink-50 to-white border border-pink-100 rounded-2xl p-3 flex flex-col justify-between cursor-pointer active:scale-95 transition-transform"
             >
                <span className="text-[9px] font-black text-pink-600 leading-tight truncate">{b}</span>
                <div className="flex items-center justify-between">
                   <span className="text-[8px] text-gray-400 font-bold uppercase">View Shops</span>
                   <ChevronRight className="w-3 h-3 text-pink-300" />
                </div>
             </div>
           ))}
        </div>
      </section>

      <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
        <button 
          onClick={() => setActiveCat('All')}
          className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeCat === 'All' ? 'bg-pink-600 text-white shadow-lg shadow-pink-100' : 'bg-white text-gray-400 border border-gray-100'}`}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveCat(cat.name)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeCat === cat.name ? 'bg-pink-600 text-white shadow-lg shadow-pink-100' : 'bg-white text-gray-400 border border-gray-100'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4">
        {filtered.length > 0 ? filtered.map(product => (
          <div 
            key={product.id}
            className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 group cursor-pointer hover:shadow-md transition-all flex flex-col"
          >
            <div className="relative aspect-[3/4] overflow-hidden" onClick={() => navigate(`/product/${product.id}`)}>
              <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={product.name} />
              <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full text-pink-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <Heart className="w-4 h-4" />
              </button>
              {product.tags.includes('Trending') && (
                <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur text-pink-600 text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">Trending</span>
              )}
            </div>
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div onClick={() => navigate(`/product/${product.id}`)}>
                <p className="text-[10px] font-bold text-gray-400 uppercase truncate">
                  {shops.find(s => s.id === product.shopId)?.name}
                </p>
                <h3 className="font-bold text-sm text-gray-800 truncate">{product.name}</h3>
                <p className="text-pink-600 font-black text-sm">PKR {product.price.toLocaleString()}</p>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                  navigate('/cart');
                }}
                className="w-full bg-pink-600 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-pink-100 active:scale-95 transition-all mt-2"
              >
                Buy Now
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center space-y-4">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
               <Search className="w-10 h-10" />
             </div>
             <p className="text-gray-400 font-medium text-sm">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreView;
