
import React, { useState, useEffect } from 'react';
import { 
  Store, Shield, TrendingUp, AlertCircle, Loader2, Check, Star, StarOff, 
  ImageIcon, UploadCloud, ArrowUp, ArrowDown, Plus, CreditCard, Gem, Crown,
  LayoutDashboard, Sparkles, Palette, ChevronUp, ChevronDown, Clock
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

  // CRITICAL: Sort pending shops to the very top so Admin always sees new registrations
  const sortedShops = [...shops].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
    return (b.sort_priority || 0) - (a.sort_priority || 0);
  });

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

      <div className="flex gap-2 p-1.5 bg-gray-200 rounded-[2.5rem] max-sm:max-w-xs mx-auto shadow-inner overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveAdminTab('SHOPS')} className={`flex-1 py-4 px-6 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeAdminTab === 'SHOPS' ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}>
          <Store className="w-4 h-4" /> Merchants
        </button>
        <button onClick={() => setActiveAdminTab('THEME')} className={`flex-1 py-4 px-6 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeAdminTab === 'THEME' ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}>
          <Palette className="w-4 h-4" /> Theme
        </button>
      </div>

      {activeAdminTab === 'SHOPS' && (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-3 text-gray-900">
              <Store className="w-5 h-5 text-pink-500" /> Active Merchants
            </h2>
            <div className="flex items-center gap-3">
               <span className="text-[8px] font-black text-gray-400 uppercase">Total: {shops.length}</span>
               <button onClick={() => refreshData?.()} className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"><ArrowUp className="w-3 h-3 text-gray-400" /></button>
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
                            </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateStatus(shop.id, shop.status === 'APPROVED' ? 'SUSPENDED' : 'APPROVED')} className={`px-6 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${shop.status === 'APPROVED' ? 'bg-red-50 text-red-600' : 'bg-pink-600 text-white shadow-lg'}`}>
                          {loadingId === shop.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (shop.status === 'APPROVED' ? 'Suspend' : 'Approve Shop')}
                        </button>
                      </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
