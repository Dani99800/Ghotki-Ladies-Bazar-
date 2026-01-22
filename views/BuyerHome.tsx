
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Sparkles, TrendingUp, Star, LayoutGrid, Heart, ShoppingCart } from 'lucide-react';
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

      {/* New Arrivals */}
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
          user={user || null} 
        />
      )}
    </div>
  );
};

export default BuyerHome;
