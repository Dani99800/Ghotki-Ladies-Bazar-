
import React, { useState, useEffect } from 'react';
import { 
  Store, Shield, Loader2, Check, Palette, Star, Trophy, ShoppingBag, Clock, ArrowUp, ArrowDown, CreditCard, X, ExternalLink, Package, User as UserIcon, MapPin
} from 'lucide-react';
import { Shop, Order, Category, AppEvent, Product, CustomRequest } from '../types';
import { supabase } from '../services/supabase';
import { PK_EVENTS, SUBSCRIPTION_PLANS } from '../constants';

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
  const [activeAdminTab, setActiveAdminTab] = useState<'SHOPS' | 'INVENTORY' | 'THEME' | 'CUSTOM_REQUESTS'>('SHOPS');
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);

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

  const sortedShops = [...shops].sort((a, b) => (b.sort_priority || 0) - (a.sort_priority || 0));

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32 animate-in fade-in duration-500">
      {/* Admin Header */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">Admin Authority</h1>
          <p className="text-[10px] font-black text-pink-600 uppercase tracking-[0.2em]">Curation & Merchant Control</p>
        </div>
        <div className="w-16 h-16 bg-pink-100 rounded-[2rem] flex items-center justify-center text-pink-600 shadow-inner"><Shield className="w-8 h-8" /></div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1.5 bg-gray-200 rounded-[2.5rem]">
        {[
          { id: 'SHOPS', icon: Store, label: 'Merchants' },
          { id: 'INVENTORY', icon: ShoppingBag, label: 'New Arrivals' },
          { id: 'CUSTOM_REQUESTS', icon: Package, label: 'Requests' },
          { id: 'THEME', icon: Palette, label: 'Themes' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveAdminTab(tab.id as any)} 
            className={`flex-1 py-4 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeAdminTab === tab.id ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Merchants Tab */}
      {activeAdminTab === 'SHOPS' && (
        <div className="space-y-12 animate-in slide-in-from-bottom-4">
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
                  <img src={product.images?.[0] || undefined} referrerPolicy="no-referrer" className="w-14 h-14 rounded-2xl object-cover shadow-sm bg-gray-50" />
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
