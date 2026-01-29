
import React, { useState, useEffect, useRef } from 'react';
import { 
  PlusCircle, ShoppingBag, X, Video, Image as ImageIcon,
  Loader2, Settings, Camera, PlayCircle, Trash2, AlertCircle,
  Package, Check, MessageCircle, Phone, MapPin, Clock,
  Smartphone, Edit3, Save, Globe, UploadCloud, BellRing,
  UserCheck, Lock, Film, Sparkles
} from 'lucide-react';
import { Product, Order, User as UserType, Shop } from '../types';
import { CATEGORIES, NOTIFICATION_SOUND } from '../constants';
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
  const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);
  
  const myShop = shops.find(s => s.owner_id === user.id);
  const prevOrdersCount = useRef(orders.length);

  const [settingsForm, setSettingsForm] = useState({
    name: '',
    bio: '',
    mobile: '',
    whatsapp: '',
    logoFile: null as File | null,
    bannerFile: null as File | null,
    logoPreview: '',
    bannerPreview: ''
  });

  useEffect(() => {
    if (myShop) {
      setSettingsForm({
        name: myShop.name || '',
        bio: myShop.bio || '',
        mobile: myShop.mobile || '',
        whatsapp: myShop.whatsapp || '',
        logoFile: null,
        bannerFile: null,
        logoPreview: myShop.logo || '',
        bannerPreview: myShop.banner || ''
      });
    }
  }, [myShop?.id, myShop?.logo, myShop?.banner, myShop?.name, myShop?.whatsapp, myShop?.mobile]);

  useEffect(() => {
    if (orders.length > prevOrdersCount.current && myShop) {
      const latestOrder = orders[0];
      if (latestOrder.sellerId === myShop.id) {
        setNewOrderAlert(latestOrder);
        const audio = new Audio(NOTIFICATION_SOUND);
        audio.play().catch(() => {});
        setTimeout(() => setNewOrderAlert(null), 10000);
      }
    }
    prevOrdersCount.current = orders.length;
  }, [orders, myShop]);

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: CATEGORIES[0].name,
    description: '',
    videoFile: null as File | null,
    videoUrl: '', 
    images: [] as File[],
    existingImageUrls: [] as string[]
  });

  const myProducts = products.filter(p => p.shopId === myShop?.id);
  const myOrders = orders.filter(o => o.sellerId === myShop?.id);
  
  const isReelUnlocked = myShop?.subscription_tier === 'STANDARD' || myShop?.subscription_tier === 'PREMIUM';

  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !myShop) return;
    setLoading(true);
    try {
      let finalLogoUrl = (myShop as any).logo_url || null;
      let finalBannerUrl = (myShop as any).banner_url || null;

      if (settingsForm.logoFile) {
        const logoPath = `shops/${myShop.id}/logo_${Date.now()}`;
        finalLogoUrl = await uploadFile('marketplace', logoPath, settingsForm.logoFile);
      }

      if (settingsForm.bannerFile) {
        const bannerPath = `shops/${myShop.id}/banner_${Date.now()}`;
        finalBannerUrl = await uploadFile('marketplace', bannerPath, settingsForm.bannerFile);
      }

      const { error } = await supabase.from('shops').update({
        name: settingsForm.name,
        bio: settingsForm.bio,
        mobile: settingsForm.mobile,
        whatsapp: settingsForm.whatsapp,
        logo_url: finalLogoUrl,
        banner_url: finalBannerUrl
      }).eq('id', myShop.id);

      if (error) throw error;
      
      alert("Shop settings updated!");
      setSettingsForm(prev => ({ ...prev, logoFile: null, bannerFile: null }));
      await refreshShop();
    } catch (err: any) {
      alert("Error: " + err.message);
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
        const path = `products/${myShop.id}/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        const url = await uploadFile('marketplace', path, file);
        uploadedUrls.push(url);
      }

      let finalVideoUrl = productForm.videoUrl;
      if (isReelUnlocked && productForm.videoFile) {
        const videoPath = `reels/${myShop.id}/${Date.now()}_${productForm.videoFile.name.replace(/\s/g, '_')}`;
        finalVideoUrl = await uploadFile('marketplace', videoPath, productForm.videoFile);
      }

      const productData = {
        shop_id: myShop.id,
        name: productForm.name,
        price: parseFloat(productForm.price),
        category: productForm.category,
        description: productForm.description,
        video_url: isReelUnlocked ? finalVideoUrl : null,
        image_urls: uploadedUrls,
        tags: editingProduct ? editingProduct.tags : ['New']
      };

      if (editingProduct) {
        await supabase.from('products').update(productData).eq('id', editingProduct.id);
      } else {
        await supabase.from('products').insert(productData);
      }

      setShowModal(false);
      addProduct(); 
      alert(editingProduct ? "Listing Updated!" : "Listing Published!");
    } catch (err: any) {
      alert("Publishing Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!supabase || !confirm("Delete this item permanently?")) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      await addProduct();
      alert("Item removed from bazaar.");
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
      if (error) throw error;
      refreshShop();
    } catch (err: any) {
      alert("Update Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!myShop) return <div className="h-screen flex flex-col items-center justify-center font-black uppercase text-gray-400 space-y-4">
    <Loader2 className="w-10 h-10 animate-spin text-pink-600" />
    <p>Opening Seller Dashboard...</p>
  </div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-32">
      {/* 24/7 Sales Motivation Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-pink-900 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
         <Sparkles className="absolute top-0 right-0 p-6 opacity-20 w-32 h-32 group-hover:scale-110 transition-transform" />
         <div className="relative z-10 space-y-2">
            <h3 className="text-white font-black text-lg italic uppercase tracking-tighter">Your Store Never Sleeps! 🛍️</h3>
            <p className="text-pink-200 text-[10px] font-bold uppercase leading-relaxed max-w-sm">
               Even if your physical shop is closed for a holiday or late at night, 
               people in Ghotki are still buying from your digital shop right now. 
               Keep your inventory updated to never miss a sale!
            </p>
         </div>
      </div>

      {newOrderAlert && (
        <div className="fixed top-20 left-4 right-4 z-[100] bg-gray-900 text-white p-5 rounded-[2.5rem] shadow-2xl flex items-center justify-between animate-in slide-in-from-top-4 border-2 border-pink-500/50">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center animate-bounce">
                <BellRing className="w-6 h-6" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-pink-500">New Order Alert</p>
                <p className="text-sm font-bold truncate max-w-[150px]">{newOrderAlert.buyerName}</p>
             </div>
          </div>
          <button onClick={() => { setActiveTab('Orders'); setNewOrderAlert(null); }} className="px-6 py-3 bg-white text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">View Details</button>
        </div>
      )}

      <div className="relative h-48 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
        <img src={myShop.banner} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-8 left-8 flex items-center gap-5">
           <img src={myShop.logo} className="w-20 h-20 rounded-3xl border-4 border-white object-cover bg-white shadow-2xl" />
           <div className="text-white space-y-1">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">{myShop.name}</h2>
              <p className="text-[10px] font-black uppercase bg-pink-600 px-3 py-1 rounded-full inline-block shadow-lg">Plan: {myShop.subscription_tier}</p>
           </div>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-[2rem] no-scrollbar overflow-x-auto">
        {['Inventory', 'Orders', 'Settings'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab as any)} 
            className={`flex-1 min-w-[100px] py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-pink-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Settings' && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <form onSubmit={handleSettingsUpdate} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
            <h3 className="font-black uppercase text-xs tracking-widest text-pink-600 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Marketplace Profile
            </h3>
            <div className="space-y-4">
              <p className="text-[9px] font-black uppercase text-gray-400 ml-2">Shop Branding</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[8px] font-bold text-gray-500 uppercase ml-2">Logo Square (1:1)</p>
                  <label className="relative w-32 h-32 rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer hover:border-pink-500 transition-all bg-gray-50">
                    {settingsForm.logoPreview ? (
                      <img src={settingsForm.logoPreview} className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-300" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                      <UploadCloud className="text-white w-6 h-6" />
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setSettingsForm({...settingsForm, logoFile: e.target.files[0], logoPreview: URL.createObjectURL(e.target.files[0])});
                      }
                    }} />
                  </label>
                </div>
                <div className="space-y-2 flex-1">
                  <p className="text-[8px] font-bold text-gray-500 uppercase ml-2">Banner Landscape (2:1)</p>
                  <label className="relative h-32 w-full rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer hover:border-pink-500 transition-all bg-gray-50">
                    {settingsForm.bannerPreview ? (
                      <img src={settingsForm.bannerPreview} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                      <UploadCloud className="text-white w-6 h-6" />
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setSettingsForm({...settingsForm, bannerFile: e.target.files[0], bannerPreview: URL.createObjectURL(e.target.files[0])});
                      }
                    }} />
                  </label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Shop Name</label>
                <input required className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm text-gray-900 border-none outline-none focus:ring-2 focus:ring-pink-500/20" value={settingsForm.name} onChange={e => setSettingsForm({...settingsForm, name: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">WhatsApp (923...)</label>
                <input required className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm text-gray-900 border-none outline-none focus:ring-2 focus:ring-pink-500/20" value={settingsForm.whatsapp} onChange={e => setSettingsForm({...settingsForm, whatsapp: e.target.value})} />
              </div>
            </div>
            <button disabled={loading} className="w-full py-5 bg-pink-600 text-white font-black rounded-3xl uppercase tracking-widest text-[11px] shadow-2xl shadow-pink-200 flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />} Save All Changes
            </button>
          </form>
        </div>
      )}

      {activeTab === 'Inventory' && (
        <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center px-2">
             <h3 className="font-black uppercase text-[10px] tracking-widest text-gray-400">Products ({myProducts.length})</h3>
             <button onClick={() => { setEditingProduct(null); setShowModal(true); }} className="bg-pink-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-pink-700 transition-all">
               <PlusCircle className="w-4 h-4" /> Add New Item
             </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myProducts.length === 0 ? (
              <div className="col-span-full py-24 text-center border-4 border-dashed border-gray-100 rounded-[3rem] text-gray-300">
                 <Package className="w-16 h-16 mx-auto opacity-10 mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-widest">No items listed in your bazaar</p>
              </div>
            ) : myProducts.map(p => (
              <div key={p.id} className="bg-white p-5 rounded-[2.5rem] border border-gray-100 flex items-center gap-5 shadow-sm hover:shadow-md transition-all group">
                <div className="relative">
                  <img src={p.images?.[0]} className="w-24 h-24 rounded-2xl object-cover shadow-sm group-hover:scale-95 transition-transform" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-black text-sm uppercase italic text-gray-900 truncate">{p.name}</h4>
                  <p className="text-pink-600 font-black text-sm">PKR {p.price.toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => { setEditingProduct(p); setProductForm({name: p.name, price: p.price.toString(), category: p.category, description: p.description, videoFile: null, videoUrl: p.videoUrl || '', images: [], existingImageUrls: p.images || []}); setShowModal(true); }} className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-pink-600 transition-colors">
                     <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteProduct(p.id)} className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-red-600 transition-colors">
                     <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Orders' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          {myOrders.length === 0 ? (
             <div className="py-24 text-center border-4 border-dashed border-gray-100 rounded-[3rem] text-gray-300">
                <ShoppingBag className="w-16 h-16 mx-auto opacity-10 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">No customer orders yet</p>
             </div>
          ) : myOrders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-[3rem] border border-gray-100 shadow-sm space-y-5">
               <div className="flex justify-between items-center">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Order #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-[10px] font-bold text-gray-900">{new Date(order.createdAt).toLocaleString()}</p>
                 </div>
                 <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${order.status === 'PENDING' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                   {order.status}
                 </span>
               </div>
               <div className="flex items-center gap-5 p-5 bg-gray-50 rounded-[2rem]">
                  <div className="flex-1">
                    <p className="font-black text-gray-900 text-base leading-none mb-1">{order.buyerName}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{order.buyerMobile}</p>
                  </div>
               </div>
               <div className="flex gap-2 pt-2">
                  {order.status === 'PENDING' && (
                    <button onClick={() => updateOrderStatus(order.id, 'SHIPPED')} className="flex-[2] py-5 bg-pink-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Mark Shipped</button>
                  )}
                  <button onClick={() => window.open(`https://wa.me/${order.buyerMobile.replace(/^0/, '92')}`)} className="flex-1 py-5 bg-green-50 text-green-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-green-100">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md p-4 flex items-end justify-center">
           <div className="bg-white w-full max-w-lg rounded-t-[3rem] p-8 space-y-7 animate-in slide-in-from-bottom-full overflow-y-auto max-h-[95vh] border-t-8 border-pink-600">
              <div className="flex items-center justify-between">
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">
                   {editingProduct ? 'Edit Listing' : 'New Listing'}
                 </h2>
                 <button onClick={() => setShowModal(false)} className="p-3 bg-gray-100 rounded-full"><X className="text-gray-500 w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSubmitProduct} className="space-y-6">
                 <div className="space-y-4">
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Item Name</label>
                       <input required className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-pink-500/20" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Price (PKR)</label>
                          <input required type="number" className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-pink-500/20" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Product Photos</p>
                       <label className="w-full h-32 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-pink-50 transition-all">
                          <UploadCloud className="w-8 h-8 mb-1" />
                          <input type="file" multiple className="hidden" accept="image/*" onChange={e => {
                             if (e.target.files) setProductForm({...productForm, images: [...productForm.images, ...Array.from(e.target.files)]});
                          }} />
                       </label>
                    </div>
                 </div>
                 <button disabled={loading} className="w-full py-6 bg-pink-600 text-white font-black rounded-[2rem] uppercase tracking-widest text-xs shadow-2xl shadow-pink-200 flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (editingProduct ? 'Save Changes' : 'Publish Listing')}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
