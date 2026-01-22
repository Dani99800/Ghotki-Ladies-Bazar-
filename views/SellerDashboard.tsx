
import React, { useState } from 'react';
import { PlusCircle, ShoppingBag, Package, TrendingUp, MoreVertical, Edit, Trash } from 'lucide-react';
import { Product, Order } from '../types';

interface SellerDashboardProps {
  products: Product[];
  setProducts: (p: Product[]) => void;
  orders: Order[];
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ products, setProducts, orders }) => {
  const [activeTab, setActiveTab] = useState<'Inventory' | 'Orders'>('Inventory');
  
  // Filter for current seller (mock assumes 's1')
  const myProducts = products.filter(p => p.shopId === 's1');

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32">
      <div className="bg-gradient-to-br from-pink-600 to-pink-700 rounded-3xl p-8 text-white">
        <h1 className="text-2xl font-bold mb-2">Seller Hub</h1>
        <p className="text-pink-100 text-sm">Manage your store and grow your sales in Ghotki.</p>
        
        <div className="grid grid-cols-3 gap-4 mt-8">
           <div className="text-center">
             <p className="text-2xl font-black">{myProducts.length}</p>
             <p className="text-[10px] uppercase font-bold text-pink-200">Products</p>
           </div>
           <div className="text-center">
             <p className="text-2xl font-black">{orders.length}</p>
             <p className="text-[10px] uppercase font-bold text-pink-200">Orders</p>
           </div>
           <div className="text-center">
             <p className="text-2xl font-black">4.8</p>
             <p className="text-[10px] uppercase font-bold text-pink-200">Rating</p>
           </div>
        </div>
      </div>

      <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl">
        <button 
          onClick={() => setActiveTab('Inventory')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'Inventory' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-400'}`}
        >
          <Package className="w-4 h-4" /> Inventory
        </button>
        <button 
          onClick={() => setActiveTab('Orders')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'Orders' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-400'}`}
        >
          <ShoppingBag className="w-4 h-4" /> Sales
        </button>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">My {activeTab}</h2>
        {activeTab === 'Inventory' && (
          <button className="bg-pink-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Add Product
          </button>
        )}
      </div>

      {activeTab === 'Inventory' ? (
        <div className="space-y-4">
          {myProducts.map(p => (
            <div key={p.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <img src={p.images[0]} className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex-1">
                <h3 className="font-bold text-sm">{p.name}</h3>
                <p className="text-pink-600 font-bold text-xs">PKR {p.price}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-pink-600"><Edit className="w-4 h-4" /></button>
                <button className="p-2 text-gray-400 hover:text-red-500"><Trash className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 text-center py-12">
          <TrendingUp className="w-12 h-12 text-gray-200 mx-auto" />
          <p className="text-gray-400 text-sm">No sales data yet for this period.</p>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
