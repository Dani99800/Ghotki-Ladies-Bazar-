
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
  
  // Find the specific shop owned by this user
  const myShop = shops.find(s => s.owner_id === user.id);
  const myProducts = products.filter(p => p.shopId === myShop?.id);
  const myOrders = orders.filter(o => o.sellerId === myShop?.id);

  const [setupData, setSetupData] = useState({
    name: '',
    bazaar: BAZAARS[0],
    category: CATEGORIES[0].name,
    bio: ''
  });

  // Pull initial data from auth user metadata if shop doesn't exist
  useEffect(() => {
    if (!myShop && supabase) {
      supabase.auth.getUser().then(({ data: { user: authUser } }) => {
        if (authUser?.user_metadata) {
          const meta = authUser.user_metadata;
          setSetupData(prev => ({
            ...prev,
            name: meta.shop_name || prev.name,
            bazaar: meta.bazaar || prev.bazaar,
            category: meta.category || prev.category
          }));
        }
      });
    }
  }, [myShop]);

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
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
      if (error) throw error;
      window.location.reload(); 
    } catch (err: any) {
      alert("Shop creation failed: " + err.message);
    } finally {
      setLoadingShop(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myShop || !supabase) return;
    setUploadProgress('UPLOADING');
    // ... logic for adding product ...
    // (Existing product logic from previous updates remains valid)
  };

  if (!myShop) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-8 animate-in fade-in py-12 pb-32">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-pink-100 text-pink-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl rotate-6 border-4 border-white">
            <Building2 className="w-12 h-12" />
          </div>
          <div className="space-y-1">
             <h1 className="text-3xl font-black uppercase italic tracking-tighter">Open Your Store</h1>
             <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Complete your profile to go live</p>
          </div>
        </div>

        <form onSubmit={handleCreateShop} className="space-y-6 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-2xl shadow-pink-100/20">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Business Name</label>
            <input required type="text" className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-none" value={setupData.name} onChange={e => setSetupData({...setupData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Market</label>
              <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" value={setupData.bazaar} onChange={e => setSetupData({...setupData, bazaar: e.target.value})}>
                {BAZAARS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Category</label>
              <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" value={setupData.category} onChange={e => setSetupData({...setupData, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Shop Description</label>
             <textarea required placeholder="Tell customers about your shop..." className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-none h-24 resize-none" value={setupData.bio} onChange={e => setSetupData({...setupData, bio: e.target.value})} />
          </div>
          <button disabled={loadingShop} className="w-full bg-pink-600 text-white font-black py-5 rounded-[2rem] uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
            {loadingShop ? <Loader2 className="animate-spin" /> : <>Launch Shop Profile <Globe className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    );
  }

  // ... rest of Dashboard logic ...
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32">
       {/* Dashboard Content */}
       <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h2 className="text-xl font-black uppercase italic mb-4">Merchant Dashboard</h2>
          <div className="flex items-center gap-4 p-4 bg-pink-50 rounded-2xl border border-pink-100">
             <Sparkles className="text-pink-600" />
             <div className="flex-1">
                <p className="text-xs font-black uppercase text-pink-600">Status: {myShop.status}</p>
                <p className="text-[10px] text-pink-400 font-bold uppercase">Shop is created. Wait for Admin approval.</p>
             </div>
          </div>
          {/* Add more inventory tools here */}
       </div>
    </div>
  );
};

export default SellerDashboard;
