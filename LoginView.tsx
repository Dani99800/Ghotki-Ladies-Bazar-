
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Store, Phone, Mail, CheckCircle, Loader2, ChevronDown, AlertTriangle, Briefcase, ShoppingBag
} from 'lucide-react';
import { supabase } from './services/supabase';
import { BAZAARS, CATEGORIES, SUBSCRIPTION_PLANS } from './constants';
import { User as UserType } from './types';

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
    tier: 'BASIC' as any
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!supabase) throw new Error("Database not connected");
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
      alert("Login Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (role: 'BUYER' | 'SELLER') => {
    if (!supabase) return;
    setLoading(true);
    try {
      // 1. Supabase Auth Signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: formData.name,
            role: role,
            tier: formData.tier
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Auth failed.");

      // 2. Insert into Profiles
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        name: formData.name,
        mobile: formData.mobile,
        role: role,
        subscription_tier: formData.tier
      });

      if (profileError) console.error("Profile sync error:", profileError);

      // 3. Insert into Shops if Seller
      if (role === 'SELLER') {
        const { error: shopError } = await supabase.from('shops').insert({
          owner_id: authData.user.id,
          name: formData.shopName || `${formData.name}'s Shop`,
          bazaar: formData.bazaar,
          category: formData.category,
          subscription_tier: formData.tier,
          status: 'PENDING', // CRITICAL: Ensure Admin can see it
          logo_url: 'https://via.placeholder.com/150',
          banner_url: 'https://via.placeholder.com/800x400',
          sort_priority: 0,
          featured: false
        });
        
        if (shopError) {
          console.error("Shop registration error:", shopError);
          throw new Error("Auth succeeded but Shop record failed. Please contact Admin.");
        }
        
        setView('PENDING');
      } else {
        if (authData.session) {
           setUser({
              id: authData.user.id,
              name: formData.name,
              role: 'BUYER',
              mobile: formData.mobile,
              address: '',
              city: 'Ghotki'
           });
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
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-8 bg-white animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
        <Mail className="w-12 h-12" />
      </div>
      <div className="space-y-4 max-w-sm mx-auto">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-tight">Verify Email</h2>
        <div className="p-6 bg-pink-50 rounded-[2rem] border-2 border-pink-100 space-y-4">
           <p className="text-pink-700 font-bold text-sm">We sent a link to:</p>
           <p className="text-gray-900 font-black text-lg break-all">{formData.email}</p>
           <div className="flex items-start gap-2 text-left pt-2">
              <AlertTriangle className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] font-black uppercase text-pink-600 tracking-wider">
                Note: Check your <span className="underline italic">SPAM</span> folder! Confirmation emails often end up there.
              </p>
           </div>
        </div>
      </div>
      <button onClick={() => setView('LOGIN')} className="bg-gray-900 text-white w-full max-w-xs py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 transition-all">Back to Login</button>
    </div>
  );

  if (view === 'PENDING') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-8 bg-white animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-pink-50 text-pink-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle className="w-12 h-12" />
      </div>
      <div className="space-y-3">
        <h2 className="text-3xl font-black uppercase italic text-pink-600 tracking-tighter">Shop Applied!</h2>
        <p className="text-gray-500 text-sm font-medium max-w-xs mx-auto">Your application is in the Admin approval queue. Please check your email for any verification links.</p>
      </div>
      <button onClick={() => setView('LOGIN')} className="bg-gray-900 text-white w-full max-w-xs py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 transition-all">Back to Login</button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center p-6 space-y-10 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-600 rounded-2xl text-white shadow-xl mb-2">
          <ShoppingBag className="w-6 h-6" />
        </div>
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
          <button onClick={() => setView('LOGIN')} className="w-full text-center text-gray-400 font-black uppercase text-[10px] pt-4 tracking-widest">Return to Login</button>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); view === 'LOGIN' ? handleAuth(e) : handleSignup(view === 'SIGNUP_SHOP' ? 'SELLER' : 'BUYER'); }} className="w-full space-y-4">
          <div className="space-y-3">
            <input required type="email" placeholder="Email Address" className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-200 transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input required type="password" placeholder="Password" className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-200 transition-all" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            
            {view !== 'LOGIN' && (
              <>
                <input required type="text" placeholder="Full Name" className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-200 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input required type="tel" placeholder="Mobile Number" className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-200 transition-all" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
              </>
            )}

            {view === 'SIGNUP_SHOP' && (
              <div className="space-y-6 pt-6 border-t border-gray-100 animate-in slide-in-from-top-4">
                <div className="space-y-2">
                   <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Step 2: Store Setup</p>
                   <input required type="text" placeholder="Shop Name" className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-pink-500/10" value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} />
                </div>
                
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 flex items-center gap-2">
                    <Briefcase className="w-3 h-3" /> Select Category
                  </p>
                  <div className="relative">
                    <select 
                      required 
                      className="w-full p-5 bg-white border-2 border-pink-50 rounded-2xl font-black text-sm outline-none appearance-none focus:ring-4 focus:ring-pink-500/10 text-gray-900 cursor-pointer"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Subscription Plan</p>
                  <div className="grid grid-cols-3 gap-2">
                    {SUBSCRIPTION_PLANS.map(plan => (
                      <button key={plan.id} type="button" onClick={() => setFormData({...formData, tier: plan.id as any})} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${formData.tier === plan.id ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-gray-50 text-gray-400'}`}>
                        <span className="text-[8px] font-black uppercase">{plan.label}</span>
                        <span className="text-[10px] font-black">PKR {plan.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button disabled={loading} className="w-full bg-pink-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-pink-200 uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 active:scale-95 transition-all">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (view === 'LOGIN' ? 'Login Securely' : 'Create Account')}
          </button>
          
          <button type="button" onClick={() => setView(view === 'LOGIN' ? 'SIGNUP_CHOICE' : 'LOGIN')} className="w-full text-center text-gray-400 font-black uppercase text-[10px] pt-4 tracking-widest">
            {view === 'LOGIN' ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </button>
        </form>
      )}
    </div>
  );
};

export default LoginView;
