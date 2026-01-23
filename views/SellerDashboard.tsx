
import React, { useState, useRef, useEffect } from 'react';
import { 
  PlusCircle, ShoppingBag, Package, X, Video, Image as ImageIcon,
  Check, Upload, Bell, Clock, ChevronRight, User, MapPin, 
  Phone, Sparkles, Loader2, Volume2, DollarSign, AlertCircle, FileVideo, Store, Building2, Globe, Settings, Camera,
  // Added PlayCircle to fix the missing name error
  PlayCircle
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

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

  const handleUpdateShopMedia = async (type: 'logo' | 'banner', file: File) => {
    if (!supabase || !myShop) return;
    type === 'logo' ? setUploadingImage(true) : setUploadingBanner(true);
    try {
      const path = `shops/${myShop.id}/${type}_${Date.now()}`;
      const publicUrl = await uploadFile('marketplace', path, file);
      const updateData = type === 'logo' ? { logo_url: publicUrl } : { banner_url: publicUrl };
      const { error } = await supabase.from('shops').update(updateData).eq('id', myShop.id);
      if (error) throw error;
      refreshShop();
    } catch (err) {
      alert("Upload failed: " + (err as any).message);
    } finally {
      type === 'logo' ? setUploadingImage(false) : setUploadingBanner(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !myShop) return;
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
    } catch (err) {
      alert((err as any).message);
    } finally {
      setLoading(false);
    }
  };

  const handleProductFileUpload = async (file: File, isVideo: boolean) => {
    if (!supabase || !myShop) return;
    setLoading(true);
    try {
      const path = `products/${myShop.id}/${Date.now()}_${file.name}`;
      const url = await uploadFile('marketplace', path, file);
      if (isVideo) setNewProduct(prev => ({ ...prev, videoUrl: url }));
      else setNewProduct(prev => ({ ...prev, images: [...prev.images, url] }));
    } catch (err) {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  if (!myShop) return <div className="p-20 text-center uppercase font-black">Loading Shop Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-24">
      {/* Shop Header */}
      <div className="relative h-48 rounded-[2.5rem] overflow-hidden group shadow-2xl">
        <img src={myShop.banner} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
        <div className="absolute bottom-6 left-6 flex items-center gap-4">
           <div className="relative">
              <img src={myShop.logo} className="w-16 h-16 rounded-2xl border-2 border-white object-cover" />
              {uploadingImage && <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center"><Loader2 className="w-4 h-4 text-white animate-spin" /></div>}
           </div>
           <div className="text-white">
              <h2 className="text-xl font-black italic uppercase tracking-tighter">{myShop.name}</h2>
              <p className="text-[10px] font-bold uppercase text-pink-300">{myShop.bazaar}</p>
           </div>
        </div>
        <button onClick={() => setActiveTab('Settings')} className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/40 transition-all">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-[1.8rem]">
        {['Inventory', 'Orders', 'Settings'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-400'}`}>{tab}</button>
        ))}
      </div>

      {activeTab === 'Inventory' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
             <h3 className="font-black uppercase text-xs italic tracking-widest text-gray-500">Your Products ({myProducts.length})</h3>
             <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                <PlusCircle className="w-4 h-4" /> Add New
             </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myProducts.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-[2rem] border border-gray-100 flex items-center gap-4 shadow-sm">
                <img src={p.images?.[0]} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <h4 className="font-black text-sm uppercase italic">{p.name}</h4>
                  <p className="text-pink-600 font-black text-xs">PKR {p.price.toLocaleString()}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[8px] font-black px-2 py-0.5 bg-gray-50 text-gray-400 rounded-full uppercase">{p.category}</span>
                    {p.videoUrl && <span className="text-[8px] font-black px-2 py-0.5 bg-pink-50 text-pink-500 rounded-full uppercase">REEL</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Settings' && (
        <div className="bg-white rounded-[2.5rem] p-8 space-y-8 border border-gray-100">
           <div className="space-y-4">
              <h3 className="font-black uppercase italic tracking-tighter text-lg">Shop Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-gray-400 ml-1">Shop Logo</p>
                    <div className="relative w-32 h-32 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group">
                       <img src={myShop.logo} className="w-full h-full object-cover" />
                       <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleUpdateShopMedia('logo', e.target.files[0])} />
                          <Camera className="text-white w-8 h-8" />
                       </label>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-gray-400 ml-1">Shop Banner</p>
                    <div className="relative w-full h-32 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group">
                       <img src={myShop.banner} className="w-full h-full object-cover" />
                       <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleUpdateShopMedia('banner', e.target.files[0])} />
                          <Camera className="text-white w-8 h-8" />
                       </label>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4 overflow-y-auto">
           <div className="bg-white w-full max-w-xl rounded-t-[3rem] p-8 space-y-6 animate-in slide-in-from-bottom-full duration-500 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter">New Product</h2>
                 <button onClick={() => setShowAddModal(false)} className="p-2 bg-gray-50 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-5">
                 <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-gray-400 ml-1">Media (Images & Video)</p>
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                       <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer shrink-0">
                          <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleProductFileUpload(e.target.files[0], false)} />
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-[8px] font-black text-gray-400 uppercase mt-1">Image</span>
                       </label>
                       <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50 flex flex-col items-center justify-center cursor-pointer shrink-0">
                          <input type="file" className="hidden" accept="video/*" onChange={e => e.target.files?.[0] && handleProductFileUpload(e.target.files[0], true)} />
                          <Video className="w-5 h-5 text-pink-500" />
                          <span className="text-[8px] font-black text-pink-500 uppercase mt-1">Reel</span>
                       </label>
                       {newProduct.images.map((img, i) => <img key={i} src={img} className="w-20 h-20 rounded-2xl object-cover shrink-0 border" />)}
                       {newProduct.videoUrl && <div className="w-20 h-20 rounded-2xl bg-black flex items-center justify-center shrink-0 border-2 border-pink-500"><PlayCircle className="text-white w-8 h-8" /></div>}
                    </div>
                 </div>

                 <input required placeholder="Product Name" className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-pink-500/20" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                 <div className="grid grid-cols-2 gap-4">
                    <input required type="number" placeholder="Price (PKR)" className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-pink-500/20" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                    <select className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-pink-500/20" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                       {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                 </div>
                 <textarea placeholder="Product Description..." className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-none h-32 resize-none outline-none focus:ring-2 focus:ring-pink-500/20" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                 
                 <button disabled={loading} className="w-full bg-pink-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-[11px] shadow-xl flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="animate-spin" /> : 'Publish to Bazar'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
