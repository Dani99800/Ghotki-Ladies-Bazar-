
import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, ShoppingBag, X, Video, Image as ImageIcon,
  Loader2, Settings, Camera, PlayCircle, Trash2, AlertCircle,
  Package, Check, MessageCircle, Phone, MapPin, Clock
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const myShop = shops.find(s => s.owner_id === user.id);
  const myProducts = products.filter(p => p.shopId === myShop?.id);
  const myOrders = orders.filter(o => o.sellerId === myShop?.id);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: CATEGORIES[0].name,
    description: '',
    images: [] as string[],
    videoUrl: ''
  });

  // Restricted Feature Check
  const canPostVideo = myShop?.subscription_tier === 'STANDARD' || myShop?.subscription_tier === 'PREMIUM';

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
      if (error) throw error;
      refreshShop(); // This should trigger a global order fetch in App.tsx if it's listening
    } catch (err: any) {
      alert("Order update failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateShopMedia = async (type: 'logo' | 'banner', file: File) => {
    if (!supabase || !myShop) return;
    setLoading(true);
    try {
      const path = `${user.id}/shop_assets/${type}_${Date.now()}`;
      const publicUrl = await uploadFile('marketplace', path, file);
      const updateData = type === 'logo' ? { logo_url: publicUrl } : { banner_url: publicUrl };
      const { error } = await supabase.from('shops').update(updateData).eq('id', myShop.id);
      if (error) throw error;
      refreshShop();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProductFileUpload = async (file: File, isVideo: boolean) => {
    if (!supabase || !myShop) return;
    
    if (isVideo && !canPostVideo) {
      alert("This feature requires a Standard (2500 PKR) or Premium plan. Please upgrade to post video reels.");
      return;
    }

    setLoading(true);
    try {
      const path = `${user.id}/products/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const url = await uploadFile('marketplace', path, file);
      if (isVideo) setNewProduct(prev => ({ ...prev, videoUrl: url }));
      else setNewProduct(prev => ({ ...prev, images: [...prev.images, url] }));
    } catch (err: any) {
       alert("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!supabase || !confirm("Are you sure you want to delete this product?")) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      addProduct();
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !myShop) return;
    if (newProduct.images.length === 0) {
      alert("Please upload at least one image before publishing.");
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
      alert("Publishing failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!myShop) return <div className="p-20 text-center uppercase font-black animate-pulse text-gray-300">Loading Seller Dashboard...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-32">
      {/* Shop Header */}
      <div className="relative h-48 rounded-[2.5rem] overflow-hidden shadow-2xl group">
        <img src={myShop.banner} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all" />
        <div className="absolute bottom-6 left-6 flex items-center gap-4">
           <img src={myShop.logo} className="w-16 h-16 rounded-2xl border-2 border-white object-cover bg-white" />
           <div className="text-white">
              <h2 className="text-xl font-black italic uppercase tracking-tighter">{myShop.name}</h2>
              <p className="text-[10px] font-bold uppercase text-pink-300">{myShop.subscription_tier} MEMBER • {myShop.bazaar}</p>
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-[1.8rem]">
        {['Inventory', 'Orders', 'Settings'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-pink-600 shadow-md' : 'text-gray-400'}`}>{tab}</button>
        ))}
      </div>

      {activeTab === 'Orders' && (
        <div className="space-y-4">
          <h3 className="font-black uppercase text-xs text-gray-500 ml-2">Recent Shop Orders ({myOrders.length})</h3>
          {myOrders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-pink-50 text-pink-600 rounded-xl"><Package className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="font-bold text-gray-900">{order.buyerName}</p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${order.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                  {order.status}
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                 {order.items.map((item, idx) => (
                   <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-600">{item.name} x {item.quantity}</span>
                      <span className="font-black text-pink-600">PKR {item.price * item.quantity}</span>
                   </div>
                 ))}
                 <div className="flex justify-between items-center pt-2 border-t mt-2">
                    <span className="text-[10px] font-black uppercase text-gray-400">Total Revenue</span>
                    <span className="text-lg font-black italic">PKR {order.total.toLocaleString()}</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                 {order.status === 'PENDING' && (
                   <button onClick={() => updateOrderStatus(order.id, 'SHIPPED')} className="bg-pink-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> Ship Order
                   </button>
                 )}
                 <button onClick={() => window.open(`https://wa.me/${order.buyerMobile}`)} className="bg-green-50 text-green-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Message Buyer
                 </button>
              </div>
            </div>
          ))}
          {myOrders.length === 0 && (
            <div className="py-20 text-center space-y-3 opacity-30">
               <ShoppingBag className="w-12 h-12 mx-auto" />
               <p className="font-black text-[10px] uppercase">No orders yet</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Inventory' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
             <h3 className="font-black uppercase text-xs text-gray-500">My Items ({myProducts.length})</h3>
             <button onClick={() => setShowAddModal(true)} className="bg-pink-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 active:scale-95 transition-all">
                <PlusCircle className="w-4 h-4" /> Add New
             </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myProducts.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-[2rem] border border-gray-100 flex items-center gap-4 shadow-sm group hover:border-pink-100 transition-all">
                <img src={p.images?.[0]} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <h4 className="font-black text-sm uppercase italic text-gray-900">{p.name}</h4>
                  <p className="text-pink-600 font-black text-xs">PKR {p.price.toLocaleString()}</p>
                </div>
                <button onClick={() => handleDeleteProduct(p.id)} className="p-3 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Settings' && (
        <div className="bg-white rounded-[2.5rem] p-8 space-y-8 border border-gray-100 shadow-sm">
           <h3 className="font-black uppercase italic tracking-tighter text-lg">Shop Media</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                 <p className="text-[10px] font-black uppercase text-gray-400">Update Logo</p>
                 <label className="relative block w-32 h-32 rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer">
                    <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleUpdateShopMedia('logo', e.target.files[0])} />
                    <img src={myShop.logo} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><Camera className="text-white" /></div>
                 </label>
              </div>
              <div className="space-y-3">
                 <p className="text-[10px] font-black uppercase text-gray-400">Update Banner</p>
                 <label className="relative block w-full h-32 rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer">
                    <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleUpdateShopMedia('banner', e.target.files[0])} />
                    <img src={myShop.banner} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><Camera className="text-white" /></div>
                 </label>
              </div>
           </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4">
           <div className="bg-white w-full max-w-xl rounded-t-[3rem] p-8 space-y-6 animate-in slide-in-from-bottom-full duration-500 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter">New Product</h2>
                 <button onClick={() => setShowAddModal(false)}><X className="text-gray-400" /></button>
              </div>
              <form onSubmit={handleCreateProduct} className="space-y-5">
                 <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                    <label className="w-24 h-24 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer shrink-0">
                       <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleProductFileUpload(e.target.files[0], false)} />
                       <ImageIcon className="text-gray-400" />
                       <span className="text-[8px] font-black text-gray-400 uppercase">Image</span>
                    </label>
                    
                    <label className={`w-24 h-24 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer shrink-0 transition-all ${canPostVideo ? 'border-pink-200 bg-pink-50' : 'border-gray-100 bg-gray-50 opacity-50'}`}>
                       <input type="file" className="hidden" accept="video/*" onChange={e => e.target.files?.[0] && handleProductFileUpload(e.target.files[0], true)} disabled={!canPostVideo} />
                       <Video className={canPostVideo ? "text-pink-500" : "text-gray-300"} />
                       <span className={`text-[8px] font-black uppercase ${canPostVideo ? "text-pink-500" : "text-gray-300"}`}>Reel</span>
                       {!canPostVideo && <span className="text-[6px] font-black uppercase text-red-400 mt-1">PRO ONLY</span>}
                    </label>

                    {newProduct.images.map((img, i) => (
                      <div key={i} className="relative w-24 h-24 shrink-0">
                        <img src={img} className="w-full h-full rounded-3xl object-cover border" />
                        <button type="button" onClick={() => setNewProduct({...newProduct, images: newProduct.images.filter((_, idx) => idx !== i)})} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                    {newProduct.videoUrl && (
                      <div className="relative w-24 h-24 shrink-0 bg-black rounded-3xl flex items-center justify-center border-2 border-pink-500">
                        <PlayCircle className="text-white" />
                        <button type="button" onClick={() => setNewProduct({...newProduct, videoUrl: ''})} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                      </div>
                    )}
                 </div>
                 <input required placeholder="Product Name" className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                 <div className="grid grid-cols-2 gap-4">
                    <input required type="number" placeholder="Price" className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                    <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-500 outline-none" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                       {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                 </div>
                 <textarea required placeholder="Description" className="w-full p-4 bg-gray-50 rounded-2xl font-bold h-24" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                 <button disabled={loading} className="w-full bg-pink-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-[11px] flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="animate-spin" /> : 'Publish Item'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
