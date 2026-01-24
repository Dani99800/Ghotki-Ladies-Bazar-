
import React, { useState, useEffect, useRef } from 'react';
import { 
  PlusCircle, ShoppingBag, X, Video, Image as ImageIcon,
  Loader2, Settings, Camera, PlayCircle, Trash2, AlertCircle,
  Package, Check, MessageCircle, Phone, MapPin, Clock,
  Lock
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioPlayedRef = useRef(false);

  const myShop = shops.find(s => s.owner_id === user.id);
  const myProducts = products.filter(p => p.shopId === myShop?.id);
  const myOrders = orders.filter(o => o.sellerId === user.id); // Filtering by owner's profile ID
  const pendingOrders = myOrders.filter(o => o.status === 'PENDING');

  // Plan Based Checks
  const hasVideoAccess = myShop?.subscription_tier === 'STANDARD' || myShop?.subscription_tier === 'PREMIUM';

  // Notification Sound Logic
  useEffect(() => {
    if (pendingOrders.length > 0 && !audioPlayedRef.current) {
      const playAudio = async () => {
        try {
          const audio = new Audio(NOTIFICATION_SOUND);
          await audio.play();
          audioPlayedRef.current = true;
        } catch (e) {
          console.log("Audio notification blocked by browser interaction rules.", e);
        }
      };
      playAudio();
    }
  }, [pendingOrders.length]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: CATEGORIES[0].name,
    description: '',
    images: [] as string[],
    videoUrl: ''
  });

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
      if (error) throw error;
      refreshShop();
    } catch (err: any) {
      alert("Status Update Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProductFileUpload = async (file: File, isVideo: boolean) => {
    if (!supabase || !myShop) return;
    
    // Feature Lock Check
    if (isVideo && !hasVideoAccess) {
      alert("Video Reels are only available for Standard (2500 PKR) and Premium (5000 PKR) plans. Please upgrade your shop tier.");
      return;
    }

    setLoading(true);
    try {
      const path = `${user.id}/products/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const url = await uploadFile('marketplace', path, file);
      if (isVideo) setNewProduct(prev => ({ ...prev, videoUrl: url }));
      else setNewProduct(prev => ({ ...prev, images: [...prev.images, url] }));
    } catch (err: any) {
       alert("Upload error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !myShop) return;
    if (newProduct.images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('products').insert({
        shop_id: myShop.id,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        description: newProduct.description,
        image_urls: newProduct.images,
        video_url: newProduct.videoUrl,
        tags: ['New']
      });
      if (error) throw error;
      setShowAddModal(false);
      setNewProduct({ name: '', price: '', category: CATEGORIES[0].name, description: '', images: [], videoUrl: '' });
      addProduct();
    } catch (err: any) {
      alert("Save Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!myShop) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-gray-300">Loading Dashboard...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-32 animate-in fade-in duration-500">
      {/* Alert for New Orders */}
      {pendingOrders.length > 0 && (
        <div className="bg-pink-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl shadow-pink-200 animate-pulse">
           <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <p className="text-[11px] font-black uppercase tracking-widest">You have {pendingOrders.length} New Order(s)!</p>
           </div>
           <button onClick={() => setActiveTab('Orders')} className="bg-white text-pink-600 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider">Review Orders</button>
        </div>
      )}

      {/* Shop Info Card */}
      <div className="relative h-48 rounded-[2.5rem] overflow-hidden shadow-2xl group border-4 border-white">
        <img src={myShop.banner} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 flex items-center gap-4">
           <img src={myShop.logo} className="w-16 h-16 rounded-2xl border-2 border-white object-cover bg-white shadow-xl" />
           <div className="text-white">
              <h2 className="text-xl font-black italic uppercase tracking-tighter">{myShop.name}</h2>
              <div className="flex items-center gap-2">
                 <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${hasVideoAccess ? 'bg-pink-500 text-white' : 'bg-gray-400 text-white opacity-50'}`}>
                    {myShop.subscription_tier} TIER
                 </span>
                 <p className="text-[9px] font-bold text-white/70 uppercase">{myShop.bazaar}</p>
              </div>
           </div>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-[1.8rem]">
        {['Inventory', 'Orders', 'Settings'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-400'}`}>{tab}</button>
        ))}
      </div>

      {activeTab === 'Orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black uppercase text-[10px] tracking-widest text-gray-400">Shop Orders ({myOrders.length})</h3>
          </div>
          {myOrders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4 transition-all hover:shadow-md">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-pink-50 text-pink-600 rounded-xl"><Package className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ref: {order.id.slice(-6).toUpperCase()}</p>
                    <p className="font-bold text-gray-900">{order.buyerName}</p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${order.status === 'PENDING' ? 'bg-orange-100 text-orange-600 animate-pulse' : 'bg-green-100 text-green-600'}`}>
                  {order.status}
                </div>
              </div>
              
              <div className="space-y-2 pt-2 border-t border-gray-50">
                 {order.items.map((item, idx) => (
                   <div key={idx} className="flex items-center justify-between text-[11px] font-bold text-gray-600">
                      <span>{item.name} x {item.quantity}</span>
                      <span className="text-pink-600 font-black">PKR {(item.price * item.quantity).toLocaleString()}</span>
                   </div>
                 ))}
                 <div className="flex justify-between items-center pt-3 border-t mt-2">
                    <span className="text-[10px] font-black uppercase text-gray-400">Total Due</span>
                    <span className="text-xl font-black italic text-gray-900">PKR {order.total.toLocaleString()}</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-50">
                 {order.status === 'PENDING' ? (
                   <button onClick={() => updateOrderStatus(order.id, 'SHIPPED')} className="bg-pink-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95">
                      <Check className="w-4 h-4" /> Ship Now
                   </button>
                 ) : (
                   <button disabled className="bg-gray-100 text-gray-400 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> Shipped
                   </button>
                 )}
                 <button onClick={() => window.open(`https://wa.me/${order.buyerMobile}`)} className="bg-green-50 text-green-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95">
                    <MessageCircle className="w-4 h-4" /> Contact Buyer
                 </button>
              </div>
            </div>
          ))}
          {myOrders.length === 0 && (
            <div className="py-20 text-center space-y-3 opacity-30 flex flex-col items-center">
               <ShoppingBag className="w-16 h-16 text-gray-200" />
               <p className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">No Orders Available</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Inventory' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
             <h3 className="font-black uppercase text-[10px] tracking-widest text-gray-400">Current Stock ({myProducts.length})</h3>
             <button onClick={() => setShowAddModal(true)} className="bg-pink-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-pink-100 flex items-center gap-2 active:scale-95 transition-all">
                <PlusCircle className="w-4 h-4" /> Add Item
             </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myProducts.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-[2.5rem] border border-gray-100 flex items-center gap-4 shadow-sm group hover:border-pink-100 transition-all">
                <img src={p.images?.[0]} className="w-20 h-20 rounded-2xl object-cover shadow-sm" />
                <div className="flex-1">
                  <h4 className="font-black text-sm uppercase italic text-gray-900 truncate max-w-[150px]">{p.name}</h4>
                  <p className="text-pink-600 font-black text-xs">PKR {p.price.toLocaleString()}</p>
                </div>
                <button onClick={async () => {
                   if(confirm("Delete item?")) {
                      await supabase.from('products').delete().eq('id', p.id);
                      addProduct();
                   }
                }} className="p-3 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity active:scale-90">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Settings' && (
        <div className="bg-white rounded-[3rem] p-10 space-y-10 border border-gray-100 shadow-sm">
           <div className="space-y-1">
              <h3 className="font-black uppercase italic tracking-tighter text-2xl text-gray-900">Merchant Settings</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-600">Account Governance</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                 <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Brand Identity (Logo)</p>
                 <label className="relative block w-32 h-32 rounded-[2rem] border-4 border-dashed border-gray-100 overflow-hidden cursor-pointer hover:border-pink-300 transition-all">
                    <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && uploadFile('marketplace', `${user.id}/logo`, e.target.files[0]).then(url => supabase.from('shops').update({logo_url: url}).eq('id', myShop.id).then(refreshShop))} />
                    <img src={myShop.logo} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><Camera className="text-white" /></div>
                 </label>
              </div>
              <div className="space-y-4">
                 <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Store Presentation (Banner)</p>
                 <label className="relative block w-full h-32 rounded-[2rem] border-4 border-dashed border-gray-100 overflow-hidden cursor-pointer hover:border-pink-300 transition-all">
                    <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && uploadFile('marketplace', `${user.id}/banner`, e.target.files[0]).then(url => supabase.from('shops').update({banner_url: url}).eq('id', myShop.id).then(refreshShop))} />
                    <img src={myShop.banner} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><Camera className="text-white" /></div>
                 </label>
              </div>
           </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end justify-center p-4">
           <div className="bg-white w-full max-w-xl rounded-t-[3rem] p-10 space-y-8 animate-in slide-in-from-bottom-full duration-500 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">Add Item</h2>
                 <button onClick={() => setShowAddModal(false)} className="p-2 bg-gray-50 rounded-full"><X className="text-gray-400" /></button>
              </div>
              <form onSubmit={handleCreateProduct} className="space-y-6">
                 <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
                    <label className="w-28 h-28 rounded-[2.2rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer shrink-0 hover:bg-pink-50 hover:border-pink-200 transition-all">
                       <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleProductFileUpload(e.target.files[0], false)} />
                       <ImageIcon className="text-gray-400 mb-1" />
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Image</span>
                    </label>
                    
                    <label className={`w-28 h-28 rounded-[2.2rem] border-4 border-dashed flex flex-col items-center justify-center cursor-pointer shrink-0 transition-all ${hasVideoAccess ? 'border-pink-200 bg-pink-50' : 'border-gray-50 bg-gray-50 opacity-50 cursor-not-allowed'}`}>
                       <input type="file" className="hidden" accept="video/*" onChange={e => e.target.files?.[0] && handleProductFileUpload(e.target.files[0], true)} disabled={!hasVideoAccess} />
                       {hasVideoAccess ? <Video className="text-pink-500 mb-1" /> : <Lock className="text-gray-300 mb-1" />}
                       <span className={`text-[9px] font-black uppercase tracking-widest ${hasVideoAccess ? "text-pink-500" : "text-gray-300"}`}>Reel</span>
                       {!hasVideoAccess && <span className="text-[7px] font-black uppercase text-pink-600 mt-1">LOCKED</span>}
                    </label>

                    {newProduct.images.map((img, i) => (
                      <div key={i} className="relative w-28 h-28 shrink-0">
                        <img src={img} className="w-full h-full rounded-[2.2rem] object-cover border-4 border-white shadow-xl" />
                        <button type="button" onClick={() => setNewProduct({...newProduct, images: newProduct.images.filter((_, idx) => idx !== i)})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-lg"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                    {newProduct.videoUrl && (
                      <div className="relative w-28 h-28 shrink-0 bg-gray-900 rounded-[2.2rem] flex items-center justify-center border-4 border-pink-500 shadow-xl overflow-hidden">
                        <PlayCircle className="text-pink-500 w-10 h-10" />
                        <button type="button" onClick={() => setNewProduct({...newProduct, videoUrl: ''})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-lg"><X className="w-3 h-3" /></button>
                      </div>
                    )}
                 </div>
                 
                 <div className="space-y-4">
                    <input required placeholder="Item Title (e.g. Silk Suit)" className="w-full p-5 bg-gray-50 rounded-2xl font-bold border border-transparent focus:border-pink-200 outline-none" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                       <input required type="number" placeholder="Price (PKR)" className="w-full p-5 bg-gray-50 rounded-2xl font-bold border border-transparent focus:border-pink-200 outline-none" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                       <select className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-gray-500 outline-none border border-transparent focus:border-pink-200" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                          {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                       </select>
                    </div>
                    <textarea required placeholder="Brief description of the fabric, color, or style..." className="w-full p-5 bg-gray-50 rounded-2xl font-bold h-28 border border-transparent focus:border-pink-200 outline-none" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                 </div>
                 
                 <button disabled={loading} className="w-full bg-pink-600 text-white font-black py-6 rounded-2xl uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 shadow-2xl shadow-pink-200 active:scale-95 transition-all">
                    {loading ? <Loader2 className="animate-spin" /> : 'Publish to Marketplace'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
