
import React, { useState, useEffect } from 'react';
import { 
  Store, Shield, Loader2, Check, Palette, Star, Trophy, ShoppingBag, Clock, ArrowUp, ArrowDown, CreditCard, X, ExternalLink, Package, User as UserIcon, MapPin
} from 'lucide-react';
import { Shop, Order, Category, AppEvent, Product, CustomRequest } from '../types';
import { supabase } from '../services/supabase';
import { PK_EVENTS, SELLER_PLANS, SUBSCRIPTION_PLANS } from '../constants';

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
  const [activeAdminTab, setActiveAdminTab] = useState<'SHOPS' | 'PENDING' | 'INVENTORY' | 'THEME' | 'CUSTOM_REQUESTS' | 'LOYALTY'>('PENDING'); // Default to pending if there are any
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [loyaltyPlans, setLoyaltyPlans] = useState<any[]>([]);

  const pendingCount = shops.filter(s => s.status === 'PENDING').length;

  // Auto-switch tab if no pending, but first time only
  useEffect(() => {
    if (pendingCount === 0 && activeAdminTab === 'PENDING') {
      setActiveAdminTab('SHOPS');
    }
  }, []);

  const deleteShop = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this merchant and all their associated data? This is irreversible.")) return;
    if (!supabase) return;
    
    setLoadingId(id + 'delete');
    try {
      // Products usually cascade or need manual delete depending on FK setup
      const { error } = await supabase.from('shops').delete().eq('id', id);
      if (error) throw error;
      if (refreshData) await refreshData();
    } catch (err: any) {
      alert(`Delete Failed: ` + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    const fetchAdminProducts = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data) {
          setAdminProducts(data.map((p: any) => ({
            ...p,
            id: p.id.toString(),
            shopId: (p.shop_id || p.shopId).toString(),
            images: Array.isArray(p.image_urls) ? p.image_urls : (p.image_url ? [p.image_url] : (p.images || [])),
            is_new_arrival: !!p.is_new_arrival
          })));
        }
      } catch (err) {
        console.error("Admin products fetch failed:", err);
      }
    };
    if (activeAdminTab === 'INVENTORY') fetchAdminProducts();
  }, [activeAdminTab, loadingId]);

  useEffect(() => {
    const fetchCustomRequests = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('custom_requests')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setCustomRequests(data || []);
      } catch (err) {
        console.error("Custom requests fetch failed:", err);
      }
    };
    if (activeAdminTab === 'CUSTOM_REQUESTS') fetchCustomRequests();
  }, [activeAdminTab, loadingId]);

  useEffect(() => {
    const fetchLoyaltyPlans = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase.from('loyalty_plans').select('*');
        if (error) throw error;
        setLoyaltyPlans(data || []);
      } catch (err) {
        console.error("Loyalty plans fetch failed:", err);
      }
    };
    if (activeAdminTab === 'LOYALTY') fetchLoyaltyPlans();
  }, [activeAdminTab, loadingId]);

  const updateLoyaltyField = async (id: string, field: string, value: any) => {
    if (!supabase) return;
    setLoadingId(id + field);
    try {
      const { error } = await supabase.from('loyalty_plans').update({ [field]: value }).eq('id', id);
      if (error) throw error;
      setLoyaltyPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    } catch (err: any) {
      alert(`Update Failed: ` + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const updateRequestStatus = async (id: string, status: string) => {
    if (!supabase) return;
    setLoadingId(id + 'status');
    try {
      const { error } = await supabase.from('custom_requests').update({ status }).eq('id', id);
      if (error) throw error;
      setCustomRequests(prev => prev.map(r => r.id === id ? { ...r, status: status as any } : r));
    } catch (err: any) {
      alert(`Update Status Failed: ` + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const updateShopField = async (id: string, field: string, value: any) => {
    if (!supabase) return;
    setLoadingId(id + field);
    try {
      const { error } = await supabase.from('shops').update({ [field]: value }).eq('id', id);
      if (error) throw error;
      if (refreshData) await refreshData();
    } catch (err: any) {
      alert(`Update ${field} Failed: ` + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const updateProductField = async (id: string, field: string, value: any) => {
    if (!supabase) return;
    setLoadingId(id + field);
    try {
      const { error } = await supabase.from('products').update({ [field]: value }).eq('id', id);
      if (error) throw error;
      setAdminProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
      if (refreshData) await refreshData();
    } catch (err: any) {
      alert(`Update ${field} Failed: ` + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const changePriority = async (shop: Shop, delta: number) => {
    const newPriority = (shop.sort_priority || 0) + delta;
    await updateShopField(shop.id, 'sort_priority', newPriority);
  };

  const normalize = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '').replace(/s(?=clothes|footwear|wear|store|$)/g, '').trim();

  const sortedShops = [...shops].sort((a, b) => (b.sort_priority || 0) - (a.sort_priority || 0));

  if (shops.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center space-y-6">
        <div className="bg-white p-12 rounded-[4rem] border shadow-sm space-y-4">
          <Store className="w-16 h-16 text-gray-200 mx-auto" />
          <h2 className="text-xl font-black uppercase italic tracking-tighter">No Shops Detected</h2>
          <p className="text-xs font-medium text-gray-500 max-w-xs mx-auto italic">We couldn't find any shops in the database. If you just added a seller, wait a moment or click sync.</p>
          <button 
            onClick={() => refreshData?.()}
            className="px-8 py-4 bg-pink-600 text-white text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] shadow-xl shadow-pink-200 active:scale-95 transition-all"
          >
            Sync Database Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32 animate-in fade-in duration-500">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-stretch gap-4">
        <div className="flex-1 bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">Admin Authority</h1>
            <p className="text-[10px] font-black text-pink-600 uppercase tracking-[0.2em]">Curation & Merchant Control</p>
          </div>
          <div className="w-16 h-16 bg-pink-100 rounded-[2rem] flex items-center justify-center text-pink-600 shadow-inner"><Shield className="w-8 h-8" /></div>
        </div>

        {/* System Stats Card */}
        <div className="bg-gray-900 p-8 rounded-[3.5rem] text-white flex items-center gap-6 shadow-2xl">
           <div className="text-center">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Live Shops</p>
              <p className="text-2xl font-black italic">{shops.filter(s => s.status === 'APPROVED').length}</p>
           </div>
           <div className="w-px h-10 bg-gray-700"></div>
           <div className="text-center">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Pending</p>
              <p className="text-2xl font-black italic text-orange-400">{shops.filter(s => s.status === 'PENDING').length}</p>
           </div>
           <button onClick={() => refreshData?.()} className="ml-auto w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all active:rotate-180 duration-500">
              <Clock className="w-5 h-5 text-pink-400" />
           </button>
        </div>
      </div>

      {/* RLS Warning for Admin (Helpful if they forgot to run SQL) */}
      <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 flex items-start gap-4">
         <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
         <div className="space-y-1">
            <p className="text-[11px] font-black uppercase text-blue-900 tracking-tight leading-none">RLS Policy Verification</p>
            <p className="text-[9px] font-medium text-blue-700 leading-relaxed italic">If you cannot approve merchants, please ensure you have applied the Admin RLS Bypass policies in your Supabase SQL Editor.</p>
         </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1.5 bg-gray-200 rounded-[2.5rem] overflow-x-auto no-scrollbar">
        {[
          { id: 'PENDING', icon: Shield, label: 'Approvals', badge: pendingCount },
          { id: 'SHOPS', icon: Store, label: 'Directory' },
          { id: 'INVENTORY', icon: ShoppingBag, label: 'Arrivals' },
          { id: 'CUSTOM_REQUESTS', icon: Package, label: 'Requests' },
          { id: 'LOYALTY', icon: Trophy, label: 'Loyalty' },
          { id: 'THEME', icon: Palette, label: 'Themes' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveAdminTab(tab.id as any)} 
            className={`relative flex-1 min-w-[90px] py-4 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeAdminTab === tab.id ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <tab.icon className="w-4 h-4" /> 
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-600 text-white rounded-full flex items-center justify-center text-[8px] border-2 border-white animate-bounce">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Approvals Tab */}
      {activeAdminTab === 'PENDING' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between px-4">
             <div className="space-y-1">
               <h2 className="text-xl font-black uppercase italic tracking-tighter">Queue</h2>
               <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Merchants waiting for verification</p>
             </div>
             <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                {pendingCount} Pending
             </div>
          </div>

          {pendingCount === 0 ? (
            <div className="bg-white p-12 rounded-[4rem] border shadow-sm text-center space-y-4">
              <Check className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-lg font-black uppercase italic">All Caught Up</h3>
              <p className="text-xs font-medium text-gray-500 italic">There are no new merchant applications to review at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {shops.filter(s => s.status === 'PENDING').map(shop => (
                <div key={shop.id} className="bg-white p-8 rounded-[4rem] border-2 border-orange-200 shadow-xl space-y-6 transition-all hover:scale-[1.01]">
                   <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                         <img src={shop.logo || undefined} className="w-20 h-20 rounded-[2.5rem] object-cover bg-gray-50 border-4 border-white shadow-xl" />
                         <div className="space-y-1">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter">{shop.name || 'New Merchant'}</h3>
                            <div className="flex gap-2">
                               <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">{shop.category || 'Clothing'}</span>
                               <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">{shop.bazaar || 'Ladies Bazar'}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex flex-col gap-2">
                         <button 
                           onClick={() => updateShopField(shop.id, 'status', 'APPROVED')}
                           disabled={loadingId === shop.id + 'status'}
                           className="px-8 py-4 bg-green-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-green-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                         >
                            {loadingId === shop.id + 'status' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} 
                            Approve
                         </button>
                         <button 
                           onClick={() => deleteShop(shop.id)}
                           disabled={loadingId === shop.id + 'delete'}
                           className="px-8 py-4 bg-red-50 text-red-600 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
                         >
                            {loadingId === shop.id + 'delete' ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />} 
                            Reject
                         </button>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-50">
                      <div className="space-y-1">
                         <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Contact Mobile</p>
                         <p className="text-sm font-bold text-gray-900">{shop.mobile || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Whatsapp</p>
                         <p className="text-sm font-bold text-gray-900">{shop.whatsapp || shop.mobile || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Merchant Address</p>
                         <p className="text-sm font-bold text-gray-900 truncate">{shop.address || 'Ghotki'}</p>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Merchants Tab */}
      {activeAdminTab === 'SHOPS' && (
        <div className="space-y-12 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between px-4">
             <div className="space-y-1">
               <h2 className="text-xl font-black uppercase italic tracking-tighter">Directory</h2>
               <p className="text-[9px] font-black text-pink-500 uppercase tracking-widest">Active marketplace merchants</p>
             </div>
          </div>

          {categories.map(cat => {
            const catNorm = normalize(cat.id);
            const catNameNorm = normalize(cat.name);

            const catShops = shops
              .filter(s => {
                const sCatNorm = normalize(s.category || '');
                return sCatNorm === catNorm || sCatNorm === catNameNorm;
              })
              .sort((a, b) => {
                const priorityA = Number(a.sort_priority) || 0;
                const priorityB = Number(b.sort_priority) || 0;
                if (priorityA !== priorityB) return priorityB - priorityA;
                return (a.name || '').localeCompare(b.name || '');
              });
            
            if (catShops.length === 0) return null;

            return (
              <div key={cat.id} className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                  <div className="h-px flex-1 bg-gray-200"></div>
                  <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-pink-600 italic">{cat.name}</h2>
                  <div className="h-px flex-1 bg-gray-200"></div>
                </div>

                <div className="space-y-4">
                  {catShops.map((shop) => (
                    <div key={shop.id} className="bg-white p-6 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col gap-6">
                       <div className="flex items-center justify-between gap-4">
                         <div className="flex items-center gap-4 flex-1 min-w-0">
                            <img src={shop.logo || undefined} className="w-14 h-14 rounded-[1.5rem] object-cover bg-gray-50 border-2 border-white shadow-sm" />
                            <div className="truncate">
                              <p className="font-black text-sm uppercase italic text-gray-900 truncate tracking-tight">{shop.name}</p>
                              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Priority: {shop.sort_priority || 0}</p>
                            </div>
                         </div>
                         
                         <div className="flex items-center gap-1.5">
                           <div className="flex flex-col gap-1">
                             <button onClick={() => changePriority(shop, 1)} className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-200 hover:text-pink-600 transition-all active:scale-90"><ArrowUp className="w-3.5 h-3.5" /></button>
                             <button onClick={() => changePriority(shop, -1)} className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-200 hover:text-pink-600 transition-all active:scale-90"><ArrowDown className="w-3.5 h-3.5" /></button>
                           </div>
                           <button onClick={() => updateShopField(shop.id, 'is_top_seller', !shop.is_top_seller)} className={`p-4 rounded-2xl border-2 transition-all ${shop.is_top_seller ? 'bg-pink-600 border-pink-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-300'}`}>
                             <Trophy className="w-5 h-5" />
                           </button>
                           <button onClick={() => updateShopField(shop.id, 'featured', !shop.featured)} className={`p-4 rounded-2xl border-2 transition-all ${shop.featured ? 'bg-orange-500 border-orange-500 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-300'}`}>
                             <Star className="w-5 h-5" />
                           </button>
                         </div>
                       </div>

                       <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-50 gap-4">
                          <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-gray-400" />
                                <select 
                                  className="bg-gray-100 border-none rounded-xl text-[10px] font-black uppercase tracking-widest px-4 py-2 outline-none focus:ring-2 focus:ring-pink-500/20"
                                  value={shop.subscription_tier}
                                  onChange={(e) => updateShopField(shop.id, 'subscription_tier', e.target.value)}
                                >
                                   {SUBSCRIPTION_PLANS.map(plan => (
                                     <option key={plan.id} value={plan.id}>{plan.label}</option>
                                   ))}
                                </select>
                             </div>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => window.open(`https://wa.me/${shop.whatsapp || shop.mobile}`)} className="p-3 bg-green-50 text-green-600 rounded-xl"><ExternalLink className="w-4 h-4" /></button>
                             <button onClick={() => updateShopField(shop.id, 'status', shop.status === 'APPROVED' ? 'SUSPENDED' : 'APPROVED')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${shop.status === 'APPROVED' ? 'bg-red-50 text-red-600' : 'bg-green-600 text-white shadow-lg'}`}>
                               {shop.status === 'APPROVED' ? 'Suspend Merchant' : 'Approve Live'}
                             </button>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Uncategorized Shops */}
          {shops.some(s => {
            const sCatNorm = normalize(s.category || '');
            return !categories.some(c => normalize(c.id) === sCatNorm || normalize(c.name) === sCatNorm);
          }) && (
            <div className="space-y-6">
               <div className="flex items-center gap-4 px-2">
                  <div className="h-px flex-1 bg-gray-200"></div>
                  <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 italic">Uncategorized Boutiques</h2>
                  <div className="h-px flex-1 bg-gray-200"></div>
                </div>
                <div className="space-y-4">
                  {shops
                    .filter(s => {
                      const sCatNorm = normalize(s.category || '');
                      return !categories.some(c => normalize(c.id) === sCatNorm || normalize(c.name) === sCatNorm);
                    })
                    .sort((a, b) => (b.sort_priority || 0) - (a.sort_priority || 0))
                    .map(shop => (
                    <div key={shop.id} className="bg-white p-6 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col gap-6">
                       <div className="flex items-center justify-between gap-4">
                         <div className="flex items-center gap-4 flex-1 min-w-0">
                            <img src={shop.logo || undefined} className="w-14 h-14 rounded-[1.5rem] object-cover bg-gray-50 border-2 border-white shadow-sm" />
                            <div className="truncate">
                              <p className="font-black text-sm uppercase italic text-gray-900 truncate tracking-tight">{shop.name}</p>
                              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Priority: {shop.sort_priority || 0}</p>
                            </div>
                         </div>
                         
                         <div className="flex items-center gap-1.5">
                           <div className="flex flex-col gap-1">
                             <button onClick={() => changePriority(shop, 1)} className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-200 hover:text-pink-600 transition-all active:scale-90"><ArrowUp className="w-3.5 h-3.5" /></button>
                             <button onClick={() => changePriority(shop, -1)} className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-200 hover:text-pink-600 transition-all active:scale-90"><ArrowDown className="w-3.5 h-3.5" /></button>
                           </div>
                           <button onClick={() => updateShopField(shop.id, 'is_top_seller', !shop.is_top_seller)} className={`p-4 rounded-2xl border-2 transition-all ${shop.is_top_seller ? 'bg-pink-600 border-pink-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-300'}`}>
                             <Trophy className="w-5 h-5" />
                           </button>
                           <button onClick={() => updateShopField(shop.id, 'featured', !shop.featured)} className={`p-4 rounded-2xl border-2 transition-all ${shop.featured ? 'bg-orange-500 border-orange-500 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-300'}`}>
                             <Star className="w-5 h-5" />
                           </button>
                         </div>
                       </div>

                       <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-50 gap-4">
                          <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-gray-400" />
                                <select 
                                  className="bg-gray-100 border-none rounded-xl text-[10px] font-black uppercase tracking-widest px-4 py-2 outline-none focus:ring-2 focus:ring-pink-500/20"
                                  value={shop.subscription_tier}
                                  onChange={(e) => updateShopField(shop.id, 'subscription_tier', e.target.value)}
                                >
                                   {SUBSCRIPTION_PLANS.map(plan => (
                                     <option key={plan.id} value={plan.id}>{plan.label}</option>
                                   ))}
                                </select>
                             </div>
                             <div className="flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 text-gray-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                   {categories.find(c => normalize(c.id) === normalize(shop.category) || normalize(c.name) === normalize(shop.category))?.name || 'No Category'}
                                </span>
                             </div>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => window.open(`https://wa.me/${shop.whatsapp || shop.mobile}`)} className="p-3 bg-green-50 text-green-600 rounded-xl"><ExternalLink className="w-4 h-4" /></button>
                             <button onClick={() => updateShopField(shop.id, 'status', shop.status === 'APPROVED' ? 'SUSPENDED' : 'APPROVED')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${shop.status === 'APPROVED' ? 'bg-red-50 text-red-600' : 'bg-green-600 text-white shadow-lg'}`}>
                               {shop.status === 'APPROVED' ? 'Suspend' : 'Approve'}
                             </button>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
            </div>
          )}
        </div>
      )}

      {/* Custom Requests Tab */}
      {activeAdminTab === 'CUSTOM_REQUESTS' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          {customRequests.length === 0 ? (
            <div className="py-24 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-gray-100 shadow-inner">
              <Package className="w-16 h-16 text-gray-100 mx-auto mb-4" />
              <p className="font-black uppercase text-sm text-gray-400 tracking-widest">No custom requests yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {customRequests.map((request) => (
                <div key={request.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl space-y-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600">
                          <Package className="w-5 h-5" />
                        </div>
                        <h3 className="font-black text-xl uppercase italic text-gray-900 tracking-tighter">{request.product_name}</h3>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                          <UserIcon className="w-3.5 h-3.5 text-pink-400" /> {request.customer_name}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                          <Clock className="w-3.5 h-3.5 text-pink-400" /> {request.delivery_days} Days
                        </div>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                      request.status === 'PENDING' ? 'bg-orange-100 text-orange-600' :
                      request.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                      request.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {request.status}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <p className="text-xs font-bold text-gray-600 leading-relaxed">{request.customer_address}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {Array.isArray(request.image_urls) && request.image_urls.map((url, i) => (
                      <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        <img src={url || undefined} referrerPolicy="no-referrer" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="Request" />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-50">
                    {request.status === 'PENDING' && (
                      <>
                        <button 
                          onClick={() => updateRequestStatus(request.id, 'APPROVED')}
                          className="flex-1 py-4 bg-green-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-lg shadow-green-600/20 active:scale-95 transition-all"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => updateRequestStatus(request.id, 'REJECTED')}
                          className="flex-1 py-4 bg-red-50 text-red-600 font-black rounded-2xl uppercase tracking-widest text-[10px] active:scale-95 transition-all"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {request.status === 'APPROVED' && (
                      <button 
                        onClick={() => updateRequestStatus(request.id, 'COMPLETED')}
                        className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                      >
                        Mark as Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Arrivals Tab */}
      {activeAdminTab === 'INVENTORY' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4">
           <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-2 mb-4 text-center text-pink-600 italic">Toggle products to appear in the "New Arrivals" section</p>
           {adminProducts.map(product => (
             <div key={product.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <img src={(Array.isArray(product.images) ? product.images[0] : (product as any).image_url) || undefined} referrerPolicy="no-referrer" className="w-14 h-14 rounded-2xl object-cover shadow-sm bg-gray-50" />
                  <div className="truncate">
                    <p className="font-black text-sm uppercase italic text-gray-900 truncate tracking-tight">{product.name}</p>
                    <p className="text-[9px] font-black text-gray-400 uppercase">PKR {product.price.toLocaleString()}</p>
                  </div>
                </div>
                <button 
                  disabled={loadingId === product.id + 'is_new_arrival'}
                  onClick={() => updateProductField(product.id, 'is_new_arrival', !product.is_new_arrival)}
                  className={`flex items-center gap-2 px-6 py-4 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all ${product.is_new_arrival ? 'bg-pink-600 text-white shadow-xl' : 'bg-gray-100 text-gray-400'}`}
                >
                  {loadingId === product.id + 'is_new_arrival' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                  {product.is_new_arrival ? 'Arrival: ON' : 'Make New'}
                </button>
             </div>
           ))}
        </div>
      )}

      {/* Loyalty Management Tab */}
      {activeAdminTab === 'LOYALTY' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between px-4">
             <div className="space-y-1">
               <h2 className="text-xl font-black uppercase italic tracking-tighter">Loyalty Cards</h2>
               <p className="text-[9px] font-black text-pink-500 uppercase tracking-widest">Manage benefits & features</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loyaltyPlans.map((plan) => (
              <div key={plan.id} className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-xl space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 shadow-inner">
                      <Trophy className="w-6 h-6" />
                   </div>
                   <div className="flex-1">
                      <input 
                        className="w-full text-lg font-black uppercase italic tracking-tighter outline-none focus:text-pink-600"
                        value={plan.name}
                        onChange={(e) => updateLoyaltyField(plan.id, 'name', e.target.value)}
                      />
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-bold text-gray-400">PRICE: PKR</span>
                         <input 
                           type="number"
                           className="w-20 text-[10px] font-black bg-gray-50 px-2 py-1 rounded-lg outline-none"
                           value={plan.price}
                           onChange={(e) => updateLoyaltyField(plan.id, 'price', Number(e.target.value))}
                         />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[10px] font-bold text-gray-400">COLOR:</span>
                         <input 
                           type="color"
                           className="w-8 h-6 rounded-md cursor-pointer border-none p-0"
                           value={plan.color || '#ec4899'}
                           onChange={(e) => updateLoyaltyField(plan.id, 'color', e.target.value)}
                         />
                      </div>
                   </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-50">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Discount %</span>
                      <input 
                        type="number"
                        className="w-16 text-right font-black text-pink-600 px-2 py-1 bg-pink-50 rounded-lg outline-none"
                        value={plan.discount_percentage}
                        onChange={(e) => updateLoyaltyField(plan.id, 'discount_percentage', Number(e.target.value))}
                      />
                   </div>

                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Free Delivery</span>
                      <button 
                        onClick={() => updateLoyaltyField(plan.id, 'free_delivery', !plan.free_delivery)}
                        className={`w-12 h-6 rounded-full transition-all relative ${plan.free_delivery ? 'bg-green-500' : 'bg-gray-200'}`}
                      >
                         <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${plan.free_delivery ? 'right-1' : 'left-1'}`}></div>
                      </button>
                   </div>

                   <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Gift Information</p>
                      <input 
                        className="w-full text-xs font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded-xl border-none"
                        value={plan.gift_info || ''}
                        placeholder="e.g. Free Makeup Kit"
                        onChange={(e) => updateLoyaltyField(plan.id, 'gift_info', e.target.value)}
                      />
                   </div>

                   <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Free Item Offer</p>
                      <input 
                        className="w-full text-xs font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded-xl border-none"
                        value={plan.free_item_info || ''}
                        placeholder="e.g. Buy 1 Khussa Get 1 Free"
                        onChange={(e) => updateLoyaltyField(plan.id, 'free_item_info', e.target.value)}
                      />
                   </div>

                   <div className="space-y-2">
                      <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Custom Benefits (Enter one per line)</p>
                      <textarea 
                        className="w-full text-[10px] font-bold text-pink-600 bg-pink-50 p-4 rounded-3xl min-h-[120px] outline-none border-2 border-transparent focus:border-pink-200 transition-all placeholder:text-pink-200"
                        value={(plan.custom_benefits || []).filter(Boolean).join('\n')}
                        placeholder="Lucky Draw Entry&#10;Win Umra Ticket&#10;VIP Access"
                        onChange={(e) => updateLoyaltyField(plan.id, 'custom_benefits', e.target.value.split('\n').map(s => s.trim()))}
                      />
                      <p className="text-[7px] font-bold text-gray-400 uppercase italic">Benefits appear as bullet points on the user profile.</p>
                   </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-[3.5rem] text-white space-y-4 shadow-2xl border-t-4 border-pink-500">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-600/30"><Star className="w-6 h-6" /></div>
                 <h3 className="text-xl font-black uppercase italic tracking-tighter">Points System Status</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="bg-white/10 p-6 rounded-3xl space-y-1 border border-white/10">
                    <p className="text-[8px] font-black uppercase tracking-widest text-pink-400">Conversion Rate</p>
                    <p className="text-sm font-bold text-white">1k PKR = 12 Points</p>
                 </div>
                 <div className="bg-white/10 p-6 rounded-3xl space-y-1 border border-white/10">
                    <p className="text-[8px] font-black uppercase tracking-widest text-pink-400">Award Type</p>
                    <p className="text-sm font-bold text-white">Post-Completion</p>
                 </div>
              </div>
              <p className="text-[9px] font-medium text-gray-400 italic">Buyers earn roughly PKR 3.00 value for every PKR 1000 spent (standard scale). points are added once seller marks order as completed.</p>
          </div>
        </div>
      )}

      {/* Themes Tab */}
      {activeAdminTab === 'THEME' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-bottom-4">
           {PK_EVENTS.map(event => (
              <button key={event.id} onClick={() => onUpdateEvent(event)} className={`p-8 rounded-[3rem] border-4 transition-all text-left relative overflow-hidden group ${activeEvent.id === event.id ? 'border-pink-600 bg-pink-50 shadow-xl' : 'border-white bg-white shadow-sm hover:border-gray-100'}`}>
                 <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">{event.emoji}</span>
                 <p className="font-black text-[11px] uppercase text-gray-900 leading-none mb-2 tracking-widest">{event.name}</p>
                 <p className="urdu-font text-2xl text-gray-400">{event.urduName}</p>
                 {activeEvent.id === event.id && (
                   <div className="absolute top-4 right-4 bg-pink-600 text-white p-1 rounded-full">
                     <Check className="w-3 h-3" />
                   </div>
                 )}
                 <div className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: event.primaryColor }}></div>
              </button>
           ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
