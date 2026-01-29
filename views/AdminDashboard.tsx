
import React, { useState } from 'react';
import { 
  Store, Shield, TrendingUp, AlertCircle, Loader2, Check, Star, StarOff, 
  ImageIcon, UploadCloud, ArrowUp, ArrowDown, Plus, CreditCard, Gem, Crown, Sparkles,
  ChevronRight, Calendar, Palette, LayoutDashboard
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
  activeEvent?: AppEvent;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ shops, setShops, orders, categories, refreshData, activeEvent }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  // Defaulting to EVENTS to make it immediately visible to the admin
  const [activeAdminTab, setActiveAdminTab] = useState<'SHOPS' | 'CATEGORIES' | 'EVENTS'>('EVENTS');
  const [newCatName, setNewCatName] = useState('');

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

  const setAppEvent = async (eventId: string) => {
    if (!supabase) return;
    setLoadingId('event_' + eventId);
    try {
      const { error } = await supabase.from('app_settings').upsert({
        key: 'active_event_id',
        value: eventId
      }, { onConflict: 'key' });
      if (error) throw error;
      if (refreshData) await refreshData();
      alert("Marketplace Theme Updated Successfully!");
    } catch (err: any) {
      alert("Event Update Failed: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const updatePlan = async (id: string, tier: SubscriptionTier) => {
    if (!supabase) return;
    setLoadingId(id);
    try {
      const { error } = await supabase.from('shops').update({ subscription_tier: tier }).eq('id', id);
      if (error) throw error;
      if (refreshData) await refreshData();
      alert(`Plan updated to ${tier} successfully!`);
    } catch (err: any) {
      alert("Plan Update Failed: " + err.message);
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

  const handleCategoryUpload = async (catId: string, file: File) => {
    if (!supabase) return;
    setLoadingId(catId);
    try {
      const path = `categories/${catId}_${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const url = await uploadFile('marketplace', path, file);
      
      const { error } = await supabase
        .from('categories')
        .update({ image_url: url })
        .eq('id', catId);

      if (error) throw error;
      
      if (refreshData) await refreshData();
      alert(`Category photo updated!`);
    } catch (err: any) {
      alert("Category upload failed: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleAddCategory = async () => {
    if (!supabase || !newCatName) return;
    setLoadingId('new_cat');
    try {
      const { error } = await supabase.from('categories').insert({
        name: newCatName,
        image_url: 'https://via.placeholder.com/400'
      });
      if (error) throw error;
      setNewCatName('');
      if (refreshData) await refreshData();
    } catch (err: any) {
      alert("Add Category Failed: " + err.message);
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
        <button onClick={() => setActiveAdminTab('EVENTS')} className={`flex-1 py-4 px-6 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeAdminTab === 'EVENTS' ? 'bg-white text-pink-600 shadow-lg scale-105' : 'text-gray-500 hover:text-gray-700'}`}>
          <Palette className="w-4 h-4" /> Event Center
        </button>
        <button onClick={() => setActiveAdminTab('SHOPS')} className={`flex-1 py-4 px-6 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeAdminTab === 'SHOPS' ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}>
          <Store className="w-4 h-4" /> Shops
        </button>
        <button onClick={() => setActiveAdminTab('CATEGORIES')} className={`flex-1 py-4 px-6 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeAdminTab === 'CATEGORIES' ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}>
          <LayoutDashboard className="w-4 h-4" /> Market
        </button>
      </div>

      {activeAdminTab === 'EVENTS' && (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
           <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-3 text-gray-900">
                  <Sparkles className="w-5 h-5 text-pink-500" /> Pakistani Event Center
                </h2>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-8 mt-1">Switch Bazaar Theme</p>
              </div>
              <div className="text-[9px] font-black text-pink-600 bg-pink-50 px-4 py-2 rounded-full uppercase border border-pink-100 animate-pulse">
                Live: {activeEvent?.name}
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PK_EVENTS.map(ev => (
                <button 
                  key={ev.id}
                  disabled={loadingId === 'event_' + ev.id}
                  onClick={() => setAppEvent(ev.id)}
                  className={`p-6 rounded-[2.5rem] border-2 transition-all flex items-center justify-between text-left group relative overflow-hidden ${activeEvent?.id === ev.id ? 'border-pink-600 bg-pink-50 shadow-lg scale-[1.02]' : 'border-gray-50 bg-white hover:border-pink-200'}`}
                >
                   {activeEvent?.id === ev.id && (
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Check className="w-12 h-12" />
                      </div>
                   )}
                   <div className="flex items-center gap-4 relative z-10">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner bg-white border border-gray-100" style={{ backgroundColor: activeEvent?.id === ev.id ? 'white' : '#f8fafc' }}>
                        {ev.emoji}
                      </div>
                      <div>
                        <p className="font-black text-xs text-gray-900 uppercase tracking-tight">{ev.name}</p>
                        <p className="text-[11px] font-bold text-gray-400 urdu-font leading-tight mt-0.5">{ev.urduName}</p>
                      </div>
                   </div>
                   {loadingId === 'event_' + ev.id ? (
                     <Loader2 className="w-5 h-5 animate-spin text-pink-600" />
                   ) : activeEvent?.id === ev.id ? (
                     <Check className="w-6 h-6 text-pink-600" />
                   ) : (
                     <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-pink-300 transition-colors" />
                   )}
                </button>
              ))}
           </div>
           
           <div className="p-8 bg-gray-900 rounded-[3rem] text-white relative overflow-hidden">
              <Calendar className="absolute top-0 right-0 p-8 opacity-10 w-32 h-32" />
              <div className="flex items-center gap-3 mb-3">
                 <AlertCircle className="w-5 h-5 text-pink-500" />
                 <p className="text-[10px] font-black uppercase text-white tracking-[0.2em]">How it works</p>
              </div>
              <p className="text-xs font-medium text-white/70 leading-relaxed max-w-md">
                Clicking an event button instantly rebrands the entire marketplace for all users. 
                Standard pink colors across all buttons, headers, and banners will shift to the selected festive theme.
              </p>
           </div>
        </div>
      )}

      {activeAdminTab === 'SHOPS' && (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-3 text-gray-900">
              <Store className="w-5 h-5 text-pink-500" /> Merchant Verification
            </h2>
            <p className="text-[8px] font-black text-gray-400 uppercase">Set Shop Rank (Priority)</p>
          </div>
          <div className="space-y-5">
            {shops.map(shop => (
              <div key={shop.id} className="p-6 bg-gray-50/50 rounded-[2.5rem] flex flex-col gap-6 border border-gray-100 transition-all hover:bg-white hover:shadow-xl relative overflow-hidden">
                 <div className={`absolute top-0 right-0 h-1.5 w-full ${shop.subscription_tier === 'PREMIUM' ? 'bg-orange-400' : shop.subscription_tier === 'STANDARD' ? 'bg-pink-500' : 'bg-gray-300'}`}></div>

                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                       <img src={shop.logo} className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-md bg-white" />
                       <div>
                          <p className="font-black text-base text-gray-900 leading-tight mb-1">{shop.name}</p>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{shop.bazaar}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center bg-white rounded-xl border border-gray-100 p-1 mr-2">
                        <button 
                          disabled={loadingId === shop.id}
                          onClick={() => updatePriority(shop.id, shop.sort_priority || 0, 1)}
                          className="p-1 hover:text-pink-600 transition-colors"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <span className="text-[10px] font-black text-pink-600">{shop.sort_priority || 0}</span>
                        <button 
                          disabled={loadingId === shop.id}
                          onClick={() => updatePriority(shop.id, shop.sort_priority || 0, -1)}
                          className="p-1 hover:text-gray-400 transition-colors"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      <button 
                        onClick={() => toggleFeatured(shop)}
                        className={`p-4 rounded-2xl border-2 transition-all active:scale-90 ${shop.featured ? 'bg-pink-100 text-pink-600 border-pink-200 shadow-inner' : 'bg-white text-gray-300 border-gray-100'}`}
                      >
                        {shop.featured ? <Star className="w-5 h-5 fill-pink-600" /> : <StarOff className="w-5 h-5" />}
                      </button>
                      <div className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest ${shop.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {shop.status}
                      </div>
                    </div>
                 </div>

                 <div className="space-y-3 bg-white p-4 rounded-3xl border border-gray-100 shadow-inner">
                    <div className="flex items-center justify-between px-1">
                       <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <CreditCard className="w-3 h-3" /> Subscription Tier
                       </p>
                       <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${shop.subscription_tier === 'PREMIUM' ? 'text-orange-600 bg-orange-50' : shop.subscription_tier === 'STANDARD' ? 'text-pink-600 bg-pink-50' : 'text-gray-500 bg-gray-100'}`}>
                         Current: {shop.subscription_tier}
                       </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                       {SUBSCRIPTION_PLANS.map(plan => (
                          <button 
                             key={plan.id}
                             disabled={loadingId === shop.id}
                             onClick={() => updatePlan(shop.id, plan.id as SubscriptionTier)}
                             className={`p-3 rounded-2xl border-2 text-[8px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1 ${shop.subscription_tier === plan.id ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : 'bg-white text-gray-400 border-gray-50 hover:border-pink-200'}`}
                          >
                             {plan.id === 'BASIC' && <Store className="w-4 h-4" />}
                             {plan.id === 'STANDARD' && <Gem className="w-4 h-4" />}
                             {plan.id === 'PREMIUM' && <Crown className="w-4 h-4" />}
                             {plan.label}
                          </button>
                       ))}
                    </div>
                 </div>

                 <button onClick={() => updateStatus(shop.id, shop.status === 'APPROVED' ? 'SUSPENDED' : 'APPROVED')} disabled={loadingId === shop.id} className={`w-full py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${shop.status === 'APPROVED' ? 'bg-red-50 text-red-600' : 'bg-green-600 text-white'}`}>
                    {loadingId === shop.id ? <Loader2 className="animate-spin w-4 h-4" /> : (shop.status === 'APPROVED' ? 'Suspend Merchant' : 'Approve & Activate')}
                 </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeAdminTab === 'CATEGORIES' && (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
           <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-6 h-6 text-pink-500" />
                  <h2 className="font-black text-sm uppercase tracking-widest text-gray-900">Market Categories</h2>
                </div>
                <p className="text-[8px] font-black text-pink-600 uppercase tracking-widest">Image Override System</p>
              </div>

              <div className="flex gap-3 p-4 bg-pink-50 rounded-[2rem] border border-pink-100">
                <input 
                  type="text" 
                  placeholder="New Category Name..." 
                  className="flex-1 p-4 bg-white rounded-xl font-bold text-sm outline-none border border-transparent focus:border-pink-300"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                />
                <button 
                  onClick={handleAddCategory}
                  disabled={loadingId === 'new_cat'}
                  className="bg-pink-600 text-white px-6 py-4 rounded-xl font-black uppercase text-[10px] flex items-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                  {loadingId === 'new_cat' ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4" />} Add
                </button>
              </div>
           </div>
           
           <div className="grid grid-cols-1 gap-5">
              {categories.map(cat => (
                <div key={cat.id} className="p-5 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex items-center justify-between group transition-all hover:bg-white hover:shadow-lg">
                   <div className="flex items-center gap-6">
                      <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded-[2rem] border-4 border-white shadow-md bg-white">
                        <img src={cat.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-black uppercase text-sm tracking-tighter text-gray-900">{cat.name}</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.3em]">Market Catalog View</p>
                      </div>
                   </div>
                   
                   <label className={`cursor-pointer p-5 bg-white rounded-3xl shadow-sm border border-gray-100 hover:bg-pink-50 hover:text-pink-600 transition-all active:scale-90 ${loadingId === cat.id ? 'opacity-50' : ''}`}>
                      {loadingId === cat.id ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        disabled={loadingId === cat.id}
                        onChange={e => e.target.files?.[0] && handleCategoryUpload(cat.id, e.target.files[0])} 
                      />
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
