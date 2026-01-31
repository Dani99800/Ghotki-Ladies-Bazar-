
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, ChevronRight, AlertCircle, ShoppingBag } from 'lucide-react';
import { Shop } from '../types';

interface ShopsListViewProps {
  shops: Shop[];
  lang: 'EN' | 'UR';
}

const ShopsListView: React.FC<ShopsListViewProps> = ({ shops, lang }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = shops
    .filter(s => {
      const status = s.status?.toString().trim().toUpperCase();
      const isApproved = status === 'APPROVED';
      const matchesSearch = (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (s.category || '').toLowerCase().includes(searchTerm.toLowerCase());
      return isApproved && matchesSearch;
    })
    .sort((a, b) => {
      // 1. Sort by Admin Priority (Higher values come first)
      const priorityA = Number(a.sort_priority) || 0;
      const priorityB = Number(b.sort_priority) || 0;
      if (priorityA !== priorityB) return priorityB - priorityA;

      // 2. Fallback to alphabetical
      return (a.name || '').localeCompare(b.name || '');
    });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-32 animate-in fade-in duration-500">
      <div className="text-center space-y-2 py-4">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">Marketplace</h1>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Premium Partner Selection</p>
      </div>

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

      {filtered.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-gray-100 shadow-inner">
           <AlertCircle className="w-16 h-16 text-gray-100 mx-auto mb-4" />
           <p className="font-black uppercase text-sm text-gray-400 tracking-widest">No boutiques found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((shop, index) => {
            const isPremium = shop.subscription_tier === 'PREMIUM';
            const showBag = shop.is_top_seller;
            return (
              <div 
                key={shop.id} 
                onClick={() => navigate(`/shop/${shop.id}`)}
                className={`group bg-white p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer flex gap-5 items-center relative overflow-hidden active:scale-95 shadow-sm ${isPremium ? 'border-pink-500 ring-4 ring-pink-50 shadow-xl' : 'border-transparent hover:border-gray-100 hover:shadow-lg'}`}
              >
                {showBag && (
                  <div className="absolute top-0 right-0 bg-pink-600 text-white text-[7px] font-black uppercase px-4 py-1.5 rounded-bl-[1.5rem] flex items-center gap-1.5 shadow-md z-10 animate-pulse">
                    <ShoppingBag className="w-3 h-3" /> Top Seller
                  </div>
                )}
                
                <div className="relative flex-shrink-0">
                  <img src={shop.logo} className="w-20 h-20 rounded-[1.8rem] object-cover border-2 border-gray-50 group-hover:scale-105 transition-transform bg-white shadow-inner" alt={shop.name} />
                  <div className="absolute -bottom-2 -right-2 bg-gray-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] border-2 border-white shadow-lg">
                    #{index + 1}
                  </div>
                </div>

                <div className="flex-1 space-y-1 overflow-hidden">
                   <div className="flex items-center gap-2">
                      <h3 className="font-black text-lg uppercase italic tracking-tighter text-gray-900 truncate leading-none">
                        <span className="text-pink-600 mr-1">{index + 1}.</span> {shop.name}
                      </h3>
                      {isPremium && <Star className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />}
                   </div>
                   <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-black uppercase tracking-widest truncate">
                      <MapPin className="w-3.5 h-3.5 text-pink-400" /> {shop.bazaar}
                   </div>
                   <div className="pt-2">
                      <span className={`text-[8px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border ${isPremium ? 'bg-pink-100 text-pink-600 border-pink-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                        {shop.subscription_tier}
                      </span>
                   </div>
                </div>
                <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 group-hover:bg-pink-600 group-hover:text-white transition-all shadow-sm">
                   <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShopsListView;
