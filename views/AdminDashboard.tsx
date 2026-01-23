
import React, { useState } from 'react';
import { 
  Store, DollarSign, Shield, CheckCircle, XCircle, TrendingUp, AlertCircle, ShoppingBag, ArrowUpRight, Loader2, Check, Clock
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
  const [successId, setSuccessId] = useState<string | null>(null);
  
  const updateStatus = async (id: string, status: string) => {
    if (!supabase) return;
    setLoadingId(id);
    try {
      const { error } = await supabase
        .from('shops')
        .update({ status })
        .eq('id', id);
        
      if (error) {
        console.error("Approval Error:", error);
        alert(`Failed to update status: ${error.message}\n\nHint: Check if your Supabase RLS policies allow Admins to update other users' shops.`);
        return;
      }

      // 1. Update local state immediately for snappy UI
      setShops(shops.map(s => s.id === id ? { ...s, status: status as any } : s));
      
      // 2. Trigger a global refresh to sync all components
      if (refreshData) await refreshData();

      // 3. Show success state
      setSuccessId(id);
      setTimeout(() => setSuccessId(null), 2000);

    } catch (err: any) {
      alert("An unexpected error occurred: " + err.message);
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
      setShops(shops.map(s => s.id === id ? { ...s, subscription_tier: tier as any } : s));
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
          <p className="text-[10px] font-black text-pink-600 uppercase tracking-[0.2em]">Platform Governance v2.5</p>
        </div>
        <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 shadow-inner">
          <Shield className="w-6 h-6" />
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white space-y-4 shadow-2xl relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
            <TrendingUp className="w-24 h-24" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Gross Marketplace Volume</p>
          <p className="text-4xl font-black italic tracking-tighter">PKR {totalGMV.toLocaleString()}</p>
          <div className="flex items-center gap-2 text-green-400 text-[10px] font-black uppercase">
            <ArrowUpRight className="w-3 h-3" /> Real-time Ledger
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-pink-100/20 space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 text-pink-50 opacity-50 group-hover:rotate-12 transition-transform">
            <DollarSign className="w-24 h-24" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-pink-600">Platform Revenue (1k/Sale)</p>
          <p className="text-4xl font-black italic tracking-tighter text-gray-900">PKR {totalPlatformFees.toLocaleString()}</p>
          <div className="flex items-center gap-2 text-pink-400 text-[10px] font-black uppercase">
            <ShoppingBag className="w-3 h-3" /> {orders.length} Verified Transactions
          </div>
        </div>
      </div>

      {/* Merchant Management */}
      <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-3 text-gray-900">
            <Store className="w-5 h-5 text-pink-500" /> Pending Approvals
          </h2>
          <span className="bg-gray-50 px-3 py-1 rounded-full text-[9px] font-black text-gray-400 uppercase tracking-widest">
            {shops.length} Total Registered
          </span>
        </div>

        <div className="space-y-4">
          {shops.map(shop => (
            <div key={shop.id} className={`p-6 bg-gray-50/50 rounded-3xl flex flex-col gap-6 border transition-all duration-300 ${successId === shop.id ? 'border-green-500 bg-green-50/30 scale-[0.98]' : 'border-gray-100 hover:border-pink-100'}`}>
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <img src={shop.logo || 'https://via.placeholder.com/150'} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" />
                     <div>
                        <p className="font-black text-base text-gray-900 leading-tight">{shop.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{shop.bazaar} • {shop.category}</p>
                     </div>
                  </div>
                  {/* Added missing 'Clock' import from 'lucide-react' to fix the compilation error */}
                  <div className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${shop.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    {shop.status === 'APPROVED' ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {shop.status}
                  </div>
               </div>

               {shop.bio && (
                 <div className="p-4 bg-white rounded-2xl border border-gray-100 text-[11px] text-gray-500 italic">
                    "{shop.bio}"
                 </div>
               )}

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex gap-2">
                    {shop.status !== 'APPROVED' ? (
                      <button 
                        onClick={() => updateStatus(shop.id, 'APPROVED')} 
                        disabled={loadingId === shop.id}
                        className="flex-1 bg-green-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-100 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loadingId === shop.id ? <Loader2 className="animate-spin w-4 h-4" /> : 'Approve & Go Live'}
                      </button>
                    ) : (
                      <button 
                        onClick={() => updateStatus(shop.id, 'SUSPENDED')} 
                        disabled={loadingId === shop.id}
                        className="flex-1 bg-red-50 text-red-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        {loadingId === shop.id ? <Loader2 className="animate-spin w-4 h-4" /> : 'Suspend Shop'}
                      </button>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <select 
                      value={shop.subscription_tier} 
                      disabled={loadingId === shop.id}
                      onChange={(e) => updateTier(shop.id, e.target.value)}
                      className="flex-1 bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500/20 disabled:opacity-50"
                    >
                      <option value="BASIC">Basic Member</option>
                      <option value="STANDARD">Standard Partner</option>
                      <option value="PREMIUM">Premium Partner (Top)</option>
                    </select>
                  </div>
               </div>
            </div>
          ))}

          {shops.length === 0 && (
            <div className="py-20 text-center space-y-4 opacity-40">
               <AlertCircle className="w-12 h-12 mx-auto text-gray-400" />
               <p className="font-black uppercase text-xs tracking-widest">No merchants awaiting verification</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
