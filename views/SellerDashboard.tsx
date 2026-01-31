
import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, ShoppingBag, X, Video, Image as ImageIcon,
  Loader2, Settings, Camera, PlayCircle, Trash2, 
  Package, Check, MessageCircle, Edit3, Save, UploadCloud, BellRing,
  Lock, Film, Sparkles, AlertCircle, Phone, RefreshCw, Store
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

  const [settingsForm, setSettingsForm] = useState({
    name: '', bio: '', mobile: '', whatsapp: '',
    logoPreview: '', bannerPreview: ''
  });

  // Track if we've checked for shop data
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
        bannerPreview: myShop.banner || ''
      });
    }
  }, [myShop?.id, myShop?.logo, myShop?.banner]);

  const [productForm, setProductForm] = useState({
    name: '', price: '', category: CATEGORIES[0].name, description: '',
    videoFile: null as File | null, videoUrl: '', images: [] as File[], existingImageUrls: [] as string[]
  });

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
        whatsapp: settingsForm.whatsapp
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

      const productData = {
        shop_id: myShop.id, 
        name: productForm.name, 
        price: parseFloat(productForm.price),
        category: productForm.category, 
        description: productForm.description, 
        image_urls: uploadedUrls
      };

      if (editingProduct) {
        await supabase.from('products').update(productData).eq('id', editingProduct.id);
      } else {
        await supabase.from('products').insert(productData);
      }

      setShowModal(false);
      addProduct(); 
    } catch (err: any) { 
      console.error(err); 
    } finally {
      setLoading(false);
    }
  };

  // If shops are empty and we haven't timed out yet, show loader
  if (!myShop && !isDataChecked) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-6 bg-white p-10 text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-pink-100 border-t-pink-600 rounded-full animate-spin"></div>
          <Store className="absolute inset-0 m-auto w-8 h-8 text-pink-600 animate-pulse" />
        </div>
        <div className="space-y-2">
          <p className="font-black uppercase tracking-widest text-xs text-gray-900 italic">Accessing Store Vault...</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Connecting to your Ghotki Bazar shop</p>
        </div>
        <button 
          onClick={refreshShop}
          className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100"
        >
          <RefreshCw className="w-4 h-4" /> Sync Now
        </button>
      </div>
    );
  }

  // If data checked but no shop found for this owner_id
  if (!myShop && isDataChecked) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-8 bg-white p-10 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-pink-50 rounded-[2.5rem] flex items-center justify-center text-pink-500 shadow-inner">
          <AlertCircle className="w-12 h-12" />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">Shop Not Found</h2>
          <p className="text-sm text-gray-500 font-medium max-w-xs mx-auto leading-relaxed">
            We couldn't find a shop registered under your account. This happens if your application is still pending or if setup wasn't completed.
          </p>
        </div>
        <div className="flex flex-col w-full max-w-xs gap-3">
           <button 
             onClick={refreshShop}
             className="w-full py-5 bg-pink-600 text-white font-black rounded-3xl uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
           >
             <RefreshCw className="w-5 h-5" /> Retry Sync
           </button>
           <button 
             onClick={() => window.open('https://wa.me/923000000000')}
             className="w-full py-5 bg-gray-900 text-white font-black rounded-3xl uppercase tracking-widest text-[11px] flex items-center justify-center gap-3"
           >
             Contact Support
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-32 animate-in fade-in duration-500">
      <div className="relative h-48 rounded-[3rem] overflow-hidden shadow-2xl">
        <img src={myShop?.banner} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute bottom-6 left-8 flex items-center gap-4">
           <div className="relative">
             <img src={myShop?.logo} className="w-20 h-20 rounded-3xl border-4 border-white object-cover bg-white shadow-xl" />
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
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab as any)} 
            className={`flex-1 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-pink-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {tab}
            {tab === 'Orders' && myOrders.some(o => o.status === 'PENDING') && <span className="ml-2 w-2 h-2 bg-red-500 rounded-full inline-block animate-ping" />}
          </button>
        ))}
      </div>

      {activeTab === 'Settings' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="bg-white p-8 rounded-[3rem] border shadow-sm space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                <Settings className="w-5 h-5 text-pink-500" />
                <h3 className="font-black uppercase text-sm tracking-tighter text-gray-900">Store Visuals</h3>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Store Banner (Wide 21:9)</p>
                  <label className="relative block aspect-[21/9] rounded-[2.5rem] border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer bg-gray-50 group hover:border-pink-300 transition-colors">
                    {uploadingBanner ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                        <Loader2 className="w-8 h-8 text-pink-600 animate-spin" />
                      </div>
                    ) : null}
                    <img src={settingsForm.bannerPreview} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 p-3 rounded-2xl shadow-xl">
                        <Camera className="text-pink-600 w-6 h-6" />
                      </div>
                      <span className="text-white font-black text-[10px] uppercase tracking-widest">Update Banner</span>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleInstantBannerUpload} />
                  </label>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Store Logo (Square 1:1)</p>
                  <div className="flex justify-center">
                    <label className="relative block w-32 h-32 rounded-[2rem] border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer bg-gray-50 group hover:border-pink-300 transition-colors shadow-lg">
                      {uploadingLogo ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                          <Loader2 className="w-6 h-6 text-pink-600 animate-spin" />
                        </div>
                      ) : null}
                      <img src={settingsForm.logoPreview} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/90 p-2 rounded-xl">
                          <Camera className="text-pink-600 w-4 h-4" />
                        </div>
                        <span className="text-white font-black text-[8px] uppercase tracking-widest text-center px-2">Update Logo</span>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleInstantLogoUpload} />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleInfoUpdate} className="space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                <ShoppingBag className="w-5 h-5 text-pink-500" />
                <h3 className="font-black uppercase text-sm tracking-tighter text-gray-900">Store Info</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Shop Name</p>
                  <input placeholder="Shop Name" className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-pink-500 outline-none transition-all" value={settingsForm.name} onChange={e => setSettingsForm({...settingsForm, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">WhatsApp Number</p>
                  <input placeholder="923xxxxxxxxx" className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-pink-500 outline-none transition-all" value={settingsForm.whatsapp} onChange={e => setSettingsForm({...settingsForm, whatsapp: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Bio / Description</p>
                <textarea placeholder="Tell your customers about your shop..." className="w-full p-5 bg-gray-50 rounded-2xl font-bold h-32 border-2 border-transparent focus:border-pink-500 outline-none transition-all resize-none" value={settingsForm.bio} onChange={e => setSettingsForm({...settingsForm, bio: e.target.value})} />
              </div>
              <button disabled={loading} className="w-full py-5 bg-pink-600 text-white font-black rounded-[2rem] uppercase tracking-widest text-[11px] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" /> : <><Save className="w-5 h-5" /> Save Shop Details</>}
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
            <div key={order.id} className="bg-white p-6 rounded-[2.5rem] border shadow-sm space-y-4 group hover:border-pink-100 transition-colors">
               <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order #{order.id.slice(-5).toUpperCase()}</p>
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${order.status === 'PENDING' ? 'bg-pink-50 text-pink-600 animate-pulse' : 'bg-gray-50 text-gray-400'}`}>{order.status}</span>
               </div>
               <div className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-50">
                  <p className="font-black text-gray-900 text-lg">{order.buyerName}</p>
                  <p className="text-[11px] font-bold text-gray-400 mt-1 flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {order.buyerMobile}</p>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{order.buyerAddress}</p>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => window.open(`https://wa.me/${order.buyerMobile.replace(/^0/, '92')}`)} className="flex-1 py-4 bg-green-50 text-green-600 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-green-100 transition-colors">
                   <MessageCircle className="w-4 h-4" /> WhatsApp Buyer
                 </button>
                 <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:text-pink-600 transition-colors">
                   <Edit3 className="w-5 h-5" />
                 </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Inventory' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center px-4">
             <div className="space-y-1">
               <h3 className="font-black uppercase text-sm tracking-tighter text-gray-900 leading-none">Your Inventory</h3>
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{myProducts.length} Total Items</p>
             </div>
             <button onClick={() => { setEditingProduct(null); setShowModal(true); }} className="bg-pink-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-pink-700 active:scale-95 transition-all"><PlusCircle className="w-4 h-4" /> New Item</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myProducts.length === 0 ? (
               <div className="col-span-full py-32 bg-white rounded-[3rem] text-center space-y-4 border border-dashed border-gray-200">
                  <ImageIcon className="w-16 h-16 text-gray-100 mx-auto" />
                  <p className="text-gray-300 font-black uppercase text-[10px] tracking-widest">No items added yet</p>
               </div>
            ) : myProducts.map(p => (
              <div key={p.id} className="bg-white p-5 rounded-[2.5rem] border flex items-center gap-5 shadow-sm group hover:border-pink-100 transition-all">
                <img src={p.images?.[0]} className="w-20 h-20 rounded-[1.5rem] object-cover shadow-inner bg-gray-50" />
                <div className="flex-1 space-y-1">
                  <h4 className="font-black text-sm uppercase truncate italic text-gray-900">{p.name}</h4>
                  <p className="text-pink-600 font-black text-base italic">PKR {p.price.toLocaleString()}</p>
                  <p className="text-[8px] font-black text-gray-400 uppercase bg-gray-50 w-max px-2 py-0.5 rounded-full">{p.category}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => { setEditingProduct(p); setProductForm({ ...productForm, name: p.name, price: p.price.toString(), category: p.category, description: p.description, existingImageUrls: p.images }); setShowModal(true); }} className="p-2.5 text-gray-300 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => { if(confirm("Permanently delete this item?")) supabase?.from('products').delete().eq('id', p.id).then(() => addProduct()); }} className="p-2.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end md:items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[3rem] p-8 space-y-8 animate-in slide-in-from-bottom-8 shadow-2xl relative my-8">
             <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-3 bg-gray-50 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
             
             <div className="space-y-1">
               <h2 className="text-2xl font-black italic uppercase tracking-tighter text-gray-900">{editingProduct ? 'Edit Product' : 'List New Item'}</h2>
               <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest">Inventory Management</p>
             </div>

             <form onSubmit={handleSubmitProduct} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Product Name</p>
                    <input required placeholder="E.g. Fancy Shalwar Kameez" className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-pink-500/20" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Price (PKR)</p>
                    <input required type="number" placeholder="2500" className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-pink-500/20" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Description</p>
                  <textarea required placeholder="Describe your item details..." className="w-full p-4 bg-gray-50 rounded-2xl font-bold h-24 border-none outline-none focus:ring-2 focus:ring-pink-500/20 resize-none" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Category</p>
                     <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-pink-500/20 appearance-none" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                        {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                     </select>
                   </div>
                   <div className="space-y-2">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Photos (Up to 3)</p>
                     <label className="w-full p-4 bg-pink-50 text-pink-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer hover:bg-pink-100 transition-colors">
                        <Camera className="w-4 h-4" /> Select Images
                        <input type="file" multiple className="hidden" accept="image/*" onChange={e => e.target.files && setProductForm({...productForm, images: Array.from(e.target.files)})} />
                     </label>
                   </div>
                </div>

                <button disabled={loading} className="w-full py-5 bg-pink-600 text-white font-black rounded-3xl uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                   {loading ? <Loader2 className="animate-spin" /> : <><Sparkles className="w-5 h-5" /> {editingProduct ? 'Save Changes' : 'Publish Product'}</>}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
