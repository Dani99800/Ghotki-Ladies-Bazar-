
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
      const finalRole = profile?.role || meta?.role || 'BUYER';
      
      const mappedUser: UserType = {
        id: data.user.id,
        name: profile?.name || meta.full_name || 'Bazar User',
        role: finalRole,
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
        setView('PENDING');
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

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-pink-600 uppercase italic tracking-tighter">GLB BAZAR</h1>
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">Digitizing Ghotki Legacy</p>
      </div>
      
      {view === 'SIGNUP_CHOICE' ? (
        <div className="w-full space-y-4">
          <button onClick={() => setView('SIGNUP_BUYER')} className="w-full p-8 bg-white border-2 border-gray-100 rounded-[2.5rem] font-black uppercase italic text-gray-900 shadow-sm hover:border-pink-200 transition-all flex items-center justify-between">
            <span>I am a Buyer</span>
            <User className="text-pink-500" />
          </button>
          <button onClick={() => setView('SIGNUP_SHOP')} className="w-full p-8 bg-gray-900 text-white rounded-[2.5rem] font-black uppercase italic shadow-2xl flex items-center justify-between">
            <span>I am a Seller</span>
            <Store className="text-pink-400" />
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
                <input required type="tel" placeholder="Mobile / WhatsApp Number" className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-pink-500/20" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
              </>
            )}

            {view === 'SIGNUP_SHOP' && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Shop Details</p>
                <input required type="text" placeholder="Shop Name" className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-pink-500/20" value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} />
                
                <select required className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  {CATEGORIES.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>

                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 mt-4">Payment Accounts (To Receive Money)</p>
                <div className="space-y-2">
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
                    <input placeholder="EasyPaisa Number" className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl text-xs font-bold" value={formData.easypaisa} onChange={e => setFormData({...formData, easypaisa: e.target.value})} />
                  </div>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                    <input placeholder="JazzCash Number" className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl text-xs font-bold" value={formData.jazzcash} onChange={e => setFormData({...formData, jazzcash: e.target.value})} />
                  </div>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input placeholder="Bank Name, A/C Title & Number" className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl text-xs font-bold" value={formData.bank} onChange={e => setFormData({...formData, bank: e.target.value})} />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-4">
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
