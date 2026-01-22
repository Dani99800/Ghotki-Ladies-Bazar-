
import React, { useState, useRef } from 'react';
import { 
  PlusCircle, 
  ShoppingBag, 
  Package, 
  X, 
  Video, 
  Image as ImageIcon,
  Check,
  Upload,
  Bell,
  Clock,
  ChevronRight,
  User,
  MapPin,
  Phone,
  Sparkles,
  Loader2,
  Volume2,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Product, Order, User as UserType, Shop } from '../types';
import { CATEGORIES } from '../constants';

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
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: CATEGORIES[0].name,
    description: '',
    imageUrl: '',
    videoUrl: '',
    socialUrl: '',
    isNewArrival: true
  });

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const myShop = shops.find(s => s.mobile === user.mobile || s.id === user.id);
  const sellerKey = user.id;
  const myProducts = products.filter(p => p.shopId === sellerKey || (sellerKey === 's1' && p.shopId === 's1'));
  const myOrders = orders.filter(o => o.sellerId === sellerKey || (sellerKey === 's1' && o.sellerId === 's1'));
  const myNotifications = notifications.filter(n => n.sellerId === sellerKey);

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    // In a real app, this would be an API call
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({...selectedOrder, status: newStatus});
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setTimeout(() => {
      const product: Product = {
        id: 'p_' + Math.random().toString(36).substr(2, 9),
        shopId: user.id,
        name: newProduct.name,
        price: parseInt(newProduct.price) || 0,
        category: newProduct.category,
        description: newProduct.description,
        images: [newProduct.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800'],
        videoUrl: newProduct.socialUrl || newProduct.videoUrl,
        tags: newProduct.isNewArrival ? ['New'] : [],
        stock: 50,
        createdAt: new Date().toISOString()
      };
      addProduct(product);
      setIsPublishing(false);
      setShowAddModal(false);
      setNewProduct({ name: '', price: '', category: CATEGORIES[0].name, description: '', imageUrl: '', videoUrl: '', socialUrl: '', isNewArrival: true });
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32 animate-in fade-in">
      
      {/* Revenue Snapshot */}
      <div className="bg-gradient-to-br from-gray-900 to-pink-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl -mt-32 -mr-32" />
        <div className="relative z-10 flex justify-between items-start mb-10">
           <div className="space-y-1">
              <h1 className="text-2xl font-black italic uppercase tracking-tighter">{myShop?.name}</h1>
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
           {myProducts.map(p => (
             <div key={p.id} className="bg-white p-4 rounded-[2rem] border border-gray-100 flex items-center gap-4">
                <img src={p.images[0]} className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1">
                   <h3 className="font-black text-sm text-gray-900 truncate">{p.name}</h3>
                   <p className="text-pink-600 font-black text-xs italic">PKR {p.price.toLocaleString()}</p>
                </div>
                <button className="p-3 text-gray-300"><ChevronRight className="w-5 h-5" /></button>
             </div>
           ))}
        </div>
      )}

      {activeTab === 'Orders' && (
        <div className="space-y-4">
          {myOrders.map(order => (
            <div key={order.id} onClick={() => setSelectedOrder(order)} className={`bg-white p-5 rounded-[2rem] border transition-all cursor-pointer flex justify-between items-center ${order.status === 'PENDING' ? 'border-pink-200 bg-pink-50/20' : 'border-gray-100'}`}>
               <div className="flex gap-4 items-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${order.status === 'PENDING' ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-400'}`}>
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-sm">Order #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{order.paymentMethod} • {order.status}</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-sm font-black text-pink-600">PKR {order.total.toLocaleString()}</p>
                  <p className="text-[8px] font-black text-gray-300 uppercase">Fee: -50</p>
               </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white w-full max-w-lg rounded-[3rem] p-8 space-y-6 shadow-2xl relative animate-in slide-in-from-bottom-full pb-12 overflow-y-auto max-h-[85vh]">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter">Order Detail</h2>
                 <button onClick={() => setSelectedOrder(null)} className="p-3 bg-gray-50 rounded-full"><X className="w-5 h-5" /></button>
              </div>

              <div className="bg-pink-50 p-6 rounded-3xl border border-pink-100 space-y-4">
                 <div className="flex items-center gap-4">
                    <User className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="text-[9px] font-black text-pink-400 uppercase">Buyer Info</p>
                      <p className="font-black text-gray-900">{selectedOrder.buyerName || 'Guest Buyer'}</p>
                      <p className="text-xs font-bold text-gray-500">{selectedOrder.buyerMobile}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <MapPin className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="text-[9px] font-black text-pink-400 uppercase">Address</p>
                      <p className="text-xs font-bold text-gray-900">{selectedOrder.buyerAddress}</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-3">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payout Breakdown</p>
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold"><span>Items Subtotal</span><span>PKR {selectedOrder.subtotal}</span></div>
                    <div className="flex justify-between text-xs font-bold"><span>Delivery Collected</span><span>PKR {selectedOrder.deliveryFee}</span></div>
                    <div className="flex justify-between text-xs font-black text-red-500"><span>Platform Service Fee</span><span>- PKR 50</span></div>
                    <div className="flex justify-between text-lg font-black pt-2 border-t text-pink-600"><span>Final Payout</span><span>PKR {selectedOrder.total - 50}</span></div>
                 </div>
              </div>

              {selectedOrder.status === 'PENDING' && (
                <div className="space-y-3">
                  <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
                    <p className="text-[10px] font-bold text-yellow-800 uppercase">Verify payment receipt on EasyPaisa before confirming.</p>
                  </div>
                  <button 
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'PAYMENT_RECEIVED')}
                    className="w-full bg-pink-600 text-white font-black py-5 rounded-[2rem] shadow-xl uppercase tracking-widest text-[11px]"
                  >
                    Confirm Payment Received
                  </button>
                </div>
              )}

              {selectedOrder.status === 'PAYMENT_RECEIVED' && (
                 <button 
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'COMPLETED')}
                    className="w-full bg-green-600 text-white font-black py-5 rounded-[2rem] shadow-xl uppercase tracking-widest text-[11px]"
                  >
                    Mark as Completed
                  </button>
              )}

              <button className="w-full border-2 border-green-500 text-green-600 font-black py-5 rounded-[2rem] flex items-center justify-center gap-2 uppercase tracking-widest text-[11px]">
                 <Phone className="w-4 h-4" /> WhatsApp Buyer
              </button>
           </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="bg-white w-full max-w-lg rounded-[3rem] p-8 space-y-6 animate-in slide-in-from-bottom-full duration-500 pb-12">
              {isPublishing && <div className="absolute inset-0 bg-white/95 z-[10] flex flex-col items-center justify-center"><Loader2 className="w-10 h-10 text-pink-600 animate-spin" /><h2 className="text-xl font-black uppercase italic mt-4">Publishing...</h2></div>}
              <div className="flex items-center justify-between">
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter">New Listing</h2>
                 <button onClick={() => setShowAddModal(false)} className="p-4 bg-gray-50 rounded-full"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleAddProduct} className="space-y-6">
                 <input required type="text" placeholder="Product Name" className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-none" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                 <input required type="number" placeholder="Price (PKR)" className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-none" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                 <input type="url" placeholder="Reel Link (TikTok/IG/FB)" className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-none" value={newProduct.socialUrl} onChange={e => setNewProduct({...newProduct, socialUrl: e.target.value})} />
                 <div className="flex gap-4">
                    <div onClick={() => photoInputRef.current?.click()} className="flex-1 h-32 bg-gray-50 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer relative overflow-hidden">
                       {newProduct.imageUrl ? <img src={newProduct.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-gray-300" />}
                       <input ref={photoInputRef} type="file" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setNewProduct({...newProduct, imageUrl: reader.result as string});
                            reader.readAsDataURL(file);
                          }
                       }} />
                    </div>
                 </div>
                 <button type="submit" className="w-full bg-pink-600 text-white font-black py-5 rounded-[2rem] shadow-2xl uppercase tracking-widest text-[11px]">Publish Listing</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
