import React, { useState, useEffect, useMemo } from 'react';
import { 
  Store, Shield, Loader2, Check, Palette, Star, Trophy, ShoppingBag, Clock, ArrowUp, ArrowDown, CreditCard, X, ExternalLink, Package, User as UserIcon, MapPin, Search, Filter, CheckCircle2, AlertCircle, Phone, MessageSquare, Car, Smartphone, Building, Shirt, Sparkles, Briefcase, Footprints, Wheat, Armchair, Plus, Wallet, DollarSign, KeyRound, Building2, FileText
} from 'lucide-react';
import { Shop, Order, Category, AppEvent, Product, CustomRequest, AdDeposit } from '../types';
import { supabase } from '../services/supabase';
import { PK_EVENTS, SELLER_PLANS, SUBSCRIPTION_PLANS, CATEGORIES as DEFAULT_CATEGORIES } from '../constants';

const REMOVED_CATEGORY_NAMES = ["men's footwear", "women's footwear", "costmatic", "cosmetics", "men's cloths", "men's clothes", "women's clothes", "footwear"];

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
  const [activeAdminTab, setActiveAdminTab] = useState<'SHOPS' | 'PENDING' | 'INVENTORY' | 'LOYALTY' | 'AD_DEPOSITS' | 'CUSTOM_REQUESTS' | 'THEME'>('SHOPS');
  
  // Category & Filter States
  const [selectedPortalFilter, setSelectedPortalFilter] = useState<'ALL' | 'MARKETPLACE' | 'RENTAL' | 'PROPERTY' | 'MOTOR'>('ALL');
  const [selectedApprovalCategory, setSelectedApprovalCategory] = useState<string>('All');
  const [selectedDirectoryCategory, setSelectedDirectoryCategory] = useState<string>('All');
  const [selectedInventoryCategory, setSelectedInventoryCategory] = useState<string>('All');
  const [directorySearch, setDirectorySearch] = useState<string>('');
  const [inventorySearch, setInventorySearch] = useState<string>('');

  const getShopPortal = (shop: Shop): 'MARKETPLACE' | 'RENTAL' | 'PROPERTY' | 'MOTOR' => {
    if (shop.portal_type) return shop.portal_type;
    const cat = (shop.category || '').toLowerCase();
    if (cat.includes('rental') || cat.includes('lease')) return 'RENTAL';
    if (cat.includes('property') || cat.includes('real estate') || cat.includes('house') || cat.includes('plot')) return 'PROPERTY';
    if (cat.includes('car') || cat.includes('motor') || cat.includes('vehicle')) return 'MOTOR';
    return 'MARKETPLACE';
  };

  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [loyaltyPlans, setLoyaltyPlans] = useState<any[]>([]);
  const [adDeposits, setAdDeposits] = useState<AdDeposit[]>([]);

  const activeCategories = useMemo(() => {
    const raw = categories.length > 0 ? categories : DEFAULT_CATEGORIES;
    return raw.filter(c => {
      const catName = (c.name || '').toLowerCase().trim();
      return !REMOVED_CATEGORY_NAMES.includes(catName);
    });
  }, [categories]);

  const pendingShops = useMemo(() => {
    return shops.filter(s => s.status === 'PENDING');
  }, [shops]);

  const pendingShopsByPortal = useMemo(() => {
    return {
      ALL: pendingShops.length,
      MARKETPLACE: pendingShops.filter(s => getShopPortal(s) === 'MARKETPLACE').length,
      RENTAL: pendingShops.filter(s => getShopPortal(s) === 'RENTAL').length,
      PROPERTY: pendingShops.filter(s => getShopPortal(s) === 'PROPERTY').length,
      MOTOR: pendingShops.filter(s => getShopPortal(s) === 'MOTOR').length,
    };
  }, [pendingShops]);

  const displayedPendingShops = useMemo(() => {
    if (selectedPortalFilter === 'ALL') return pendingShops;
    return pendingShops.filter(s => getShopPortal(s) === selectedPortalFilter);
  }, [pendingShops, selectedPortalFilter]);

  const pendingCount = pendingShops.length;

  // Auto-switch tab if no pending applications initially
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
      let remoteReqs: any[] = [];
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('custom_requests')
            .select('*')
            .order('created_at', { ascending: false });
          if (!error && data) remoteReqs = data;
        } catch (err) {
          console.error("Custom requests fetch failed:", err);
        }
      }
      const localSaved = localStorage.getItem('glb_custom_requests');
      let localReqs: any[] = [];
      if (localSaved) {
        try { localReqs = JSON.parse(localSaved); } catch (e) {}
      }
      
      // Combine and deduplicate
      const map = new Map();
      [...remoteReqs, ...localReqs].forEach(item => {
        if (item.id && !map.has(item.id)) map.set(item.id, item);
      });
      setCustomRequests(Array.from(map.values()));
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

  const fetchAdDeposits = async () => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('ad_deposits')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          setAdDeposits(data);
          return;
        }
      }
    } catch (e) {
      console.warn('Supabase ad_deposits fetch failed, using local storage fallback', e);
    }
    const saved = localStorage.getItem('glb_ad_deposits');
    if (saved) {
      try {
        setAdDeposits(JSON.parse(saved));
      } catch (e) {}
    }
  };

  useEffect(() => {
    fetchAdDeposits();
  }, [activeAdminTab]);

  const approveAdDeposit = async (deposit: AdDeposit) => {
    if (deposit.amount < 500) {
      alert("Minimum deposit amount required for approval is PKR 500.");
      return;
    }
    setLoadingId(deposit.id + 'approve');
    try {
      if (supabase) {
        await supabase
          .from('ad_deposits')
          .update({ status: 'APPROVED' })
          .eq('id', deposit.id);
      }
      
      const targetShop = shops.find(s => s.id === deposit.shop_id || s.owner_id === deposit.seller_id);
      if (targetShop) {
        const newBalance = (targetShop.ad_wallet_balance || 0) + Number(deposit.amount);
        await updateShopField(targetShop.id, 'ad_wallet_balance', newBalance);
      }

      const updatedList = adDeposits.map(d => d.id === deposit.id ? { ...d, status: 'APPROVED' as const } : d);
      setAdDeposits(updatedList);
      localStorage.setItem('glb_ad_deposits', JSON.stringify(updatedList));

      alert(`Deposit of PKR ${Number(deposit.amount).toLocaleString()} Approved! Ad Wallet balance credited to ${deposit.shop_name || 'Merchant'}.`);
    } catch (err: any) {
      alert("Error approving deposit: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const rejectAdDeposit = async (deposit: AdDeposit) => {
    setLoadingId(deposit.id + 'reject');
    try {
      if (supabase) {
        await supabase
          .from('ad_deposits')
          .update({ status: 'REJECTED' })
          .eq('id', deposit.id);
      }
      const updatedList = adDeposits.map(d => d.id === deposit.id ? { ...d, status: 'REJECTED' as const } : d);
      setAdDeposits(updatedList);
      localStorage.setItem('glb_ad_deposits', JSON.stringify(updatedList));
    } catch (err: any) {
      alert("Error rejecting deposit: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

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

  const normalize = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();

  // Helper function to match shop/product categories
  const matchesCategory = (itemCategory: string | undefined, targetCategory: string) => {
    if (!targetCategory || targetCategory === 'All') return true;
    if (!itemCategory) return false;
    const catNorm = normalize(itemCategory);
    const targetNorm = normalize(targetCategory);
    if (catNorm === targetNorm) return true;

    // Soft mappings for legacy/alternative names
    if (targetNorm.includes('car') || targetNorm.includes('vehicle')) {
      return catNorm.includes('car') || catNorm.includes('vehicle') || catNorm.includes('bike') || catNorm.includes('auto');
    }
    if (targetNorm.includes('mobile') || targetNorm.includes('electronic')) {
      return catNorm.includes('mobile') || catNorm.includes('electronic') || catNorm.includes('phone') || catNorm.includes('tech');
    }
    if (targetNorm.includes('fashion') || targetNorm.includes('cloth')) {
      return catNorm.includes('fashion') || catNorm.includes('cloth') || catNorm.includes('dress') || catNorm.includes('suit');
    }
    if (targetNorm.includes('shoe') || targetNorm.includes('footwear')) {
      return catNorm.includes('shoe') || catNorm.includes('footwear') || catNorm.includes('sandal');
    }
    if (targetNorm.includes('property') || targetNorm.includes('realestate')) {
      return catNorm.includes('property') || catNorm.includes('house') || catNorm.includes('plot') || catNorm.includes('real estate');
    }
    if (targetNorm.includes('agri') || targetNorm.includes('livestock')) {
      return catNorm.includes('agri') || catNorm.includes('livestock') || catNorm.includes('cattle') || catNorm.includes('farm');
    }
    return false;
  };

  // Group pending count by category
  const pendingCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    activeCategories.forEach(c => {
      counts[c.name] = pendingShops.filter(s => matchesCategory(s.category, c.name)).length;
    });
    return counts;
  }, [pendingShops, activeCategories]);

  // Filtered pending shops by category
  const filteredPendingShops = useMemo(() => {
    if (selectedApprovalCategory === 'All') return pendingShops;
    return pendingShops.filter(s => matchesCategory(s.category, selectedApprovalCategory));
  }, [pendingShops, selectedApprovalCategory]);

  const pendingAdDepositsCount = useMemo(() => {
    return adDeposits.filter(d => d.status === 'PENDING').length;
  }, [adDeposits]);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8 pb-32 animate-in fade-in duration-500">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-stretch gap-4">
        <div className="flex-1 bg-white p-6 md:p-8 rounded-[3rem] border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">Marketplace Admin</h1>
            <p className="text-[10px] font-black text-pink-600 uppercase tracking-[0.2em]">Ghotki District Control & Ad Wallet Approvals</p>
          </div>
          <div className="w-14 h-14 bg-pink-100 rounded-[2rem] flex items-center justify-center text-pink-600 shadow-inner">
            <Shield className="w-7 h-7" />
          </div>
        </div>

        {/* System Stats Card */}
        <div className="bg-gray-900 p-6 md:p-8 rounded-[3rem] text-white flex items-center justify-between gap-6 shadow-2xl">
           <div className="text-center">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Live Stores</p>
              <p className="text-2xl font-black italic text-green-400">{shops.filter(s => s.status === 'APPROVED').length}</p>
           </div>
           <div className="w-px h-10 bg-gray-700"></div>
           <div className="text-center">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Pending Store Apps</p>
              <p className="text-2xl font-black italic text-orange-400">{pendingCount}</p>
           </div>
           <div className="w-px h-10 bg-gray-700"></div>
           <div className="text-center">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Pending Ad Deposits</p>
              <p className="text-2xl font-black italic text-pink-400">{pendingAdDepositsCount}</p>
           </div>
           <button onClick={() => refreshData?.()} className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all active:rotate-180 duration-500">
              <Clock className="w-5 h-5 text-pink-400" />
           </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex gap-2 p-1.5 bg-gray-200 rounded-[2.5rem] overflow-x-auto no-scrollbar">
        {[
          { id: 'SHOPS', icon: Store, label: 'District Stores Directory', badge: pendingCount },
          { id: 'AD_DEPOSITS', icon: Wallet, label: 'Ad Wallet Deposits', badge: pendingAdDepositsCount },
          { id: 'CUSTOM_REQUESTS', icon: Package, label: 'Buyer Requests' },
          { id: 'THEME', icon: Palette, label: 'Festival Themes' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveAdminTab(tab.id as any)} 
            className={`relative flex-1 min-w-[140px] py-4 px-3 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeAdminTab === tab.id ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <tab.icon className="w-4 h-4 flex-shrink-0" /> 
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-orange-500 text-white rounded-full text-[8px] font-black border-2 border-white animate-bounce">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ----------------- TAB: DISTRICT STORES DIRECTORY ----------------- */}
      {activeAdminTab === 'SHOPS' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
          
          {/* Pending Store Applications Section (if any pending) */}
          {pendingShops.length > 0 && (
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 md:p-8 rounded-[3rem] text-white space-y-6 shadow-xl border border-orange-400">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                 <div>
                   <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Pending Portal Applications ({pendingShops.length})</h3>
                   <p className="text-[10px] font-black text-orange-100 uppercase tracking-widest mt-1">Review seller & agency applications organized by specialized portals</p>
                 </div>
                 <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                   <AlertCircle className="w-4 h-4" /> Action Required
                 </span>
              </div>

              {/* Portal Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {[
                  { id: 'ALL', label: 'All Portals', count: pendingShopsByPortal.ALL, icon: Store },
                  { id: 'MARKETPLACE', label: 'Marketplace', count: pendingShopsByPortal.MARKETPLACE, icon: ShoppingBag },
                  { id: 'RENTAL', label: 'Rentals', count: pendingShopsByPortal.RENTAL, icon: KeyRound },
                  { id: 'PROPERTY', label: 'Real Estate', count: pendingShopsByPortal.PROPERTY, icon: Building2 },
                  { id: 'MOTOR', label: 'Motors', count: pendingShopsByPortal.MOTOR, icon: Car },
                ].map(p => {
                  const IconComponent = p.icon;
                  const isActive = selectedPortalFilter === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPortalFilter(p.id as any)}
                      className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
                        isActive 
                          ? 'bg-white text-orange-600 shadow-md scale-105' 
                          : 'bg-black/20 text-white hover:bg-black/30'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                      {p.label}
                      <span className={`px-2 py-0.5 rounded-full text-[9px] ${isActive ? 'bg-orange-100 text-orange-700 font-bold' : 'bg-white/20 text-white'}`}>
                        {p.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {displayedPendingShops.length === 0 ? (
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl text-center text-orange-100 font-bold text-xs uppercase tracking-wider">
                    No pending applications for this portal category.
                  </div>
                ) : (
                  displayedPendingShops.map(shop => {
                    const shopPortal = getShopPortal(shop);
                    return (
                      <div key={shop.id} className="bg-white p-5 md:p-6 rounded-[2.5rem] text-gray-900 space-y-4 shadow-md">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                           <img src={shop.logo || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=200'} className="w-14 h-14 rounded-2xl object-cover bg-gray-50 border border-gray-100 shadow-sm flex-shrink-0" />
                           <div>
                              <h4 className="font-black text-base uppercase italic text-gray-900">{shop.name || 'New Merchant'}</h4>
                              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mt-0.5">
                                <span className="bg-pink-100 text-pink-700 font-black px-2 py-0.5 rounded-md">{shop.category || 'General'}</span>
                                <span>•</span>
                                <span><MapPin className="w-3 h-3 inline text-pink-600" /> {shop.city || 'Mirpur Mathelo'}</span>
                              </p>
                           </div>
                        </div>

                        <div className="flex items-center gap-2">
                           <button 
                             onClick={() => updateShopField(shop.id, 'status', 'APPROVED')}
                             disabled={loadingId === shop.id + 'status'}
                             className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                           >
                              {loadingId === shop.id + 'status' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} 
                              Approve
                           </button>
                           <button 
                             onClick={() => deleteShop(shop.id)}
                             disabled={loadingId === shop.id + 'delete'}
                             className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-1.5"
                           >
                              {loadingId === shop.id + 'delete' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />} 
                              Reject
                           </button>
                        </div>
                     </div>

                     <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-gray-100 text-xs text-gray-600">
                        <span><strong>Plan:</strong> <span className="text-pink-600 font-black uppercase">{shop.seller_plan || 'BUSINESS_1000'}</span></span>
                        <span>•</span>
                        <span><strong>TRX ID:</strong> <span className="font-mono font-bold text-gray-900">{shop.payment_trx_id || 'Pending TRX'}</span></span>
                        <span>•</span>
                        <span><strong>Phone:</strong> {shop.mobile || 'N/A'}</span>
                        <span>•</span>
                        <span><strong>WhatsApp:</strong> {shop.whatsapp || shop.mobile || 'N/A'}</span>
                        <span>•</span>
                        <span><strong>Address:</strong> {shop.address || shop.bazaar || 'Ghotki District'}</span>
                     </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-2">
             <div className="space-y-1">
               <h2 className="text-xl font-black uppercase italic tracking-tighter text-gray-900">District Portals & Stores Directory</h2>
               <p className="text-[9px] font-black text-pink-500 uppercase tracking-widest">Manage priorities, top seller badges and live store visibility</p>
             </div>

             {/* Search Bar */}
             <div className="relative w-full md:w-72">
               <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
               <input
                 type="text"
                 placeholder="Search store by name..."
                 value={directorySearch}
                 onChange={e => setDirectorySearch(e.target.value)}
                 className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none focus:border-pink-500 transition-all"
               />
             </div>
          </div>

          {/* Directory Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedDirectoryCategory('All')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedDirectoryCategory === 'All' ? 'bg-pink-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              All Categories ({shops.length})
            </button>
            {activeCategories.map(cat => {
              const count = shops.filter(s => matchesCategory(s.category, cat.name)).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedDirectoryCategory(cat.name)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedDirectoryCategory === cat.name ? 'bg-pink-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'}`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Shops Grouped by Category */}
          {activeCategories
            .filter(cat => selectedDirectoryCategory === 'All' || selectedDirectoryCategory === cat.name)
            .map(cat => {
              const catShops = shops
                .filter(s => matchesCategory(s.category, cat.name))
                .filter(s => !directorySearch || s.name.toLowerCase().includes(directorySearch.toLowerCase()) || (s.city || '').toLowerCase().includes(directorySearch.toLowerCase()))
                .sort((a, b) => (Number(b.sort_priority) || 0) - (Number(a.sort_priority) || 0));

              if (catShops.length === 0) return null;

              return (
                <div key={cat.id} className="space-y-4">
                  <div className="flex items-center gap-4 px-2">
                    <div className="h-px flex-1 bg-gray-200"></div>
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-pink-600 italic flex items-center gap-2">
                      <span>{cat.name}</span>
                      <span className="text-gray-400 font-normal">({catShops.length})</span>
                    </h2>
                    <div className="h-px flex-1 bg-gray-200"></div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {catShops.map((shop) => (
                      <div key={shop.id} className="bg-white p-5 md:p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                           <div className="flex items-center gap-4 flex-1 min-w-0">
                              <img src={shop.logo || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=200'} className="w-14 h-14 rounded-2xl object-cover bg-gray-50 border border-gray-100 shadow-sm" />
                              <div className="truncate">
                                <div className="flex items-center gap-2">
                                  <p className="font-black text-base uppercase italic text-gray-900 truncate tracking-tight">{shop.name}</p>
                                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${shop.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{shop.status}</span>
                                </div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mt-0.5">
                                  <span><MapPin className="w-3 h-3 inline text-pink-600" /> {shop.city || 'Mirpur Mathelo'}</span>
                                  <span>•</span>
                                  <span>Priority: {shop.sort_priority || 0}</span>
                                </p>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-2">
                             <div className="flex flex-col gap-1">
                               <button title="Increase Order Priority" onClick={() => changePriority(shop, 1)} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 hover:text-pink-600 transition-all active:scale-90"><ArrowUp className="w-3.5 h-3.5" /></button>
                               <button title="Decrease Order Priority" onClick={() => changePriority(shop, -1)} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 hover:text-pink-600 transition-all active:scale-90"><ArrowDown className="w-3.5 h-3.5" /></button>
                             </div>
                             <button 
                               onClick={() => updateShopField(shop.id, 'is_top_seller', !shop.is_top_seller)} 
                               className={`p-3 rounded-2xl border transition-all ${shop.is_top_seller ? 'bg-pink-600 border-pink-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-400 hover:text-pink-600'}`}
                               title="Toggle Top Seller Badge"
                             >
                               <Trophy className="w-4 h-4" />
                             </button>
                             <button 
                               onClick={() => updateShopField(shop.id, 'featured', !shop.featured)} 
                               className={`p-3 rounded-2xl border transition-all ${shop.featured ? 'bg-orange-500 border-orange-500 text-white shadow-md' : 'bg-white border-gray-200 text-gray-400 hover:text-orange-500'}`}
                               title="Toggle Featured Store"
                             >
                               <Star className="w-4 h-4" />
                             </button>
                           </div>
                         </div>

                         <div className="flex flex-wrap items-center justify-between pt-3 border-t border-gray-100 gap-3 text-xs">
                            <div className="flex items-center gap-4 flex-wrap">
                               <div className="flex items-center gap-2">
                                  <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                                  <select 
                                    className="bg-gray-100 border-none rounded-xl text-[10px] font-black uppercase tracking-widest px-3 py-1.5 outline-none focus:ring-2 focus:ring-pink-500/20"
                                    value={shop.subscription_tier || 'INDIVIDUAL'}
                                    onChange={(e) => updateShopField(shop.id, 'subscription_tier', e.target.value)}
                                  >
                                     {SUBSCRIPTION_PLANS.map(plan => (
                                       <option key={plan.id} value={plan.id}>{plan.label}</option>
                                     ))}
                                  </select>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <button onClick={() => window.open(`https://wa.me/${shop.whatsapp || shop.mobile}`)} className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"><ExternalLink className="w-4 h-4" /></button>
                               <button 
                                 onClick={() => updateShopField(shop.id, 'status', shop.status === 'APPROVED' ? 'SUSPENDED' : 'APPROVED')} 
                                 className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${shop.status === 'APPROVED' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-600 text-white shadow-sm'}`}
                               >
                                 {shop.status === 'APPROVED' ? 'Suspend Store' : 'Approve Store'}
                               </button>
                            </div>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ----------------- TAB 3: ADS & INVENTORY ----------------- */}
      {activeAdminTab === 'INVENTORY' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-2">
             <div className="space-y-1">
               <h2 className="text-xl font-black uppercase italic tracking-tighter text-gray-900">District Marketplace Ads ({adminProducts.length})</h2>
               <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest">Manage product listings & mark top deals as "New Arrival"</p>
             </div>

             <div className="relative w-full md:w-72">
               <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
               <input
                 type="text"
                 placeholder="Search ads by title..."
                 value={inventorySearch}
                 onChange={e => setInventorySearch(e.target.value)}
                 className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none focus:border-pink-500 transition-all"
               />
             </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedInventoryCategory('All')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedInventoryCategory === 'All' ? 'bg-pink-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              All Ads
            </button>
            {activeCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedInventoryCategory(cat.name)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedInventoryCategory === cat.name ? 'bg-pink-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="space-y-3">
             {adminProducts
               .filter(p => matchesCategory(p.category, selectedInventoryCategory))
               .filter(p => !inventorySearch || p.name.toLowerCase().includes(inventorySearch.toLowerCase()))
               .map(product => {
                 const shop = shops.find(s => s.id === product.shopId);
                 return (
                   <div key={product.id} className="bg-white p-5 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <img 
                          src={(Array.isArray(product.images) && product.images[0]) ? product.images[0] : 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=200'} 
                          referrerPolicy="no-referrer" 
                          className="w-14 h-14 rounded-2xl object-cover shadow-sm bg-gray-50 flex-shrink-0" 
                        />
                        <div className="truncate">
                          <p className="font-black text-sm uppercase italic text-gray-900 truncate tracking-tight">{product.name}</p>
                          <div className="flex items-center gap-2 text-[9px] font-black uppercase text-gray-400 mt-0.5">
                            <span className="text-pink-600 font-bold">PKR {product.price.toLocaleString()}</span>
                            <span>•</span>
                            <span>{shop?.name || 'Seller Store'}</span>
                            <span>•</span>
                            <span className="bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{product.category || 'General'}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        disabled={loadingId === product.id + 'is_new_arrival'}
                        onClick={() => updateProductField(product.id, 'is_new_arrival', !product.is_new_arrival)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${product.is_new_arrival ? 'bg-pink-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                      >
                        {loadingId === product.id + 'is_new_arrival' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                        {product.is_new_arrival ? 'Arrival: ON' : 'Make New'}
                      </button>
                   </div>
                 );
               })}
          </div>
        </div>
      )}

      {/* ----------------- TAB 4: BUYER REQUESTS ----------------- */}
      {activeAdminTab === 'CUSTOM_REQUESTS' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between px-2">
            <div className="space-y-1">
              <h2 className="text-xl font-black uppercase italic tracking-tighter text-gray-900">Buyer Demand Requests ({customRequests.length})</h2>
              <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest">Custom product search requests submitted by local buyers</p>
            </div>
          </div>

          {customRequests.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-[3.5rem] border border-gray-100 shadow-inner space-y-3">
              <Package className="w-14 h-14 text-gray-200 mx-auto" />
              <p className="font-black uppercase text-sm text-gray-400 tracking-widest">No buyer demands submitted yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {customRequests.map((request) => (
                <div key={request.id} className="bg-white p-6 md:p-8 rounded-[3rem] border border-gray-100 shadow-lg space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 flex-shrink-0 font-black">
                          <Package className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-black text-lg uppercase italic text-gray-900 tracking-tighter">{request.product_name}</h3>
                          <span className="bg-pink-100 text-pink-700 font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full inline-block mt-0.5">
                            {request.category || 'General Bazaar'}
                          </span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest ${
                        request.status === 'PENDING' ? 'bg-orange-100 text-orange-600' :
                        request.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                        request.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {request.status}
                      </div>
                    </div>

                    {request.description && (
                      <p className="text-xs font-medium text-gray-600 bg-gray-50 p-3 rounded-2xl italic">
                        "{request.description}"
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-2xl">
                      <div>
                        <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Budget / Target Price</p>
                        <p className="font-black text-pink-600 text-sm italic">{request.budget ? `PKR ${Number(request.budget).toLocaleString()}` : 'Negotiable'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Waiting Time</p>
                        <p className="font-black text-amber-600 text-sm flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {request.delivery_days || 3} Days Max
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-gray-100 pt-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-500 flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-pink-500" /> {request.customer_name}
                        </span>
                        <div className="flex items-center gap-2">
                          <a 
                            href={`https://wa.me/${(request.customer_mobile || '').replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-1 hover:bg-green-600 shadow-sm"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                          <a 
                            href={`tel:${request.customer_mobile}`} 
                            className="p-2 bg-pink-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-1 hover:bg-pink-700 shadow-sm"
                          >
                            <Phone className="w-3.5 h-3.5" /> Call
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5 text-xs text-gray-600 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="truncate">{request.customer_address}</p>
                      </div>
                    </div>

                    {Array.isArray(request.image_urls) && request.image_urls.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        {request.image_urls.map((url, i) => (
                          <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                            <img src={url || undefined} referrerPolicy="no-referrer" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="Request" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    {request.status === 'PENDING' && (
                      <>
                        <button 
                          onClick={() => updateRequestStatus(request.id, 'APPROVED')}
                          className="flex-1 py-3 bg-green-600 text-white font-black rounded-2xl uppercase tracking-widest text-[9px] shadow-md shadow-green-600/20 active:scale-95 transition-all"
                        >
                          Approve Live
                        </button>
                        <button 
                          onClick={() => updateRequestStatus(request.id, 'REJECTED')}
                          className="flex-1 py-3 bg-red-50 text-red-600 font-black rounded-2xl uppercase tracking-widest text-[9px] active:scale-95 transition-all"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {request.status === 'APPROVED' && (
                      <button 
                        onClick={() => updateRequestStatus(request.id, 'COMPLETED')}
                        className="w-full py-3 bg-blue-600 text-white font-black rounded-2xl uppercase tracking-widest text-[9px] shadow-md shadow-blue-600/20 active:scale-95 transition-all"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB 5: LOYALTY CARDS ----------------- */}
      {activeAdminTab === 'LOYALTY' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between px-2">
             <div className="space-y-1">
               <h2 className="text-xl font-black uppercase italic tracking-tighter text-gray-900">Loyalty Membership Cards</h2>
               <p className="text-[9px] font-black text-pink-500 uppercase tracking-widest">Manage discount tiers and member benefits</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loyaltyPlans.map((plan) => (
              <div key={plan.id} className="bg-white p-6 md:p-8 rounded-[3.5rem] border border-gray-100 shadow-xl space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 shadow-inner flex-shrink-0">
                      <Trophy className="w-6 h-6" />
                   </div>
                   <div className="flex-1">
                      <input 
                        className="w-full text-lg font-black uppercase italic tracking-tighter outline-none focus:text-pink-600"
                        value={plan.name}
                        onChange={(e) => updateLoyaltyField(plan.id, 'name', e.target.value)}
                      />
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[10px] font-bold text-gray-400">PRICE: PKR</span>
                         <input 
                           type="number"
                           className="w-24 text-[10px] font-black bg-gray-50 px-2 py-1 rounded-lg outline-none"
                           value={plan.price}
                           onChange={(e) => updateLoyaltyField(plan.id, 'price', Number(e.target.value))}
                         />
                      </div>
                   </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100 text-xs">
                   <div className="flex items-center justify-between">
                      <span className="font-black uppercase text-gray-500 tracking-widest text-[10px]">Discount %</span>
                      <input 
                        type="number"
                        className="w-16 text-right font-black text-pink-600 px-2 py-1 bg-pink-50 rounded-lg outline-none"
                        value={plan.discount_percentage}
                        onChange={(e) => updateLoyaltyField(plan.id, 'discount_percentage', Number(e.target.value))}
                      />
                   </div>

                   <div className="flex items-center justify-between">
                      <span className="font-black uppercase text-gray-500 tracking-widest text-[10px]">Free Delivery</span>
                      <button 
                        onClick={() => updateLoyaltyField(plan.id, 'free_delivery', !plan.free_delivery)}
                        className={`w-12 h-6 rounded-full transition-all relative ${plan.free_delivery ? 'bg-green-500' : 'bg-gray-200'}`}
                      >
                         <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${plan.free_delivery ? 'right-1' : 'left-1'}`}></div>
                      </button>
                   </div>

                   <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Special Gift</p>
                      <input 
                        className="w-full text-xs font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded-xl border-none"
                        value={plan.gift_info || ''}
                        placeholder="e.g. Free Gift Hamper"
                        onChange={(e) => updateLoyaltyField(plan.id, 'gift_info', e.target.value)}
                      />
                   </div>

                   <div className="space-y-2">
                      <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Custom Benefits (One per line)</p>
                      <textarea 
                        className="w-full text-[10px] font-bold text-pink-600 bg-pink-50 p-3.5 rounded-2xl min-h-[100px] outline-none border-2 border-transparent focus:border-pink-200 transition-all"
                        value={(plan.custom_benefits || []).filter(Boolean).join('\n')}
                        onChange={(e) => updateLoyaltyField(plan.id, 'custom_benefits', e.target.value.split('\n').map(s => s.trim()))}
                      />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- TAB 6: FESTIVAL THEMES ----------------- */}
      {activeAdminTab === 'THEME' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between px-2">
            <div className="space-y-1">
              <h2 className="text-xl font-black uppercase italic tracking-tighter text-gray-900">Festival & Seasonal Themes</h2>
              <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest">Switch district theme banners for Eid, Ramzan, Independence Day & Shopping Festivals</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             {PK_EVENTS.map(event => (
                <button 
                  key={event.id} 
                  onClick={() => onUpdateEvent(event)} 
                  className={`p-8 rounded-[3rem] border-4 transition-all text-left relative overflow-hidden group ${activeEvent.id === event.id ? 'border-pink-600 bg-pink-50 shadow-xl' : 'border-white bg-white shadow-sm hover:border-gray-100'}`}
                >
                   <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">{event.emoji}</span>
                   <p className="font-black text-[11px] uppercase text-gray-900 leading-none mb-1.5 tracking-widest">{event.name}</p>
                   <p className="urdu-font text-2xl text-gray-400">{event.urduName}</p>
                   {activeEvent.id === event.id && (
                     <div className="absolute top-4 right-4 bg-pink-600 text-white p-1 rounded-full shadow-md">
                       <Check className="w-3.5 h-3.5" />
                     </div>
                   )}
                   <div className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: event.primaryColor }}></div>
                </button>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
