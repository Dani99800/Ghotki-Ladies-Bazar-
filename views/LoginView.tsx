import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Store, Lock, Phone, ArrowLeft, Mail, Eye, EyeOff, Sparkles, Loader2, Inbox
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { BAZAARS, CATEGORIES } from '../constants';

interface LoginViewProps {
  setUser: (u: any) => void;
  lang: 'EN' | 'UR';
}

const LoginView: React.FC<LoginViewProps> = ({ setUser, lang }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'LOGIN' | 'SIGNUP_CHOICE' | 'SIGNUP_BUYER' | 'SIGNUP_SHOP' | 'PENDING' | 'CHECK_EMAIL'>('LOGIN');
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
      if (!supabase) throw new Error("Database connection not initialized.");
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) throw error;
      if (!data.user) throw new Error("Login failed: User not found.");
      
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      // If profile missing or error, handle gracefully
      if (profileError || !profile) {
        console.warn("Profile not found for user, defaulting to BUYER role.");
        const fallbackUser = { ...data.user, role: 'BUYER', name: data.user.user_metadata?.full_name || 'User' };
        setUser(fallbackUser);
        navigate('/');
        return;
      }

      setUser({ ...data.user, ...profile });
      
      // Safe check for role before navigating
      const role = profile?.role || 'BUYER';
      navigate(role === 'SELLER' ? '/seller' : '/');
    } catch (err: any) {
      console.error("Auth Error:", err);
      alert(err.message === "Email not confirmed" ? "Check your inbox! You must click the link in your email to log in." : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (role: 'BUYER' | 'SELLER') => {
    if (!formData.email || !formData.password || !formData.name) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      if (!supabase) throw new Error("Database connection not initialized.");
      
      const redirectTo = window.location.origin;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            full_name: formData.name,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed. Please check your details.");

      // Create Profile record manually
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        name: formData.name,
        mobile: formData.mobile,
        role: role,
        address: formData.address
      });
      
      if (profileError) {
        console.error("Profile creation error:", profileError);
        // We don't throw here so the user sees the "Check Email" screen 
        // since the Auth account was actually created.
      }

      if (role === 'SELLER') {
        const { error: shopError } = await supabase.from('shops').upsert({
          owner_id: authData.user.id,
          name: formData.shopName,
          bazaar: formData.bazaar,
          category: formData.category,
          status: 'PENDING'
        });
        if (shopError) console.error("Shop creation error:", shopError);
        setView('PENDING');
      } else {
        setView('CHECK_EMAIL');
      }
    } catch (err: any) {
      console.error("Signup Error:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (view === 'CHECK_EMAIL') {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in zoom-in">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-xl border-4 border-white">
          <Inbox className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Check Your Email</h1>
          <p className="text-gray-500 text-sm">We've sent a link to <span className="font-bold text-gray-800">{formData.email}</span>. Click the link in that email to activate your account.</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase mt-4">Note: If you are redirected to localhost, simply return to this app and Login.</p>
        </div>
        <button onClick={() => setView('LOGIN')} className="bg-gray-900 text-white font-black py-4 px-10 rounded-2xl text-[10px] uppercase tracking-widest">Back to Login</button>
      </div>
    );
  }

  if (view === 'PENDING') {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in zoom-in">
        <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 shadow-xl border-4 border-white">
          <Sparkles className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Success!</h1>
          <p className="text-gray-500 text-sm">Shop registered. First, check your email to verify account. Then, wait for admin approval.</p>
        </div>
        <button onClick={() => setView('LOGIN')} className="bg-pink-600 text-white font-black py-4 px-10 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl">Back to Login</button>
      </div>
    );
  }

  if (view === 'SIGNUP_CHOICE') {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center p-6 space-y-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Join Bazar</h1>
        <div className="grid grid-cols-1 gap-4 w-full">
          <button onClick={() => setView('SIGNUP_BUYER')} className="p-8 bg-white border-2 border-gray-100 rounded-[2.5rem] flex flex-col items-center gap-4 hover:border-pink-500 hover:shadow-2xl transition-all group">
            <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 group-hover:scale-110 transition-transform"><User className="w-8 h-8" /></div>
            <div className="text-center">
              <p className="font-black text-lg uppercase italic tracking-tighter">I am a Shopper</p>
              <p className="text-xs text-gray-400">Shop from Ghotki's best</p>
            </div>
          </button>
          <button onClick={() => setView('SIGNUP_SHOP')} className="p-8 bg-gray-900 border-2 border-gray-900 rounded-[2.5rem] flex flex-col items-center gap-4 hover:shadow-2xl transition-all group text-white">
            <div className="w-16 h-16 bg-pink-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform"><Store className="w-8 h-8" /></div>
            <div className="text-center">
              <p className="font-black text-lg uppercase italic tracking-tighter">I am a Seller</p>
              <p className="text-xs text-white/50">Start selling online</p>
            </div>
          </button>
        </div>
        <button onClick={() => setView('LOGIN')} className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Login Instead</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center p-6 space-y-10 animate-in fade-in duration-500">
      <div className="text-center">
        <h1 className="text-5xl font-black text-pink-600 tracking-tighter uppercase italic">GLB BAZAR</h1>
        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">Digitizing Ghotki Legacy</p>
      </div>

      <form onSubmit={(e) => {
        if (view === 'LOGIN') handleAuth(e);
        else { e.preventDefault(); handleSignup(view === 'SIGNUP_BUYER' ? 'BUYER' : 'SELLER'); }
      }} className="w-full space-y-5">
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
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (view === 'LOGIN' ? 'Login to Bazar' : 'Register Now')}
        </button>
      </form>

      <div className="text-center space-y-4">
        {view === 'LOGIN' ? (
          <button onClick={() => setView('SIGNUP_CHOICE')} className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">New here? <span className="text-pink-600">Create Account</span></button>
        ) : (
          <button onClick={() => setView('LOGIN')} className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]"><ArrowLeft className="w-3 h-3 inline mr-2" /> Back to <span className="text-pink-600">Login</span></button>
        )}
      </div>
    </div>
  );
};

export default LoginView;