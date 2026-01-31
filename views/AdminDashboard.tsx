
import React, { useState, useEffect } from 'react';
import { 
  Store, Shield, TrendingUp, AlertCircle, Loader2, Check, Star, StarOff, 
  ImageIcon, UploadCloud, ArrowUp, ArrowDown, Plus, CreditCard, Gem, Crown,
  LayoutDashboard, Sparkles, Palette, ChevronUp, ChevronDown
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

  useEffect(() => {
    console.log("Admin Dashboard Shops Count:", shops.length);
  }, [shops]);

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

  const totalGMV = orders.reduce((acc, o) => acc + o.total, 0);
  const totalPlatformFees = orders.length * 1000;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">Admin Control</h1>
          <p className="text-[10px] font-black text-pink-600 uppercase tracking-[0.2em]">Marketplace Governance</p>
        </div>
        <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 shadow-inner">
          <Shield className="w-7 h-7" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 p-8 rounded-[3rem] text-white space-y-4 shadow-2xl relative overflow-hidden group">
          <TrendingUp className="absolute -top-4 -right-4 p-6 opacity-10 w-32 h-32 group-hover:scale-110 transition-transform" />
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Market GMV</p>
          <p className="text-4xl font-black italic tracking-tighter">PKR {totalGMV.toLocaleString()}</p>
        </div>
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-pink-600">Platform Revenue</p>
          <p className="text-4xl font-black italic tracking-tighter text-gray-900">PKR {totalPlatformFees.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-gray-200 rounded-[2.5rem] max-sm:max-w-xs mx-auto shadow-inner overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveAdminTab('SHOPS')} className={`flex-1 py-4 px-6 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeAdminTab === 'SHOPS' ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}>
          <Store className="w-4 h-4" /> Shops
        </button>
        <button onClick={() => setActiveAdminTab('CATEGORIES')} className={`flex-1 py-4 px-6 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeAdminTab === 'CATEGORIES' ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}>
          <LayoutDashboard className="w-4 h-4" /> Market
        </button>
        <button onClick={() => setActiveAdminTab('THEME')} className={`flex-1 py-4 px-6 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeAdminTab === 'THEME' ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}>
          <Palette className="w-4 h-4" /> Theme
        </button>
      </div>

      {activeAdminTab === 'SHOPS' && (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-3 text-gray-900">
              <Store className="w-5 h-5 text-pink-500" /> Merchant List
            </h2>
            <div className="flex items-center gap-3">
               <span className="text-[8px] font-black text-gray-400 uppercase">Total: {shops.length}</span>
               <button onClick={() => refreshData?.()} className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100"><ArrowUp className="w-3 h-3 text-gray-400" /></button>
            </div>
          </div>
          
          <div className="space-y-5">
            {shops.length === 0 ? (
              <div className="py-20 text-center space-y-4 border border-dashed border-gray-100 rounded-[2.5rem]">
                <AlertCircle className="w-10 h-10 text-gray-200 mx-auto" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No shops found in database</p>
              </div>
            ) : (
              [...shops].sort((a,b) => (b.sort_priority || 0) - (a.sort_priority || 0)).map(shop => (
                <div key={shop.id} className="p-6 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 flex flex-col gap-6 relative overflow-hidden group">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <img src={shop.logo} className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-md bg-white" />
                        <div>
                            <p className="font-black text-base text-gray-900 leading-tight mb-1">{shop.name}</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{shop.bazaar}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[8px] font-black text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full uppercase">Priority: {shop.sort_priority || 0}</span>
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${shop.status === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>{shop.status}</span>
                            </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-1 mr-2">
                          <button 
                            onClick={() => updatePriority(shop.id, shop.sort_priority || 0, 1)}
                            className="p-2 bg-white rounded-lg border border-gray-100 text-gray-400 hover:text-pink-600 shadow-sm transition-all active:scale-90"
                            title="Move Up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => updatePriority(shop.id, shop.sort_priority || 0, -1)}
                            className="p-2 bg-white rounded-lg border border-gray-100 text-gray-400 hover:text-pink-600 shadow-sm transition-all active:scale-90"
                            title="Move Down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>

                        <button onClick={() => toggleFeatured(shop)} className={`p-4 rounded-2xl border-2 transition-all ${shop.featured ? 'bg-pink-100 text-pink-600 border-pink-200' : 'bg-white text-gray-300 border-gray-100'}`}>
                          {shop.featured ? <Star className="w-5 h-5 fill-pink-600" /> : <StarOff className="w-5 h-5" />}
                        </button>
                        <button onClick={() => updateStatus(shop.id, shop.status === 'APPROVED' ? 'SUSPENDED' : 'APPROVED')} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest ${shop.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                          {loadingId === shop.id ? <Loader2 className="w-3 h-3 animate-spin" /> : (shop.status === 'APPROVED' ? 'Suspend' : 'Approve')}
                        </button>
                      </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeAdminTab === 'THEME' && (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
           <div className="flex items-center gap-3 px-2">
              <Palette className="w-6 h-6 text-pink-500" />
              <div>
                <h2 className="font-black text-sm uppercase tracking-widest text-gray-900 leading-none">Market Theme & Events</h2>
                <p className="text-[8px] font-black text-pink-600 uppercase tracking-widest mt-1">Global Festive Visual Switch</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {PK_EVENTS.map(event => (
                <div 
                  key={event.id} 
                  className={`p-6 rounded-[2.5rem] border-2 transition-all relative overflow-hidden ${activeEvent.id === event.id ? 'border-gray-900 shadow-2xl scale-[1.02]' : 'border-gray-100 hover:border-pink-200 cursor-pointer'}`}
                  onClick={() => onUpdateEvent(event)}
                >
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <span className="text-6xl">{event.emoji}</span>
                  </div>
                  
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: event.primaryColor }} />
                      <h3 className="font-black uppercase text-sm tracking-tighter text-gray-900">{event.name}</h3>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="urdu-font text-xl font-medium text-gray-700">{event.urduName}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{event.bannerText}</p>
                    </div>

                    <button 
                      className={`w-full py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeEvent.id === event.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {activeEvent.id === event.id ? 'Active Theme' : 'Activate Theme'}
                    </button>
                  </div>

                  {activeEvent.id === event.id && (
                    <div className="absolute top-4 right-4 bg-green-500 w-2 h-2 rounded-full animate-ping" />
                  )}
                </div>
              ))}
           </div>
        </div>
      )}

      {activeAdminTab === 'CATEGORIES' && (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
           <div className="grid grid-cols-1 gap-5">
              {categories.map(cat => (
                <div key={cat.id} className="p-5 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <img src={cat.image_url} className="w-20 h-20 rounded-[1.5rem] object-cover border-2 border-white shadow-sm" />
                      <p className="font-black uppercase text-sm tracking-tighter text-gray-900">{cat.name}</p>
                   </div>
                   <label className="cursor-pointer p-4 bg-white rounded-2xl shadow-sm hover:text-pink-600">
                      <UploadCloud className="w-5 h-5" />
                      <input type="file" className="hidden" accept="image/*" />
                   </label>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
