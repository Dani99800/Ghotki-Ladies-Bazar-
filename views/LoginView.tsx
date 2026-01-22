
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Store, 
  ShieldCheck, 
  Lock, 
  Phone, 
  UserPlus, 
  ArrowLeft, 
  CheckCircle, 
  CreditCard, 
  MapPin, 
  ClipboardCheck,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { UserRole, User as UserType, Shop } from '../types';
import { BAZAARS, CATEGORIES, REGISTRATION_FEE_PKR } from '../constants';

interface LoginViewProps {
  setUser: (u: UserType) => void;
  registerShop: (s: Partial<Shop>) => Shop; 
  lang: 'EN' | 'UR';
}

const LoginView: React.FC<LoginViewProps> = ({ setUser, registerShop, lang }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'LOGIN' | 'REGISTER_SHOP' | 'PENDING_APPROVAL'>('LOGIN');
  const [role, setRole] = useState<UserRole>('BUYER');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ 
    mobile: '', 
    password: '',
    name: '',
    shopName: '',
    whatsapp: '',
    bazaar: BAZAARS[0],
    category: CATEGORIES[0].name,
    address: '',
    paymentMethod: 'EasyPaisa' as 'EasyPaisa' | 'JazzCash' | 'Bank Transfer'
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalRole = role;
    let userId = Math.random().toString(36).substr(2, 9);

    if (formData.mobile === '0000') {
      finalRole = 'ADMIN';
      userId = 'admin_000';
    } else if (formData.mobile === '03001234567') {
      finalRole = 'SELLER';
      userId = 's1'; // Zubeda
    } else if (formData.mobile === '03112223334') {
      finalRole = 'SELLER';
      userId = 's_j'; // J. Boutique
    }

    const newUser: UserType = {
      id: userId,
      name: formData.name || (finalRole === 'SELLER' ? formData.shopName : (finalRole === 'ADMIN' ? 'System Admin' : 'User')),
      mobile: formData.mobile,
      role: finalRole
    };
    
    setUser(newUser);
    localStorage.setItem('glb_user', JSON.stringify(newUser));
    
    if (finalRole === 'ADMIN') navigate('/admin');
    else if (finalRole === 'SELLER') navigate('/seller');
    else navigate('/');
  };

  const handleRegisterShop = (e: React.FormEvent) => {
    e.preventDefault();
    const newShop = registerShop({
      name: formData.shopName,
      ownerName: formData.name,
      mobile: formData.mobile,
      whatsapp: formData.whatsapp,
      bazaar: formData.bazaar,
      category: formData.category,
      address: formData.address,
    });
    setView('PENDING_APPROVAL');
  };

  const jumpToDashboard = () => {
    const newUser: UserType = {
      id: 's_' + Math.random().toString(36).substr(2, 9),
      name: formData.shopName,
      mobile: formData.mobile,
      role: 'SELLER'
    };
    setUser(newUser);
    localStorage.setItem('glb_user', JSON.stringify(newUser));
    navigate('/seller');
  };

  if (view === 'PENDING_APPROVAL') {
    return (
      <div className="max-w-md mx-auto min-h-[90vh] flex flex-col p-6 space-y-8 animate-in slide-in-from-bottom-8 duration-500 pb-20 items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 border-4 border-white shadow-xl">
             <ClipboardCheck className="w-12 h-12" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Success!</h1>
            <p className="text-gray-400 text-xs font-black tracking-widest uppercase">Your shop registration is complete</p>
          </div>
        </div>

        <div className="bg-pink-600 rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl shadow-pink-200 w-full">
           <div className="flex items-center gap-3">
             <Sparkles className="w-6 h-6 text-yellow-300" />
             <h3 className="font-black text-sm uppercase tracking-widest">Instant Launch Active</h3>
           </div>
           <p className="text-xs font-medium leading-relaxed opacity-90">
             Your boutique <span className="font-black underline">{formData.shopName}</span> has been provisionally approved for the Ghotki bazar. You can start adding products and video reels immediately.
           </p>
           <button 
             onClick={jumpToDashboard}
             className="w-full bg-white text-pink-600 font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all uppercase tracking-widest text-[11px]"
           >
             Go to Store Dashboard <ArrowLeft className="w-4 h-4 rotate-180" />
           </button>
        </div>

        <button 
          onClick={() => setView('LOGIN')}
          className="text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-pink-600 transition-colors"
        >
          Return to Login
        </button>
      </div>
    );
  }

  if (view === 'REGISTER_SHOP') {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6 animate-in slide-in-from-right duration-300 pb-20">
        <button onClick={() => setView('LOGIN')} className="flex items-center gap-2 text-pink-600 font-black mb-4 active:scale-95 transition-transform uppercase text-xs tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>
        
        <div className="text-center space-y-1">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Open Shop</h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Start Selling in 2 Minutes</p>
        </div>

        <form onSubmit={handleRegisterShop} className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-pink-600 uppercase tracking-[0.3em] ml-1 border-b border-pink-50 pb-2">Business Identity</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Official Shop Name</label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. Ghotki Royal Boutique"
                    className="w-full pl-12 pr-6 py-4.5 bg-white border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-pink-500 outline-none text-sm shadow-sm transition-all font-bold"
                    value={formData.shopName}
                    onChange={e => setFormData({...formData, shopName: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Owner Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <input
                    required
                    type="text"
                    placeholder="Owner's Name"
                    className="w-full pl-12 pr-6 py-4.5 bg-white border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-pink-500 outline-none text-sm shadow-sm transition-all font-bold"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-pink-600 uppercase tracking-[0.3em] ml-1 border-b border-pink-50 pb-2">Contact & Bazaar</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Mobile (Login)</label>
                  <input
                    required
                    type="tel"
                    placeholder="03xx..."
                    className="w-full px-6 py-4.5 bg-white border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-pink-500 outline-none text-sm shadow-sm transition-all font-bold"
                    value={formData.mobile}
                    onChange={e => setFormData({...formData, mobile: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">WhatsApp</label>
                  <input
                    required
                    type="tel"
                    placeholder="923xx..."
                    className="w-full px-6 py-4.5 bg-white border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-pink-500 outline-none text-sm shadow-sm transition-all font-bold"
                    value={formData.whatsapp}
                    onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                  />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Bazaar Location</label>
                  <select 
                    className="w-full px-6 py-4.5 bg-white border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-pink-500 outline-none text-sm shadow-sm appearance-none font-bold"
                    value={formData.bazaar}
                    onChange={e => setFormData({...formData, bazaar: e.target.value})}
                  >
                    {BAZAARS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-pink-600 uppercase tracking-[0.3em] ml-1 border-b border-pink-50 pb-2">Account Security</h3>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="w-full pl-12 pr-14 py-4.5 bg-white border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-pink-500 outline-none text-sm shadow-sm transition-all font-bold"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-pink-600 text-white font-black py-6 rounded-[2.5rem] shadow-2xl shadow-pink-200 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-[11px]"
          >
            Launch My Shop
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-6 space-y-12 animate-in zoom-in duration-300">
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-black text-pink-600 tracking-tighter uppercase italic drop-shadow-sm">GLB BAZAR</h1>
        <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">The Digital Pulse of Ghotki</p>
      </div>

      <div className="w-full space-y-8">
        <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-full shadow-inner">
          {(['BUYER', 'SELLER'] as UserRole[]).map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-4.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${role === r ? 'bg-white text-pink-600 shadow-xl' : 'text-gray-400'}`}
            >
              {r === 'BUYER' ? 'Shop' : 'Sell'}
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Mobile Number</label>
              <div className="relative">
                 <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                 <input
                   required
                   type="tel"
                   value={formData.mobile}
                   onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                   className="w-full pl-12 pr-6 py-4.5 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all font-bold"
                   placeholder="03xx xxxxxxx"
                 />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Password</label>
              <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                 <input
                   required
                   type="password"
                   value={formData.password}
                   onChange={e => setFormData({ ...formData, password: e.target.value })}
                   className="w-full pl-12 pr-6 py-4.5 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all font-bold"
                   placeholder="••••••••"
                 />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-pink-600 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-pink-200 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-[11px]"
          >
            {role === 'SELLER' ? 'Store Hub' : 'Enter Bazar'}
          </button>
        </form>

        <div className="flex items-center gap-4 w-full pt-4">
           <div className="h-px flex-1 bg-gray-100" />
           <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Become a Vendor</span>
           <div className="h-px flex-1 bg-gray-100" />
        </div>

        <button 
          onClick={() => setView('REGISTER_SHOP')}
          className="w-full bg-white border-2 border-pink-50 text-pink-600 font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-pink-50 hover:border-pink-100 transition-all active:scale-95 shadow-sm uppercase tracking-widest text-[11px]"
        >
          <UserPlus className="w-5 h-5" />
          Register My Shop
        </button>
      </div>

      <p className="text-center text-[9px] text-gray-300 uppercase font-black tracking-[0.3em] pt-8">
        Digital Ghotki Platform • v2.5
      </p>
    </div>
  );
};

export default LoginView;
