
import React, { useState, useRef, useEffect } from 'react';
import { 
  PlusCircle, ShoppingBag, Package, X, Video, Image as ImageIcon,
  Check, Upload, Bell, Clock, ChevronRight, User, MapPin, 
  Phone, Sparkles, Loader2, Volume2, DollarSign, AlertCircle, FileVideo, Store
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

  const [newProduct, setNewProduct] = useState<{
    name: string;
    price: string;
    category: string;
    description: string;
    imageFile: File | null;
    videoFile: File | null;
  }>({
    name: '',
    price: '',
    category: CATEGORIES[0].name,
    description: '',
    imageFile: null,
    videoFile: null
  });

  const [setupData, setSetupData] = useState({
    name: '',
    bazaar: BAZAARS[0],
    category: CATEGORIES[0].name
  });

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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
        subscription_tier: user.subscription_tier || 'BASIC',
        status: 'PENDING'
      });
      if (error) throw error;
      window.location.reload(); // Refresh to catch the new shop
    } catch (err: any) {
      alert("Error creating shop: " + err.message);
    } finally {
      setLoadingShop(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myShop) return alert("Shop not found!");
    if (!supabase) return;
    
    setUploadProgress('UPLOADING');
    try {
      let imageUrl = 'https://via.placeholder.com/600x800';
      let videoUrl = '';

      if (newProduct.imageFile) {
        imageUrl = await uploadFile('assets', `products/${user.id}_${Date.now()}_img.jpg`, newProduct.imageFile);
      }
      if (newProduct.videoFile) {
        videoUrl = await uploadFile('assets', `products/${user.id}_${Date.now()}_video.mp4`, newProduct.videoFile);
      }

      setUploadProgress('PUBLISHING');
      
      const { data, error } = await supabase.from('products').insert({
        shop_id: myShop.id,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        description: newProduct.description,
        image_urls: [imageUrl],
        video_url: videoUrl,
        tags: ['New']
      }).select().single();

      if (error) throw error;

      addProduct({
        ...data,
        images: data.image_urls,
        shopId: data.shop_id,
        videoUrl: data.video_url
      } as any);
      
      setShowAddModal(false);
      setNewProduct({ name: '', price: '', category: CATEGORIES[0].name, description: '', imageFile: null, videoFile: null });
    } catch (err: any) {
      alert("Error adding product: " + err.message);
    } finally {
      setUploadProgress('IDLE');
    }
  };

  // IF NO SHOP FOUND FOR THIS SELLER
  if (!myShop) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-8 animate-in fade-in py-20">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mx-auto">
            <Store className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Shop Setup</h1>
          <p className="text-gray-400 text-sm font-bold">We couldn't find your shop profile. Please fill this out to get started!</p>
        </div>

        <form onSubmit={handleCreateShop} className="space-y-4 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Business Name</label>
            <input required type="text" placeholder="e.g. Ghotki Glamour" className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" value={setupData.name} onChange={e => setSetupData({...setupData, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Market Location</label>
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

          <button disabled={loadingShop} className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-[11px] mt-4 flex items-center justify-center gap-3">
            {loadingShop ? <Loader2 className="animate-spin" /> : 'Create My Shop'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32 animate-in fade-in">
      {/* Header Stat Card */}
      <div className="bg-gradient-to-br from-gray-900 to-pink-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl -mt-32 -mr-32" />
        <div className="relative z-10 flex justify-between items-start mb-10">
           <div className="space-y-1">
              <div className="flex items-center gap-2">
                 <h1 className="text-2xl font-black italic uppercase tracking-tighter">{myShop.name}</h1>
                 <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase ${myShop.status === 'APPROVED' ? 'bg-green-500' : 'bg-orange-500'}`}>{myShop.status}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-pink-300">{myShop.bazaar}</p>
           </div>
           <button onClick={() => setShowAddModal(true)} className="w-12 h-12 bg-white text-pink-600 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"><PlusCircle className="w-7 h-7" /></button>
        </div>
        
        <div className="grid grid-cols-2 gap-6 relative z-10">
           <div className="space-y-1">
              <p className="text-3xl font-black tracking-tighter italic">PKR {myOrders.reduce((a, b) => a + b.total, 0).toLocaleString()}</p>
              <p className="text-[9px] font-black uppercase text-pink-300/60">Total Gross Volume</p>
           </div>
           <div className="space-y-1">
              <p className="text-3xl font-black tracking-tighter italic">PKR {(myOrders.length * 1000).toLocaleString()}</p>
              <p className="text-[9px] font-black uppercase text-pink-300/60">Platform Fees Due</p>
           </div>
        </div>
      </div>

      <div className="flex gap-3 p-1.5 bg-gray-100 rounded-[1.8rem]">
        {['Inventory', 'Orders', 'Alerts'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-400'}`}>{tab}</button>
        ))}
      </div>

      {activeTab === 'Inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {myProducts.length === 0 ? (
             <div className="col-span-full py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                   <Package className="w-8 h-8" />
                </div>
                <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">No products listed yet</p>
                <button onClick={() => setShowAddModal(true)} className="text-pink-600 font-black uppercase text-[10px] underline">Add Your First Product</button>
             </div>
           ) : myProducts.map(p => (
             <div key={p.id} className="bg-white p-5 rounded-[2.5rem] border border-gray-100 flex items-center gap-5 shadow-sm group hover:border-pink-200 transition-all">
                <img src={p.images?.[0] || 'https://via.placeholder.com/150'} className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-50" />
                <div className="flex-1">
                   <h3 className="font-black text-sm text-gray-900 truncate uppercase italic">{p.name}</h3>
                   <p className="text-pink-600 font-black text-xs italic">PKR {p.price.toLocaleString()}</p>
                   <div className="flex items-center gap-2 mt-2">
                      <span className="text-[8px] font-black px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full uppercase">{p.category}</span>
                      {p.videoUrl && <div className="flex items-center gap-1 text-pink-500 font-black text-[8px] uppercase"><FileVideo className="w-2.5 h-2.5" /> Reel</div>}
                   </div>
                </div>
                <ChevronRight className="text-gray-200 group-hover:text-pink-300 transition-colors" />
             </div>
           ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="bg-white w-full max-w-lg rounded-[3rem] p-8 space-y-6 animate-in slide-in-from-bottom-full duration-500 pb-12 overflow-y-auto max-h-[90vh] relative shadow-2xl">
              {uploadProgress !== 'IDLE' && (
                <div className="absolute inset-0 bg-white/95 z-[100] flex flex-col items-center justify-center space-y-4 rounded-[3rem]">
                   <Loader2 className="w-12 h-12 text-pink-600 animate-spin" />
                   <h2 className="text-xl font-black uppercase italic tracking-tighter">
                     {uploadProgress === 'UPLOADING' ? 'Uploading Media...' : 'Publishing to Bazar...'}
                   </h2>
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Syncing with Ghotki Cloud</p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter">New Product</h2>
                 <button onClick={() => setShowAddModal(false)} className="p-4 bg-gray-50 rounded-full active:scale-90 transition-all"><X className="w-6 h-6 text-gray-400" /></button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Title</label>
                    <input required type="text" placeholder="Product Name" className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-pink-500/10" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Price</label>
                       <input required type="number" placeholder="PKR" className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-pink-500/10" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Category</label>
                       <select className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-pink-500/10 appearance-none" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                          {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                       </select>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div onClick={() => photoInputRef.current?.click()} className="h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group hover:border-pink-300 transition-all">
                       {newProduct.imageFile ? (
                         <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center"><Check className="w-8 h-8 text-green-600" /></div>
                       ) : (
                         <>
                           <ImageIcon className="w-8 h-8 text-gray-300 group-hover:text-pink-400 transition-colors" />
                           <span className="text-[9px] font-black uppercase mt-2 text-gray-400">Add Photo</span>
                         </>
                       )}
                       <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setNewProduct({...newProduct, imageFile: e.target.files?.[0] || null})} />
                    </div>

                    <div onClick={() => videoInputRef.current?.click()} className="h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group hover:border-pink-300 transition-all">
                       {newProduct.videoFile ? (
                         <div className="absolute inset-0 bg-pink-500/10 flex items-center justify-center"><Check className="w-8 h-8 text-pink-600" /></div>
                       ) : (
                         <>
                           <Video className="w-8 h-8 text-gray-300 group-hover:text-pink-400 transition-colors" />
                           <span className="text-[9px] font-black uppercase mt-2 text-gray-400">Add Reel</span>
                         </>
                       )}
                       <input ref={videoInputRef} type="file" accept="video/mp4" className="hidden" onChange={(e) => setNewProduct({...newProduct, videoFile: e.target.files?.[0] || null})} />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Description</label>
                    <textarea placeholder="Write something about the product..." className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-none h-24 outline-none focus:ring-2 focus:ring-pink-500/10" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                 </div>

                 <button type="submit" className="w-full bg-pink-600 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-pink-200 uppercase tracking-widest text-[11px] active:scale-95 transition-all">
                   List Product Now
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
