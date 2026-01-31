
import React, { useState } from 'react';
import { 
  Store, Shield, TrendingUp, AlertCircle, Loader2, Check, Star,
  ArrowUp, ArrowDown, Plus, CreditCard, Gem, Crown,
  LayoutDashboard, Sparkles, Palette, ChevronUp, ChevronDown, Clock, Flame, Edit, LayoutGrid, RefreshCw, ShoppingBag
} from 'lucide-react';
import { Shop, Order, Category, SubscriptionTier, AppEvent } from '../types';
import { supabase } from '../services/supabase';
import { PK_EVENTS } from '../constants';

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

  const movePriority = async (id: string, current: number, delta: number) => {
    if (!supabase) return;
    setLoadingId(id);
    try {
      const newPriority = Math.max(0, (Number(current) || 0) + delta);
      const { error } = await supabase.from('shops').update({ sort_priority: newPriority }).eq('id', id);
      if (error) throw error;
      if (refreshData) await refreshData();
    } catch (err: any) {
      alert("Move Failed: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const toggleTopSeller = async (shop: Shop) => {
    if (!supabase) return;
    setLoadingId(shop.id);
    try {
      const { error } = await supabase.from('shops').update({ is_top_seller: !shop.is_top_seller }).eq('id', shop.id);
      if (error) throw error;
      if (refreshData) await refreshData();
    } catch (err: any) {
      alert("Toggle Failed: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const sortedShops = [...shops].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
    
    const prioA = Number(a.sort_priority) || 0;
    const prioB = Number(b.sort_priority) || 0;
    if (prioA !== prioB) return prioB - prioA;
    
    return (a.name || '').localeCompare(b.name || '');
  });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">Admin Control</h1>
          <p className="text-[10px] font-black text-pink-600 uppercase tracking-[0.2em]">Marketplace Governance</p>
        </div>
        <div className="w-16 h-16 bg-pink-100 rounded-3xl flex items-center justify-center text-pink-600 shadow-inner">
          <Shield className="w-8 h-8" />
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-gray-200 rounded-[2.5rem] overflow-x-auto no-scrollbar">
        {['SHOPS', 'CATEGORIES', 'THEME'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveAdminTab(tab as any)} 
            className={`flex-1 py-4 px-6 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeAdminTab === tab ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab === 'SHOPS' ? <Store className="w-4 h-4" /> : tab === 'CATEGORIES' ? <LayoutGrid className="w-4 h-4" /> : <Palette className="w-4 h-4" />}
            {tab}
          </button>
        ))}
      </div>

      {activeAdminTab === 'SHOPS' && (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-3 text-gray-900">
              <Store className="w-5 h-5 text-pink-500" /> Manage Merchants
            </h2>
            <button onClick={() => refreshData?.()} className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all active:scale-90">
               <RefreshCw className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-6">
            {sortedShops.map((shop, index) => (
              <div key={shop.id} className={`p-6 rounded-[2.5rem] border transition-all flex flex-col gap-6 relative overflow-hidden group ${shop.status === 'PENDING' ? 'bg-pink-50/50 border-pink-100 shadow-inner' : 'bg-gray-50/50 border-gray-100 shadow-sm'}`}>
                {shop.is_top_seller && (
                  <div className="absolute top-0 right-0 p-3 bg-pink-600 text-white text-[7px] font-black uppercase tracking-widest rounded-bl-3xl flex items-center gap-1.5 z-10 shadow-lg">
                    <ShoppingBag className="w-3 h-3" /> TOP SELLER ACTIVE
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <img src={shop.logo} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md bg-white" />
                        <div className="absolute -top-2 -left-2 bg-gray-900 text-white text-[8px] font-black px-2 py-1 rounded-lg">Rank #{index + 1}</div>
                      </div>
                      <div>
                          <p className="font-black text-sm text-gray-900 italic uppercase truncate max-w-[150px]">{shop.name}</p>
                          <p className="text-[9px] font-black text-pink-500 uppercase tracking-widest">{shop.bazaar}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${shop.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{shop.status}</span>
                            <span className="text-[7px] font-black px-2 py-0.5 rounded-full uppercase bg-gray-200 text-gray-600">Prio: {shop.sort_priority || 0}</span>
                          </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      {/* Priority Up/Down */}
                      <div className="flex items-center bg-white rounded-xl p-1 border border-gray-100 shadow-sm">
                        <button onClick={() => movePriority(shop.id, shop.sort_priority || 0, 1)} className="p-2 hover:bg-pink-600 hover:text-white rounded-lg transition-all" title="Move Up"><ChevronUp className="w-4 h-4" /></button>
                        <button onClick={() => movePriority(shop.id, shop.sort_priority || 0, -1)} className="p-2 hover:bg-pink-600 hover:text-white rounded-lg transition-all" title="Move Down"><ChevronDown className="w-4 h-4" /></button>
                      </div>

                      {/* Explicit Top Seller Toggle */}
                      <button 
                        onClick={() => toggleTopSeller(shop)} 
                        className={`p-4 rounded-xl transition-all border ${shop.is_top_seller ? 'bg-pink-600 text-white border-pink-700 shadow-lg' : 'bg-white text-gray-300 border-gray-100 hover:border-pink-200 hover:text-pink-600'}`}
                        title="Toggle Top Seller Bag"
                      >
                        <ShoppingBag className="w-5 h-5" />
                      </button>

                      <button onClick={() => updateStatus(shop.id, shop.status === 'APPROVED' ? 'SUSPENDED' : 'APPROVED')} className={`px-4 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex-1 md:flex-none ${shop.status === 'APPROVED' ? 'bg-red-50 text-red-600' : 'bg-pink-600 text-white shadow-md'}`}>
                        {loadingId === shop.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (shop.status === 'APPROVED' ? 'Suspend' : 'Approve')}
                      </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories & Theme Tabs Content (Abbreviated as per current file) */}
    </div>
  );
};

export default AdminDashboard;
