
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Store, Phone, Mail, CheckCircle, Loader2, CreditCard, Building2, Smartphone
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { BAZAARS, CATEGORIES, SUBSCRIPTION_PLANS } from '../constants';
import { User as UserType } from '../types';

interface LoginViewProps {
  setUser: (u: UserType) => void;
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
    tier: 'BASIC',
    easypaisa: '',
    jazzcash: '',
    bank: ''
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
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
      const meta = data.user.user_metadata || {};
      
      // FIX: Robust role priority
      const finalRole = profile?.role || meta?.role || 'BUYER';
      
      const mappedUser: UserType = {
        id: data.user.id,
        name: profile?.name || meta.full_name || 'Bazar User',
        role: finalRole as any,
        mobile: profile?.mobile || meta.mobile || '',
        address: profile?.address || meta.address || '',
        city: profile?.city || meta.city || 'Ghotki',
        subscription_tier: profile?.subscription_tier || meta.tier || 'NONE'
      };

      setUser(mappedUser);
      
      if (finalRole === 'ADMIN') navigate('/admin');
      else if (finalRole === 'SELLER') navigate('/seller');
      else navigate('/');
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
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: role,
            tier: formData.tier
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed.");

      await supabase.from('profiles').upsert({
        id: authData.user.id,
        name: formData.name,
        mobile: formData.mobile,
        role: role,
        subscription_tier: formData.tier
      });

      if (role === 'SELLER') {
        await supabase.from('shops').insert({
          owner_id: authData.user.id,
          name: formData.shopName || `${formData.name}'s Shop`,
          bazaar: formData.bazaar,
          category: formData.category,
          subscription_tier: formData.tier,
          status: 'PENDING',
          logo_url: 'https://via.placeholder.com/150',
          banner_url: 'https://via.placeholder.com/800x400',
          easypaisa_number: formData.easypaisa,
          jazzcash_number: formData.jazzcash,
          bank_details: formData.bank,
          whatsapp: formData.mobile
        });
        setView('CHECK_EMAIL');
      } else {
        if (authData.session) {
           const mappedUser: UserType = {
              id: authData.user.id,
              name: formData.name,
              role: 'BUYER',
              mobile: formData.mobile,
              address: '',
              city: 'Ghotki'
           };
           setUser(mappedUser);
           navigate('/');
        } else {
           setView('CHECK_EMAIL');
        }
      }
    } catch (err: any) {
      alert("Signup Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (view === 'CHECK_EMAIL') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-6 bg-white">
      <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
        <Mail className="w-12 h-12" />
      </div>
      <div className="space-y-4 max-w-sm mx-auto">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-tight">Confirm Your Email</h2>
        <div className="space-y-3">
          <p className="text-gray-500 text-sm font-medium">
            We've sent a link to <span className="text-pink-600 font-bold">{formData.email}</span>. 
          </p>
          <div className="bg-pink-50 p-6 rounded-[2rem] border-2 border-pink-100 animate-pulse">
            <p className="text-pink-700 font-black uppercase text-xs leading-relaxed">
              Must check your <span className="underline italic">Spam folder</span> in your Gmail box if it's not in your Inbox!
            </p>
          </div>
        </div>
      </div>
      <button onClick={() => setView('LOGIN')} className="bg-gray-900 text-white w-full max-w-xs py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl">Return to Login</button>
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
            <User className="text-pink-500 group-hover:scale-110 transition-transform" />
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
            <input required type="email" placeholder="Email Address" className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-pink-500/20" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input required type="password" placeholder="Password" className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-pink-500/20" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            
            {view !== 'LOGIN' && (
              <>
                <input required type="text" placeholder="Your Full Name" className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-pink-500/20" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input required type="tel" placeholder="Mobile / WhatsApp (03xx...)" className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-pink-500/20" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
              </>
            )}

            {view === 'SIGNUP_SHOP' && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Shop Details</p>
                <input required type="text" placeholder="Shop Name" className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-pink-500/20" value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} />
                
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 mt-4">Subscription Plan</p>
                <div className="grid grid-cols-3 gap-2">
                  {SUBSCRIPTION_PLANS.map(plan => (
                    <button key={plan.id} type="button" onClick={() => setFormData({...formData, tier: plan.id as any})} className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center ${formData.tier === plan.id ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-gray-50 text-gray-400 grayscale'}`}>
                      <span className="text-[8px] font-black uppercase">{plan.label}</span>
                      <span className="text-[10px] font-black">PKR {plan.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button disabled={loading} className="w-full bg-pink-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-pink-200 uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 active:scale-95 transition-all">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (view === 'LOGIN' ? 'Secure Login' : 'Register Account')}
          </button>
          
          <button type="button" onClick={() => setView(view === 'LOGIN' ? 'SIGNUP_CHOICE' : 'LOGIN')} className="w-full text-center text-gray-400 font-black uppercase text-[10px] pt-4">
            {view === 'LOGIN' ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </button>
        </form>
      )}
    </div>
  );
};

export default LoginView;
