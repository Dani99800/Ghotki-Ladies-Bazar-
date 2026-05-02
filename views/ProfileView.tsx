
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
  LayoutDashboard,
  Bookmark
} from 'lucide-react';
import { User } from '../types';

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
  onDeleteAccount: () => Promise<void>;
  lang: 'EN' | 'UR';
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout, onDeleteAccount, lang }) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const menuItems = [
    { icon: ShoppingBag, label: 'My Orders', path: '/orders', show: true },
    { icon: Bookmark, label: 'Saved Videos', path: '/saved', show: user.role === 'BUYER' },
    { icon: LayoutDashboard, label: 'Admin Panel', path: '/admin', show: user.role === 'ADMIN' },
    { icon: Bell, label: 'Notifications', path: '#', show: true },
    { icon: Settings, label: 'Account Settings', path: '#', show: true },
  ].filter(i => i.show);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteAccount();
    } catch (error) {
      console.error("Deletion failed:", error);
      alert("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="flex justify-center flex-col items-center gap-4">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-gray-900 text-center uppercase tracking-tighter">Delete Account?</h3>
                <p className="text-gray-500 text-center text-xs font-medium leading-relaxed italic">
                  This action is permanent. All your orders, shop data, and profile details will be erased forever from GLB Bazar.
                </p>
             </div>
             
             <div className="space-y-2">
                <button 
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="w-full py-4 bg-red-600 text-white font-black rounded-xl uppercase tracking-widest text-[10px] shadow-xl shadow-red-200 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isDeleting ? 'Erasing Data...' : 'Yes, Delete Permanently'}
                </button>
                <button 
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-4 bg-gray-50 text-gray-400 font-bold rounded-xl uppercase tracking-widest text-[10px] active:scale-95 transition-all"
                >
                  Cancel
                </button>
             </div>
           </div>
        </div>
      )}
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

      <div className="flex flex-col gap-2">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 p-5 bg-white text-gray-500 font-black rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all active:scale-[0.98] uppercase tracking-widest text-[10px]"
        >
          <LogOut className="w-5 h-5" />
          Logout from Bazar
        </button>

        <button 
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center justify-center gap-3 p-4 bg-red-50/30 text-red-400 font-black rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all active:scale-[0.98] uppercase tracking-widest text-[9px]"
        >
          <Shield className="w-4 h-4" />
          Delete Account Permanently
        </button>
      </div>

      <p className="text-center text-[9px] text-gray-300 uppercase font-black tracking-widest pt-4">
        Digitizing Ghotki Legacy • v2.2.0
      </p>
    </div>
  );
};

export default ProfileView;
