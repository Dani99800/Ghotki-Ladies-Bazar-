
import React, { useState, useEffect, useRef } from 'react';
import { 
  PlusCircle, ShoppingBag, X, Video, Image as ImageIcon,
  Loader2, Settings, Camera, PlayCircle, Trash2, 
  Package, Check, MessageCircle, Edit3, Save, UploadCloud, BellRing,
  Lock, Film, Sparkles, AlertCircle, Phone, RefreshCw, Store, CreditCard, Building2, Smartphone, ShieldCheck, Clock, Plus,
  ChevronRight, DollarSign, Tag, FileText
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
  const [isDataChecked, setIsDataChecked] = useState(false);

  // File Upload States
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: CATEGORIES[0].name,
    description: '',
    images: [] as string[],
    videoUrl: ''
  });

  const myShop = shops.find(s => s.owner_id === user.id || (s as any).ownerId === user.id);
  
  const [settingsForm, setSettingsForm] = useState({
    name: '', bio: '', mobile: '', whatsapp: '',
    logo: '', banner: '',
    easypaisa: '', jazzcash: '', bank: ''
  });

  const [setupForm, setSetupForm] = useState({
    shopName: '', bazaar: BAZAARS[0], category: CATEGORIES[0].name
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsDataChecked(true), 1500);
    return () => clearTimeout(timer);
  }, [shops]);

  useEffect(() => {
    if (myShop) {
      setSettingsForm({
        name: myShop.name || '', 
        bio: myShop.bio || '',
        mobile: myShop.mobile || myShop.whatsapp || '', 
        whatsapp: myShop.whatsapp || '',
        logo: myShop.logo || '', 
        banner: myShop.banner || '',
        easypaisa: myShop.easypaisa_number || '',
        jazzcash: myShop.jazzcash_number || '',
        bank: myShop.bank_details || ''
      });
    }
  }, [myShop?.id]);

  const handleFileUpload = async (file: File, bucket: string = 'marketplace') => {
    if (!supabase) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err: any) {
      console.error("Storage upload error:", err);
      alert("Upload failed: " + err.message);
      return null;
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !myShop) return;
    setUploadingMedia(true);
    const url = await handleFileUpload(file);
    if (url) {
      const { error } = await supabase.from('shops').update({ logo_url: url }).eq('id', myShop.id);
      if (!error) {
        setSettingsForm(prev => ({ ...prev, logo: url }));
        alert("Logo updated successfully!");
        refreshShop();
      } else {
        alert("Database update failed: " + error.message);
      }
    }
    setUploadingMedia(false);
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !myShop) return;
    setUploadingMedia(true);
    const url = await handleFileUpload(file);
    if (url) {
      const { error } = await supabase.from('shops').update({ banner_url: url }).eq('id', myShop.id);
      if (!error) {
        setSettingsForm(prev => ({ ...prev, banner: url }));
        alert("Banner updated successfully!");
        refreshShop();
      } else {
        alert("Database update failed: " + error.message);
      }
    }
    setUploadingMedia(false);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myShop) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('products').insert({
        shop_id: myShop.id,
        name: productForm.name,
        price: parseFloat(productForm.price),
        category: productForm.category,
        description: productForm.description,
        image_urls: productForm.images,
        video_url: productForm.videoUrl,
        tags: ['New']
      });

      if (error) throw error;
      
      addProduct(); // Refresh global products
      setShowModal(false);
      setProductForm({ name: '', price: '', category: CATEGORIES[0].name, description: '', images: [], videoUrl: '' });
      alert("Product listed successfully!");
    } catch (err: any) {
      alert("Listing failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    const url = await handleFileUpload(file);
    if (url) {
      setProductForm(prev => ({ ...prev, images: [...prev.images, url] }));
    }
    setUploadingMedia(false);
  };

  const handleAddProductVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    const url = await handleFileUpload(file);
    if (url) {
      setProductForm(prev => ({ ...prev, videoUrl: url }));
    }
    setUploadingMedia(false);
  };

  const handleSaveSettings = async () => {
    if (!myShop) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('shops').update({
        name: settingsForm.name,
        bio: settingsForm.bio,
        easypaisa_number: settingsForm.easypaisa,
        jazzcash_number: settingsForm.jazzcash,
        bank_details: settingsForm.bank,
        whatsapp: settingsForm.whatsapp,
        mobile: settingsForm.mobile
      }).eq('id', myShop.id);
      
      if (error) throw error;
      refreshShop();
      alert("Settings updated!");
    } catch (err: any) {
      alert("Save failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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
        banner_url: 'https://via.placeholder.com/800x400'
      });
      if (error) throw error;
      refreshShop();
    } catch (err: any) {
      alert("Setup Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const myProducts = products.filter(p => p.shopId === myShop?.id);
  const myOrders = orders.filter(o => o.sellerId === myShop?.id);

  if (!isDataChecked) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-6 bg-white">
        <Loader2 className="w-12 h-12 text-pink-600 animate-spin" />
        <p className="font-black uppercase tracking-widest text-[10px] text-gray-400">Merchant Handshake...</p>
      </div>
    );
  }

  if (!myShop) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center p-8 space-y-10 animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-pink-50 rounded-[2.5rem] flex items-center justify-center text-pink-600 shadow-inner">
           <Store className="w-12 h-12" />
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">Initialize Store</h2>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Connect your merchant profile to Ghotki Bazar.</p>
        </div>
        <form onSubmit={handleCreateShopRecord} className="w-full space-y-4">
           <input required placeholder="Shop Name" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-pink-500/10" value={setupForm.shopName} onChange={e => setSetupForm({...setupForm, shopName: e.target.value})} />
           <select className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none appearance-none" value={setupForm.bazaar} onChange={e => setSetupForm({...setupForm, bazaar: e.target.value})}>
             {BAZAARS.map(b => <option key={b} value={b}>{b}</option>)}
           </select>
           <button disabled={loading} className="w-full py-5 bg-pink-600 text-white font-black rounded-2xl uppercase tracking-widest text-[11px] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
             {loading ? <Loader2 className="animate-spin" /> : <><Plus className="w-5 h-5" /> Activate Merchant Panel</>}
           </button>
        </form>
      </div>
    );
  }

  if (myShop.status === 'PENDING') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center space-y-8 bg-white">
        <div className="w-32 h-32 bg-pink-50 rounded-[3rem] flex items-center justify-center text-pink-600 shadow-inner">
           <Clock className="w-16 h-16 animate-pulse" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">Awaiting Approval</h2>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest leading-relaxed max-w-sm mx-auto">
            Your shop "<span className="text-pink-600 italic">{myShop.name}</span>" is pending admin verification.
          </p>
        </div>
        <button onClick={refreshShop} className="px-10 py-5 bg-gray-900 text-white font-black rounded-[2rem] uppercase tracking-widest text-[11px] shadow-2xl flex items-center gap-3">
          <RefreshCw className="w-5 h-5" /> Refresh Status
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-32 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="relative h-64 rounded-[3rem] overflow-hidden shadow-2xl group/banner border-4 border-white">
        <img src={settingsForm.banner} className="w-full h-full object-cover transition-transform group-hover/banner:scale-105 duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-4 right-4 z-10">
           <button onClick={() => bannerInputRef.current?.click()} className="p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-all">
             {uploadingMedia ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
           </button>
           <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={handleBannerChange} />
        </div>
        <div className="absolute bottom-8 left-8 flex items-center gap-6">
           <div className="relative group/logo">
             <img src={settingsForm.logo} className="w-24 h-24 rounded-3xl border-4 border-white object-cover bg-white shadow-xl" />
             <button onClick={() => logoInputRef.current?.click()} className="absolute inset-0 bg-black/40 opacity-0 group-hover/logo:opacity-100 transition-opacity rounded-3xl flex items-center justify-center text-white">
               {uploadingMedia ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
             </button>
             <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
           </div>
           <div className="text-white">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">{myShop.name}</h2>
              <p className="text-[10px] font-black uppercase text-pink-400 tracking-[0.2em] mt-2">{myShop.category} • {myShop.bazaar}</p>
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
        <div className="space-y-6">
          <div className="flex justify-between items-center px-4">
             <h3 className="font-black uppercase text-sm tracking-widest text-gray-900">Store Catalog</h3>
             <button onClick={() => setShowModal(true)} className="bg-pink-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95 transition-all">
                <PlusCircle className="w-4 h-4" /> Add Product
             </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myProducts.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex items-center gap-5 shadow-sm hover:shadow-xl transition-all">
                <img src={p.images?.[0]} className="w-16 h-16 rounded-2xl object-cover bg-gray-50 shadow-inner" />
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-black text-xs uppercase truncate italic text-gray-900">{p.name}</h4>
                  <p className="text-pink-600 font-black text-sm italic">PKR {p.price.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                   {p.videoUrl && <div className="p-2 bg-pink-50 text-pink-600 rounded-lg"><Film className="w-4 h-4" /></div>}
                   <button className="p-3 bg-gray-50 text-gray-300 rounded-xl hover:text-pink-600 transition-all"><Edit3 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {myProducts.length === 0 && (
               <div className="col-span-full py-20 text-center border-4 border-dashed border-gray-50 rounded-[3rem]">
                 <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                 <p className="text-gray-300 font-black uppercase text-xs">No products listed</p>
               </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Orders' && (
        <div className="space-y-4">
          {myOrders.length === 0 ? (
            <div className="py-32 bg-white rounded-[3rem] text-center border border-dashed border-gray-100">
               <BellRing className="w-16 h-16 text-gray-100 mx-auto mb-4" />
               <p className="text-gray-300 font-black uppercase text-[10px] tracking-widest">No active orders</p>
            </div>
          ) : myOrders.map(order => (
            <div key={order.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID: #{order.id.slice(-5).toUpperCase()}</p>
                    <p className="font-black text-xl text-gray-900">{order.buyerName}</p>
                  </div>
                  <span className={`px-4 py-1.5 bg-pink-50 text-pink-600 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse`}>
                    {order.status}
                  </span>
               </div>
               <div className="flex items-center gap-3">
                  <button onClick={() => window.open(`https://wa.me/${order.buyerMobile.replace(/^0/, '92')}`)} className="flex-1 py-4 bg-green-50 text-green-600 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" /> WhatsApp Buyer
                  </button>
                  <button className="p-4 bg-gray-900 text-white rounded-2xl shadow-lg"><Check className="w-5 h-5" /></button>
               </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Settings' && (
         <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
           <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSaveSettings(); }}>
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Store Information</p>
                 <input placeholder="Store Name" className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-4 focus:ring-pink-500/10" value={settingsForm.name} onChange={e => setSettingsForm({...settingsForm, name: e.target.value})} />
                 <textarea placeholder="Store Bio" className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-4 focus:ring-pink-500/10 h-32 resize-none" value={settingsForm.bio} onChange={e => setSettingsForm({...settingsForm, bio: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment: EasyPaisa</p>
                    <input placeholder="EasyPaisa Number" className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-none outline-none" value={settingsForm.easypaisa} onChange={e => setSettingsForm({...settingsForm, easypaisa: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment: JazzCash</p>
                    <input placeholder="JazzCash Number" className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-none outline-none" value={settingsForm.jazzcash} onChange={e => setSettingsForm({...settingsForm, jazzcash: e.target.value})} />
                 </div>
              </div>
              <button disabled={loading} className="w-full py-5 bg-pink-600 text-white font-black rounded-3xl uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 transition-all">
                {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Save Store Changes'}
              </button>
           </form>
         </div>
      )}

      {/* Product Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-t-[3.5rem] p-8 space-y-8 animate-in slide-in-from-bottom-full duration-500 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center">
                       <PlusCircle className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">New Product</h2>
                 </div>
                 <button onClick={() => setShowModal(false)} className="p-3 bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-6 pb-10">
                 <div className="space-y-3">
                    <div className="relative">
                       <input required placeholder="Product Title" className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-none outline-none" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="relative flex items-center">
                          <DollarSign className="absolute left-4 w-4 h-4 text-gray-300" />
                          <input required type="number" placeholder="Price (PKR)" className="w-full p-5 pl-10 bg-gray-50 rounded-2xl font-bold border-none outline-none" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} />
                       </div>
                       <select className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-none outline-none appearance-none" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                          {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                       </select>
                    </div>
                    <textarea placeholder="Product Description" className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-none outline-none h-32 resize-none" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                 </div>

                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Media Assets</p>
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                       <label className="flex-shrink-0 w-24 h-24 bg-pink-50 border-2 border-dashed border-pink-100 rounded-3xl flex flex-col items-center justify-center text-pink-600 cursor-pointer hover:bg-pink-100 transition-all">
                          {uploadingMedia ? <Loader2 className="animate-spin" /> : <ImageIcon className="w-6 h-6" />}
                          <span className="text-[8px] font-black uppercase mt-1">Add Image</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleAddProductImage} />
                       </label>
                       
                       <label className={`flex-shrink-0 w-24 h-24 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all ${productForm.videoUrl ? 'bg-green-50 border-green-200 text-green-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                          {uploadingMedia ? <Loader2 className="animate-spin" /> : <Film className="w-6 h-6" />}
                          <span className="text-[8px] font-black uppercase mt-1">{productForm.videoUrl ? 'Video Ready' : 'Add Video'}</span>
                          <input type="file" className="hidden" accept="video/*" onChange={handleAddProductVideo} />
                       </label>

                       {productForm.images.map((url, i) => (
                          <div key={i} className="relative flex-shrink-0 w-24 h-24 rounded-3xl overflow-hidden shadow-sm">
                             <img src={url} className="w-full h-full object-cover" />
                             <button type="button" onClick={() => setProductForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full"><X className="w-3 h-3" /></button>
                          </div>
                       ))}
                    </div>
                 </div>

                 <button disabled={loading || uploadingMedia} className="w-full py-5 bg-pink-600 text-white font-black rounded-3xl uppercase tracking-widest text-[11px] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                   {loading ? <Loader2 className="animate-spin" /> : <><Sparkles className="w-5 h-5" /> Launch Product</>}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
