
import React, { useState, useRef } from 'react';
import { 
  PlusCircle, ShoppingBag, Package, X, Video, Image as ImageIcon,
  Check, Upload, Bell, Clock, ChevronRight, User, MapPin, 
  Phone, Sparkles, Loader2, Volume2, DollarSign, AlertCircle, FileVideo
} from 'lucide-react';
import { Product, Order, User as UserType, Shop } from '../types';
import { CATEGORIES } from '../constants';
import { supabase, uploadFile } from '../services/supabase';

interface SellerDashboardProps {
  products: Product[];
  user: UserType;
  addProduct: (p: Product) => void;
  orders: Order[];
  notifications: any[];
  markRead: (id: string) => void;
  shops: Shop[];
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ products, user, addProduct, orders, notifications, markRead, shops }) => {
  const [activeTab, setActiveTab] = useState<'Inventory' | 'Orders' | 'Alerts'>('Inventory');
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<'IDLE' | 'UPLOADING' | 'PUBLISHING'>('IDLE');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
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

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const myShop = shops.find(s => s.owner_id === user.id || s.id === user.id);
  const myProducts = products.filter(p => p.shopId === myShop?.id);
  const myOrders = orders.filter(o => o.sellerId === myShop?.id);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myShop) return alert("Shop not found!");
    
    setUploadProgress('UPLOADING');
    try {
      let imageUrl = '';
      let videoUrl = '';

      if (newProduct.imageFile) {
        imageUrl = await uploadFile('assets', `products/${Date.now()}_img.jpg`, newProduct.imageFile);
      }
      if (newProduct.videoFile) {
        videoUrl = await uploadFile('assets', `products/${Date.now()}_video.mp4`, newProduct.videoFile);
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

      addProduct(data as any);
      setShowAddModal(false);
      setNewProduct({ name: '', price: '', category: CATEGORIES[0].name, description: '', imageFile: null, videoFile: null });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadProgress('IDLE');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32 animate-in fade-in">
      <div className="bg-gradient-to-br from-gray-900 to-pink-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl -mt-32 -mr-32" />
        <div className="relative z-10 flex justify-between items-start mb-10">
           <div className="space-y-1">
              <h1 className="text-2xl font-black italic uppercase tracking-tighter">{myShop?.name || 'My Store'}</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-pink-300">Net Sales Breakdown</p>
           </div>
           <button onClick={() => setShowAddModal(true)} className="w-12 h-12 bg-white text-pink-600 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"><PlusCircle className="w-7 h-7" /></button>
        </div>
        <div className="grid grid-cols-2 gap-6 relative z-10">
           <div className="space-y-1">
              <p className="text-3xl font-black tracking-tighter italic">PKR {myOrders.reduce((a, b) => a + b.total, 0).toLocaleString()}</p>
              <p className="text-[9px] font-black uppercase text-pink-300/60">Total Gross Volume</p>
           </div>
           <div className="space-y-1">
              <p className="text-3xl font-black tracking-tighter italic">PKR {(myOrders.length * 50).toLocaleString()}</p>
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
             <div className="col-span-full py-20 text-center opacity-40">No products listed yet. Click + to add your first!</div>
           ) : myProducts.map(p => (
             <div key={p.id} className="bg-white p-4 rounded-[2rem] border border-gray-100 flex items-center gap-4">
                <img src={p.images?.[0] || (p as any).image_urls?.[0]} className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1">
                   <h3 className="font-black text-sm text-gray-900 truncate">{p.name}</h3>
                   <p className="text-pink-600 font-black text-xs italic">PKR {p.price.toLocaleString()}</p>
                </div>
                {p.videoUrl && <FileVideo className="w-4 h-4 text-pink-400" />}
             </div>
           ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="bg-white w-full max-w-lg rounded-[3rem] p-8 space-y-6 animate-in slide-in-from-bottom-full duration-500 pb-12 overflow-y-auto max-h-[90vh]">
              {uploadProgress !== 'IDLE' && (
                <div className="absolute inset-0 bg-white/95 z-[100] flex flex-col items-center justify-center space-y-4">
                   <Loader2 className="w-12 h-12 text-pink-600 animate-spin" />
                   <h2 className="text-xl font-black uppercase italic tracking-tighter">
                     {uploadProgress === 'UPLOADING' ? 'Uploading Files...' : 'Publishing Listing...'}
                   </h2>
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Ghotki Bazar Cloud Sync</p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter">New Listing</h2>
                 <button onClick={() => setShowAddModal(false)} className="p-4 bg-gray-50 rounded-full"><X className="w-6 h-6 text-gray-400" /></button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-6">
                 <input required type="text" placeholder="Product Name" className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-none" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                 <input required type="number" placeholder="Price (PKR)" className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-none" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div onClick={() => photoInputRef.current?.click()} className="h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group">
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

                    <div onClick={() => videoInputRef.current?.click()} className="h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group">
                       {newProduct.videoFile ? (
                         <div className="absolute inset-0 bg-pink-500/10 flex items-center justify-center"><Check className="w-8 h-8 text-pink-600" /></div>
                       ) : (
                         <>
                           <Video className="w-8 h-8 text-gray-300 group-hover:text-pink-400 transition-colors" />
                           <span className="text-[9px] font-black uppercase mt-2 text-gray-400">Add Video Reel</span>
                         </>
                       )}
                       <input ref={videoInputRef} type="file" accept="video/mp4" className="hidden" onChange={(e) => setNewProduct({...newProduct, videoFile: e.target.files?.[0] || null})} />
                    </div>
                 </div>

                 <textarea placeholder="Product Description..." className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-none h-24" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />

                 <button type="submit" className="w-full bg-pink-600 text-white font-black py-5 rounded-[2.5rem] shadow-2xl shadow-pink-200 uppercase tracking-widest text-[11px] active:scale-95 transition-all">
                   Publish to Bazar
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
