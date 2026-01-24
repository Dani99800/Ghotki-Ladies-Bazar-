
import React, { useState } from 'react';
import { 
  Store, DollarSign, Shield, TrendingUp, AlertCircle, ShoppingBag, ArrowUpRight, Loader2, Check, Clock, Star, StarOff
} from 'lucide-react';
import { Shop, Order } from '../types';
import { supabase } from '../services/supabase';

interface AdminDashboardProps {
  shops: Shop[];
  setShops: (shops: Shop[]) => void;
  orders: Order[];
  refreshData?: () => Promise<void>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ shops, setShops, orders, refreshData }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
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
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-24 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">Admin Control</h1>
          <p className="text-[10px] font-black text-pink-600 uppercase tracking-[0.2em]">Platform Governance v3.0</p>
        </div>
        <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 shadow-inner">
          <Shield className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white space-y-4 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
            <TrendingUp className="w-24 h-24" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Sales Volume</p>
          <p className="text-4xl font-black italic tracking-tighter">PKR {totalGMV.toLocaleString()}</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-pink-600">Admin Commission</p>
          <p className="text-4xl font-black italic tracking-tighter text-gray-900">PKR {totalPlatformFees.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
        <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-3 text-gray-900">
          <Store className="w-5 h-5 text-pink-500" /> Merchant Management
        </h2>

        <div className="space-y-4">
          {shops.map(shop => (
            <div key={shop.id} className="p-6 bg-gray-50/50 rounded-3xl flex flex-col gap-6 border border-gray-100">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <img src={shop.logo} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" />
                     <div>
                        <p className="font-black text-base text-gray-900 leading-tight">{shop.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{shop.bazaar}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleFeatured(shop)}
                      className={`p-3 rounded-xl border transition-all ${shop.featured ? 'bg-pink-100 text-pink-600 border-pink-200' : 'bg-white text-gray-300 border-gray-200'}`}
                      title={shop.featured ? 'Featured/Trending' : 'Standard Shop'}
                    >
                      {shop.featured ? <Star className="w-4 h-4 fill-pink-600" /> : <StarOff className="w-4 h-4" />}
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
                        {loadingId === shop.id ? <Loader2 className="animate-spin w-4 h-4" /> : 'Approve Shop'}
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
                    className="flex-1 bg-white border border-gray-200 text-[10px] font-black uppercase p-4 rounded-2xl outline-none"
                  >
                    <option value="BASIC">Basic (1000)</option>
                    <option value="STANDARD">Standard (2500)</option>
                    <option value="PREMIUM">Premium (5000)</option>
                  </select>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
