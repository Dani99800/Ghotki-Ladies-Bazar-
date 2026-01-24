
import React, { useState } from 'react';
import { 
  Store, DollarSign, Shield, TrendingUp, AlertCircle, ShoppingBag, ArrowUpRight, Loader2, Check, Clock, Star, StarOff, 
  Settings, Image as ImageIcon, Camera
} from 'lucide-react';
import { Shop, Order } from '../types';
import { supabase } from '../services/supabase';
import { CATEGORIES } from '../constants';

interface AdminDashboardProps {
  shops: Shop[];
  setShops: (shops: Shop[]) => void;
  orders: Order[];
  refreshData?: () => Promise<void>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ shops, setShops, orders, refreshData }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<'SHOPS' | 'CATEGORIES'>('SHOPS');
  
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

  const toggleFeatured = async (shop: Shop) => {
    if (!supabase) return;
    setLoadingId(shop.id);
    try {
      // Logic: Trending/Featured is exclusively Admin controlled
      const { error } = await supabase.from('shops').update({ featured: !shop.featured }).eq('id', shop.id);
      if (error) throw error;
      if (refreshData) await refreshData();
    } catch (err: any) {
      alert("Featured Toggle Failed: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const updateTier = async (id: string, tier: string) => {
    if (!supabase) return;
    setLoadingId(id);
    try {
      const { error } = await supabase.from('shops').update({ subscription_tier: tier }).eq('id', id);
      if (error) throw error;
      if (refreshData) await refreshData();
    } catch (err: any) {
      alert("Tier Update Failed: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const totalGMV = orders.reduce((acc, o) => acc + o.total, 0);
  const totalPlatformFees = orders.length * 1000;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">Admin Control</h1>
          <p className="text-[10px] font-black text-pink-600 uppercase tracking-[0.2em]">Platform Governance v3.5</p>
        </div>
        <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 shadow-inner">
          <Shield className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 p-8 rounded-[3rem] text-white space-y-4 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
            <TrendingUp className="w-24 h-24" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Market GMV</p>
          <p className="text-4xl font-black italic tracking-tighter">PKR {totalGMV.toLocaleString()}</p>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-pink-600">Platform Revenue</p>
          <p className="text-4xl font-black italic tracking-tighter text-gray-900">PKR {totalPlatformFees.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-[2rem] max-w-sm mx-auto">
        <button onClick={() => setActiveAdminTab('SHOPS')} className={`flex-1 py-3 rounded-[1.8rem] text-[9px] font-black uppercase tracking-widest transition-all ${activeAdminTab === 'SHOPS' ? 'bg-white text-pink-600 shadow-md' : 'text-gray-400'}`}>Manage Shops</button>
        <button onClick={() => setActiveAdminTab('CATEGORIES')} className={`flex-1 py-3 rounded-[1.8rem] text-[9px] font-black uppercase tracking-widest transition-all ${activeAdminTab === 'CATEGORIES' ? 'bg-white text-pink-600 shadow-md' : 'text-gray-400'}`}>Category Photos</button>
      </div>

      {activeAdminTab === 'SHOPS' ? (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
          <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-3 text-gray-900">
            <Store className="w-5 h-5 text-pink-500" /> Merchant Verification
          </h2>

          <div className="space-y-4">
            {shops.map(shop => (
              <div key={shop.id} className="p-6 bg-gray-50/50 rounded-[2.5rem] flex flex-col gap-6 border border-gray-100 transition-all hover:bg-white hover:shadow-lg">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                       <img src={shop.logo} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md bg-white" />
                       <div>
                          <p className="font-black text-base text-gray-900 leading-tight">{shop.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{shop.bazaar} • {shop.subscription_tier}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleFeatured(shop)}
                        className={`p-4 rounded-2xl border-2 transition-all active:scale-90 ${shop.featured ? 'bg-pink-100 text-pink-600 border-pink-200 shadow-inner' : 'bg-white text-gray-300 border-gray-100'}`}
                        title={shop.featured ? 'Remove from Trending' : 'Make Trending'}
                      >
                        {shop.featured ? <Star className="w-5 h-5 fill-pink-600" /> : <StarOff className="w-5 h-5" />}
                      </button>
                      <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${shop.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {shop.status}
                      </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex gap-2">
                      {shop.status !== 'APPROVED' ? (
                        <button onClick={() => updateStatus(shop.id, 'APPROVED')} disabled={loadingId === shop.id} className="flex-1 bg-green-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                          {loadingId === shop.id ? <Loader2 className="animate-spin w-4 h-4" /> : 'Confirm Live'}
                        </button>
                      ) : (
                        <button onClick={() => updateStatus(shop.id, 'SUSPENDED')} disabled={loadingId === shop.id} className="flex-1 bg-red-50 text-red-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 active:scale-95 transition-all flex items-center justify-center gap-2">
                          {loadingId === shop.id ? <Loader2 className="animate-spin w-4 h-4" /> : 'Suspend Shop'}
                        </button>
                      )}
                    </div>
                    <select 
                      value={shop.subscription_tier} 
                      onChange={(e) => updateTier(shop.id, e.target.value)}
                      className="flex-1 bg-white border border-gray-200 text-[10px] font-black uppercase px-6 py-4 rounded-2xl outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-pink-500/20"
                    >
                      <option value="BASIC">Tier 1 (1000)</option>
                      <option value="STANDARD">Tier 2 (2500)</option>
                      <option value="PREMIUM">Tier 3 (5000)</option>
                    </select>
                 </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 animate-in fade-in duration-300">
           <div className="flex items-center gap-3">
              <ImageIcon className="w-5 h-5 text-pink-500" />
              <h2 className="font-black text-sm uppercase tracking-widest text-gray-900">Global Category Management</h2>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {CATEGORIES.map(cat => (
                <div key={cat.id} className="p-4 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center gap-4 group">
                   <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded-2xl">
                      <img src={cat.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Camera className="w-5 h-5 text-white" />
                      </div>
                   </div>
                   <div className="flex-1">
                      <p className="font-black uppercase text-[10px] text-gray-900">{cat.name}</p>
                      <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Update Banner</p>
                   </div>
                </div>
              ))}
           </div>
           
           <div className="p-6 bg-pink-50 rounded-[2rem] border border-pink-100">
              <p className="text-[10px] font-bold text-pink-600 leading-relaxed text-center italic">
                * Note: Admin can upload specific high-res photos here to overwrite the default category images shown on the home page.
              </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
