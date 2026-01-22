
import React from 'react';
import { 
  Users, 
  Store, 
  ShoppingBag, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Activity 
} from 'lucide-react';
import { Shop, Order } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

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
    { label: 'Platform Fee', value: 'PKR 2,500/shop', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
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
    <div className="max-w-6xl mx-auto p-4 space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <div className="text-sm text-gray-500 font-medium">System Status: <span className="text-green-600">Online</span></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
               <stat.icon className="w-5 h-5" />
            </div>
            <div>
               <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
               <p className="text-xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payout/Registration Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pink-500" />
              Order Volume (7 Days)
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#db2777" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shop Approvals */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <h2 className="font-bold mb-4 flex items-center gap-2">
             <Store className="w-5 h-5 text-blue-500" />
             Pending Approvals
           </h2>
           <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {pendingShops.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8 italic">No pending shops</p>
              ) : pendingShops.map(shop => (
                <div key={shop.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                   <div className="flex items-center gap-3 mb-2">
                     <img src={shop.logo} className="w-10 h-10 rounded-lg object-cover" />
                     <div className="flex-1 overflow-hidden">
                       <p className="font-bold text-sm truncate">{shop.name}</p>
                       <p className="text-[10px] text-gray-500">{shop.bazaar}</p>
                     </div>
                   </div>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => approveShop(shop.id)}
                        className="flex-1 bg-green-600 text-white text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" /> Approve
                      </button>
                      <button 
                        onClick={() => rejectShop(shop.id)}
                        className="flex-1 bg-red-600 text-white text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3 h-3" /> Reject
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
