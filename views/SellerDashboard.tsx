
import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, ShoppingBag, X, Video, Image as ImageIcon,
  Loader2, Settings, Camera, PlayCircle, Trash2, 
  Package, Check, MessageCircle, Edit3, Save, UploadCloud, BellRing,
  Lock, Film, Sparkles, AlertCircle, Phone, RefreshCw, Store, CreditCard, Building2, Smartphone, ShieldCheck, Clock, Plus
} from 'lucide-react';
import { Product, Order, User as UserType, Shop } from '../types';
import { CATEGORIES, BAZAARS } from '../constants';
import { supabase, uploadFile } from '../services/supabase';

interface SellerDashboardProps {
  products: Product[];
  user: UserType;
  addProduct: () => void;
  orders: Order[];
  shops: Shop[];
  refreshShop: () => void;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ products, user, addProduct, orders, shops, refreshShop }) => {
  const [activeTab, setActiveTab] = useState<'Inventory' | 'Orders' | 'Settings'>('Inventory');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [isDataChecked, setIsDataChecked] = useState(false);

  // Robust check for shop ownership
  const myShop = shops.find(s => s.owner_id === user.id || (s as any).ownerId === user.id);
  
  const [settingsForm, setSettingsForm] = useState({
    name: '', bio: '', mobile: '', whatsapp: '',
    logoPreview: '', bannerPreview: '',
    easypaisa: '', jazzcash: '', bank: ''
  });

  const [setupForm, setSetupForm] = useState({
    shopName: '', bazaar: BAZAARS[0], category: CATEGORIES[0].name
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsDataChecked(true), 2500);
    return () => clearTimeout(timer);
  }, [shops]);

  useEffect(() => {
    if (myShop) {
      setSettingsForm({
        name: myShop.name || '', 
        bio: myShop.bio || '',
        mobile: myShop.mobile || myShop.whatsapp || '', 
        whatsapp: myShop.whatsapp || '',
        logoPreview: myShop.logo || '', 
        bannerPreview: myShop.banner || '',
        easypaisa: myShop.easypaisa_number || '',
        jazzcash: myShop.jazzcash_number || '',
        bank: myShop.bank_details || ''
      });
    }
  }, [myShop?.id]);

  const handleCreateShopRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('shops').insert({
        owner_id: user.id,
        name: setupForm.shopName,
        bazaar: setupForm.bazaar,
        category: setupForm.category,
        subscription_tier: user.subscription_tier || 'BASIC',
        status: 'PENDING',
        logo_url: 'https://via.placeholder.com/150',
        banner_url: 'https://via.placeholder.com/800x400',
        sort_priority: 0,
        featured: false
      });
      if (error) throw error;
      await refreshShop();
      alert("Shop record created! Waiting for Admin approval.");
    } catch (err: any) {
      alert("Setup Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const myProducts = products.filter(p => p.shopId === myShop?.id);
  const myOrders = orders.filter(o => o.sellerId === myShop?.id);

  // State 1: Loading
  if (!isDataChecked) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-6 bg-white">
        <Loader2 className="w-12 h-12 text-pink-600 animate-spin" />
        <p className="font-black uppercase tracking-widest text-[10px] text-gray-400">Syncing Store Data...</p>
      </div>
    );
  }

  // State 2: Missing Shop Record (Auto-Fix)
  if (!myShop) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center p-8 space-y-10 animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-pink-50 rounded-[2.5rem] flex items-center justify-center text-pink-600 shadow-inner">
           <Store className="w-12 h-12" />
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">Complete Setup</h2>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Let's initialize your store record.</p>
        </div>
        
        <form onSubmit={handleCreateShopRecord} className="w-full space-y-4">
           <input required placeholder="Shop Name" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none" value={setupForm.shopName} onChange={e => setSetupForm({...setupForm, shopName: e.target.value})} />
           <select className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none appearance-none" value={setupForm.bazaar} onChange={e => setSetupForm({...setupForm, bazaar: e.target.value})}>
             {BAZAARS.map(b => <option key={b} value={b}>{b}</option>)}
           </select>
           <button disabled={loading} className="w-full py-5 bg-pink-600 text-white font-black rounded-2xl uppercase tracking-widest text-[11px] shadow-2xl flex items-center justify-center gap-3">
             {loading ? <Loader2 className="animate-spin" /> : <><Plus className="w-5 h-5" /> Initialize Store</>}
           </button>
        </form>
      </div>
    );
  }

  // State 3: Pending Approval
  if (myShop.status === 'PENDING') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center space-y-8 bg-white animate-in fade-in duration-500">
        <div className="w-32 h-32 bg-pink-50 rounded-[3rem] flex items-center justify-center text-pink-600 shadow-inner">
           <Clock className="w-16 h-16 animate-pulse" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">Awaiting Approval</h2>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest leading-relaxed max-w-sm mx-auto">
            Your shop "<span className="text-pink-600 italic">{myShop.name}</span>" is in the approval queue. The Admin will review and verify your merchant status shortly.
          </p>
        </div>
        <button onClick={refreshShop} className="px-10 py-5 bg-gray-900 text-white font-black rounded-[2rem] uppercase tracking-widest text-[11px] shadow-2xl flex items-center gap-3 active:scale-95 transition-all">
          <RefreshCw className="w-5 h-5" /> Check Status
        </button>
      </div>
    );
  }

  // State 4: Fully Approved Dashboard
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-32 animate-in fade-in duration-500">
      {/* Banner / Header */}
      <div className="relative h-56 rounded-[3rem] overflow-hidden shadow-2xl group/banner">
        <img src={myShop.banner} className="w-full h-full object-cover transition-transform group-hover/banner:scale-105 duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-8 left-8 flex items-center gap-6">
           <img src={myShop.logo} className="w-24 h-24 rounded-3xl border-4 border-white object-cover bg-white shadow-xl" />
           <div className="text-white">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">{myShop.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                 <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest">{myShop.subscription_tier} MEMBER</span>
                 <span className="flex items-center gap-1 text-green-400 text-[10px] font-black uppercase tracking-widest"><ShieldCheck className="w-3 h-3" /> Approved</span>
              </div>
           </div>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-[2.5rem] shadow-inner">
        {['Inventory', 'Orders', 'Settings'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-pink-600 shadow-xl' : 'text-gray-400'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Inventory' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center px-4">
             <h3 className="font-black uppercase text-sm tracking-widest text-gray-900">Manage Catalog</h3>
             <button onClick={() => { setShowModal(true); }} className="bg-pink-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95 transition-all">
                <PlusCircle className="w-4 h-4" /> Add Product
             </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myProducts.length === 0 ? (
               <div className="col-span-full py-20 text-center border-4 border-dashed border-gray-50 rounded-[3rem]">
                 <p className="text-gray-300 font-black uppercase text-xs">No products listed yet</p>
               </div>
            ) : myProducts.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex items-center gap-5 shadow-sm group hover:shadow-xl transition-all">
                <img src={p.images?.[0]} className="w-16 h-16 rounded-2xl object-cover bg-gray-50 shadow-inner" />
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-black text-xs uppercase truncate italic text-gray-900">{p.name}</h4>
                  <p className="text-pink-600 font-black text-sm italic">PKR {p.price.toLocaleString()}</p>
                </div>
                <button className="p-3 bg-gray-50 text-gray-300 rounded-xl hover:text-pink-600 hover:bg-pink-50 transition-all">
                   <Edit3 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Orders' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4">
          {myOrders.length === 0 ? (
            <div className="py-32 bg-white rounded-[3rem] text-center space-y-4 border border-dashed border-gray-100">
               <Package className="w-16 h-16 text-gray-100 mx-auto" />
               <p className="text-gray-300 font-black uppercase text-[10px] tracking-widest">Waiting for your first order...</p>
            </div>
          ) : myOrders.map(order => (
            <div key={order.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
               <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID: #{order.id.slice(-5).toUpperCase()}</p>
                    <p className="font-black text-xl text-gray-900 leading-none">{order.buyerName}</p>
                  </div>
                  <span className="px-4 py-1.5 bg-pink-50 text-pink-600 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">Pending</span>
               </div>
               
               <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {order.items.map((it, i) => (
                    <img key={i} src={it.images[0]} className="w-14 h-14 rounded-xl border object-cover shadow-sm" />
                  ))}
               </div>

               <div className="flex items-center gap-3">
                  <button onClick={() => window.open(`https://wa.me/${order.buyerMobile.replace(/^0/, '92')}`)} className="flex-1 py-4 bg-green-50 text-green-600 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 border border-green-100 shadow-sm">
                    <MessageCircle className="w-4 h-4" /> WhatsApp Buyer
                  </button>
                  <button className="p-4 bg-gray-900 text-white rounded-2xl active:scale-95 transition-all shadow-lg">
                    <Check className="w-5 h-5" />
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Settings' && (
         <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
           <form className="space-y-6">
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Store Information</p>
                 <input placeholder="Store Name" className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-4 focus:ring-pink-500/10" value={settingsForm.name} onChange={e => setSettingsForm({...settingsForm, name: e.target.value})} />
                 <textarea placeholder="Tell your store story..." className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-4 focus:ring-pink-500/10 h-32 resize-none" value={settingsForm.bio} onChange={e => setSettingsForm({...settingsForm, bio: e.target.value})} />
              </div>
              
              <div className="space-y-2 pt-4">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment Details</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input placeholder="EasyPaisa Number" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none" value={settingsForm.easypaisa} onChange={e => setSettingsForm({...settingsForm, easypaisa: e.target.value})} />
                    <input placeholder="JazzCash Number" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none" value={settingsForm.jazzcash} onChange={e => setSettingsForm({...settingsForm, jazzcash: e.target.value})} />
                 </div>
              </div>

              <button className="w-full py-5 bg-pink-600 text-white font-black rounded-3xl uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 transition-all">
                Save Profile Updates
              </button>
           </form>
         </div>
      )}
    </div>
  );
};

export default SellerDashboard;
