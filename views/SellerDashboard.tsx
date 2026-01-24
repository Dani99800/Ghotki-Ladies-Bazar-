
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
  
  const pendingCountRef = useRef<number>(0);
  const initialLoadRef = useRef<boolean>(true);

  const myShop = shops.find(s => s.owner_id === user.id);
  const myProducts = products.filter(p => p.shopId === myShop?.id);
  const myOrders = orders.filter(o => o.sellerId === user.id); 
  const pendingOrders = myOrders.filter(o => o.status === 'PENDING');

  const hasVideoAccess = myShop?.subscription_tier === 'STANDARD' || myShop?.subscription_tier === 'PREMIUM';

  // Smart Notification Sound Logic
  useEffect(() => {
    const playNotification = async () => {
      try {
        const audio = new Audio(NOTIFICATION_SOUND);
        await audio.play();
      } catch (e) {
        console.log("Audio play blocked by browser. Interaction required.");
      }
    };

    // Case 1: Initial Login with existing pending orders
    if (initialLoadRef.current && pendingOrders.length > 0) {
      playNotification();
      pendingCountRef.current = pendingOrders.length;
      initialLoadRef.current = false;
    } 
    // Case 2: New order arrives during session
    else if (pendingOrders.length > pendingCountRef.current) {
      playNotification();
      pendingCountRef.current = pendingOrders.length;
    }
    
    // Update ref regardless of sound to keep track
    pendingCountRef.current = pendingOrders.length;
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
    if (isVideo && !hasVideoAccess) {
      alert("Upgrade required for Video Reels.");
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

  if (!myShop) return <div className="h-screen flex items-center justify-center font-black uppercase text-gray-300">Loading Dashboard...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-32">
      {pendingOrders.length > 0 && (
        <div className="bg-pink-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl animate-pulse">
           <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <p className="text-[11px] font-black uppercase tracking-widest">You have {pendingOrders.length} New Order(s)!</p>
           </div>
           <button onClick={() => setActiveTab('Orders')} className="bg-white text-pink-600 px-4 py-2 rounded-lg text-[9px] font-black uppercase">View Orders</button>
        </div>
      )}

      <div className="relative h-48 rounded-[2.5rem] overflow-hidden shadow-2xl group border-4 border-white">
        <img src={myShop.banner} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 flex items-center gap-4">
           <img src={myShop.logo} className="w-16 h-16 rounded-2xl border-2 border-white object-cover bg-white shadow-xl" />
           <div className="text-white">
              <h2 className="text-xl font-black italic uppercase tracking-tighter">{myShop.name}</h2>
              <p className="text-[8px] font-black uppercase bg-pink-500/50 px-2 py-0.5 rounded inline-block">{myShop.subscription_tier} MEMBER</p>
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
          <h3 className="font-black uppercase text-[10px] tracking-widest text-gray-400 ml-2">Shop Orders ({myOrders.length})</h3>
          {myOrders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-pink-500" />
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">#{order.id.slice(-6).toUpperCase()}</p>
                    <p className="font-bold text-gray-900">{order.buyerName}</p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${order.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                  {order.status}
                </div>
              </div>
              
              <div className="space-y-2 pt-2 border-t border-gray-50">
                 <p className="text-[10px] font-black text-gray-400 uppercase">Address: <span className="text-gray-900 normal-case font-bold">{order.buyerAddress}</span></p>
                 {order.items.map((item, idx) => (
                   <div key={idx} className="flex items-center justify-between text-[11px] font-bold text-gray-600">
                      <span>{item.name} x {item.quantity}</span>
                      <span className="text-pink-600 font-black">PKR {(item.price * item.quantity).toLocaleString()}</span>
                   </div>
                 ))}
                 <div className="flex justify-between items-center pt-3 border-t mt-2">
                    <span className="text-[10px] font-black uppercase text-gray-400">Total Revenue</span>
                    <span className="text-xl font-black italic text-gray-900">PKR {order.total.toLocaleString()}</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-50">
                 {order.status === 'PENDING' && (
                   <button onClick={() => updateOrderStatus(order.id, 'SHIPPED')} className="bg-pink-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> Ship Order
                   </button>
                 )}
                 <button onClick={() => window.open(`https://wa.me/${order.buyerMobile}`)} className="bg-green-50 text-green-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Message
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Inventory' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
             <h3 className="font-black uppercase text-[10px] tracking-widest text-gray-400">In Stock ({myProducts.length})</h3>
             <button onClick={() => setShowAddModal(true)} className="bg-pink-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> Add Item
             </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myProducts.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-[2rem] border border-gray-100 flex items-center gap-4 shadow-sm">
                <img src={p.images?.[0]} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <h4 className="font-black text-sm uppercase italic text-gray-900 truncate">{p.name}</h4>
                  <p className="text-pink-600 font-black text-xs">PKR {p.price.toLocaleString()}</p>
                </div>
                <button onClick={async () => { if(confirm("Delete?")) { await supabase.from('products').delete().eq('id', p.id); addProduct(); } }} className="p-3 text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end justify-center p-4">
           <div className="bg-white w-full max-w-xl rounded-t-[3rem] p-8 space-y-6 animate-in slide-in-from-bottom-full duration-500 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter">New Item</h2>
                 <button onClick={() => setShowAddModal(false)}><X className="text-gray-400" /></button>
              </div>
              <form onSubmit={handleCreateProduct} className="space-y-5">
                 <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    <label className="w-24 h-24 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer shrink-0">
                       <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleProductFileUpload(e.target.files[0], false)} />
                       <ImageIcon className="text-gray-400" />
                       <span className="text-[8px] font-black text-gray-400 uppercase">Image</span>
                    </label>
                    <label className={`w-24 h-24 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer shrink-0 transition-all ${hasVideoAccess ? 'border-pink-200 bg-pink-50' : 'border-gray-50 bg-gray-50 opacity-50'}`}>
                       <input type="file" className="hidden" accept="video/*" onChange={e => e.target.files?.[0] && handleProductFileUpload(e.target.files[0], true)} disabled={!hasVideoAccess} />
                       <Video className={hasVideoAccess ? "text-pink-500" : "text-gray-300"} />
                       <span className={`text-[8px] font-black uppercase ${hasVideoAccess ? "text-pink-500" : "text-gray-300"}`}>Reel</span>
                    </label>
                    {newProduct.images.map((img, i) => <img key={i} src={img} className="w-24 h-24 rounded-3xl object-cover border" />)}
                 </div>
                 <input required placeholder="Product Name" className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                 <div className="grid grid-cols-2 gap-4">
                    <input required type="number" placeholder="Price" className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                    <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                       {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                 </div>
                 <textarea required placeholder="Description" className="w-full p-4 bg-gray-50 rounded-2xl font-bold h-24" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                 <button disabled={loading} className="w-full bg-pink-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-[11px] shadow-xl">
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
