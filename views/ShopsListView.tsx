
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, MapPin, Star, ChevronRight, Store } from 'lucide-react';
import { Shop } from '../types';
import { BAZAARS } from '../constants';

interface ShopsListViewProps {
  shops: Shop[];
  lang: 'EN' | 'UR';
}

const ShopsListView: React.FC<ShopsListViewProps> = ({ shops, lang }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBazaar, setSelectedBazaar] = useState('All');

  const filtered = shops.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBazaar = selectedBazaar === 'All' || s.bazaar === selectedBazaar;
    return matchesSearch && matchesBazaar && s.status === 'APPROVED';
  });

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Ghotki Marketplace</h1>
        <p className="text-gray-400 text-sm font-black uppercase tracking-widest">Digitizing our local legacy</p>
      </div>

      <div className="max-w-xl mx-auto relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Find your favorite shop..."
          className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm focus:ring-4 focus:ring-pink-100 outline-none transition-all font-medium text-lg"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar justify-center">
        <button 
          onClick={() => setSelectedBazaar('All')}
          className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedBazaar === 'All' ? 'bg-pink-600 text-white shadow-xl shadow-pink-200' : 'bg-white text-gray-400 border border-gray-100'}`}
        >
          All City Bazaars
        </button>
        {BAZAARS.map(b => (
          <button 
            key={b}
            onClick={() => setSelectedBazaar(b)}
            className={`whitespace-nowrap px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedBazaar === b ? 'bg-pink-600 text-white shadow-xl shadow-pink-200' : 'bg-white text-gray-400 border border-gray-100'}`}
          >
            {b}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {filtered.map(shop => (
          <div 
            key={shop.id}
            onClick={() => navigate(`/shop/${shop.id}`)}
            className="group bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col"
          >
            {/* Shop Banner / Header */}
            <div className="relative h-48 overflow-hidden">
               <img 
                 src={shop.banner} 
                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                 alt={shop.name} 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
               <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={shop.logo} 
                      className="w-14 h-14 rounded-2xl border-4 border-white shadow-lg object-cover bg-white" 
                      alt={shop.name}
                    />
                    <div className="text-white">
                      <h3 className="font-black text-lg leading-tight drop-shadow-md">{shop.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{shop.category}</p>
                    </div>
                  </div>
               </div>
            </div>

            {/* Shop Content */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
               <div className="space-y-2">
                 <div className="flex items-center gap-2 text-pink-600">
                   <MapPin className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase tracking-widest">{shop.bazaar}</span>
                 </div>
                 <p className="text-gray-500 text-xs font-medium line-clamp-2 leading-relaxed">
                   {shop.bio || 'Premium collections available for our local customers in Ghotki.'}
                 </p>
               </div>

               <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-pink-500 fill-pink-500" />
                    <Star className="w-3 h-3 text-pink-500 fill-pink-500" />
                    <Star className="w-3 h-3 text-pink-500 fill-pink-500" />
                    <Star className="w-3 h-3 text-pink-500 fill-pink-500" />
                    <Star className="w-3 h-3 text-pink-500 fill-pink-500" />
                    <span className="text-[9px] font-black text-gray-300 ml-1">5.0</span>
                  </div>
                  <div className="flex items-center gap-1 text-pink-600 font-black text-[10px] uppercase tracking-tighter">
                    Enter Shop <ChevronRight className="w-4 h-4" />
                  </div>
               </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-24 text-center space-y-6">
             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                <Store className="w-12 h-12" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-gray-900">No shops found</h3>
                <p className="text-gray-500">Try searching for something else or explore all bazaars.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopsListView;
