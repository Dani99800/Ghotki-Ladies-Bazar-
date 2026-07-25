
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, ChevronRight, AlertCircle, ShoppingBag, Filter, Trophy } from 'lucide-react';
import { Category, Shop } from '../types';
import { GHOTKI_LOCATIONS } from '../constants';

interface ShopsListViewProps {
  shops: Shop[];
  categories: Category[];
  lang: 'EN' | 'UR';
}

const ShopsListView: React.FC<ShopsListViewProps> = ({ shops, categories, lang }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'ALL'>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');

  const normalize = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '').replace(/s(?=clothes|footwear|wear|store|$)/g, '').trim();

  const filtered = shops
    .filter(s => {
      const status = s.status?.toString().trim().toUpperCase();
      const isApproved = status === 'APPROVED';
      const matchesSearch = (s.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const shopLoc = (s.city || s.address || s.bazaar || '').toLowerCase();
      const matchesLocation = selectedLocation === 'All' || shopLoc.includes(selectedLocation.toLowerCase());

      if (!isApproved || !matchesSearch || !matchesLocation) return false;
      if (selectedCategory === 'ALL') return true;
      
      const shopCatNorm = normalize(s.category || '');
      const selectedCatNorm = normalize(selectedCategory);
      const selectedCatObj = categories.find(c => c.id === selectedCategory);
      const selectedCatNameNorm = selectedCatObj ? normalize(selectedCatObj.name) : '';
      
      const matchesCategory = shopCatNorm === selectedCatNorm || 
                              (selectedCatNameNorm && shopCatNorm === selectedCatNameNorm);
                              
      return matchesCategory;
    })
    .sort((a, b) => {
      const priorityA = Number(a.sort_priority) || 0;
      const priorityB = Number(b.sort_priority) || 0;
      if (priorityA !== priorityB) return priorityB - priorityA;
      return (a.name || '').localeCompare(b.name || '');
    });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-32 animate-in fade-in duration-500">
      <div className="text-center space-y-2 py-4">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">Marketplace</h1>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Premium Partner Selection</p>
      </div>

      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-pink-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search boutiques by name..." 
            className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[2.2rem] shadow-sm outline-none transition-all focus:ring-4 focus:ring-pink-500/10 focus:border-pink-200 font-bold text-gray-800"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Location Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1 shrink-0 pl-1">
            <MapPin className="w-3 h-3 text-pink-600" /> City:
          </span>
          {GHOTKI_LOCATIONS.map(loc => (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border ${selectedLocation === loc ? 'bg-gray-900 border-gray-900 text-white shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
            >
              {loc}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button 
            onClick={() => setSelectedCategory('ALL')}
            className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${selectedCategory === 'ALL' ? 'bg-pink-600 border-pink-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-pink-200'}`}
          >
            All Shops
          </button>
          {categories.filter(c => !["men's footwear", "women's footwear", "costmatic", "cosmetics", "men's cloths", "men's clothes", "women's clothes", "footwear"].includes((c.name || '').toLowerCase().trim())).map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${selectedCategory === cat.id ? 'bg-pink-600 border-pink-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-pink-200'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-gray-100 shadow-inner">
           <AlertCircle className="w-16 h-16 text-gray-100 mx-auto mb-4" />
           <p className="font-black uppercase text-sm text-gray-400 tracking-widest">No boutiques found</p>
        </div>
      ) : (
        <div className="space-y-10">
          {selectedCategory === 'ALL' ? (
            <>
              {categories.map(cat => {
                const catNorm = normalize(cat.id);
                const catNameNorm = normalize(cat.name);
                
                const catShops = filtered.filter(s => {
                  const sCatNorm = normalize(s.category || '');
                  return sCatNorm === catNorm || sCatNorm === catNameNorm;
                });
                
                if (catShops.length === 0) return null;

                return (
                  <div key={cat.id} className="space-y-6">
                    <div className="flex items-center gap-4 px-2">
                      <div className="h-px flex-1 bg-gray-100"></div>
                      <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-pink-600 italic">{cat.name}</h2>
                      <div className="h-px flex-1 bg-gray-100"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                      {catShops.map((shop, index) => (
                        <ShopCard 
                          key={shop.id} 
                          shop={shop} 
                          index={index} 
                          navigate={navigate} 
                          isTopInCategory={index === 0} 
                          categoryName={cat.name}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((shop, index) => (
                <ShopCard 
                  key={shop.id} 
                  shop={shop} 
                  index={index} 
                  navigate={navigate} 
                  isTopInCategory={index === 0} 
                  categoryName={categories.find(c => normalize(c.id) === normalize(shop.category) || normalize(c.name) === normalize(shop.category))?.name || shop.category || 'Category'}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ShopCard: React.FC<{ shop: Shop, index: number, navigate: any, isTopInCategory?: boolean, categoryName?: string }> = ({ shop, index, navigate, isTopInCategory, categoryName }) => {
  const isPremium = shop.subscription_tier === 'PREMIUM';
  const isTopSeller = shop.is_top_seller;
  const isTrending = shop.featured;

  return (
    <div 
      onClick={() => navigate(`/shop/${shop.id}`)}
      className={`group bg-white p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border-2 transition-all cursor-pointer flex gap-3 md:gap-5 items-center relative overflow-hidden active:scale-95 shadow-sm ${isTopInCategory ? 'ring-2 ring-pink-500 ring-offset-4' : ''} ${isPremium ? 'border-pink-500 shadow-xl' : 'border-transparent hover:border-gray-100 hover:shadow-lg'}`}
    >
      {isTopInCategory && (
        <div className="absolute top-0 left-0 bg-gray-900 text-white text-[6px] font-black uppercase px-3 py-1 rounded-br-xl z-20 tracking-tighter">
          #1 in {categoryName || 'Category'}
        </div>
      )}

      {isTopSeller && (
        <div className="absolute top-0 right-0 bg-pink-600 text-white text-[6px] md:text-[7px] font-black uppercase px-3 py-1 md:px-4 md:py-1.5 rounded-bl-[1.5rem] flex items-center gap-1 md:gap-1.5 shadow-md z-10 animate-pulse">
          <Trophy className="w-2.5 md:w-3 h-2.5 md:h-3" /> Top Seller
        </div>
      )}
      {isTrending && !isTopSeller && (
        <div className="absolute top-0 right-0 bg-orange-500 text-white text-[6px] md:text-[7px] font-black uppercase px-3 py-1 md:px-4 md:py-1.5 rounded-bl-[1.5rem] flex items-center gap-1 md:gap-1.5 shadow-md z-10">
          <Star className="w-2.5 md:w-3 h-2.5 md:h-3 fill-white" /> Trending
        </div>
      )}
      
      <div className="relative flex-shrink-0">
        <img src={shop.logo || undefined} referrerPolicy="no-referrer" className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[1.8rem] object-cover border-2 border-gray-50 group-hover:scale-105 transition-transform bg-white shadow-inner" alt={shop.name} />
        <div className="absolute -bottom-1 -right-1 bg-gray-900 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-black text-[8px] md:text-[10px] border-2 border-white shadow-lg">
          #{index + 1}
        </div>
      </div>

      <div className="flex-1 space-y-0.5 md:space-y-1 overflow-hidden">
         <div className="flex items-center gap-2">
            <h3 className="font-black text-sm md:text-lg uppercase italic tracking-tighter text-gray-900 truncate leading-none">
              {shop.name}
            </h3>
            {isPremium && <Star className="w-3 md:w-3.5 h-3 md:h-3.5 text-pink-500 fill-pink-500" />}
         </div>
         <div className="flex items-center gap-1 md:gap-1.5 text-[8px] md:text-[9px] text-gray-400 font-black uppercase tracking-widest truncate">
            <MapPin className="w-3 md:w-3.5 h-3 md:h-3.5 text-pink-400" /> {shop.bazaar}
         </div>
         <div className="pt-1 md:pt-2 flex gap-1.5 md:gap-2">
            <span className={`text-[7px] md:text-[8px] font-black px-2 py-0.5 md:px-3 md:py-1 rounded-lg uppercase tracking-widest border ${isPremium ? 'bg-pink-100 text-pink-600 border-pink-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
              {shop.subscription_tier}
            </span>
            {isTrending && <span className="text-[7px] md:text-[8px] font-black px-2 py-0.5 md:px-3 md:py-1 rounded-lg uppercase tracking-widest bg-orange-100 text-orange-600 border border-orange-200">Trending</span>}
         </div>
      </div>
      <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-50 rounded-xl md:rounded-2xl flex items-center justify-center text-gray-200 group-hover:bg-pink-600 group-hover:text-white transition-all shadow-sm">
         <ChevronRight className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
};

export default ShopsListView;
