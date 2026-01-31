
import React, { useState } from 'react';
/* Added missing LayoutGrid import */
import { 
  Store, Shield, TrendingUp, AlertCircle, Loader2, Check, Star, StarOff, 
  ImageIcon, UploadCloud, ArrowUp, ArrowDown, Plus, CreditCard, Gem, Crown,
  LayoutDashboard, Sparkles, Palette, ChevronUp, ChevronDown, Clock, Flame, Image as LucideImage, Edit, LayoutGrid
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

  // Sort pending shops to the very top so Admin always sees new registrations
  const sortedShops = [...shops].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
    return (b.sort_priority || 0) - (a.sort_priority || 0);
  });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">Admin Control</h1>
          <p className="text-[10px] font-black text-pink-600 uppercase tracking-[0.2em]">Marketplace Governance</p>
        </div>
        <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 shadow-inner">
          <Shield className="w-7 h-7" />
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
            <div className="flex items-center gap-3">
               <span className="text-[8px] font-black text-gray-400 uppercase">Total: {shops.length}</span>
               <button onClick={() => refreshData?.()} className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <RefreshCw className="w-3 h-3 text-gray-400" />
               </button>
            </div>
          </div>
          
          <div className="space-y-5">
            {sortedShops.length === 0 ? (
              <div className="py-20 text-center space-y-4 border border-dashed border-gray-100 rounded-[2.5rem]">
                <AlertCircle className="w-10 h-10 text-gray-200 mx-auto" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No shops in database</p>
              </div>
            ) : (
              sortedShops.map(shop => (
                <div key={shop.id} className={`p-6 rounded-[2.5rem] border transition-all flex flex-col gap-6 relative overflow-hidden group ${shop.status === 'PENDING' ? 'bg-pink-50/30 border-pink-200' : 'bg-gray-50/50 border-gray-100'}`}>
                  {shop.status === 'PENDING' && (
                    <div className="absolute top-0 right-0 p-3 bg-pink-600 text-white text-[7px] font-black uppercase tracking-widest rounded-bl-2xl flex items-center gap-1.5 animate-pulse">
                      <Clock className="w-2.5 h-2.5" /> Needs Review
                    </div>
                  )}
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <img src={shop.logo} className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-md bg-white" />
                        <div>
                            <p className="font-black text-base text-gray-900 leading-tight mb-1">{shop.name}</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{shop.bazaar}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${shop.status === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>{shop.status}</span>
                              {shop.featured && <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase bg-yellow-100 text-yellow-700 flex items-center gap-1"><Flame className="w-2.5 h-2.5" /> Trending</span>}
                            </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Priority Controls */}
                        <div className="flex flex-col items-center bg-white rounded-xl p-1 border border-gray-100">
                           <button onClick={() => updatePriority(shop.id, shop.sort_priority || 0, 1)} className="p-1 hover:text-pink-600"><ChevronUp className="w-4 h-4" /></button>
                           <span className="text-[10px] font-black text-gray-900">{shop.sort_priority || 0}</span>
                           <button onClick={() => updatePriority(shop.id, shop.sort_priority || 0, -1)} className="p-1 hover:text-pink-600"><ChevronDown className="w-4 h-4" /></button>
                        </div>
                        
                        <button onClick={() => toggleFeatured(shop)} className={`p-4 rounded-2xl transition-all ${shop.featured ? 'bg-yellow-400 text-white shadow-lg' : 'bg-white text-gray-300 border border-gray-100'}`}>
                          <Flame className="w-5 h-5" />
                        </button>

                        <button onClick={() => updateStatus(shop.id, shop.status === 'APPROVED' ? 'SUSPENDED' : 'APPROVED')} className={`px-6 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${shop.status === 'APPROVED' ? 'bg-red-50 text-red-600' : 'bg-pink-600 text-white shadow-lg'}`}>
                          {loadingId === shop.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (shop.status === 'APPROVED' ? 'Suspend' : 'Approve')}
                        </button>
                      </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeAdminTab === 'CATEGORIES' && (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-3 text-gray-900">
              <LayoutGrid className="w-5 h-5 text-pink-500" /> Catalog Categories
            </h2>
            <button className="bg-gray-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
               <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="bg-gray-50 p-4 rounded-[2rem] border border-gray-100 flex items-center gap-4 group">
                 <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                    <img src={cat.image_url} className="w-full h-full object-cover" alt={cat.name} />
                 </div>
                 <div className="flex-1">
                    <h3 className="font-black text-sm text-gray-900 uppercase italic leading-tight">{cat.name}</h3>
                    <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">ID: {cat.id}</p>
                 </div>
                 <button className="p-3 bg-white text-gray-300 rounded-xl hover:text-pink-600 hover:shadow-md transition-all">
                    <Edit className="w-4 h-4" />
                 </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Theme/Event Tab */}
      {activeAdminTab === 'THEME' && (
         <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
            <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-3 text-gray-900">
              <Sparkles className="w-5 h-5 text-pink-500" /> Marketplace Theme
            </h2>
            <div className="grid grid-cols-2 gap-3">
               {PK_EVENTS.map(event => (
                  <button 
                    key={event.id}
                    onClick={() => onUpdateEvent(event)}
                    className={`p-6 rounded-[2.5rem] border-2 transition-all text-left flex flex-col gap-2 ${activeEvent.id === event.id ? 'border-pink-600 bg-pink-50 shadow-lg' : 'border-gray-50 bg-gray-50/30'}`}
                  >
                     <span className="text-2xl">{event.emoji}</span>
                     <h3 className="font-black text-xs uppercase text-gray-900">{event.name}</h3>
                     <p className="urdu-font text-lg text-gray-400">{event.urduName}</p>
                  </button>
               ))}
            </div>
         </div>
      )}
    </div>
  );
};

// Simple Refresh component
const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);

export default AdminDashboard;
