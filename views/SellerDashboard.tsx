
import React, { useState } from 'react';
import { 
  PlusCircle, 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  Edit, 
  Trash, 
  X, 
  Video, 
  Image as ImageIcon,
  Tag,
  Check
} from 'lucide-react';
import { Product, Order, User } from '../types';
import { CATEGORIES } from '../constants';

interface SellerDashboardProps {
  products: Product[];
  user: User;
  addProduct: (p: Product) => void;
  orders: Order[];
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ products, user, addProduct, orders }) => {
  const [activeTab, setActiveTab] = useState<'Inventory' | 'Orders'>('Inventory');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: CATEGORIES[0].name,
    description: '',
    imageUrl: '',
    videoUrl: '',
    isNewArrival: true
  });

  // Filter for current seller (mock assumes 's1' if not logged in properly or uses user.id)
  const myProducts = products.filter(p => p.shopId === 's1' || p.shopId === user.id);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: 'p_' + Math.random().toString(36).substr(2, 9),
      shopId: user.id === '0000' ? 's1' : user.id, // Fallback for admin/testing
      name: newProduct.name,
      price: parseInt(newProduct.price),
      category: newProduct.category,
      description: newProduct.description,
      images: [newProduct.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800'],
      videoUrl: newProduct.videoUrl,
      tags: newProduct.isNewArrival ? ['New'] : [],
      stock: 50
    };
    addProduct(product);
    setShowAddModal(false);
    setNewProduct({ name: '', price: '', category: CATEGORIES[0].name, description: '', imageUrl: '', videoUrl: '', isNewArrival: true });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-pink-600 to-pink-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-pink-200">
        <div className="flex items-center justify-between mb-6">
           <div>
             <h1 className="text-2xl font-black uppercase tracking-tight">Seller Hub</h1>
             <p className="text-pink-100 text-[10px] font-bold uppercase tracking-widest">Managing Boutique: {user.name}</p>
           </div>
           <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
             <Package className="w-6 h-6" />
           </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
           <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
             <p className="text-2xl font-black">{myProducts.length}</p>
             <p className="text-[9px] uppercase font-black text-pink-200 tracking-tighter">Products</p>
           </div>
           <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
             <p className="text-2xl font-black">{orders.length}</p>
             <p className="text-[9px] uppercase font-black text-pink-200 tracking-tighter">Sales</p>
           </div>
           <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
             <p className="text-2xl font-black">4.9</p>
             <p className="text-[9px] uppercase font-black text-pink-200 tracking-tighter">Rating</p>
           </div>
        </div>
      </div>

      <div className="flex gap-4 p-1.5 bg-gray-100 rounded-[1.5rem] shadow-inner">
        <button 
          onClick={() => setActiveTab('Inventory')}
          className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'Inventory' ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-400'}`}
        >
          <Package className="w-4 h-4" /> Inventory
        </button>
        <button 
          onClick={() => setActiveTab('Orders')}
          className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'Orders' ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-400'}`}
        >
          <ShoppingBag className="w-4 h-4" /> Live Orders
        </button>
      </div>

      <div className="flex justify-between items-center px-1">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{activeTab} List</h2>
        {activeTab === 'Inventory' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-pink-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-pink-100 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Add Product
          </button>
        )}
      </div>

      {activeTab === 'Inventory' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myProducts.map(p => (
            <div key={p.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow group">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                {p.videoUrl && (
                  <div className="absolute top-1 right-1 bg-pink-600 p-1 rounded-md">
                    <Video className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-black text-sm text-gray-900 truncate">{p.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-pink-600 font-black text-xs">PKR {p.price.toLocaleString()}</span>
                   <span className="text-[9px] font-bold text-gray-400 border px-1.5 py-0.5 rounded-lg">{p.category}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                   <span className={`w-2 h-2 rounded-full ${p.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Stock: {p.stock}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button className="p-2.5 bg-gray-50 text-gray-400 hover:text-pink-600 rounded-xl transition-colors"><Edit className="w-4 h-4" /></button>
                <button className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-500 rounded-xl transition-colors"><Trash className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {myProducts.length === 0 && (
            <div className="col-span-full py-16 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center space-y-4">
               <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center text-pink-300">
                  <Package className="w-10 h-10" />
               </div>
               <div>
                  <h3 className="font-black text-gray-900 uppercase">Empty Warehouse</h3>
                  <p className="text-gray-400 text-xs font-medium">Start by adding your first product with a reel!</p>
               </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 text-center py-20 bg-white rounded-[3rem] border border-gray-100">
          <TrendingUp className="w-16 h-16 text-gray-200 mx-auto" />
          <div>
            <h3 className="font-black text-gray-900 uppercase">No Orders Yet</h3>
            <p className="text-gray-400 text-xs font-medium">Promote your shop to get your first customer.</p>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-lg rounded-t-[3rem] p-8 space-y-8 animate-in slide-in-from-bottom-full duration-500 pb-20 overflow-y-auto max-h-[90vh] custom-scrollbar">
              <div className="flex items-center justify-between">
                 <h2 className="text-xl font-black uppercase italic tracking-tighter">New Product</h2>
                 <button onClick={() => setShowAddModal(false)} className="p-3 bg-gray-50 rounded-full text-gray-400"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-6">
                 <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Title</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Traditional Balochi Suit"
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none text-sm font-bold"
                        value={newProduct.name}
                        onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (PKR)</label>
                        <input 
                          required
                          type="number" 
                          placeholder="e.g. 4500"
                          className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none text-sm font-bold"
                          value={newProduct.price}
                          onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                        <select 
                          className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none text-sm font-bold appearance-none"
                          value={newProduct.category}
                          onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                        >
                          {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Reel / Video URL (Optional)</label>
                      <div className="relative">
                        <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
                        <input 
                          type="url" 
                          placeholder="Link to Pexels, Pixabay or YouTube Shorts"
                          className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none text-sm font-bold"
                          value={newProduct.videoUrl}
                          onChange={e => setNewProduct({...newProduct, videoUrl: e.target.value})}
                        />
                      </div>
                      <p className="text-[9px] text-gray-400 font-medium ml-1">Videos drive 4x more engagement in the Explore feed.</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Thumbnail Image URL</label>
                      <div className="relative">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
                        <input 
                          type="url" 
                          placeholder="Unsplash or Image Link"
                          className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none text-sm font-bold"
                          value={newProduct.imageUrl}
                          onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                       <div className="flex items-center gap-3">
                         <Tag className="w-5 h-5 text-pink-600" />
                         <span className="text-xs font-black uppercase tracking-tight">Mark as New Arrival</span>
                       </div>
                       <button 
                         type="button"
                         onClick={() => setNewProduct({...newProduct, isNewArrival: !newProduct.isNewArrival})}
                         className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${newProduct.isNewArrival ? 'bg-pink-600 justify-end' : 'bg-gray-200 justify-start'}`}
                       >
                         <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                       </button>
                    </div>
                 </div>

                 <button 
                   type="submit"
                   className="w-full bg-pink-600 text-white font-black py-5 rounded-3xl shadow-xl shadow-pink-100 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
                 >
                   <Check className="w-4 h-4" /> Finalize Listing
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
