
import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, ShoppingBag, X, Video, Image as ImageIcon,
  Loader2, Settings, Camera, PlayCircle, Trash2, 
  Package, Check, MessageCircle, Edit3, Save, UploadCloud, BellRing,
  Lock, Film, Sparkles, AlertCircle, Phone, RefreshCw, Store, CreditCard, Building2, Smartphone, ShieldCheck, Clock
} from 'lucide-react';
import { Product, Order, User as UserType, Shop } from '../types';
import { CATEGORIES } from '../constants';
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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [isDataChecked, setIsDataChecked] = useState(false);
  
  const myShop = shops.find(s => s.owner_id === user.id);
  const isEligibleForVideo = myShop?.subscription_tier === 'STANDARD' || myShop?.subscription_tier === 'PREMIUM';

  const [settingsForm, setSettingsForm] = useState({
    name: '', bio: '', mobile: '', whatsapp: '',
    logoPreview: '', bannerPreview: '',
    easypaisa: '', jazzcash: '', bank: ''
  });

  const [productForm, setProductForm] = useState({
    name: '', price: '', category: CATEGORIES[0].name, description: '',
    videoFile: null as File | null, videoUrl: '', images: [] as File[], existingImageUrls: [] as string[]
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDataChecked(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [shops]);

  useEffect(() => {
    if (myShop) {
      setSettingsForm({
        name: myShop.name || '', 
        bio: myShop.bio || '',
        mobile: myShop.mobile || '', 
        whatsapp: myShop.whatsapp || '',
        logoPreview: myShop.logo || '', 
        bannerPreview: myShop.banner || '',
        easypaisa: myShop.easypaisa_number || '',
        jazzcash: myShop.jazzcash_number || '',
        bank: myShop.bank_details || ''
      });
    }
  }, [myShop?.id, myShop?.logo, myShop?.banner, myShop?.easypaisa_number, myShop?.jazzcash_number, myShop?.bank_details]);

  const myProducts = products.filter(p => p.shopId === myShop?.id);
  const myOrders = orders.filter(o => o.sellerId === myShop?.id);

  const handleInstantLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase || !myShop) return;

    setUploadingLogo(true);
    try {
      const path = `shops/${myShop.id}/logo_${Date.now()}`;
      const publicUrl = await uploadFile('marketplace', path, file);
      
      const { error } = await supabase.from('shops').update({
        logo_url: publicUrl
      }).eq('id', myShop.id);

      if (error) throw error;
      await refreshShop();
    } catch (err: any) {
      alert("Logo upload failed: " + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleInstantBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase || !myShop) return;

    setUploadingBanner(true);
    try {
      const path = `shops/${myShop.id}/banner_${Date.now()}`;
      const publicUrl = await uploadFile('marketplace', path, file);
      
      const { error } = await supabase.from('shops').update({
        banner_url: publicUrl
      }).eq('id', myShop.id);

      if (error) throw error;
      await refreshShop();
    } catch (err: any) {
      alert("Banner upload failed: " + err.message);
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleInfoUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !myShop) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('shops').update({
        name: settingsForm.name, 
        bio: settingsForm.bio, 
        mobile: settingsForm.mobile,
        whatsapp: settingsForm.whatsapp,
        easypaisa_number: settingsForm.easypaisa,
        jazzcash_number: settingsForm.jazzcash,
        bank_details: settingsForm.bank
      }).eq('id', myShop.id);

      if (error) throw error;
      await refreshShop();
      alert("Store info updated!");
    } catch (err: any) {
      alert("Update Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !myShop) return;
    setLoading(true);
    try {
      const uploadedUrls = [...productForm.existingImageUrls];
      for (const file of productForm.images) {
        const path = `products/${myShop.id}/${Date.now()}_${file.name}`;
        uploadedUrls.push(await uploadFile('marketplace', path, file));
      }

      let finalVideoUrl = productForm.videoUrl;
      if (isEligibleForVideo && productForm.videoFile) {
        const videoPath = `videos/${myShop.id}/${Date.now()}_${productForm.videoFile.name}`;
        finalVideoUrl = await uploadFile('marketplace', videoPath, productForm.videoFile);
      }

      const productData = {
        shop_id: myShop.id, 
        name: productForm.name, 
        price: parseFloat(productForm.price),
        category: productForm.category, 
        description: productForm.description, 
        image_urls: uploadedUrls,
        video_url: finalVideoUrl
      };

      if (editingProduct) {
        await supabase.from('products').update(productData).eq('id', editingProduct.id);
      } else {
        await supabase.from('products').insert(productData);
      }

      setShowModal(false);
      setProductForm({
        name: '', price: '', category: CATEGORIES[0].name, description: '',
        videoFile: null, videoUrl: '', images: [], existingImageUrls: []
      });
      addProduct(); 
    } catch (err: any) { 
      console.error(err);
      alert("Operation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!myShop && !isDataChecked) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-6 bg-white p-10 text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-pink-100 border-t-pink-600 rounded-full animate-spin"></div>
          <Store className="absolute inset-0 m-auto w-8 h-8 text-pink-600 animate-pulse" />
        </div>
        <p className="font-black uppercase tracking-widest text-xs text-gray-900 italic">Accessing Store Vault...</p>
        <button onClick={refreshShop} className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-100"><RefreshCw className="w-4 h-4" /> Sync Now</button>
      </div>
    );
  }

  // PENDING APPROVAL SCREEN
  if (myShop && myShop.status === 'PENDING') {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-8 bg-white p-10 text-center animate-in fade-in duration-500">
        <div className="w-32 h-32 bg-pink-50 rounded-[2.5rem] flex items-center justify-center text-pink-600 shadow-inner relative overflow-hidden">
           <Clock className="w-16 h-16 animate-pulse" />
           <div className="absolute top-0 right-0 p-3 bg-pink-100/50 rounded-bl-3xl">
              <ShieldCheck className="w-5 h-5" />
           </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-black uppercase italic text-gray-900 tracking-tighter leading-tight">Application Under Review</h2>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest max-w-xs mx-auto">
            Your shop "<span className="text-pink-600 italic">{myShop.name}</span>" has been registered and is currently being verified by our administration team.
          </p>
        </div>
        <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 w-full max-w-xs space-y-4">
           <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
              <span>Status</span>
              <span className="text-pink-600 animate-pulse">Pending Approval</span>
           </div>
           <p className="text-[9px] text-gray-400 italic">You will get full dashboard access once approved. Usually takes 12-24 hours.</p>
        </div>
        <button onClick={refreshShop} className="px-10 py-5 bg-pink-600 text-white font-black rounded-3xl uppercase tracking-widest text-[11px] shadow-2xl flex items-center gap-3 transition-transform active:scale-95">
          <RefreshCw className="w-5 h-5" /> Refresh Status
        </button>
      </div>
    );
  }

  if (!myShop && isDataChecked) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-8 bg-white p-10 text-center animate-in fade-in duration-500">
        <AlertCircle className="w-12 h-12 text-pink-500" />
        <h2 className="text-2xl font-black uppercase italic text-gray-900">Shop Not Found</h2>
        <button onClick={refreshShop} className="px-10 py-5 bg-pink-600 text-white font-black rounded-3xl uppercase tracking-widest text-[11px] shadow-2xl flex items-center gap-3"><RefreshCw className="w-5 h-5" /> Retry Sync</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-32 animate-in fade-in duration-500">
      {/* Header Banner Section - Instant Click to Upload */}
      <div className="relative h-48 rounded-[3rem] overflow-hidden shadow-2xl group/banner cursor-pointer">
        {uploadingBanner && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        )}
        <label className="absolute inset-0 cursor-pointer z-10">
          <input type="file" className="hidden" accept="image/*" onChange={handleInstantBannerUpload} />
          <div className="absolute inset-0 bg-black/20 group-hover/banner:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover/banner:opacity-100">
            <div className="bg-white/90 p-3 rounded-2xl shadow-xl flex items-center gap-2">
              <Camera className="w-5 h-5 text-pink-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-pink-600">Update Banner</span>
            </div>
          </div>
        </label>
        <img src={myShop?.banner} className="w-full h-full object-cover transition-transform group-hover/banner:scale-105 duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-6 left-8 flex items-center gap-4 z-30 pointer-events-none">
           <div className="relative group/logo pointer-events-auto cursor-pointer">
              {uploadingLogo && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 rounded-3xl">
                  <Loader2 className="w-6 h-6 text-pink-600 animate-spin" />
                </div>
              )}
              <label className="absolute inset-0 cursor-pointer z-10">
                <input type="file" className="hidden" accept="image/*" onChange={handleInstantLogoUpload} />
                <div className="absolute inset-0 bg-black/0 group-hover/logo:bg-black/20 rounded-3xl transition-all flex items-center justify-center opacity-0 group-hover/logo:opacity-100">
                  <div className="bg-white/90 p-1.5 rounded-lg">
                    <Camera className="w-4 h-4 text-pink-600" />
                  </div>
                </div>
              </label>
              <img src={myShop?.logo} className="w-20 h-20 rounded-3xl border-4 border-white object-cover bg-white shadow-xl transition-transform group-hover/logo:scale-110" />
              {myShop?.featured && <div className="absolute -top-2 -right-2 bg-yellow-400 p-1.5 rounded-xl shadow-lg border-2 border-white"><Sparkles className="w-3 h-3 text-white" /></div>}
           </div>
           <div className="text-white drop-shadow-md">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{myShop?.name}</h2>
              <p className="text-[9px] font-black uppercase opacity-70 mt-1 tracking-widest">{myShop?.subscription_tier} • {myShop?.bazaar}</p>
           </div>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-[2.5rem] shadow-inner">
        {['Inventory', 'Orders', 'Settings'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-pink-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Settings' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="bg-white p-8 rounded-[3rem] border shadow-sm space-y-10">
            <form onSubmit={handleInfoUpdate} className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                  <ShoppingBag className="w-5 h-5 text-pink-500" />
                  <h3 className="font-black uppercase text-sm tracking-tighter text-gray-900">Store Info</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="Shop Name" className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-pink-500 outline-none" value={settingsForm.name} onChange={e => setSettingsForm({...settingsForm, name: e.target.value})} />
                  <input placeholder="WhatsApp Number" className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-pink-500 outline-none" value={settingsForm.whatsapp} onChange={e => setSettingsForm({...settingsForm, whatsapp: e.target.value})} />
                </div>
                <textarea placeholder="Shop Bio" className="w-full p-5 bg-gray-50 rounded-2xl font-bold h-32 border-2 border-transparent focus:border-pink-500 outline-none resize-none" value={settingsForm.bio} onChange={e => setSettingsForm({...settingsForm, bio: e.target.value})} />
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                  <CreditCard className="w-5 h-5 text-pink-500" />
                  <h3 className="font-black uppercase text-sm tracking-tighter text-gray-900">Payment Accounts</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
                    <input placeholder="EasyPaisa Number" className="w-full pl-12 pr-5 py-4 bg-gray-50 rounded-2xl font-bold text-sm" value={settingsForm.easypaisa} onChange={e => setSettingsForm({...settingsForm, easypaisa: e.target.value})} />
                  </div>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                    <input placeholder="JazzCash Number" className="w-full pl-12 pr-5 py-4 bg-gray-50 rounded-2xl font-bold text-sm" value={settingsForm.jazzcash} onChange={e => setSettingsForm({...settingsForm, jazzcash: e.target.value})} />
                  </div>
                </div>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input placeholder="Bank Account Details (Bank, Title, A/C Number)" className="w-full pl-12 pr-5 py-4 bg-gray-50 rounded-2xl font-bold text-sm" value={settingsForm.bank} onChange={e => setSettingsForm({...settingsForm, bank: e.target.value})} />
                </div>
              </div>

              <button disabled={loading} className="w-full py-5 bg-pink-600 text-white font-black rounded-[2rem] uppercase tracking-widest text-[11px] shadow-2xl flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin" /> : <><Save className="w-5 h-5" /> Save Store Changes</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'Orders' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4">
          {myOrders.length === 0 ? (
            <div className="py-32 bg-white rounded-[3rem] text-center space-y-4 border border-dashed border-gray-200">
               <Package className="w-16 h-16 text-gray-100 mx-auto" />
               <p className="text-gray-300 font-black uppercase text-[10px] tracking-widest">No orders yet</p>
            </div>
          ) : myOrders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-[2.5rem] border shadow-sm space-y-4 group">
               <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order #{order.id.slice(-5).toUpperCase()}</p>
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${order.status === 'PENDING' ? 'bg-pink-50 text-pink-600 animate-pulse' : 'bg-gray-50 text-gray-400'}`}>{order.status}</span>
               </div>
               <div className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-50">
                  <p className="font-black text-gray-900 text-lg">{order.buyerName}</p>
                  <p className="text-[11px] font-bold text-gray-400 mt-1 flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {order.buyerMobile}</p>
               </div>
               <button onClick={() => window.open(`https://wa.me/${order.buyerMobile.replace(/^0/, '92')}`)} className="w-full py-4 bg-green-50 text-green-600 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2">
                 <MessageCircle className="w-4 h-4" /> Message Buyer
               </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Inventory' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center px-4">
             <h3 className="font-black uppercase text-sm tracking-tighter text-gray-900 leading-none">Your Inventory</h3>
             <button onClick={() => { setEditingProduct(null); setShowModal(true); }} className="bg-pink-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2"><PlusCircle className="w-4 h-4" /> New Item</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myProducts.length === 0 ? (
               <div className="col-span-full py-32 bg-white rounded-[3rem] text-center border border-dashed border-gray-200">
                  <ImageIcon className="w-16 h-16 text-gray-100 mx-auto" />
               </div>
            ) : myProducts.map(p => (
              <div key={p.id} className="bg-white p-5 rounded-[2.5rem] border flex items-center gap-5 shadow-sm">
                <div className="relative">
                  <img src={p.images?.[0]} className="w-20 h-20 rounded-[1.5rem] object-cover bg-gray-50" />
                  {p.videoUrl && <PlayCircle className="absolute bottom-1 right-1 w-4 h-4 text-white fill-pink-600" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-sm uppercase truncate italic text-gray-900">{p.name}</h4>
                  <p className="text-pink-600 font-black text-base italic">PKR {p.price.toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => { setEditingProduct(p); setProductForm({ ...productForm, name: p.name, price: p.price.toString(), category: p.category, description: p.description, existingImageUrls: p.images, videoUrl: p.videoUrl || '', videoFile: null }); setShowModal(true); }} className="p-2.5 text-gray-300 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => { if(confirm("Delete item?")) supabase?.from('products').delete().eq('id', p.id).then(() => addProduct()); }} className="p-2.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[3rem] p-8 space-y-8 animate-in slide-in-from-bottom-8 shadow-2xl relative">
             <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-3 bg-gray-50 rounded-full"><X className="w-5 h-5 text-gray-400" /></button>
             <h2 className="text-2xl font-black italic uppercase tracking-tighter text-gray-900">{editingProduct ? 'Edit Item' : 'List New Item'}</h2>

             <form onSubmit={handleSubmitProduct} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required placeholder="Product Name" className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                  <input required type="number" placeholder="Price (PKR)" className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} />
                </div>
                <textarea required placeholder="Description" className="w-full p-4 bg-gray-50 rounded-2xl font-bold h-24 border-none outline-none resize-none" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                      {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                   </select>
                   <label className="w-full p-4 bg-pink-50 text-pink-600 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 cursor-pointer">
                      <Camera className="w-4 h-4" /> Photos
                      <input type="file" multiple className="hidden" accept="image/*" onChange={e => e.target.files && setProductForm({...productForm, images: Array.from(e.target.files)})} />
                   </label>
                </div>
                <button disabled={loading} className="w-full py-5 bg-pink-600 text-white font-black rounded-3xl uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 transition-all">
                   {loading ? <Loader2 className="animate-spin" /> : <><Sparkles className="w-5 h-5" /> {editingProduct ? 'Update Product' : 'List Product'}</>}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
