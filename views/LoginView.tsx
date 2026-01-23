
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
  const [showPassword, setShowPassword] = useState(false);
  
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) throw error;
      if (!data.user) throw new Error("User not found.");
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
      const meta = data.user.user_metadata || {};
      const finalRole = profile?.role || meta?.role || 'BUYER';
      
      setUser({ ...data.user, ...profile, role: finalRole });
      
      if (finalRole === 'ADMIN') navigate('/admin');
      else if (finalRole === 'SELLER') navigate('/seller');
      else navigate('/');
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
      if (!authData.user) throw new Error("Signup failed.");

      await supabase.from('profiles').upsert({
        id: authData.user.id,
        name: formData.name,
        mobile: formData.mobile,
        role: role,
        subscription_tier: formData.tier
      });

      if (role === 'SELLER') {
        await supabase.from('shops').upsert({
          owner_id: authData.user.id,
          name: formData.shopName,
          bazaar: formData.bazaar,
          category: formData.category,
          subscription_tier: formData.tier,
          status: 'PENDING'
        });
        setView('PENDING');
      } else {
        setView('CHECK_EMAIL');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (view === 'CHECK_EMAIL') return <div className="min-h-screen flex items-center justify-center p-8 text-center"><h2 className="text-2xl font-black uppercase italic">Check Your Email</h2></div>;
  if (view === 'PENDING') return <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-4"><h2 className="text-2xl font-black uppercase italic text-pink-600">Registration Success!</h2><p className="text-gray-500">Wait for admin to verify your shop after email confirmation.</p><button onClick={() => setView('LOGIN')} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-black uppercase">To Login</button></div>;

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center p-6 space-y-8">
      <h1 className="text-4xl font-black text-pink-600 uppercase italic">Ghotki Bazar</h1>
      
      {view === 'SIGNUP_CHOICE' ? (
        <div className="w-full space-y-4">
          <button onClick={() => setView('SIGNUP_BUYER')} className="w-full p-6 bg-white border border-gray-100 rounded-3xl font-black uppercase italic">I am a Buyer</button>
          <button onClick={() => setView('SIGNUP_SHOP')} className="w-full p-6 bg-gray-900 text-white rounded-3xl font-black uppercase italic">I am a Seller</button>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); view === 'LOGIN' ? handleAuth(e) : handleSignup(view === 'SIGNUP_SHOP' ? 'SELLER' : 'BUYER'); }} className="w-full space-y-4">
          <input required type="email" placeholder="Email" className="w-full p-4 bg-white border rounded-2xl font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <input required type="password" placeholder="Password" className="w-full p-4 bg-white border rounded-2xl font-bold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          
          {view !== 'LOGIN' && (
            <>
              <input required type="text" placeholder="Full Name" className="w-full p-4 bg-white border rounded-2xl font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required type="tel" placeholder="Mobile" className="w-full p-4 bg-white border rounded-2xl font-bold" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
            </>
          )}

          {view === 'SIGNUP_SHOP' && (
            <div className="space-y-4 border-t pt-4">
              <input required type="text" placeholder="Shop Name" className="w-full p-4 bg-white border rounded-2xl font-bold" value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} />
              <p className="text-[10px] font-black uppercase text-gray-400">Select Plan</p>
              <div className="grid grid-cols-3 gap-2">
                {SUBSCRIPTION_PLANS.map(plan => (
                  <button key={plan.id} type="button" onClick={() => setFormData({...formData, tier: plan.id})} className={`p-3 rounded-xl text-[8px] font-black uppercase border-2 transition-all ${formData.tier === plan.id ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-gray-100 text-gray-400'}`}>
                    {plan.label}<br/>PKR {plan.price}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button disabled={loading} className="w-full bg-pink-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest flex items-center justify-center gap-3">
            {loading ? <Loader2 className="animate-spin" /> : (view === 'LOGIN' ? 'Login' : 'Join Now')}
          </button>
          
          <button type="button" onClick={() => setView(view === 'LOGIN' ? 'SIGNUP_CHOICE' : 'LOGIN')} className="w-full text-center text-gray-400 font-black uppercase text-[10px]">
            {view === 'LOGIN' ? 'Create Account' : 'Back to Login'}
          </button>
        </form>
      )}
    </div>
  );
};

export default LoginView;
