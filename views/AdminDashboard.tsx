
import React, { useState } from 'react';
import { 
  Store, DollarSign, Shield, CheckCircle, XCircle, TrendingUp, AlertCircle, ShoppingBag, ArrowUpRight
} from 'lucide-react';
import { Shop, Order } from '../types';
import { supabase } from '../services/supabase';

interface AdminDashboardProps {
  shops: Shop[];
  setShops: (shops: Shop[]) => void;
  orders: Order[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ shops, setShops, orders }) => {
  const [loading, setLoading] = useState(false);
  
  const updateStatus = async (id: string, status: string) => {
    setLoading(true);
    const { error } = await supabase.from('shops').update({ status }).eq('id', id);
    if (!error) {
      setShops(shops.map(s => s.id === id ? { ...s, status: status as any } : s));
    }
    setLoading(false);
  };

  const updateTier = async (id: string, tier: string) => {
    setLoading(true);
    const { error } = await supabase.from('shops').update({ subscription_tier: tier }).eq('id', id);
    if (!error) {
      setShops(shops.map(s => s.id === id ? { ...s, subscription_tier: tier as any } : s));
    }
    setLoading(false);
  };

  const totalGMV = orders.reduce((acc, o) => acc + o.total, 0);
  const totalPlatformFees = orders.length * 1000;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-24 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">Admin Control</h1>
          <p className="text-[10px] font-black text-pink-600 uppercase tracking-[0.2em]">Platform Governance v2.4</p>
        </div>
        <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600">
          <Shield className="w-6 h-6" />
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white space-y-4 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
            <TrendingUp className="w-24 h-24" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Gross Marketplace Volume</p>
          <p className="text-4xl font-black italic tracking-tighter">PKR {totalGMV.toLocaleString()}</p>
          <div className="flex items-center gap-2 text-green-400 text-[10px] font-black uppercase">
            <ArrowUpRight className="w-3 h-3" /> Live Transaction Data
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-pink-100 space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 text-pink-50 opacity-50 group-hover:rotate-12 transition-transform">
            <DollarSign className="w-24 h-24" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-pink-600">Total Platform Revenue (1k/Sale)</p>
          <p className="text-4xl font-black italic tracking-tighter text-gray-900">PKR {totalPlatformFees.toLocaleString()}</p>
          <div className="flex items-center gap-2 text-pink-400 text-[10px] font-black uppercase">
            <ShoppingBag className="w-3 h-3" /> {orders.length} Orders Completed
          </div>
        </div>
      </div>

      {/* Merchant Management */}
      <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-3 text-gray-900">
            <Store className="w-5 h-5 text-pink-500" /> Merchant Verification
          </h2>
          <span className="bg-gray-50 px-3 py-1 rounded-full text-[9px] font-black text-gray-400 uppercase tracking-widest">
            {shops.length} Total Shops
          </span>
        </div>

        <div className="space-y-4">
          {shops.map(shop => (
            <div key={shop.id} className="p-6 bg-gray-50/50 rounded-3xl flex flex-col gap-6 border border-gray-100 hover:border-pink-100 transition-colors">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <img src={shop.logo} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" />
                     <div>
                        <p className="font-black text-base text-gray-900 leading-tight">{shop.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{shop.bazaar}</p>
                     </div>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest ${shop.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    {shop.status}
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex gap-2">
                    {shop.status !== 'APPROVED' ? (
                      <button 
                        onClick={() => updateStatus(shop.id, 'APPROVED')} 
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-100 active:scale-95 transition-all"
                      >
                        Approve Store
                      </button>
                    ) : (
                      <button 
                        onClick={() => updateStatus(shop.id, 'SUSPENDED')} 
                        disabled={loading}
                        className="flex-1 bg-red-50 text-red-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 active:scale-95 transition-all"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <select 
                      value={shop.subscription_tier} 
                      onChange={(e) => updateTier(shop.id, e.target.value)}
                      className="flex-1 bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500/20"
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
               <p className="font-black uppercase text-xs tracking-widest">No merchants registered yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
