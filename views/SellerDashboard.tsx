
import React, { useState, useEffect, useRef } from 'react';
import { 
  PlusCircle, X, Image as ImageIcon, Loader2, Settings, Trash2, 
  Check, MessageCircle, Sparkles, Plus, DollarSign, Tag, Calendar, History, Film, Camera, Save, UploadCloud, Store, ChevronDown, Trophy, CreditCard, Smartphone, Building2, Edit2
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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

  useEffect(() => {
    if (myShop) {
      setSettingsForm({
        name: myShop.name,
        whatsapp: myShop.whatsapp || '',
        logo: myShop.logo || '',
        banner: myShop.banner || '',
        bio: myShop.bio || '',
        easypaisa: myShop.easypaisa_number || '',
        jazzcash: myShop.jazzcash_number || '',
        bank: myShop.bank_details || ''
      });
    }
  }, [myShop]);

  useEffect(() => {
    if (editingProduct) {
      setProductForm({
        name: editingProduct.name,
        originalPrice: (editingProduct.original_price || editingProduct.price).toString(),
        discountPercentage: (editingProduct.discount_percentage || '0').toString(),
        price: editingProduct.price.toString(),
        category: editingProduct.category,
        description: editingProduct.description || '',
        eventName: editingProduct.event_name || '',
        images: editingProduct.images || [],
        videoUrl: editingProduct.videoUrl || ''
      });
    }
  }, [editingProduct]);

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
      if (refreshOrders) await refreshOrders();
      alert("Order Fulfilled!");
      setOrderSubTab('HISTORY');
    } catch (err: any) {
      alert("Status Update Failed: " + err.message);
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
      // Cache busting ensures the browser doesn't show an old image after update
      const finalUrl = `${publicUrl}?v=${Date.now()}`;
      
      if (type === 'IMAGE') {
        setProductForm(p => ({ ...p, images: [...p.images, finalUrl] }));
      } else if (type === 'VIDEO') {
        setProductForm(p => ({ ...p, videoUrl: finalUrl }));
      } else if (type === 'LOGO' || type === 'BANNER') {
        const field = type.toLowerCase() as 'logo' | 'banner';
        
        // Update both field variants to ensure compatibility with different SQL column names
        const dbPayload = type === 'LOGO' 
          ? { logo: finalUrl, logo_url: finalUrl } 
          : { banner: finalUrl, banner_url: finalUrl };
        
        const { error: updateError } = await supabase.from('shops').update(dbPayload).eq('id', myShop.id);
        if (updateError) throw updateError;
        
        setSettingsForm(prev => ({ ...prev, [field]: finalUrl }));
        await refreshShop();
        alert(`${type} updated instantly!`);
      }
    } catch (err: any) {
      alert(`Upload Failed: ${err.message}`);
    } finally {
      setLoading(false);
      setUploadingType(null);
      if (e.target) e.target.value = '';
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Delete this style permanently?")) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      await addProduct();
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    } finally {
      setLoading(false);
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
      alert("Settings Saved!");
    } catch (err: any) {
      alert("Save failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myShop || !supabase) return;
    setLoading(true);
    try {
      const payload = {
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
      };

      const { error } = editingProduct 
        ? await supabase.from('products').update(payload).eq('id', editingProduct.id)
        : await supabase.from('products').insert(payload);

      if (error) throw error;
      await addProduct();
      setShowModal(false);
      setEditingProduct(null);
      setProductForm({ name: '', originalPrice: '', discountPercentage: '', price: '', category: CATEGORIES[0].name, description: '', eventName: '', images: [], videoUrl: '' });
      alert(editingProduct ? "Updated!" : "Published!");
    } catch (err: any) {
      alert("Launch failed: " + err.message);
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
      {/* Banner / Header */}
      <div className="relative h-56 rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white bg-gray-900 group">
         <img src={settingsForm.banner} className="w-full h-full object-cover opacity-80" alt="Banner" />
         <div onClick={() => bannerInputRef.current?.click()} className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-black/50 backdrop-blur-sm z-10">
           {uploadingType === 'BANNER' ? <Loader2 className="animate-spin text-white" /> : <UploadCloud className="w-10 h-10 text-white" />}
           <span className="text-[10px] font-black uppercase text-white tracking-widest mt-2">Update Cover</span>
         </div>
         <input type="file" hidden ref={bannerInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, 'BANNER')} />

         <div className="absolute bottom-6 left-8 flex items-end gap-6 z-20">
            <div className="relative group/logo">
              <div className="w-24 h-24 rounded-[2.5rem] border-4 border-white bg-white overflow-hidden shadow-2xl relative">
                <img src={settingsForm.logo} className="w-full h-full object-cover" alt="Logo" />
                <div onClick={(e) => { e.stopPropagation(); logoInputRef.current?.click(); }} className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                   {uploadingType === 'LOGO' ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
                </div>
              </div>
              <input type="file" hidden ref={logoInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, 'LOGO')} />
            </div>
            <div className="text-white drop-shadow-lg mb-2">
               <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{myShop?.name}</h2>
               <p className="text-[9px] font-black uppercase text-pink-400 tracking-[0.3em] mt-2">Verified Boutique</p>
            </div>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-[2.5rem]">
        {['Inventory', 'Orders', 'Settings'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Inventory' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
             <h3 className="font-black uppercase text-[11px] tracking-widest text-gray-400">Manage Styles</h3>
             <button onClick={() => { setEditingProduct(null); setShowModal(true); }} className="bg-pink-600 text-white px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95 transition-all">
                <PlusCircle className="w-4 h-4" /> New Listing
             </button>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {products.filter(p => p.shopId === myShop?.id).map(p => (
              <div key={p.id} className="bg-white p-5 rounded-[2.5rem] border border-gray-100 flex flex-col gap-4 shadow-sm group hover:shadow-xl transition-all">
                <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-gray-50 shadow-inner">
                  <img src={p.images?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => { setEditingProduct(p); setShowModal(true); }} className="p-3 bg-white text-pink-600 rounded-xl shadow-lg hover:bg-pink-50"><Edit2 className="w-4 h-4" /></button>
                     <button onClick={() => handleDeleteProduct(p.id)} className="p-3 bg-white text-red-600 rounded-xl shadow-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="space-y-1.5 px-1">
                  <h4 className="font-black text-xs uppercase truncate text-gray-900 italic">{p.name}</h4>
                  <p className="text-pink-600 font-black text-sm italic">PKR {p.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Orders' && (
        <div className="space-y-6">
          <div className="flex gap-2 bg-gray-200 p-1.5 rounded-[1.8rem]">
            <button onClick={() => setOrderSubTab('ACTIVE')} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-[1.5rem] ${orderSubTab === 'ACTIVE' ? 'bg-white text-pink-600 shadow-md' : 'text-gray-400'}`}>Pending</button>
            <button onClick={() => setOrderSubTab('HISTORY')} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-[1.5rem] ${orderSubTab === 'HISTORY' ? 'bg-white text-pink-600 shadow-md' : 'text-gray-400'}`}>Fulfilled</button>
          </div>
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
               <div className="py-24 text-center text-gray-300 font-black uppercase text-[10px] tracking-widest border-4 border-dashed rounded-[3rem]">No orders found</div>
            ) : filteredOrders.map(order => (
              <div key={order.id} className="bg-white p-7 rounded-[3rem] border border-gray-100 shadow-sm space-y-4">
                 <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">ID: #{order.id.slice(-6).toUpperCase()}</p>
                      <p className="font-black text-lg text-gray-900 italic uppercase">{order.buyerName}</p>
                    </div>
                    <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-pink-50 text-pink-600'}`}>{order.status}</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <button onClick={() => window.open(`https://wa.me/${order.buyerMobile.replace(/^0/, '92')}`)} className="flex-1 py-4 bg-green-50 text-green-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4" /> Message Buyer
                    </button>
                    {order.status !== 'COMPLETED' && (
                      <button onClick={() => handleCompleteOrder(order.id)} disabled={loading} className="p-4 bg-gray-900 text-white rounded-2xl shadow-xl hover:bg-green-600 transition-all flex items-center justify-center">
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Check className="w-5 h-5" />}
                      </button>
                    )}
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Settings' && (
        <form onSubmit={handleUpdateSettings} className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-xl space-y-8">
           <div className="space-y-6">
              <h3 className="font-black uppercase text-xs text-gray-900 flex items-center gap-2"><Settings className="w-4 h-4 text-pink-600" /> Boutique Identity</h3>
              <div className="space-y-4">
                 <input placeholder="Shop Name" className="w-full p-5 bg-gray-50 rounded-2xl font-black text-sm outline-none border-2 border-transparent focus:border-pink-100" value={settingsForm.name} onChange={e => setSettingsForm({...settingsForm, name: e.target.value})} />
                 <input placeholder="WhatsApp (03xx...)" className="w-full p-5 bg-gray-50 rounded-2xl font-black text-sm outline-none border-2 border-transparent focus:border-pink-100" value={settingsForm.whatsapp} onChange={e => setSettingsForm({...settingsForm, whatsapp: e.target.value})} />
                 <textarea placeholder="Tell your story..." className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none h-24 border-2 border-transparent focus:border-pink-100" value={settingsForm.bio} onChange={e => setSettingsForm({...settingsForm, bio: e.target.value})} />
              </div>
           </div>
           <div className="space-y-6 pt-6 border-t border-gray-100">
              <h3 className="font-black uppercase text-xs text-gray-900 flex items-center gap-2"><CreditCard className="w-4 h-4 text-pink-600" /> Payment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <input placeholder="EasyPaisa" className="w-full p-5 bg-pink-50/50 rounded-2xl font-black text-sm border border-pink-100" value={settingsForm.easypaisa} onChange={e => setSettingsForm({...settingsForm, easypaisa: e.target.value})} />
                 <input placeholder="JazzCash" className="w-full p-5 bg-blue-50/50 rounded-2xl font-black text-sm border border-blue-100" value={settingsForm.jazzcash} onChange={e => setSettingsForm({...settingsForm, jazzcash: e.target.value})} />
              </div>
           </div>
           <button disabled={loading} className="w-full py-5 bg-gray-900 text-white font-black rounded-[2rem] uppercase tracking-widest text-xs shadow-xl active:scale-[0.98] transition-all">
             {loading ? <Loader2 className="animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Save Brand Profile</>}
           </button>
        </form>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-white w-full max-w-lg rounded-t-[4rem] p-10 space-y-8 animate-in slide-in-from-bottom-full duration-500 max-h-[95vh] overflow-y-auto no-scrollbar border-t-8 border-pink-600">
              <div className="flex items-center justify-between">
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">{editingProduct ? 'Refine Style' : 'New Creation'}</h2>
                 <button onClick={() => { setShowModal(false); setEditingProduct(null); }} className="p-4 bg-gray-100 rounded-full"><X className="w-6 h-6 text-gray-400" /></button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-6 pb-12">
                 <div className="grid grid-cols-2 gap-4">
                   <div onClick={() => imgInputRef.current?.click()} className="aspect-square bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 cursor-pointer overflow-hidden group">
                      {productForm.images.length > 0 ? <img src={productForm.images[0]} className="w-full h-full object-cover" /> : <><Camera className="w-8 h-8 text-gray-300" /><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Add Photo</span></>}
                      <input type="file" hidden ref={imgInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, 'IMAGE')} />
                   </div>
                   <div onClick={() => videoInputRef.current?.click()} className="aspect-square bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 cursor-pointer overflow-hidden group">
                      {productForm.videoUrl ? <div className="text-pink-600 flex flex-col items-center"><Film className="w-8 h-8" /><span className="text-[9px] font-black uppercase mt-1">Reel Added</span></div> : <><Film className="w-8 h-8 text-gray-300" /><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Video Reel</span></>}
                      <input type="file" hidden ref={videoInputRef} accept="video/*" onChange={(e) => handleFileUpload(e, 'VIDEO')} />
                   </div>
                 </div>

                 <input required placeholder="Style Name" className="w-full p-6 bg-gray-50 rounded-[2rem] font-black text-base outline-none border border-transparent focus:border-pink-200" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                 
                 <div className="relative">
                    <select required className="w-full p-6 bg-gray-50 rounded-[2rem] font-black text-sm outline-none appearance-none cursor-pointer border border-transparent focus:border-pink-200" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                      {CATEGORIES.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                 </div>

                 <input placeholder="Event Label (e.g. Eid Mubarak)" className="w-full p-6 bg-pink-50/50 rounded-[2rem] font-black text-sm border border-pink-100 outline-none" value={productForm.eventName} onChange={e => setProductForm({...productForm, eventName: e.target.value})} />

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase text-gray-400 ml-4">Original Price</p>
                      <input required type="number" placeholder="PKR" className="w-full p-6 bg-gray-50 rounded-[2rem] font-black text-sm outline-none" value={productForm.originalPrice} onChange={e => setProductForm({...productForm, originalPrice: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase text-pink-600 ml-4">Sale %</p>
                      <input type="number" placeholder="Off %" className="w-full p-6 bg-pink-50 rounded-[2rem] font-black text-sm outline-none text-pink-600" value={productForm.discountPercentage} onChange={e => setProductForm({...productForm, discountPercentage: e.target.value})} />
                    </div>
                 </div>

                 <button disabled={loading} className="w-full py-6 bg-gray-900 text-white font-black rounded-[2.5rem] uppercase tracking-widest text-xs shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                   {loading ? <Loader2 className="animate-spin" /> : <><Sparkles className="w-6 h-6" /> {editingProduct ? 'Refine Style' : 'List in Bazar'}</>}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
