
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Store, 
  ShieldCheck, 
  Lock, 
  Phone, 
  UserPlus, 
  Info, 
  ArrowLeft, 
  CheckCircle, 
  CreditCard, 
  MapPin, 
  ClipboardCheck,
  Clock,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserRole, User as UserType } from '../types';
import { BAZAARS, CATEGORIES, REGISTRATION_FEE_PKR } from '../constants';

interface LoginViewProps {
  setUser: (u: UserType) => void;
  lang: 'EN' | 'UR';
}

const LoginView: React.FC<LoginViewProps> = ({ setUser, lang }) => {
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
    
    // Admin Credentials: Mobile '0000'
    let finalRole = role;
    if (formData.mobile === '0000') {
      finalRole = 'ADMIN';
    }

    const newUser: UserType = {
      id: Math.random().toString(36).substr(2, 9),
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
    setView('PENDING_APPROVAL');
  };

  if (view === 'PENDING_APPROVAL') {
    return (
      <div className="max-w-md mx-auto min-h-[90vh] flex flex-col p-6 space-y-8 animate-in slide-in-from-bottom-8 duration-500 pb-20">
        <div className="text-center space-y-4 pt-8">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 border-4 border-white shadow-xl">
             <ClipboardCheck className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Registration Pending</h1>
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase">Application ID: GLB-{Math.floor(Math.random()*90000 + 10000)}</p>
          </div>
        </div>

        {/* Status Stepper */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="w-0.5 h-10 bg-green-500 my-1" />
              <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 animate-pulse">
                <Clock className="w-4 h-4" />
              </div>
              <div className="w-0.5 h-10 bg-gray-100 my-1" />
              <div className="w-6 h-6 bg-gray-100 rounded-full" />
            </div>
            <div className="flex-1 space-y-8">
              <div>
                <h4 className="font-black text-xs text-gray-900 uppercase">Application Submitted</h4>
                <p className="text-[10px] text-gray-400 font-medium">Your shop details for <span className="text-gray-900 font-bold">{formData.shopName}</span> have been recorded.</p>
              </div>
              <div>
                <h4 className="font-black text-xs text-pink-600 uppercase">Payment Verification</h4>
                <p className="text-[10px] text-gray-400 font-medium">Waiting for PKR {REGISTRATION_FEE_PKR.toLocaleString()} via <span className="text-gray-900 font-bold">{formData.paymentMethod}</span>.</p>
              </div>
              <div>
                <h4 className="font-black text-xs text-gray-300 uppercase">Store Goes Live</h4>
                <p className="text-[10px] text-gray-400 font-medium">Admin will review and approve within 24 hours.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Instructions Box */}
        <div className="bg-pink-600 rounded-[2.5rem] p-8 text-white space-y-6 shadow-xl shadow-pink-200">
           <div className="flex items-center gap-3">
             <CreditCard className="w-6 h-6" />
             <h3 className="font-black text-sm uppercase tracking-widest">How to Pay</h3>
           </div>
           
           <div className="space-y-4">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                <p className="text-[10px] uppercase font-bold text-pink-100 mb-1">Transfer To</p>
                <p className="text-lg font-black tracking-tight">0300 1234567</p>
                <p className="text-xs font-bold opacity-80">Title: GLB Admin (Zubeda K.)</p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] leading-relaxed font-medium">
                  1. Open your <b>{formData.paymentMethod}</b> App.<br/>
                  2. Transfer <b>PKR {REGISTRATION_FEE_PKR.toLocaleString()}</b> to the number above.<br/>
                  3. Take a screenshot of the receipt.<br/>
                  4. Send it to our WhatsApp for instant approval.
                </p>
              </div>
           </div>

           <button 
             onClick={() => window.open(`https://wa.me/923001234567?text=Payment receipt for ${formData.shopName}`)}
             className="w-full bg-white text-pink-600 font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-pink-800/20 active:scale-95 transition-all uppercase tracking-widest text-[10px]"
           >
             Send Receipt on WhatsApp <ExternalLink className="w-3 h-3" />
           </button>
        </div>

        <button 
          onClick={() => setView('LOGIN')}
          className="w-full text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-pink-600 transition-colors"
        >
          Return to Login Screen
        </button>
      </div>
    );
  }

  if (view === 'REGISTER_SHOP') {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6 animate-in slide-in-from-right duration-300 pb-20">
        <button onClick={() => setView('LOGIN')} className="flex items-center gap-2 text-pink-600 font-bold mb-4 active:scale-95 transition-transform">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Join the Marketplace</h1>
          <p className="text-gray-500 text-sm font-medium">Create your digital storefront in minutes</p>
        </div>

        <form onSubmit={handleRegisterShop} className="space-y-8">
          {/* Section 1: Shop Info */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-pink-600 uppercase tracking-widest ml-1 border-b border-pink-50 pb-2">Store Identity</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Shop Name</label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. Ghotki Fashion Point"
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none text-sm shadow-sm transition-all"
                    value={formData.shopName}
                    onChange={e => setFormData({...formData, shopName: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Owner Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    required
                    type="text"
                    placeholder="Owner's Name"
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none text-sm shadow-sm transition-all"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Location */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-pink-600 uppercase tracking-widest ml-1 border-b border-pink-50 pb-2">Contact & Location</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Login Mobile</label>
                  <input
                    required
                    type="tel"
                    placeholder="03xx..."
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none text-sm shadow-sm transition-all"
                    value={formData.mobile}
                    onChange={e => setFormData({...formData, mobile: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">WhatsApp</label>
                  <input
                    required
                    type="tel"
                    placeholder="923xx..."
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none text-sm shadow-sm transition-all"
                    value={formData.whatsapp}
                    onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                  />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Select Bazaar</label>
                  <select 
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none text-sm shadow-sm appearance-none"
                    value={formData.bazaar}
                    onChange={e => setFormData({...formData, bazaar: e.target.value})}
                  >
                    {BAZAARS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Primary Category</label>
                  <select 
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none text-sm shadow-sm appearance-none"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Detailed Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-gray-300" />
                <textarea
                  required
                  placeholder="e.g. Shop #42, First Floor, Resham Gali..."
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none text-sm h-24 resize-none shadow-sm transition-all"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Account Security */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-pink-600 uppercase tracking-widest ml-1 border-b border-pink-50 pb-2">Account Security</h3>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Set Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none text-sm shadow-sm transition-all"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Fee Payment Selection */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-pink-600 uppercase tracking-widest ml-1 border-b border-pink-50 pb-2">Registration Fee (PKR {REGISTRATION_FEE_PKR})</h3>
            <div className="grid grid-cols-1 gap-3">
              {(['EasyPaisa', 'JazzCash', 'Bank Transfer'] as const).map(method => (
                <div 
                  key={method}
                  onClick={() => setFormData({...formData, paymentMethod: method})}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentMethod === method ? 'border-pink-600 bg-pink-50' : 'border-gray-100 hover:border-pink-100 bg-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.paymentMethod === method ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className={`text-sm font-black ${formData.paymentMethod === method ? 'text-pink-600' : 'text-gray-500'}`}>{method}</span>
                  </div>
                  {formData.paymentMethod === method && <CheckCircle className="w-5 h-5 text-pink-600" />}
                </div>
              ))}
            </div>
            <p className="text-[9px] text-gray-400 font-medium px-1">Note: Your shop will be visible to buyers only after payment is verified by our admin team.</p>
          </div>

          <button 
            type="submit"
            className="w-full bg-pink-600 text-white font-black py-5 rounded-3xl shadow-xl shadow-pink-200 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs"
          >
            Submit for Approval
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-6 space-y-12 animate-in zoom-in duration-300">
      <div className="text-center space-y-3">
        <h1 className="text-5xl font-black text-pink-600 tracking-tighter uppercase italic">GLB BAZAR</h1>
        <div className="flex items-center justify-center gap-2">
           <span className="h-px w-8 bg-gray-200" />
           <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Digital Heart of Ghotki</p>
           <span className="h-px w-8 bg-gray-200" />
        </div>
      </div>

      <div className="w-full space-y-8">
        <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-full shadow-inner">
          {(['BUYER', 'SELLER'] as UserRole[]).map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-4 rounded-xl text-xs font-black transition-all uppercase tracking-wider ${role === r ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-400 hover:text-gray-500'}`}
            >
              {r === 'BUYER' ? 'Shop' : 'Sell'}
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Mobile Number</label>
              <div className="relative">
                 <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                 <input
                   required
                   type="tel"
                   value={formData.mobile}
                   onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                   className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                   placeholder="03xx xxxxxxx"
                 />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Password</label>
              <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                 <input
                   required
                   type="password"
                   value={formData.password}
                   onChange={e => setFormData({ ...formData, password: e.target.value })}
                   className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                   placeholder="••••••••"
                 />
              </div>
            </div>
            
            <div className="bg-pink-50 p-3 rounded-2xl border border-pink-100">
               <p className="text-[9px] text-pink-700 font-bold leading-tight flex items-center gap-2">
                 <ShieldCheck className="w-3 h-3" />
                 ADMIN: Mobile 0000 | Pwd admin
               </p>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-pink-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-pink-200 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs"
          >
            {role === 'SELLER' ? 'Store Dashboard' : 'Explore Market'}
          </button>
        </form>

        <div className="flex items-center gap-4 w-full pt-4">
           <div className="h-px flex-1 bg-gray-100" />
           <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Vendor Registration</span>
           <div className="h-px flex-1 bg-gray-100" />
        </div>

        <button 
          onClick={() => setView('REGISTER_SHOP')}
          className="w-full bg-white border-2 border-pink-50 text-pink-600 font-black py-5 rounded-[2rem] flex items-center justify-center gap-2 hover:bg-pink-50 hover:border-pink-100 transition-all active:scale-95 shadow-sm"
        >
          <UserPlus className="w-5 h-5" />
          <span className="uppercase tracking-widest text-xs">Register My Shop</span>
        </button>
      </div>

      <p className="text-[9px] text-gray-300 font-black uppercase tracking-widest">
        Powered by Ghotki Ladies Bazar
      </p>
    </div>
  );
};

export default LoginView;
