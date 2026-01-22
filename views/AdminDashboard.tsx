
import React from 'react';
import { 
  Users, 
  Store, 
  ShoppingBag, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Activity,
  AlertCircle
} from 'lucide-react';
import { Shop, Order } from '../types';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminDashboardProps {
  shops: Shop[];
  setShops: (shops: Shop[]) => void;
  orders: Order[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ shops, setShops, orders }) => {
  const pendingShops = shops.filter(s => s.status === 'PENDING');
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

  const stats = [
    { label: 'Total Shops', value: shops.length, icon: Store, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Orders', value: orders.length, icon: ShoppingBag, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'Total Revenue', value: `PKR ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Apps', value: pendingShops.length, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const chartData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  const approveShop = (id: string) => {
    setShops(shops.map(s => s.id === id ? { ...s, status: 'APPROVED' } : s));
  };

  const rejectShop = (id: string) => {
    setShops(shops.map(s => s.id === id ? { ...s, status: 'REJECTED' } : s));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Platform Command</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Global Bazar Administration</p>
        </div>
        <div className="text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
           Live Status
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 group hover:shadow-lg transition-shadow">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
               <stat.icon className="w-5 h-5" />
            </div>
            <div>
               <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{stat.label}</p>
               <p className="text-xl font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black text-xs uppercase tracking-widest text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-pink-500" />
              Growth Activity
            </h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#db2777" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#db2777" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#db2777" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
           <h2 className="font-black text-xs uppercase tracking-widest text-gray-900 mb-6 flex items-center gap-2">
             <AlertCircle className="w-4 h-4 text-orange-500" />
             Pending Approvals
           </h2>
           <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {pendingShops.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                     <Store className="w-8 h-8" />
                   </div>
                   <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest italic">All stores verified</p>
                </div>
              ) : pendingShops.map(shop => (
                <div key={shop.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 animate-in slide-in-from-right duration-300">
                   <div className="flex items-center gap-3">
                     <img src={shop.logo} className="w-12 h-12 rounded-xl object-cover bg-white p-1 border" />
                     <div className="flex-1 overflow-hidden">
                       <p className="font-black text-sm text-gray-900 truncate leading-tight">{shop.name}</p>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate">{shop.ownerName} • {shop.bazaar}</p>
                     </div>
                   </div>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => approveShop(shop.id)}
                        className="flex-1 bg-green-600 text-white text-[10px] font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-100 active:scale-95 transition-all uppercase"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button 
                        onClick={() => rejectShop(shop.id)}
                        className="bg-white text-red-600 text-[10px] font-black p-3 rounded-xl border border-red-100 active:scale-95 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
