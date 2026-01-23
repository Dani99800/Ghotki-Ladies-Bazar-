
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  Phone, 
  MapPin, 
  Shield, 
  LogOut, 
  ChevronRight, 
  ShoppingBag, 
  Settings,
  Bell,
  LayoutDashboard
} from 'lucide-react';
import { User } from '../types';

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
  lang: 'EN' | 'UR';
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout, lang }) => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: ShoppingBag, label: 'My Orders', path: '/orders', show: true },
    { icon: LayoutDashboard, label: 'Admin Panel', path: '/admin', show: user.role === 'ADMIN' },
    { icon: Bell, label: 'Notifications', path: '#', show: true },
    { icon: Settings, label: 'Account Settings', path: '#', show: true },
  ].filter(i => i.show);

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="text-center py-6 space-y-4">
        <div className="w-24 h-24 bg-pink-100 rounded-full border-4 border-white shadow-xl flex items-center justify-center mx-auto text-pink-600">
           <UserIcon className="w-12 h-12" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">{user.name}</h1>
          <span className="px-3 py-1 bg-pink-50 text-pink-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-pink-100">
            {user.role} Account
          </span>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Personal Details</h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-pink-500">
              <Phone className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-gray-400 uppercase">Mobile Number</p>
              <p className="font-bold text-gray-900">{user.mobile}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-pink-500">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-gray-400 uppercase">City & Address</p>
              <p className="font-bold text-gray-900">{user.city || 'Ghotki'}, {user.address || 'Address not set'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Menu</h2>
        {menuItems.map((item, idx) => (
          <button 
            key={idx}
            onClick={() => item.path !== '#' && navigate(item.path)}
            className="w-full bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-4">
              <item.icon className="w-5 h-5 text-gray-400 group-hover:text-pink-500 transition-colors" />
              <span className="font-bold text-gray-700">{item.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </button>
        ))}
      </div>

      <button 
        onClick={onLogout}
        className="w-full mt-4 flex items-center justify-center gap-3 p-5 bg-red-50 text-red-600 font-black rounded-2xl border border-red-100 hover:bg-red-100 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
      >
        <LogOut className="w-5 h-5" />
        Logout from GLB Bazar
      </button>

      <p className="text-center text-[9px] text-gray-300 uppercase font-black tracking-widest pt-4">
        Digitizing Ghotki Legacy • v2.2.0
      </p>
    </div>
  );
};

export default ProfileView;
