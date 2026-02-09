
import React, { useState } from 'react';
import { 
  Store, Shield, Loader2, Check, ArrowUp, ArrowDown, Plus, 
  Sparkles, Palette, ChevronUp, ChevronDown, RefreshCw, ShoppingBag, LayoutGrid, Star, Trophy
} from 'lucide-react';
import { Shop, Order, Category, AppEvent } from '../types';
import { supabase } from '../services/supabase';
import { PK_EVENTS } from '../constants';

interface AdminDashboardProps {
  shops: Shop[];
  setShops: (shops: Shop[]) => void;
  orders: Order[];
  categories: Category[];
  refreshData?: () => Promise<void>;
  activeEvent: AppEvent;
  onUpdateEvent: (e: AppEvent) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  shops, setShops, orders, categories, refreshData, activeEvent, onUpdateEvent 
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<'SHOPS' | 'CATEGORIES' | 'THEME'>('SHOPS');

  const updateShopField = async (id: string, field: string, value: any) => {
    if (!supabase) return;
    setLoadingId(id + field);
    try {
      const { error } = await supabase.from('shops').update({ [field]: value }).eq('id', id);
      if (error) throw error;
      if (refreshData) await refreshData();
    } catch (err: any) {
      alert(`Update ${field} Failed: ` + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const adjustPriority = async (shop: Shop, delta: number) => {
    const current = Number(shop.sort_priority) || 0;
    await updateShopField(shop.id, 'sort_priority', current + delta);
  };

  const sortedShops = [...shops].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
    const prioA = Number(a.sort_priority) || 0;
    const prioB = Number(b.sort_priority) || 0;
    if (prioA !== prioB) return prioB - prioA;
    return (a.name || '').localeCompare(b.name || '');
  });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">Bazaar Admin</h1>
          <p className="text-[10px] font-black text-pink-600 uppercase tracking-[0.2em]">Platform Authority</p>
        </div>
        <div className="w-16 h-16 bg-pink-100 rounded-[2rem] flex items-center justify-center text-pink-600 shadow-inner"><Shield className="w-8 h-8" /></div>
      </div>

      <div className="flex gap-2 p-1.5 bg-gray-200 rounded-[2.5rem]">
        {[
          { id: 'SHOPS', icon: Store, label: 'Merchants' },
          { id: 'CATEGORIES', icon: LayoutGrid, label: 'Categories' },
          { id: 'THEME', icon: Palette, label: 'Theme' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveAdminTab(tab.id as any)} 
            className={`flex-1 py-4 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeAdminTab === tab.id ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeAdminTab === 'SHOPS' && (
        <div className="space-y-4">
          {sortedShops.map((shop) => (
            <div key={shop.id} className="bg-white p-6 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-xl hover:border-pink-50">
               <div className="flex items-center gap-5 flex-1 min-w-0">
                  <div className="relative">
                    <img src={shop.logo} className="w-16 h-16 rounded-[1.8rem] object-cover bg-gray-50 shadow-inner border-2 border-white" />
                    {shop.is_top_seller && <div className="absolute -top-2 -right-2 bg-pink-600 text-white p-1.5 rounded-xl shadow-lg border-2 border-white animate-bounce"><Trophy className="w-3 h-3" /></div>}
                  </div>
                  <div className="truncate">
                    <p className="font-black text-base uppercase italic text-gray-900 truncate tracking-tight">{shop.name}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{shop.category}</p>
                       <span className={`text-[8px] font-black px-3 py-1 rounded-lg uppercase tracking-[0.2em] shadow-sm ${shop.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                         {shop.status}
                       </span>
                    </div>
                  </div>
               </div>

               <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-[2rem]">
                  {/* Ranking Logic */}
                  <div className="flex flex-col gap-1 mr-3 border-r pr-3 border-gray-200">
                    <button onClick={() => adjustPriority(shop, 1)} className="p-1.5 bg-white rounded-lg text-gray-400 hover:text-pink-600 hover:shadow-sm transition-all active:scale-90"><ChevronUp className="w-4 h-4" /></button>
                    <span className="text-[11px] font-black text-center text-gray-900">{shop.sort_priority || 0}</span>
                    <button onClick={() => adjustPriority(shop, -1)} className="p-1.5 bg-white rounded-lg text-gray-400 hover:text-pink-600 hover:shadow-sm transition-all active:scale-90"><ChevronDown className="w-4 h-4" /></button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateShopField(shop.id, 'featured', !shop.featured)}
                      className={`p-4 rounded-2xl transition-all border-2 ${shop.featured ? 'bg-orange-500 text-white border-orange-600 shadow-lg' : 'bg-white text-gray-300 border-gray-100'}`}
                      title="Trending Star"
                    >
                      <Star className={`w-5 h-5 ${shop.featured ? 'fill-white' : ''}`} />
                    </button>

                    <button 
                      onClick={() => updateShopField(shop.id, 'is_top_seller', !shop.is_top_seller)}
                      className={`p-4 rounded-2xl transition-all border-2 ${shop.is_top_seller ? 'bg-pink-600 text-white border-pink-700 shadow-lg' : 'bg-white text-gray-300 border-gray-100'}`}
                      title="Top Seller Badge"
                    >
                      <Trophy className="w-5 h-5" />
                    </button>

                    <button 
                      onClick={() => updateShopField(shop.id, 'status', shop.status === 'APPROVED' ? 'SUSPENDED' : 'APPROVED')}
                      className={`px-6 py-4 rounded-[1.5rem] text-[9px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all ${shop.status === 'APPROVED' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-600 text-white'}`}
                    >
                      {shop.status === 'APPROVED' ? 'Halt' : 'Go'}
                    </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {activeAdminTab === 'CATEGORIES' && (
        <div className="grid grid-cols-2 gap-5 animate-in slide-in-from-bottom-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white p-5 rounded-[3rem] border border-gray-100 flex items-center gap-5 shadow-sm hover:shadow-xl transition-all">
               <img src={cat.image_url} className="w-16 h-16 rounded-[1.5rem] object-cover shadow-inner border-2 border-white" />
               <p className="font-black uppercase italic text-gray-900 text-[10px] tracking-widest">{cat.name}</p>
            </div>
          ))}
        </div>
      )}

      {activeAdminTab === 'THEME' && (
        <div className="grid grid-cols-2 gap-5 animate-in slide-in-from-bottom-4">
           {PK_EVENTS.map(event => (
              <button key={event.id} onClick={() => onUpdateEvent(event)} className={`p-8 rounded-[3rem] border-2 transition-all text-left group ${activeEvent.id === event.id ? 'border-pink-600 bg-pink-50 shadow-2xl shadow-pink-100' : 'border-gray-100 bg-white hover:border-pink-200'}`}>
                 <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">{event.emoji}</span>
                 <p className="font-black text-[11px] uppercase text-gray-900 tracking-[0.2em] leading-none mb-2">{event.name}</p>
                 <p className="urdu-font text-2xl text-gray-400 group-hover:text-pink-600 transition-colors">{event.urduName}</p>
                 {activeEvent.id === event.id && <div className="mt-5 bg-pink-600 h-1.5 w-12 rounded-full shadow-lg" />}
              </button>
           ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
