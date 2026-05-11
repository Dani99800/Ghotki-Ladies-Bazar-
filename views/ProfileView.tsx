
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
  Bookmark,
  RefreshCw,
  Trophy,
  Gift,
  Truck,
  Star,
  CheckCircle2,
  X
} from 'lucide-react';
import { User, LoyaltyPlan } from '../types';

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
  onDeleteAccount: () => Promise<void>;
  lang: 'EN' | 'UR';
  loyaltyPlans: LoyaltyPlan[];
  purchaseLoyaltyCard: (plan: LoyaltyPlan) => Promise<void>;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout, onDeleteAccount, lang, loyaltyPlans = [], purchaseLoyaltyCard }) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showLoyaltyModal, setShowLoyaltyModal] = React.useState(false);

  const activePlan = loyaltyPlans.find(p => p.id === user.loyalty_plan_id);
  const isLoyaltyExpired = user.loyalty_expiry ? new Date(user.loyalty_expiry) < new Date() : false;
  const effectivePlan = isLoyaltyExpired ? null : activePlan;

  const isAdmin = user.email?.toLowerCase() === 'd46050573@gmail.com' || user.role === 'ADMIN';

  const menuItems = [
    { icon: ShoppingBag, label: 'My Orders', path: '/orders', show: true },
    { icon: Bookmark, label: 'Saved Videos', path: '/saved', show: user.role === 'BUYER' },
    { icon: LayoutDashboard, label: 'Admin Panel', path: '/admin', show: isAdmin },
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
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-pink-100 rounded-full border-4 border-white shadow-xl flex items-center justify-center mx-auto text-pink-600">
             <UserIcon className="w-12 h-12" />
          </div>
          {effectivePlan && (
            <div 
              style={{ backgroundColor: effectivePlan.color || '#facc15' }}
              className="absolute -bottom-1 -right-1 w-8 h-8 text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce"
            >
              <Trophy className="w-4 h-4" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">{user.name}</h1>
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 bg-pink-50 text-pink-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-pink-100">
              {isAdmin ? 'ADMIN' : user.role} ACCOUNT
            </span>
            {effectivePlan && (
               <span 
                 style={{ backgroundColor: `${effectivePlan.color}20`, color: effectivePlan.color, borderColor: `${effectivePlan.color}40` }}
                 className="px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest border"
               >
                  {effectivePlan.name}
               </span>
            )}
          </div>
        </div>
      </div>

      {/* POINTS AND LOYALTY CARD */}
      <div className="grid grid-cols-2 gap-4">
         <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-[2.5rem] shadow-xl space-y-2 border-b-4 border-pink-600">
            <div className="flex items-center gap-2 text-pink-500">
               <Star className="w-4 h-4" />
               <span className="text-[8px] font-black uppercase tracking-widest">Bazar Points</span>
            </div>
            <p className="text-2xl font-black text-white italic">{(user.points || 0).toLocaleString()}</p>
            <p className="text-[8px] font-medium text-pink-200/50 uppercase tracking-widest">≈ PKR {((user.points || 0) * 0.25).toLocaleString()} Value</p>
         </div>

         <div 
           onClick={() => setShowLoyaltyModal(true)}
           style={effectivePlan ? { backgroundImage: `linear-gradient(to bottom right, ${effectivePlan.color}, ${effectivePlan.color}dd)`, color: 'white' } : {}}
           className={`p-6 rounded-[2.5rem] shadow-xl space-y-2 cursor-pointer active:scale-95 transition-all ${effectivePlan ? '' : 'bg-white border border-gray-100'}`}
         >
            <div className={`flex items-center gap-2 ${effectivePlan ? 'text-white' : 'text-pink-600'}`}>
               <Trophy className="w-4 h-4" />
               <span className="text-[8px] font-black uppercase tracking-widest">Loyalty Card</span>
            </div>
            {effectivePlan ? (
              <>
                <p className="text-xs font-black uppercase italic truncate">{effectivePlan.name}</p>
                <p className="text-[7px] font-black opacity-80 uppercase">Expiry: {new Date(user.loyalty_expiry!).toLocaleDateString()}</p>
              </>
            ) : (
              <>
                <p className="text-xs font-black uppercase italic text-gray-400">Get 15% OFF</p>
                <div className="flex items-center gap-1 text-pink-600">
                  <span className="text-[8px] font-black uppercase tracking-widest">Purchase Now</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </>
            )}
         </div>
      </div>

      {/* LOYALTY MODAL */}
      {showLoyaltyModal && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in transition-all">
           <div 
             style={{ borderTopColor: effectivePlan?.color || '#facc15' }}
             className="bg-white w-full max-w-sm rounded-t-[4rem] p-10 space-y-8 animate-in slide-in-from-bottom-full duration-500 max-h-[90vh] overflow-y-auto no-scrollbar border-t-8"
           >
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                   <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">Club Gold</h2>
                   <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest">Elite Bazar Membership</p>
                 </div>
                 <button onClick={() => setShowLoyaltyModal(false)} className="p-4 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X className="w-6 h-6 text-gray-400 focus:outline-none" /></button>
              </div>

              <div className="space-y-6">
                {loyaltyPlans.map((plan) => (
                  <div 
                    key={plan.id} 
                    style={user.loyalty_plan_id === plan.id ? { borderColor: plan.color || '#facc15', backgroundColor: `${plan.color}05` } : {}}
                    className={`p-8 rounded-[3rem] border-2 transition-all space-y-6 relative overflow-hidden ${user.loyalty_plan_id === plan.id ? '' : 'border-gray-50 bg-gray-50'}`}
                  >
                    {user.loyalty_plan_id === plan.id && (
                      <div style={{ color: plan.color || '#facc15' }} className="absolute top-4 right-4"><CheckCircle2 className="w-6 h-6" /></div>
                    )}
                    
                    <div className="space-y-1">
                       <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-900">{plan.name}</h3>
                       <p className="text-2xl font-black text-pink-600 italic">PKR {plan.price?.toLocaleString()}</p>
                       <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">{plan.duration_days} DAYS MEMBERSHIP</p>
                    </div>

                    <div className="space-y-3">
                       <div className="flex items-center gap-3 text-gray-700">
                          <Star style={{ color: plan.color || '#facc15' }} className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{plan.discount_percentage}% OFF All Items</span>
                       </div>
                       {plan.free_delivery && (
                         <div className="flex items-center gap-3 text-gray-700">
                            <Truck className="w-4 h-4 text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Free Express Delivery</span>
                         </div>
                       )}
                       {plan.gift_info && (
                         <div className="flex items-center gap-3 text-gray-700">
                            <Gift className="w-4 h-4 text-pink-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{plan.gift_info}</span>
                         </div>
                       )}
                       {plan.custom_benefits?.map((benefit: string, bidx: number) => (
                         <div key={bidx} className="flex items-center gap-3 text-gray-700">
                            <Star className="w-4 h-4 text-purple-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{benefit}</span>
                         </div>
                       ))}
                    </div>

                    <button 
                      onClick={() => purchaseLoyaltyCard(plan)}
                      disabled={user.loyalty_plan_id === plan.id}
                      className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all ${user.loyalty_plan_id === plan.id ? 'bg-gray-200 text-gray-400' : 'bg-gray-900 text-white shadow-gray-200'}`}
                    >
                      {user.loyalty_plan_id === plan.id ? 'Already Active' : 'Activate Membership'}
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="bg-pink-50 p-6 rounded-[2rem] border border-pink-100">
                 <p className="text-[9px] font-bold text-pink-700 italic leading-relaxed">
                   Membership benefits are applied automatically at checkout. Some gifts may be delivered with your next purchase.
                 </p>
              </div>
           </div>
        </div>
      )}

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
          onClick={() => {
            localStorage.clear();
            sessionStorage.clear();
            onLogout();
            window.location.reload();
          }}
          className="w-full flex items-center justify-center gap-3 p-4 bg-blue-50 text-blue-600 font-black rounded-2xl border-2 border-blue-100 hover:bg-blue-100 transition-all active:scale-[0.98] uppercase tracking-widest text-[10px]"
        >
          <RefreshCw className="w-5 h-5 animate-spin" />
          Fix Stale Data (System Reset)
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
