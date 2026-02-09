
import React, { useState, useEffect, useRef } from 'react';
import { 
  PlusCircle, X, Image as ImageIcon, Loader2, Settings, Trash2, 
  Check, MessageCircle, Sparkles, Plus, DollarSign, Tag, Calendar, History, Film, Camera, Save, UploadCloud, Store, ChevronDown, Trophy, CreditCard, Smartphone, Building2
} from 'lucide-react';
import { Product, Order, User as UserType, Shop } from '../types';
import { CATEGORIES } from '../constants';
import { supabase } from '../services/supabase';

interface SellerDashboardProps {
  products: Product[];
  user: UserType;
  addProduct: () => void;
  orders: Order[];
  shops: Shop[];
  refreshShop: () => void;
  refreshOrders?: () => void;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ products, user, addProduct, orders, shops, refreshShop, refreshOrders }) => {
  const [activeTab, setActiveTab] = useState<'Inventory' | 'Orders' | 'Settings'>('Inventory');
  const [orderSubTab, setOrderSubTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingType, setUploadingType] = useState<'LOGO' | 'BANNER' | null>(null);

  const imgInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const myShop = shops.find(s => s.owner_id === user.id);

  const [productForm, setProductForm] = useState({
    name: '',
    originalPrice: '',
    discountPercentage: '',
    price: '', 
    category: CATEGORIES[0].name,
    description: '',
    eventName: '',
    images: [] as string[],
    videoUrl: ''
  });

  const [settingsForm, setSettingsForm] = useState({
    name: myShop?.name || '',
    whatsapp: myShop?.whatsapp || '',
    logo: myShop?.logo || '',
    banner: myShop?.banner || '',
    bio: myShop?.bio || '',
    easypaisa: myShop?.easypaisa_number || '',
    jazzcash: myShop?.jazzcash_number || '',
    bank: myShop?.bank_details || ''
  });

  // Sync internal form state when shop data updates from parent
  useEffect(() => {
    if (myShop) {
      setSettingsForm({
        name: myShop.name,
        whatsapp: myShop.whatsapp || '',
        logo: myShop.logo,
        banner: myShop.banner,
        bio: myShop.bio || '',
        easypaisa: myShop.easypaisa_number || '',
        jazzcash: myShop.jazzcash_number || '',
        bank: myShop.bank_details || ''
      });
    }
  }, [myShop]);

  useEffect(() => {
    const orig = parseFloat(productForm.originalPrice);
    const perc = parseFloat(productForm.discountPercentage);
    if (!isNaN(orig) && !isNaN(perc)) {
      const discounted = orig - (orig * (perc / 100));
      setProductForm(prev => ({ ...prev, price: Math.round(discounted).toString() }));
    } else if (!isNaN(orig)) {
      setProductForm(prev => ({ ...prev, price: orig.toString() }));
    }
  }, [productForm.originalPrice, productForm.discountPercentage]);

  const handleCompleteOrder = async (orderId: string) => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('orders').update({ status: 'COMPLETED' }).eq('id', orderId);
      if (error) throw error;
      
      // Force refresh data in parent
      if (refreshOrders) await refreshOrders();
      if (refreshShop) await refreshShop();
      
      // Show confirmation and help user find the completed order
      alert("Order completed! You can find it in the 'Fulfilled' (History) tab.");
      setOrderSubTab('HISTORY');
    } catch (err: any) {
      alert("Failed to complete order: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'IMAGE' | 'VIDEO' | 'LOGO' | 'BANNER') => {
    if (!supabase || !e.target.files?.[0] || !myShop) return;
    
    const file = e.target.files[0];
    const bucket = type === 'VIDEO' ? 'videos' : 'marketplace';
    
    setLoading(true);
    if (type === 'LOGO' || type === 'BANNER') setUploadingType(type);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
      // Append a cache-busting timestamp to ensure the UI updates the image immediately
      const publicUrlWithCacheBurst = `${publicUrl}?t=${Date.now()}`;
      
      if (type === 'IMAGE') {
        setProductForm(p => ({ ...p, images: [...p.images, publicUrlWithCacheBurst] }));
      } else if (type === 'VIDEO') {
        setProductForm(p => ({ ...p, videoUrl: publicUrlWithCacheBurst }));
      } else if (type === 'LOGO' || type === 'BANNER') {
        const dbField = type === 'LOGO' ? 'logo_url' : 'banner_url';
        const fallbackField = type === 'LOGO' ? 'logo' : 'banner';
        
        // Update DB immediately
        const { error: updateError } = await supabase.from('shops')
          .update({ [dbField]: publicUrlWithCacheBurst, [fallbackField]: publicUrlWithCacheBurst })
          .eq('id', myShop.id);

        if (updateError) throw updateError;
        
        // Update local state for instant feedback
        const formField = type === 'LOGO' ? 'logo' : 'banner';
        setSettingsForm(prev => ({ ...prev, [formField]: publicUrlWithCacheBurst }));
        
        // Trigger parent reload to update marketplace globally
        await refreshShop();
        alert(`${type} updated successfully and is now live!`);
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setLoading(false);
      setUploadingType(null);
      // Clear the input value so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myShop || !supabase) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('shops').update({
        name: settingsForm.name,
        whatsapp: settingsForm.whatsapp,
        bio: settingsForm.bio,
        easypaisa_number: settingsForm.easypaisa,
        jazzcash_number: settingsForm.jazzcash,
        bank_details: settingsForm.bank
      }).eq('id', myShop.id);

      if (error) throw error;
      await refreshShop();
      alert("Brand Profile & Payment Methods Updated!");
    } catch (err: any) {
      alert("Update failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myShop || !supabase) return;
    if (productForm.images.length === 0) return alert("Upload at least one image.");
    
    setLoading(true);
    try {
      const { error } = await supabase.from('products').insert({
        shop_id: myShop.id,
        name: productForm.name,
        price: parseFloat(productForm.price),
        original_price: parseFloat(productForm.originalPrice),
        discount_percentage: parseFloat(productForm.discountPercentage) || 0,
        event_name: productForm.eventName,
        category: productForm.category,
        description: productForm.description,
        image_urls: productForm.images,
        video_url: productForm.videoUrl,
        tags: productForm.discountPercentage ? [`${productForm.discountPercentage}% OFF`] : ['New Arrival']
      });

      if (error) throw error;
      await addProduct();
      setShowModal(false);
      setProductForm({ name: '', originalPrice: '', discountPercentage: '', price: '', category: CATEGORIES[0].name, description: '', eventName: '', images: [], videoUrl: '' });
    } catch (err: any) {
      alert("Product listing failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const isMine = o.sellerId === myShop?.id;
    if (!isMine) return false;
    return orderSubTab === 'ACTIVE' ? o.status !== 'COMPLETED' : o.status === 'COMPLETED';
  });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-32">
      {/* Interactive Branding Header */}
      <div className="relative h-56 rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white bg-gray-900 group">
         <img src={settingsForm.banner} className="w-full h-full object-cover opacity-80" alt="Boutique Banner" />
         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
         
         {/* Banner Upload Trigger */}
         <div 
           onClick={() => bannerInputRef.current?.click()}
           className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-black/50 backdrop-blur-[2px] z-10"
         >
           <div className="flex flex-col items-center text-white">
             {uploadingType === 'BANNER' ? <Loader2 className="animate-spin mb-2" /> : <UploadCloud className="w-10 h-10 mb-2" />}
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Change Shop Banner</span>
           </div>
         </div>
         <input type="file" hidden ref={bannerInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, 'BANNER')} />

         <div className="absolute bottom-6 left-8 flex items-end gap-6 z-20">
            <div className="relative group/logo">
              <div className="w-24 h-24 rounded-[2.5rem] border-4 border-white bg-white overflow-hidden shadow-2xl relative">
                <img src={settingsForm.logo} className="w-full h-full object-cover" alt="Boutique Logo" />
                
                {/* Logo Upload Trigger */}
                <div 
                  onClick={(e) => { e.stopPropagation(); logoInputRef.current?.click(); }}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity"
                >
                   {uploadingType === 'LOGO' ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
                   <span className="text-[7px] font-black text-white uppercase mt-1">Logo</span>
                </div>
              </div>
              <input type="file" hidden ref={logoInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, 'LOGO')} />
              {myShop?.is_top_seller && <div className="absolute -top-3 -right-3 bg-pink-600 text-white p-2 rounded-2xl shadow-xl animate-bounce border-2 border-white"><Trophy className="w-4 h-4" /></div>}
            </div>
            
            <div className="text-white drop-shadow-lg mb-2">
               <div className="flex items-center gap-3">
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{myShop?.name}</h2>
                 <div className="flex items-center gap-1 bg-green-500/20 backdrop-blur-md px-2 py-1 rounded-lg border border-green-500/30">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                   <span className="text-[7px] font-black uppercase tracking-widest text-green-400">Live</span>
                 </div>
               </div>
               <p className="text-[9px] font-black uppercase text-pink-400 tracking-[0.3em] mt-2 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full inline-block">Verified Boutique Merchant</p>
            </div>
         </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-[2.5rem]">
        {['Inventory', 'Orders', 'Settings'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Inventory' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex justify-between items-center px-2">
             <h3 className="font-black uppercase text-[11px] tracking-widest text-gray-400">Stock Management</h3>
             <button onClick={() => setShowModal(true)} className="bg-pink-600 text-white px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95 transition-all">
                <PlusCircle className="w-4 h-4" /> Add Style
             </button>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {products.filter(p => p.shopId === myShop?.id).map(p => (
              <div key={p.id} className="bg-white p-5 rounded-[2.5rem] border border-gray-100 flex flex-col gap-4 shadow-sm group hover:shadow-xl transition-all">
                <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-gray-50 shadow-inner">
                  <img src={p.images?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {p.discount_percentage ? <div className="absolute top-3 left-3 bg-red-600 text-white text-[8px] font-black px-3 py-1.5 rounded-xl shadow-lg">-{p.discount_percentage}% OFF</div> : null}
                  {p.event_name && <div className="absolute bottom-3 right-3 bg-pink-600 text-white text-[7px] font-black px-3 py-1 rounded-lg uppercase shadow-xl animate-pulse">{p.event_name}</div>}
                </div>
                <div className="space-y-1.5 px-1">
                  <h4 className="font-black text-xs uppercase truncate text-gray-900 italic tracking-tight">{p.name}</h4>
                  <div className="flex items-center gap-2">
                    <p className="text-pink-600 font-black text-sm italic">PKR {p.price.toLocaleString()}</p>
                    {p.original_price && <p className="text-[9px] text-gray-300 line-through font-bold">PKR {p.original_price}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Orders' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex gap-2 bg-gray-200 p-1.5 rounded-[1.8rem]">
            <button onClick={() => setOrderSubTab('ACTIVE')} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all ${orderSubTab === 'ACTIVE' ? 'bg-white text-pink-600 shadow-md' : 'text-gray-400'}`}>Current Tasks</button>
            <button onClick={() => setOrderSubTab('HISTORY')} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all ${orderSubTab === 'HISTORY' ? 'bg-white text-pink-600 shadow-md' : 'text-gray-400'}`}>Fulfilled</button>
          </div>
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
               <div className="py-24 text-center text-gray-300 font-black uppercase text-[10px] tracking-[0.3em] border-4 border-dashed rounded-[3rem] border-gray-100">No Orders in {orderSubTab === 'ACTIVE' ? 'Current Tasks' : 'History'}</div>
            ) : filteredOrders.map(order => (
              <div key={order.id} className="bg-white p-7 rounded-[3rem] border border-gray-100 shadow-sm space-y-5 animate-in fade-in">
                 <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Ref: #{order.id.slice(-6).toUpperCase()}</p>
                      <p className="font-black text-xl text-gray-900 tracking-tighter leading-none italic uppercase">{order.buyerName}</p>
                    </div>
                    <div className="text-right">
                       <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-pink-50 text-pink-600'}`}>
                        {order.status}
                      </span>
                      <p className="text-[9px] font-black text-gray-400 mt-2 uppercase">PKR {order.total.toLocaleString()}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <button onClick={() => window.open(`https://wa.me/${order.buyerMobile.replace(/^0/, '92')}`)} className="flex-1 py-5 bg-green-50 text-green-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-green-100 transition-all active:scale-[0.98]">
                      <MessageCircle className="w-4 h-4" /> Message Buyer
                    </button>
                    {order.status !== 'COMPLETED' && (
                      <button onClick={() => handleCompleteOrder(order.id)} disabled={loading} className="p-5 bg-gray-900 text-white rounded-2xl shadow-xl hover:bg-green-600 transition-all active:scale-[0.98] disabled:opacity-50">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                      </button>
                    )}
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Settings' && (
        <form onSubmit={handleUpdateSettings} className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-xl space-y-8 animate-in zoom-in-95 duration-500">
           <div className="space-y-6">
              <h3 className="font-black uppercase text-xs tracking-widest text-gray-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-pink-600" /> Boutique Configuration
              </h3>
              
              <div className="space-y-4">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Brand Name</p>
                    <input required className="w-full p-5 bg-gray-50 rounded-2xl font-black text-sm border-none outline-none focus:ring-4 focus:ring-pink-500/10 transition-all" value={settingsForm.name} onChange={e => setSettingsForm({...settingsForm, name: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp Customer Line</p>
                    <input required className="w-full p-5 bg-gray-50 rounded-2xl font-black text-sm border-none outline-none focus:ring-4 focus:ring-pink-500/10 transition-all" value={settingsForm.whatsapp} onChange={e => setSettingsForm({...settingsForm, whatsapp: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">About Boutique</p>
                    <textarea className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm border-none outline-none h-24 resize-none focus:ring-4 focus:ring-pink-500/10 transition-all italic" value={settingsForm.bio} onChange={e => setSettingsForm({...settingsForm, bio: e.target.value})} />
                 </div>
              </div>
           </div>

           <div className="space-y-6 pt-6 border-t border-gray-100">
              <h3 className="font-black uppercase text-xs tracking-widest text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-pink-600" /> Payment Identities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-pink-600 uppercase tracking-widest ml-1 flex items-center gap-2"><Smartphone className="w-3 h-3" /> EasyPaisa</p>
                    <input placeholder="Account Number" className="w-full p-5 bg-pink-50/50 rounded-2xl font-black text-sm border border-pink-100/50 outline-none" value={settingsForm.easypaisa} onChange={e => setSettingsForm({...settingsForm, easypaisa: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest ml-1 flex items-center gap-2"><Smartphone className="w-3 h-3" /> JazzCash</p>
                    <input placeholder="Account Number" className="w-full p-5 bg-blue-50/50 rounded-2xl font-black text-sm border border-blue-100/50 outline-none" value={settingsForm.jazzcash} onChange={e => setSettingsForm({...settingsForm, jazzcash: e.target.value})} />
                 </div>
                 <div className="md:col-span-2 space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Building2 className="w-3 h-3" /> Bank Details</p>
                    <textarea placeholder="Bank Name, IBAN, Account Title..." className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm border-none outline-none h-24 resize-none" value={settingsForm.bank} onChange={e => setSettingsForm({...settingsForm, bank: e.target.value})} />
                 </div>
              </div>
           </div>

           <button disabled={loading} className="w-full py-5 bg-gray-900 text-white font-black rounded-[2.5rem] uppercase tracking-widest text-[11px] shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
             {loading ? <Loader2 className="animate-spin" /> : <><Save className="w-5 h-5" /> Update Merchant Identity</>}
           </button>
        </form>
      )}

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-white w-full max-w-lg rounded-t-[4rem] p-10 space-y-8 animate-in slide-in-from-bottom-full duration-500 max-h-[95vh] overflow-y-auto no-scrollbar border-t-8 border-pink-600">
              <div className="flex items-center justify-between">
                 <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">New Listing</h2>
                    <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest mt-2">Premium Marketplace Entry</p>
                 </div>
                 <button onClick={() => setShowModal(false)} className="p-4 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"><X className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-6 pb-12">
                 <div className="grid grid-cols-2 gap-4">
                   <div onClick={() => imgInputRef.current?.click()} className="aspect-square bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-pink-50 hover:border-pink-200 transition-all overflow-hidden group">
                      {productForm.images.length > 0 ? (
                        <img src={productForm.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <><Camera className="w-8 h-8 text-gray-300" /><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gallery</span></>
                      )}
                      <input type="file" hidden ref={imgInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, 'IMAGE')} />
                   </div>
                   <div onClick={() => videoInputRef.current?.click()} className="aspect-square bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-pink-50 hover:border-pink-200 transition-all overflow-hidden">
                      {productForm.videoUrl ? (
                        <div className="flex flex-col items-center"><Film className="w-8 h-8 text-pink-600 animate-pulse" /><span className="text-[9px] font-black text-pink-600 mt-2 uppercase tracking-widest">Reel Added</span></div>
                      ) : (
                        <><Film className="w-8 h-8 text-gray-300" /><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Video</span></>
                      )}
                      <input type="file" hidden ref={videoInputRef} accept="video/*" onChange={(e) => handleFileUpload(e, 'VIDEO')} />
                   </div>
                 </div>

                 <input required placeholder="Style / Product Name" className="w-full p-6 bg-gray-50 rounded-[2rem] font-black text-base outline-none focus:ring-4 focus:ring-pink-500/10 transition-all" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                 
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Boutique Category</p>
                    <div className="relative">
                      <select required className="w-full p-6 bg-gray-50 rounded-[2rem] font-black text-sm outline-none appearance-none cursor-pointer" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                        {CATEGORIES.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                 </div>

                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-pink-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <Sparkles className="w-3 h-3 animate-pulse" /> Custom Event Badge (e.g. Eid Sale)
                    </p>
                    <input placeholder="Enter pop-up text..." className="w-full p-6 bg-pink-50/50 rounded-[2rem] font-black text-sm border border-pink-100 outline-none" value={productForm.eventName} onChange={e => setProductForm({...productForm, eventName: e.target.value})} />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Actual Price</p>
                       <input required type="number" placeholder="PKR" className="w-full p-6 bg-gray-50 rounded-[2rem] font-black text-sm outline-none" value={productForm.originalPrice} onChange={e => setProductForm({...productForm, originalPrice: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Discount %</p>
                       <input type="number" placeholder="OFF" className="w-full p-6 bg-gray-50 rounded-[2rem] font-black text-sm outline-none text-pink-600" value={productForm.discountPercentage} onChange={e => setProductForm({...productForm, discountPercentage: e.target.value})} />
                    </div>
                 </div>

                 <div className="p-7 bg-pink-600 rounded-[2.5rem] flex justify-between items-center shadow-2xl shadow-pink-200">
                    <div className="text-white">
                      <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Final Sale Price</p>
                      <p className="text-[8px] font-bold text-pink-200 uppercase">Displayed in Bazaar</p>
                    </div>
                    <p className="text-3xl font-black text-white italic tracking-tighter">PKR {parseFloat(productForm.price || '0').toLocaleString()}</p>
                 </div>

                 <button disabled={loading} className="w-full py-6 bg-gray-900 text-white font-black rounded-[2.5rem] uppercase tracking-[0.2em] text-xs shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                   {loading ? <Loader2 className="animate-spin" /> : <><Sparkles className="w-6 h-6" /> Launch Boutique Style</>}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
