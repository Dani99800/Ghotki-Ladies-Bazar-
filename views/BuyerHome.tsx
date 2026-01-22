
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Sparkles, TrendingUp, Star, LayoutGrid, Heart, ShoppingCart } from 'lucide-react';
import { Shop, Product } from '../types';
import { BAZAARS, CATEGORIES } from '../constants';

interface BuyerHomeProps {
  shops: Shop[];
  products: Product[];
  lang: 'EN' | 'UR';
}

const BuyerHome: React.FC<BuyerHomeProps> = ({ shops, products, lang }) => {
  const navigate = useNavigate();
  const [selectedBazaar, setSelectedBazaar] = useState<string>('All');
  const [activeCategory, setActiveCategory] = useState<string>('All');

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

      {/* Bazaar Horizontal Scroll */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-pink-500" />
          <h2 className="font-bold text-lg">{t.bazaars}</h2>
        </div>
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
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

      {/* Categories Grid */}
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

      {/* Featured Shops */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-pink-500 fill-pink-500" />
            <h2 className="font-bold text-lg">{t.featured}</h2>
          </div>
          <button onClick={() => navigate('/shops')} className="text-pink-600 text-sm font-semibold">View All</button>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
          {filteredShops.map(shop => (
            <div 
              key={shop.id}
              onClick={() => navigate(`/shop/${shop.id}`)}
              className="flex-shrink-0 w-48 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl overflow-hidden border">
                <img src={shop.logo} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-center font-bold text-sm truncate">{shop.name}</h3>
              <p className="text-center text-[10px] text-gray-500 mb-2 truncate">{shop.bazaar}</p>
              <div className="flex justify-center">
                 <span className="bg-pink-50 text-pink-600 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Verified Shop</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-pink-500" />
          <h2 className="font-bold text-lg">{t.trending}</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {trendingProducts.map(product => (
            <div 
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute top-2 right-2">
                  <button className="p-1.5 bg-white/80 backdrop-blur rounded-full text-pink-600">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                {product.tags.map(tag => (
                   <span key={tag} className="absolute top-2 left-2 bg-pink-600 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-tighter">
                     {tag}
                   </span>
                ))}
              </div>
              <div className="p-3">
                <h4 className="text-xs text-gray-500 truncate mb-1">
                  {shops.find(s => s.id === product.shopId)?.name}
                </h4>
                <h3 className="font-bold text-sm truncate mb-1">{product.name}</h3>
                <div className="flex items-center justify-between">
                   <span className="text-pink-600 font-bold text-sm">PKR {product.price.toLocaleString()}</span>
                   <button className="bg-gray-50 p-1 rounded-lg">
                      <ShoppingCart className="w-4 h-4 text-gray-400" />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals List */}
      <section className="pb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-pink-500" />
          <h2 className="font-bold text-lg">{t.new}</h2>
        </div>
        <div className="space-y-4">
          {newArrivals.map(product => (
            <div 
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm cursor-pointer"
            >
              <img src={product.images[0]} className="w-20 h-20 object-cover rounded-xl" />
              <div className="flex-1">
                <h4 className="font-bold text-sm">{product.name}</h4>
                <p className="text-xs text-gray-500 mb-1">{shops.find(s => s.id === product.shopId)?.name}</p>
                <span className="text-pink-600 font-bold">PKR {product.price}</span>
              </div>
              <button className="bg-pink-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md">
                Buy
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BuyerHome;
