
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Truck, CheckCircle2, MessageCircle, Clock, 
  ChevronRight, ArrowLeft, ShoppingBag, MapPin 
} from 'lucide-react';
import { Order, User, Shop } from '../types';

interface OrdersViewProps {
  orders: Order[];
  user: User;
  shops: Shop[];
}

const OrdersView: React.FC<OrdersViewProps> = ({ orders, user, shops }) => {
  const navigate = useNavigate();
  const myOrders = orders.filter(o => o.buyerId === user.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-orange-500 bg-orange-50';
      case 'SHIPPED': return 'text-blue-500 bg-blue-50';
      case 'COMPLETED': return 'text-green-500 bg-green-50';
      case 'CANCELLED': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">My Orders</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ghotki Bazar Shopping History</p>
        </div>
      </div>

      {myOrders.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto text-pink-300">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <p className="text-gray-400 font-bold text-sm">No orders yet. Time to go to the bazaar!</p>
          <button onClick={() => navigate('/')} className="bg-pink-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest">Browse Items</button>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map(order => {
            const shop = shops.find(s => s.id === order.sellerId);
            return (
              <div key={order.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center shadow-sm">
                      <Package className="w-5 h-5 text-pink-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Order #{order.id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs font-bold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={shop?.logo} className="w-10 h-10 rounded-lg object-cover border" />
                      <div>
                        <p className="font-black text-sm text-gray-900">{shop?.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{order.items.length} Item{order.items.length > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.open(`https://wa.me/${shop?.whatsapp}?text=Hi, I am checking status of Order ${order.id}`)}
                      className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex gap-1 overflow-x-auto py-2 no-scrollbar">
                    {order.items.map((item, i) => (
                      <img key={i} src={item.images[0]} className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-sm" />
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase">Grand Total</p>
                      <p className="text-lg font-black text-pink-600">PKR {order.total.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 font-black text-[9px] uppercase tracking-widest">
                      Track <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersView;
