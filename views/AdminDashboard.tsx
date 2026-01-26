
import React, { useState } from 'react';
import { 
  Store, DollarSign, Shield, TrendingUp, AlertCircle, ShoppingBag, ArrowUpRight, Loader2, Check, Clock, Star, StarOff, 
  Settings, Image as ImageIcon, Camera, UploadCloud
} from 'lucide-react';
import { Shop, Order, Category } from '../types';
import { supabase, uploadFile } from '../services/supabase';

interface AdminDashboardProps {
  shops: Shop[];
  setShops: (shops: Shop[]) => void;
  orders: Order[];
  categories: Category[];
  refreshData?: () => Promise<void>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ shops, setShops, orders, categories, refreshData }) => {
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
      alert(`Category photo updated! Home screen will now reflect this change.`);
    } catch (err: any) {
      alert("Category upload failed: " + err.message);
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
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">Admin Control</h1>
          <p className="text-[10px] font-black text-pink-600 uppercase tracking-[0.2em]">Marketplace Governance</p>
        </div>
        <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 shadow-inner">
          <Shield className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 p-8 rounded-[3rem] text-white space-y-4 shadow-2xl relative overflow-hidden">
          <TrendingUp className="absolute top-0 right-0 p-6 opacity-10 w-24 h-24" />
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Market GMV</p>
          <p className="text-4xl font-black italic tracking-tighter">PKR {totalGMV.toLocaleString()}</p>
        </div>
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-pink-600">Platform Revenue</p>
          <p className="text-4xl font-black italic tracking-tighter text-gray-900">PKR {totalPlatformFees.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-[2rem] max-w-sm mx-auto shadow-inner">
        <button onClick={() => setActiveAdminTab('SHOPS')} className={`flex-1 py-4 rounded-[1.8rem] text-[9px] font-black uppercase tracking-widest transition-all ${activeAdminTab === 'SHOPS' ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-400'}`}>Verify Shops</button>
        <button onClick={() => setActiveAdminTab('CATEGORIES')} className={`flex-1 py-4 rounded-[1.8rem] text-[9px] font-black uppercase tracking-widest transition-all ${activeAdminTab === 'CATEGORIES' ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-400'}`}>Market Setup</button>
      </div>

      {activeAdminTab === 'SHOPS' ? (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
          <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-3 text-gray-900">
            <Store className="w-5 h-5 text-pink-500" /> Merchant Verification
          </h2>
          <div className="space-y-5">
            {shops.map(shop => (
              <div key={shop.id} className="p-6 bg-gray-50/50 rounded-[2.5rem] flex flex-col gap-6 border border-gray-100 transition-all hover:bg-white hover:shadow-xl">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                       <img src={shop.logo} className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-md bg-white" />
                       <div>
                          <p className="font-black text-base text-gray-900 leading-tight mb-1">{shop.name}</p>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{shop.bazaar} • {shop.subscription_tier}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                 <button onClick={() => updateStatus(shop.id, shop.status === 'APPROVED' ? 'SUSPENDED' : 'APPROVED')} disabled={loadingId === shop.id} className={`w-full py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${shop.status === 'APPROVED' ? 'bg-red-50 text-red-600' : 'bg-green-600 text-white'}`}>
                    {loadingId === shop.id ? <Loader2 className="animate-spin w-4 h-4" /> : (shop.status === 'APPROVED' ? 'Suspend Merchant' : 'Approve & Activate')}
                 </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <ImageIcon className="w-6 h-6 text-pink-500" />
                <h2 className="font-black text-sm uppercase tracking-widest text-gray-900">Manage Categories</h2>
              </div>
              <p className="text-[8px] font-black text-pink-600 uppercase tracking-widest">Image Override System</p>
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
