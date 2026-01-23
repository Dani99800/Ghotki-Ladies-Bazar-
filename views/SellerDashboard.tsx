
import React, { useState, useRef, useEffect } from 'react';
import { 
  PlusCircle, ShoppingBag, Package, X, Video, Image as ImageIcon,
  Check, Upload, Bell, Clock, ChevronRight, User, MapPin, 
  Phone, Sparkles, Loader2, Volume2, DollarSign, AlertCircle, FileVideo, Store, Building2, Globe
} from 'lucide-react';
import { Product, Order, User as UserType, Shop } from '../types';
import { CATEGORIES, BAZAARS } from '../constants';
import { supabase, uploadFile } from '../services/supabase';

interface SellerDashboardProps {
  products: Product[];
  user: UserType;
  addProduct: (p: Product) => void;
  orders: Order[];
  shops: Shop[];
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ products, user, addProduct, orders, shops }) => {
  const [activeTab, setActiveTab] = useState<'Inventory' | 'Orders' | 'Alerts'>('Inventory');
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<'IDLE' | 'UPLOADING' | 'PUBLISHING'>('IDLE');
  const [loadingShop, setLoadingShop] = useState(false);
  const [launchSuccess, setLaunchSuccess] = useState(false);
  
  const myShop = shops.find(s => s.owner_id === user.id);
  const myProducts = products.filter(p => p.shopId === myShop?.id);
  const myOrders = orders.filter(o => o.sellerId === myShop?.id);

  const [setupData, setSetupData] = useState({
    name: '',
    bazaar: BAZAARS[0],
    category: CATEGORIES[0].name,
    bio: ''
  });

  // Pull initial data from auth user metadata to pre-fill onboarding
  useEffect(() => {
    if (!myShop && supabase) {
      const getInitialMeta = async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser?.user_metadata) {
          const meta = authUser.user_metadata;
          setSetupData(prev => ({
            ...prev,
            name: meta.shop_name || meta.full_name || prev.name,
            bazaar: meta.bazaar || prev.bazaar,
            category: meta.category || prev.category
          }));
        }
      };
      getInitialMeta();
    }
  }, [myShop]);

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || loadingShop) return; // Guard against multiple clicks
    
    setLoadingShop(true);
    
    try {
      const { error } = await supabase.from('shops').insert({
        owner_id: user.id,
        name: setupData.name,
        bazaar: setupData.bazaar,
        category: setupData.category,
        bio: setupData.bio,
        subscription_tier: user.subscription_tier || 'BASIC',
        status: 'PENDING',
        logo_url: 'https://images.unsplash.com/photo-1594465911325-1e42f9d37536?auto=format&fit=crop&q=80&w=200',
        banner_url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?auto=format&fit=crop&q=80&w=800'
      });

      if (error) {
        if (error.message.includes('column "bio"')) {
           alert("SCHEMA ERROR: Missing 'bio' column. Please run this in Supabase SQL Editor: ALTER TABLE shops ADD COLUMN bio TEXT;");
        } else {
           alert("Launch Error: " + error.message);
        }
        throw error;
      }
      
      setLaunchSuccess(true);
      // Wait a moment for database consistency before refreshing
      setTimeout(() => {
        window.location.reload(); 
      }, 2000);

    } catch (err: any) {
      console.error("Shop Setup Failed:", err);
    } finally {
      setLoadingShop(false);
    }
  };

  if (launchSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in zoom-in duration-500">
         <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
            <Check className="w-12 h-12" />
         </div>
         <h2 className="text-3xl font-black uppercase italic tracking-tighter">Store Launched!</h2>
         <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Finalizing your digital storefront...</p>
         <Loader2 className="animate-spin text-pink-600" />
      </div>
    );
  }

  if (!myShop) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-8 animate-in fade-in py-12 pb-32">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-pink-100 text-pink-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl rotate-6 border-4 border-white">
            <Building2 className="w-12 h-12" />
          </div>
          <div className="space-y-1">
             <h1 className="text-3xl font-black uppercase italic tracking-tighter">Business Setup</h1>
             <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Setup your bazaar presence</p>
          </div>
        </div>

        <form onSubmit={handleCreateShop} className="space-y-6 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-2xl shadow-pink-100/20">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Shop Name</label>
            <input required type="text" placeholder="e.g. Ghotki Traditional Fabrics" className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-pink-500/20" value={setupData.name} onChange={e => setSetupData({...setupData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Market</label>
              <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-pink-500/20" value={setupData.bazaar} onChange={e => setSetupData({...setupData, bazaar: e.target.value})}>
                {BAZAARS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
              <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-pink-500/20" value={setupData.category} onChange={e => setSetupData({...setupData, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">About Your Shop</label>
             <textarea required placeholder="Specialties, history, or craftsmanship..." className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-none h-24 resize-none outline-none focus:ring-2 focus:ring-pink-500/20" value={setupData.bio} onChange={e => setSetupData({...setupData, bio: e.target.value})} />
          </div>

          <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex gap-3 items-center">
             <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
             <p className="text-[9px] font-black text-orange-800 uppercase leading-tight tracking-tight">Your store will be visible to buyers once GLB Admin approves this profile.</p>
          </div>

          <button disabled={loadingShop} className="w-full bg-pink-600 text-white font-black py-5 rounded-[2rem] uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
            {loadingShop ? <Loader2 className="animate-spin w-5 h-5" /> : <>Complete Onboarding <Globe className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32 animate-in fade-in">
       {/* Header Stat Card */}
      <div className="bg-gradient-to-br from-gray-900 to-pink-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl -mt-32 -mr-32" />
        <div className="relative z-10 flex justify-between items-start mb-10">
           <div className="space-y-1">
              <div className="flex items-center gap-2">
                 <h1 className="text-2xl font-black italic uppercase tracking-tighter">{myShop.name}</h1>
                 <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase ${myShop.status === 'APPROVED' ? 'bg-green-500' : 'bg-orange-500'}`}>{myShop.status}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-pink-300">{myShop.bazaar}</p>
           </div>
           <button onClick={() => setShowAddModal(true)} className="w-12 h-12 bg-white text-pink-600 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"><PlusCircle className="w-7 h-7" /></button>
        </div>
        
        <div className="grid grid-cols-2 gap-6 relative z-10">
           <div className="space-y-1">
              <p className="text-3xl font-black tracking-tighter italic">PKR {myOrders.reduce((a, b) => a + b.total, 0).toLocaleString()}</p>
              <p className="text-[9px] font-black uppercase text-pink-300/60">Total Gross Volume</p>
           </div>
           <div className="space-y-1">
              <p className="text-3xl font-black tracking-tighter italic">PKR {(myOrders.length * 1000).toLocaleString()}</p>
              <p className="text-[9px] font-black uppercase text-pink-300/60">Platform Fees Due</p>
           </div>
        </div>
      </div>

      <div className="flex gap-3 p-1.5 bg-gray-100 rounded-[1.8rem]">
        {['Inventory', 'Orders', 'Alerts'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-400'}`}>{tab}</button>
        ))}
      </div>

      {activeTab === 'Inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {myProducts.length === 0 ? (
             <div className="col-span-full py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                   <Package className="w-8 h-8" />
                </div>
                <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">No products listed yet</p>
                <button onClick={() => setShowAddModal(true)} className="text-pink-600 font-black uppercase text-[10px] underline">Add Your First Product</button>
             </div>
           ) : myProducts.map(p => (
             <div key={p.id} className="bg-white p-5 rounded-[2.5rem] border border-gray-100 flex items-center gap-5 shadow-sm group hover:border-pink-200 transition-all">
                <img src={p.images?.[0] || 'https://via.placeholder.com/150'} className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-50" />
                <div className="flex-1">
                   <h3 className="font-black text-sm text-gray-900 truncate uppercase italic">{p.name}</h3>
                   <p className="text-pink-600 font-black text-xs italic">PKR {p.price.toLocaleString()}</p>
                   <div className="flex items-center gap-2 mt-2">
                      <span className="text-[8px] font-black px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full uppercase">{p.category}</span>
                      {p.videoUrl && <div className="flex items-center gap-1 text-pink-500 font-black text-[8px] uppercase"><FileVideo className="w-2.5 h-2.5" /> Reel</div>}
                   </div>
                </div>
                <ChevronRight className="text-gray-200 group-hover:text-pink-300 transition-colors" />
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
