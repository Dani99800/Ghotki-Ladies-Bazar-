
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, ChevronRight } from 'lucide-react';
import { Shop } from '../types';

interface ShopsListViewProps {
  shops: Shop[];
  lang: 'EN' | 'UR';
}

const ShopsListView: React.FC<ShopsListViewProps> = ({ shops, lang }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const tierOrder = { 'PREMIUM': 3, 'STANDARD': 2, 'BASIC': 1, 'NONE': 0 };

  const filtered = shops
    .filter(s => s.status === 'APPROVED' && s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (tierOrder[b.subscription_tier as keyof typeof tierOrder] || 0) - (tierOrder[a.subscription_tier as keyof typeof tierOrder] || 0));

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-24">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Marketplace</h1>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Premium Vendors First</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
        <input 
          type="text" 
          placeholder="Search shops..." 
          className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(shop => (
          <div 
            key={shop.id} 
            onClick={() => navigate(`/shop/${shop.id}`)}
            className={`bg-white p-4 rounded-[2rem] border-2 transition-all cursor-pointer flex gap-4 items-center ${shop.subscription_tier === 'PREMIUM' ? 'border-pink-500 shadow-xl' : 'border-gray-50 shadow-sm'}`}
          >
            <img src={shop.logo} className="w-20 h-20 rounded-2xl object-cover border" />
            <div className="flex-1">
               <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm uppercase italic">{shop.name}</h3>
                  {shop.subscription_tier === 'PREMIUM' && <Star className="w-3 h-3 text-pink-500 fill-pink-500" />}
               </div>
               <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">{shop.bazaar}</p>
               <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase ${shop.subscription_tier === 'PREMIUM' ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-400'}`}>
                 {shop.subscription_tier} Plan
               </span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopsListView;
