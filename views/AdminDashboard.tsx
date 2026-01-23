
import React from 'react';
import { Store, DollarSign, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Shop, Order } from '../types';
import { supabase } from '../services/supabase';

interface AdminDashboardProps {
  shops: Shop[];
  setShops: (shops: Shop[]) => void;
  orders: Order[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ shops, setShops, orders }) => {
  
  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('shops').update({ status }).eq('id', id);
    if (!error) setShops(shops.map(s => s.id === id ? { ...s, status: status as any } : s));
  };

  const updateTier = async (id: string, tier: string) => {
    const { error } = await supabase.from('shops').update({ subscription_tier: tier }).eq('id', id);
    if (!error) setShops(shops.map(s => s.id === id ? { ...s, subscription_tier: tier as any } : s));
  };

  const totalVolume = orders.reduce((acc, o) => acc + o.total, 0);
  const totalFees = orders.length * 1000;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Admin Dashboard</h1>
        <Shield className="text-pink-600" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 text-white p-6 rounded-[2rem] space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Total GMV</p>
          <p className="text-2xl font-black italic">PKR {totalVolume.toLocaleString()}</p>
        </div>
        <div className="bg-pink-600 text-white p-6 rounded-[2rem] space-y-2 shadow-xl shadow-pink-200">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Platform Revenue</p>
          <p className="text-2xl font-black italic">PKR {totalFees.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
        <h2 className="font-black text-xs uppercase tracking-widest flex items-center gap-2"><Store className="w-4 h-4 text-pink-500" /> Manage Shops</h2>
        <div className="space-y-4">
          {shops.map(shop => (
            <div key={shop.id} className="p-4 bg-gray-50 rounded-2xl flex flex-col gap-4">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <img src={shop.logo} className="w-10 h-10 rounded-xl object-cover" />
                     <div>
                        <p className="font-black text-sm">{shop.name}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">{shop.bazaar}</p>
                     </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase ${shop.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>{shop.status}</span>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => updateStatus(shop.id, 'APPROVED')} className="flex-1 bg-green-600 text-white py-3 rounded-xl text-[9px] font-black uppercase">Approve</button>
                  <select 
                    value={shop.subscription_tier} 
                    onChange={(e) => updateTier(shop.id, e.target.value)}
                    className="bg-white border text-[9px] font-black uppercase p-2 rounded-xl outline-none"
                  >
                    <option value="BASIC">BASIC</option>
                    <option value="STANDARD">STANDARD</option>
                    <option value="PREMIUM">PREMIUM</option>
                  </select>
                  <button onClick={() => updateStatus(shop.id, 'SUSPENDED')} className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100"><XCircle className="w-4 h-4" /></button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
