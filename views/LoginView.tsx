
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Store, ShieldCheck, Lock, Phone, UserPlus, 
  ArrowLeft, CheckCircle, Mail, Eye, EyeOff, Sparkles, Loader2
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { BAZAARS, CATEGORIES } from '../constants';

interface LoginViewProps {
  setUser: (u: any) => void;
  lang: 'EN' | 'UR';
}

const LoginView: React.FC<LoginViewProps> = ({ setUser, lang }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'LOGIN' | 'SIGNUP_CHOICE' | 'SIGNUP_BUYER' | 'SIGNUP_SHOP' | 'PENDING'>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({ 
    email: '',
    password: '',
    name: '',
    mobile: '',
    shopName: '',
    bazaar: BAZAARS[0],
    category: CATEGORIES[0].name,
    address: ''
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) throw error;
      
      // Fetch profile
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      setUser({ ...data.user, ...profile });
      navigate(profile.role === 'SELLER' ? '/seller' : '/');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (role: 'BUYER' | 'SELLER') => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (authError) throw authError;
      if (!authData.user) return;

      // 1. Create Profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        name: formData.name,
        mobile: formData.mobile,
        role: role,
        address: formData.address
      });
      if (profileError) throw profileError;

      // 2. Create Shop if Seller
      if (role === 'SELLER') {
        const { error: shopError } = await supabase.from('shops').insert({
          owner_id: authData.user.id,
          name: formData.shopName,
          bazaar: formData.bazaar,
          category: formData.category,
          status: 'PENDING'
        });
        if (shopError) throw shopError;
        setView('PENDING');
      } else {
        setUser({ id: authData.user.id, name: formData.name, role: 'BUYER' });
        navigate('/');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (view === 'PENDING') {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in zoom-in">
        <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 shadow-xl border-4 border-white">
          <Sparkles className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black italic uppercase italic tracking-tighter">Reviewing Shop</h1>
          <p className="text-gray-500 text-sm">Your registration for <span className="font-bold text-pink-600">{formData.shopName}</span> has been sent to the Ghotki administration team. We'll contact you shortly.</p>
        </div>
        <button onClick={() => setView('LOGIN')} className="text-pink-600 font-black uppercase text-xs tracking-widest">Back to Login</button>
      </div>
    );
  }

  if (view === 'SIGNUP_CHOICE') {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center p-6 space-y-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Join GLB Bazar</h1>
        <div className="grid grid-cols-1 gap-4 w-full">
          <button onClick={() => setView('SIGNUP_BUYER')} className="p-8 bg-white border-2 border-gray-100 rounded-[2.5rem] flex flex-col items-center gap-4 hover:border-pink-500 hover:shadow-2xl transition-all group">
            <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 group-hover:scale-110 transition-transform"><User className="w-8 h-8" /></div>
            <div className="text-center">
              <p className="font-black text-lg uppercase italic tracking-tighter">I am a Shopper</p>
              <p className="text-xs text-gray-400">Browse and buy from local shops</p>
            </div>
          </button>
          <button onClick={() => setView('SIGNUP_SHOP')} className="p-8 bg-gray-900 border-2 border-gray-900 rounded-[2.5rem] flex flex-col items-center gap-4 hover:shadow-2xl transition-all group text-white">
            <div className="w-16 h-16 bg-pink-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform"><Store className="w-8 h-8" /></div>
            <div className="text-center">
              <p className="font-black text-lg uppercase italic tracking-tighter">I am a Seller</p>
              <p className="text-xs text-white/50">Open your digital shop in Ghotki</p>
            </div>
          </button>
        </div>
        <button onClick={() => setView('LOGIN')} className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Already have an account? Login</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center p-6 space-y-10 animate-in fade-in duration-500">
      <div className="text-center">
        <h1 className="text-5xl font-black text-pink-600 tracking-tighter uppercase italic">GLB BAZAR</h1>
        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">Digitizing Ghotki Legacy</p>
      </div>

      <form onSubmit={view === 'LOGIN' ? handleAuth : (e) => { e.preventDefault(); handleSignup(view === 'SIGNUP_BUYER' ? 'BUYER' : 'SELLER'); }} className="w-full space-y-5">
        {(view === 'SIGNUP_BUYER' || view === 'SIGNUP_SHOP') && (
          <div className="space-y-4">
             <div className="relative">
               <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
               <input required type="text" placeholder="Full Name" className="w-full pl-12 pr-6 py-4.5 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-pink-500 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
             </div>
             <div className="relative">
               <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
               <input required type="tel" placeholder="Mobile Number" className="w-full pl-12 pr-6 py-4.5 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-pink-500 font-bold" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
             </div>
          </div>
        )}

        {view === 'SIGNUP_SHOP' && (
          <div className="space-y-4 animate-in slide-in-from-right">
             <div className="relative">
               <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
               <input required type="text" placeholder="Shop Name" className="w-full pl-12 pr-6 py-4.5 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-pink-500 font-bold" value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} />
             </div>
             <select className="w-full px-6 py-4.5 bg-white border border-gray-100 rounded-2xl shadow-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-pink-500" value={formData.bazaar} onChange={e => setFormData({...formData, bazaar: e.target.value})}>
               {BAZAARS.map(b => <option key={b} value={b}>{b}</option>)}
             </select>
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input required type="email" placeholder="Email Address" className="w-full pl-12 pr-6 py-4.5 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-pink-500 font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input required type={showPassword ? "text" : "password"} placeholder="Password" className="w-full pl-12 pr-14 py-4.5 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-pink-500 font-bold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-pink-600">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button disabled={loading} type="submit" className="w-full bg-pink-600 text-white font-black py-5 rounded-3xl shadow-2xl shadow-pink-200 flex items-center justify-center gap-3 active:scale-95 transition-all uppercase tracking-widest text-xs">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (view === 'LOGIN' ? 'Login to Bazar' : 'Complete Registration')}
        </button>
      </form>

      <div className="text-center space-y-4">
        {view === 'LOGIN' ? (
          <button onClick={() => setView('SIGNUP_CHOICE')} className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">New to Ghotki Bazar? <span className="text-pink-600">Create Account</span></button>
        ) : (
          <button onClick={() => setView('LOGIN')} className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]"><ArrowLeft className="w-3 h-3 inline mr-2" /> Already have an account? <span className="text-pink-600">Login</span></button>
        )}
      </div>
    </div>
  );
};

export default LoginView;
