
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, ChevronRight, Sparkles } from 'lucide-react';
import { Shop } from '../types';

interface ShopsListViewProps {
  shops: Shop[];
  lang: 'EN' | 'UR';
}

const ShopsListView: React.FC<ShopsListViewProps> = ({ shops, lang }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const tierWeight = { 'PREMIUM': 3, 'STANDARD': 2, 'BASIC': 1, 'NONE': 0 };

  const filtered = shops
    .filter(s => {
      const matchesStatus = s.status === 'APPROVED';
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => (tierWeight[b.subscription_tier] || 0) - (tierWeight[a.subscription_tier] || 0));

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-24">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">Marketplace</h1>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Premium Partner Selection</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
        <input 
          type="text" 
          placeholder="Search shops or categories..." 
          className="w-full pl-12 pr-6 py-5 bg-white border border-gray-100 rounded-3xl shadow-sm outline-none transition-all focus:ring-2 focus:ring-pink-500/20"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(shop => {
          const isPremium = shop.subscription_tier === 'PREMIUM';
          return (
            <div 
              key={shop.id} 
              onClick={() => navigate(`/shop/${shop.id}`)}
              className={`group bg-white p-5 rounded-[2.5rem] border-2 transition-all cursor-pointer flex gap-5 items-center relative overflow-hidden ${isPremium ? 'border-pink-500 shadow-xl shadow-pink-100' : 'border-transparent shadow-sm hover:border-gray-100'}`}
            >
              {isPremium && (
                <div className="absolute top-0 right-0 bg-pink-500 text-white text-[7px] font-black uppercase px-3 py-1 rounded-bl-xl flex items-center gap-1">
                  <Sparkles className="w-2 h-2" /> Top Partner
                </div>
              )}
              
              <div className="relative">
                <img src={shop.logo} className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-50 group-hover:scale-105 transition-transform" />
              </div>

              <div className="flex-1 space-y-1">
                 <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm uppercase italic tracking-tight text-gray-900">{shop.name}</h3>
                    {isPremium && <Star className="w-3 h-3 text-pink-500 fill-pink-500" />}
                 </div>
                 <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase">
                    <MapPin className="w-3 h-3" /> {shop.bazaar}
                 </div>
                 <div className="pt-2">
                    <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${isPremium ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-400'}`}>
                      {shop.subscription_tier} MEMBER
                    </span>
                 </div>
              </div>
              <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isPremium ? 'text-pink-500' : 'text-gray-200'}`} />
            </div>
          );
        })}
      </div>
      
      {filtered.length === 0 && (
        <div className="py-20 text-center text-gray-400 font-black uppercase text-xs">No shops found matching your search</div>
      )}
    </div>
  );
};

export default ShopsListView;
