
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Store, Lock, Phone, ArrowLeft, Mail, Eye, EyeOff, Sparkles, Loader2, Inbox, CheckCircle
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { BAZAARS, CATEGORIES, SUBSCRIPTION_PLANS } from '../constants';

interface LoginViewProps {
  setUser: (u: any) => void;
  lang: 'EN' | 'UR';
}

const LoginView: React.FC<LoginViewProps> = ({ setUser, lang }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'LOGIN' | 'SIGNUP_CHOICE' | 'SIGNUP_BUYER' | 'SIGNUP_SHOP' | 'PENDING' | 'CHECK_EMAIL'>('LOGIN');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ 
    email: '',
    password: '',
    name: '',
    mobile: '',
    shopName: '',
    bazaar: BAZAARS[0],
    category: CATEGORIES[0].name,
    tier: 'BASIC'
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!supabase) throw new Error("Supabase not initialized");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) throw error;
      if (!data.user) throw new Error("User not found.");
      
      // The actual profile creation happens in App.tsx fetchProfile if it doesn't exist
      navigate('/');
    } catch (err: any) {
      alert("Login Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (role: 'BUYER' | 'SELLER') => {
    if (!supabase) return;
    setLoading(true);
    try {
      // Store all data in metadata because public tables are locked until email is verified
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: role,
            tier: formData.tier,
            mobile: formData.mobile,
            shop_name: formData.shopName,
            bazaar: formData.bazaar,
            category: formData.category
          }
        }
      });

      if (authError) throw authError;
      
      if (role === 'SELLER') setView('PENDING');
      else setView('CHECK_EMAIL');

    } catch (err: any) {
      alert("Signup Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (view === 'CHECK_EMAIL') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
        <Mail className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-black uppercase italic tracking-tighter">Check Your Email</h2>
      <p className="text-gray-500 text-sm">A verification link has been sent to <span className="text-gray-900 font-bold">{formData.email}</span>.</p>
      <button onClick={() => setView('LOGIN')} className="bg-gray-900 text-white w-full max-w-xs py-4 rounded-2xl font-black uppercase tracking-widest">Back to Login</button>
    </div>
  );

  if (view === 'PENDING') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="w-20 h-20 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-black uppercase italic text-pink-600 tracking-tighter">Step 1: Verify Email</h2>
      <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
        Verify your email first. After that, log in to set up your digital shop and get Admin approval.
      </p>
      <button onClick={() => setView('LOGIN')} className="bg-gray-900 text-white w-full max-w-xs py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl">Go to Login</button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-pink-600 uppercase italic tracking-tighter">GLB BAZAR</h1>
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">Digitizing Ghotki Legacy</p>
      </div>
      
      {view === 'SIGNUP_CHOICE' ? (
        <div className="w-full space-y-4">
          <button onClick={() => setView('SIGNUP_BUYER')} className="w-full p-8 bg-white border-2 border-gray-100 rounded-[2.5rem] font-black uppercase italic text-gray-900 shadow-sm hover:border-pink-200 transition-all flex items-center justify-between group">
            <span>I am a Buyer</span>
            <User className="text-gray-300 group-hover:text-pink-500 transition-colors" />
          </button>
          <button onClick={() => setView('SIGNUP_SHOP')} className="w-full p-8 bg-gray-900 text-white rounded-[2.5rem] font-black uppercase italic shadow-2xl flex items-center justify-between group">
            <span>I am a Seller</span>
            <Store className="text-pink-400 group-hover:scale-110 transition-transform" />
          </button>
          <button onClick={() => setView('LOGIN')} className="w-full text-center text-gray-400 font-black uppercase text-[10px] pt-4">Back to Login</button>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); view === 'LOGIN' ? handleAuth(e) : handleSignup(view === 'SIGNUP_SHOP' ? 'SELLER' : 'BUYER'); }} className="w-full space-y-4">
          <div className="space-y-3">
            <input required type="email" placeholder="Email Address" className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-pink-500/20 shadow-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input required type="password" placeholder="Password" className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-pink-500/20 shadow-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            
            {view !== 'LOGIN' && (
              <>
                <input required type="text" placeholder="Your Full Name" className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-pink-500/20 shadow-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input required type="tel" placeholder="Mobile Number" className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-pink-500/20 shadow-sm" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
              </>
            )}

            {view === 'SIGNUP_SHOP' && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <input required type="text" placeholder="Shop Name" className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-pink-500/20 shadow-sm" value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} />
                <div className="grid grid-cols-3 gap-2">
                  {SUBSCRIPTION_PLANS.map(plan => (
                    <button key={plan.id} type="button" onClick={() => setFormData({...formData, tier: plan.id as any})} className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${formData.tier === plan.id ? 'border-pink-600 bg-pink-50 text-pink-600 shadow-md' : 'border-gray-50 text-gray-400 grayscale'}`}>
                      <span className="text-[8px] font-black uppercase leading-none">{plan.label}</span>
                      <span className="text-[9px] font-black">PKR {plan.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button disabled={loading} className="w-full bg-pink-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-pink-200 uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 active:scale-95 transition-all">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (view === 'LOGIN' ? 'Secure Login' : 'Start My Journey')}
          </button>
          
          <button type="button" onClick={() => setView(view === 'LOGIN' ? 'SIGNUP_CHOICE' : 'LOGIN')} className="w-full text-center text-gray-400 font-black uppercase text-[10px] pt-4">
            {view === 'LOGIN' ? "Don't have an account? Join Now" : 'Already have an account? Login'}
          </button>
        </form>
      )}
    </div>
  );
};

export default LoginView;
