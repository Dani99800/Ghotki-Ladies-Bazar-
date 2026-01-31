
import React, { useState } from 'react';
import { 
  Store, Shield, TrendingUp, AlertCircle, Loader2, Check, Star, StarOff, 
  ImageIcon, UploadCloud, ArrowUp, ArrowDown, Plus, CreditCard, Gem, Crown,
  LayoutDashboard, Sparkles, Palette, ChevronUp, ChevronDown, Clock, Flame, Image as LucideImage, Edit, LayoutGrid, RefreshCw
} from 'lucide-react';
import { Shop, Order, Category, SubscriptionTier, AppEvent } from '../types';
import { supabase, uploadFile } from '../services/supabase';
import { SUBSCRIPTION_PLANS, PK_EVENTS } from '../constants';

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

  const updateStatus = async (id: string, status: string) => {
    if (!supabase) return;
    setLoadingId(id);
    try {
      const { error } = await supabase.from('shops').update({ status }).eq('id', id);
      if (error) throw error;
      if (refreshData) await refreshData();
    } catch (err: any) {
      alert("Status Update Failed: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const updatePriority = async (id: string, current: number, delta: number) => {
    if (!supabase) return;
    setLoadingId(id);
    try {
      const newPriority = Math.max(0, (current || 0) + delta);
      const { error } = await supabase.from('shops').update({ sort_priority: newPriority }).eq('id', id);
      if (error) throw error;
      if (refreshData) await refreshData();
    } catch (err: any) {
      alert("Priority Update Failed: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const toggleFeatured = async (shop: Shop) => {
    if (!supabase) return;
    setLoadingId(shop.id);
    try {
      const { error } = await supabase.from('shops').update({ featured: !shop.featured }).eq('id', shop.id);
      if (error) throw error;
      if (refreshData) await refreshData();
    } catch (err: any) {
      alert("Toggle Failed: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  // Sort: Pending always comes first to catch Admin's attention
  const sortedShops = [...shops].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
    return (b.sort_priority || 0) - (a.sort_priority || 0);
  });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">Admin Control</h1>
          <p className="text-[10px] font-black text-pink-600 uppercase tracking-[0.2em]">Marketplace Governance</p>
        </div>
        <div className="w-16 h-16 bg-pink-100 rounded-3xl flex items-center justify-center text-pink-600 shadow-inner">
          <Shield className="w-8 h-8" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-gray-200 rounded-[2.5rem] max-sm:max-w-xs mx-auto shadow-inner overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveAdminTab('SHOPS')} className={`flex-1 py-4 px-6 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeAdminTab === 'SHOPS' ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}>
          <Store className="w-4 h-4" /> Merchants
        </button>
        <button onClick={() => setActiveAdminTab('CATEGORIES')} className={`flex-1 py-4 px-6 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeAdminTab === 'CATEGORIES' ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}>
          <LayoutGrid className="w-4 h-4" /> Categories
        </button>
        <button onClick={() => setActiveAdminTab('THEME')} className={`flex-1 py-4 px-6 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeAdminTab === 'THEME' ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}>
          <Palette className="w-4 h-4" /> Theme
        </button>
      </div>

      {/* Merchants Tab */}
      {activeAdminTab === 'SHOPS' && (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-3 text-gray-900">
              <Store className="w-5 h-5 text-pink-500" /> Active Merchants
            </h2>
            <button 
              onClick={() => refreshData?.()} 
              className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all active:scale-90"
              title="Refresh Data"
            >
               <RefreshCw className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-6">
            {sortedShops.length === 0 ? (
              <div className="py-20 text-center border-4 border-dashed border-gray-50 rounded-[3rem]">
                <p className="text-gray-300 font-black uppercase tracking-widest text-xs">No merchants found</p>
              </div>
            ) : sortedShops.map(shop => (
              <div key={shop.id} className={`p-6 rounded-[2.5rem] border transition-all flex flex-col gap-6 relative overflow-hidden group ${shop.status === 'PENDING' ? 'bg-pink-50/50 border-pink-100 shadow-inner' : 'bg-gray-50/50 border-gray-100 shadow-sm'}`}>
                {shop.status === 'PENDING' && (
                  <div className="absolute top-0 right-0 p-3 bg-pink-600 text-white text-[7px] font-black uppercase tracking-widest rounded-bl-3xl flex items-center gap-1.5 animate-pulse z-10">
                    <Clock className="w-2.5 h-2.5" /> New Registration
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <img src={shop.logo} className="w-20 h-20 rounded-3xl object-cover border-4 border-white shadow-lg bg-white" />
                        {shop.featured && <div className="absolute -top-2 -right-2 bg-yellow-400 p-1.5 rounded-xl border-2 border-white shadow-md"><Flame className="w-3 h-3 text-white fill-white" /></div>}
                      </div>
                      <div>
                          <p className="font-black text-lg text-gray-900 leading-tight mb-1">{shop.name}</p>
                          <p className="text-[10px] font-black text-pink-500 uppercase tracking-[0.2em]">{shop.category} • {shop.bazaar}</p>
                          <div className="flex items-center gap-3 mt-3">
                            <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${shop.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{shop.status}</span>
                            <span className="text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-gray-200 text-gray-600">{shop.subscription_tier}</span>
                          </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      {/* Priority Controls */}
                      <div className="flex flex-col items-center bg-white rounded-2xl p-2 border border-gray-100 shadow-sm">
                         <button onClick={() => updatePriority(shop.id, shop.sort_priority || 0, 1)} className="p-1 hover:text-pink-600 transition-colors"><ChevronUp className="w-5 h-5" /></button>
                         <span className="text-[11px] font-black text-gray-900 my-1">{shop.sort_priority || 0}</span>
                         <button onClick={() => updatePriority(shop.id, shop.sort_priority || 0, -1)} className="p-1 hover:text-pink-600 transition-colors"><ChevronDown className="w-5 h-5" /></button>
                      </div>
                      
                      <button onClick={() => toggleFeatured(shop)} title="Toggle Trending" className={`p-5 rounded-2xl transition-all flex-1 md:flex-none flex justify-center ${shop.featured ? 'bg-yellow-400 text-white shadow-xl shadow-yellow-100' : 'bg-white text-gray-300 border border-gray-100'}`}>
                        <Flame className={`w-6 h-6 ${shop.featured ? 'fill-white' : ''}`} />
                      </button>

                      <button onClick={() => updateStatus(shop.id, shop.status === 'APPROVED' ? 'SUSPENDED' : 'APPROVED')} className={`px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex-1 md:flex-none ${shop.status === 'APPROVED' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-pink-600 text-white shadow-2xl shadow-pink-100'}`}>
                        {loadingId === shop.id ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (shop.status === 'APPROVED' ? 'Suspend' : 'Approve')}
                      </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeAdminTab === 'CATEGORIES' && (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-10 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-3 text-gray-900">
              <LayoutGrid className="w-5 h-5 text-pink-500" /> Catalog Categories
            </h2>
            <button className="bg-gray-900 text-white px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl active:scale-95 transition-all">
               <Plus className="w-4 h-4" /> New Category
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {categories.map(cat => (
              <div key={cat.id} className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100 flex items-center gap-5 group hover:bg-white hover:shadow-xl hover:border-pink-50 transition-all duration-500">
                 <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                    <img src={cat.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={cat.name} />
                 </div>
                 <div className="flex-1">
                    <h3 className="font-black text-base text-gray-900 uppercase italic leading-tight mb-1">{cat.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">ID: {cat.id}</p>
                 </div>
                 <button className="p-4 bg-white text-gray-300 rounded-2xl hover:text-pink-600 hover:shadow-lg transition-all border border-gray-50">
                    <Edit className="w-5 h-5" />
                 </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Theme/Event Tab */}
      {activeAdminTab === 'THEME' && (
         <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-10 animate-in slide-in-from-bottom-4">
            <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-3 text-gray-900">
              <Sparkles className="w-5 h-5 text-pink-500" /> Marketplace Season
            </h2>
            <div className="grid grid-cols-2 gap-4">
               {PK_EVENTS.map(event => (
                  <button 
                    key={event.id}
                    onClick={() => onUpdateEvent(event)}
                    className={`p-8 rounded-[3rem] border-4 transition-all text-left flex flex-col gap-3 relative overflow-hidden group ${activeEvent.id === event.id ? 'border-pink-600 bg-pink-50 shadow-2xl' : 'border-gray-50 bg-gray-50/30 hover:border-pink-200'}`}
                  >
                     <span className="text-4xl block group-hover:scale-110 transition-transform">{event.emoji}</span>
                     <div>
                        <h3 className="font-black text-xs uppercase text-gray-900">{event.name}</h3>
                        <p className="urdu-font text-2xl text-gray-400 mt-1">{event.urduName}</p>
                     </div>
                     {activeEvent.id === event.id && <div className="absolute top-4 right-6 bg-pink-600 text-white p-1 rounded-full"><Check className="w-3 h-3" /></div>}
                  </button>
               ))}
            </div>
         </div>
      )}
    </div>
  );
};

export default AdminDashboard;
