
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Store, Phone, Mail, CheckCircle, Loader2, ChevronDown, AlertTriangle, Briefcase, ShoppingBag, MapPin, Sparkles, CreditCard, ShieldCheck, UserCheck, KeyRound, Building2, Car, FileText
} from 'lucide-react';
import { supabase, uploadFile } from '../services/supabase';
import { BAZAARS, CATEGORIES, SELLER_PLANS, GHOTKI_LOCATIONS, PAYMENT_ACCOUNTS } from '../constants';
import { User as UserType, SellerType, SellerPlan } from '../types';

interface LoginViewProps {
  setUser: (u: UserType) => void;
  lang: 'EN' | 'UR';
}

const LoginView: React.FC<LoginViewProps> = ({ setUser, lang }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'LOGIN' | 'SIGNUP_CHOICE' | 'SIGNUP_BUYER' | 'SIGNUP_SELLER' | 'PENDING' | 'CHECK_EMAIL'>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [sellerType, setSellerType] = useState<SellerType>('BUSINESS');
  const [portalType, setPortalType] = useState<'MARKETPLACE' | 'RENTAL' | 'PROPERTY' | 'MOTOR'>('MARKETPLACE');
  const [cnicLicense, setCnicLicense] = useState('');
  
  const [formData, setFormData] = useState({ 
    email: '',
    password: '',
    name: '',
    mobile: '',
    city: GHOTKI_LOCATIONS[0],
    shopName: '',
    shopAddress: '',
    bazaar: BAZAARS[0],
    category: CATEGORIES[0].name,
    plan: 'BUSINESS_1000' as SellerPlan,
    paymentMethod: 'Easypaisa',
    trxId: '',
    proofUrl: ''
  });

  const [uploadingProof, setUploadingProof] = useState(false);

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
      const userEmail = data.user.email?.toLowerCase();
      const isMasterEmail = userEmail === 'd46050573@gmail.com';
      let finalRole = (profile?.role || meta?.role || 'BUYER').toUpperCase();
      
      if (isMasterEmail) finalRole = 'ADMIN';
      
      const mappedUser: UserType = {
        id: data.user.id,
        name: profile?.name || meta.full_name || 'Bazar User',
        role: finalRole as any,
        mobile: profile?.mobile || meta.mobile || '',
        address: profile?.address || meta.address || '',
        city: profile?.city || meta.city || 'Ghotki',
        seller_type: profile?.seller_type || meta.seller_type || 'BUSINESS',
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

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploadingProof(true);
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `proofs/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const url = await uploadFile('marketplace', fileName, file);
      setFormData(prev => ({ ...prev, proofUrl: url }));
    } catch (err: any) {
      alert("Payment proof upload failed: " + err.message);
    } finally {
      setUploadingProof(false);
    }
  };

  const handleSignup = async (role: 'BUYER' | 'SELLER') => {
    if (!supabase) return;
    setLoading(true);
    try {
      if (role === 'SELLER') {
        const { data: exists, error: checkError } = await supabase
          .rpc('check_seller_exists', { checked_email: formData.email });
        
        if (checkError) console.error("Check failed:", checkError);
        if (exists) {
          throw new Error("This email is already registered as a seller. Please login instead.");
        }
      }

      const activePlan = formData.plan || 'BUSINESS_1000';
      const effectiveSellerType = activePlan === 'INDIVIDUAL_100' ? 'INDIVIDUAL' : 'BUSINESS';

      // Portal-specific category resolution
      const effectiveCategory = portalType === 'RENTAL' ? (formData.category || 'Rentals & Leases') :
        portalType === 'PROPERTY' ? (formData.category || 'Property & Real Estate') :
        portalType === 'MOTOR' ? (formData.category || 'Cars & Vehicles') :
        (formData.category || 'General');

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: formData.name,
            mobile: formData.mobile,
            role: role,
            city: formData.city,
            seller_type: effectiveSellerType,
            seller_plan: activePlan,
            tier: effectiveSellerType === 'BUSINESS' ? 'PREMIUM' : 'BASIC',
            shop_name: effectiveSellerType === 'BUSINESS' ? (formData.shopName || `${formData.name}'s Shop`) : formData.name,
            address: formData.shopAddress || '',
            bazaar: formData.bazaar || 'General',
            category: effectiveCategory,
            portal_type: portalType,
            cnic_license: cnicLicense,
            payment_method: formData.paymentMethod,
            payment_trx_id: formData.trxId,
            payment_proof_url: formData.proofUrl
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Registration failed to create user.");

      // Ensure profile record is upserted immediately
      const profilePayload = {
        id: authData.user.id,
        name: formData.name,
        email: formData.email,
        role: role,
        mobile: formData.mobile,
        city: formData.city,
        seller_type: effectiveSellerType,
        seller_plan: activePlan,
        subscription_tier: effectiveSellerType === 'BUSINESS' ? 'PREMIUM' : 'BASIC',
        address: formData.shopAddress || '',
        shop_name: effectiveSellerType === 'BUSINESS' ? (formData.shopName || `${formData.name}'s Shop`) : formData.name
      };
      const { error: profErr } = await supabase.from('profiles').upsert(profilePayload);
      if (profErr) console.warn("Profile upsert notice:", profErr.message);

      if (role === 'SELLER') {
        // Create shop explicitly if needed
        const { error: shopErr } = await supabase.from('shops').insert({
          owner_id: authData.user.id,
          name: effectiveSellerType === 'BUSINESS' ? (formData.shopName || `${formData.name}'s Shop`) : formData.name,
          bazaar: formData.bazaar,
          category: effectiveCategory,
          city: formData.city,
          seller_type: effectiveSellerType,
          seller_plan: activePlan,
          status: 'PENDING',
          portal_type: portalType,
          cnic_license: cnicLicense,
          payment_status: formData.trxId || formData.proofUrl ? 'PENDING' : 'UNPAID',
          payment_method: formData.paymentMethod,
          payment_trx_id: formData.trxId,
          payment_proof_url: formData.proofUrl,
          mobile: formData.mobile,
          whatsapp: formData.mobile,
          address: formData.shopAddress
        });
        if (shopErr) console.warn("Shop auto-create notice:", shopErr.message);

        setView('PENDING');
      } else {
        if (authData.session) {
           setUser({
              id: authData.user.id,
              name: formData.name,
              role: 'BUYER',
              mobile: formData.mobile,
              address: '',
              city: formData.city
           });
           navigate('/');
        } else {
           setView('CHECK_EMAIL');
        }
      }
    } catch (err: any) {
      alert("Registration Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (view === 'CHECK_EMAIL') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-white animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner mb-8">
        <Mail className="w-12 h-12" />
      </div>
      <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 mb-4">Verify Your Email</h2>
      <div className="p-8 bg-pink-50 rounded-[2.5rem] border-2 border-pink-100 max-w-sm mx-auto mb-8">
         <p className="text-pink-700 font-bold mb-4">Check your inbox ({formData.email})</p>
         <div className="flex items-start gap-3 text-left p-4 bg-white/50 rounded-2xl border border-pink-100">
            <AlertTriangle className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] font-black uppercase text-pink-600 tracking-wider">
              Note: Please check your <span className="underline">SPAM</span> or Junk folder. Emails often land there!
            </p>
         </div>
      </div>
      <button onClick={() => setView('LOGIN')} className="w-full max-w-xs bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 transition-all">Back to Login</button>
    </div>
  );

  if (view === 'PENDING') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-white animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-pink-50 text-pink-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner mb-8">
        <CheckCircle className="w-12 h-12" />
      </div>
      <div className="space-y-4 max-w-sm mx-auto mb-10">
        <h2 className="text-3xl font-black uppercase italic text-pink-600 tracking-tighter">Registration Submitted!</h2>
        <p className="text-gray-500 text-sm font-medium leading-relaxed">
          Your {sellerType === 'INDIVIDUAL' ? 'Individual Seller' : 'Business'} profile for <span className="font-bold text-gray-900">{formData.name}</span> is pending Admin Approval.
          <br/><br/>
          Admin will verify your payment details and activate your listing quota shortly.
        </p>
      </div>
      <button onClick={() => setView('LOGIN')} className="w-full max-w-xs bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 transition-all">Back to Login</button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-pink-600 rounded-[1.5rem] text-white shadow-xl mb-3">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h1 className="text-4xl font-black text-pink-600 uppercase italic tracking-tighter">GHOTKI BAZAR</h1>
        <p className="text-[11px] font-black uppercase text-gray-700 tracking-[0.1em]">Ghotki District ka Local Buy & Sell Marketplace</p>
        <p className="text-[11px] font-bold text-pink-600 font-urdu pt-1">گهوٽڪي ۾ جيڪو کپي، گهوٽڪي بازار تي ڳوليو.</p>
      </div>
      
      {view === 'SIGNUP_CHOICE' ? (
        <div className="w-full space-y-4">
          <button onClick={() => setView('SIGNUP_BUYER')} className="w-full p-6 bg-white border-2 border-gray-100 rounded-[2.5rem] font-black uppercase italic text-gray-900 shadow-sm hover:border-pink-200 transition-all flex items-center justify-between group">
            <div className="text-left">
              <div className="text-base font-black">I am a Buyer</div>
              <div className="text-[10px] text-gray-400 font-normal">Browse products, contact sellers on WhatsApp</div>
            </div>
            <User className="text-pink-500 group-hover:scale-110 transition-transform" />
          </button>

          <button onClick={() => setView('SIGNUP_SELLER')} className="w-full p-6 bg-gray-900 text-white rounded-[2.5rem] font-black uppercase italic shadow-2xl flex items-center justify-between group">
            <div className="text-left">
              <div className="text-base font-black text-pink-400">I want to Sell Products</div>
              <div className="text-[10px] text-gray-300 font-normal">Individual (PKR 100) or Shop Business (PKR 500)</div>
            </div>
            <Store className="text-pink-400 group-hover:scale-110 transition-transform" />
          </button>

          <button onClick={() => setView('LOGIN')} className="w-full text-center text-gray-400 font-black uppercase text-[10px] pt-4 tracking-widest">Already have an account? Login</button>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); view === 'LOGIN' ? handleAuth(e) : handleSignup(view === 'SIGNUP_SELLER' ? 'SELLER' : 'BUYER'); }} className="w-full space-y-4">
          <div className="space-y-3">
            <input required type="email" placeholder="Email Address" className="w-full p-4 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-200 transition-all shadow-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input required type="password" placeholder="Password" className="w-full p-4 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-200 transition-all shadow-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            
            {view !== 'LOGIN' && (
              <>
                <input required type="text" placeholder="Your Full Name" className="w-full p-4 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-200 transition-all shadow-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input required type="tel" placeholder="WhatsApp / Mobile (03xx...)" className="w-full p-4 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-200 transition-all shadow-sm" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Your Location / City</label>
                  <select className="w-full p-4 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-pink-500/10 shadow-sm" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                    {GHOTKI_LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {view === 'SIGNUP_SELLER' && (
              <div className="space-y-5 pt-4 border-t border-gray-100 animate-in slide-in-from-top-4">
                
                {/* PORTAL SELECTION */}
                <div className="space-y-2">
                  <p className="text-[11px] font-black uppercase text-gray-900 tracking-wider">Select Portal Category for Your Business</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button 
                      type="button" 
                      onClick={() => { setPortalType('MARKETPLACE'); setFormData({...formData, category: 'General'}); }}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${portalType === 'MARKETPLACE' ? 'border-pink-600 bg-pink-50/50 text-pink-700 shadow-sm' : 'border-gray-100 bg-white text-gray-600'}`}
                    >
                      <ShoppingBag className="w-5 h-5 text-pink-600 flex-shrink-0" />
                      <div>
                        <div className="text-[11px] font-black uppercase">Marketplace</div>
                        <div className="text-[9px] font-bold text-gray-400">Retail Shops</div>
                      </div>
                    </button>

                    <button 
                      type="button" 
                      onClick={() => { setPortalType('RENTAL'); setFormData({...formData, category: 'Rentals & Leases'}); }}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${portalType === 'RENTAL' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm' : 'border-gray-100 bg-white text-gray-600'}`}
                    >
                      <KeyRound className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <div>
                        <div className="text-[11px] font-black uppercase">Rentals</div>
                        <div className="text-[9px] font-bold text-gray-400">Cars & Items</div>
                      </div>
                    </button>

                    <button 
                      type="button" 
                      onClick={() => { setPortalType('PROPERTY'); setFormData({...formData, category: 'Property & Real Estate'}); }}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${portalType === 'PROPERTY' ? 'border-emerald-600 bg-emerald-50/50 text-emerald-700 shadow-sm' : 'border-gray-100 bg-white text-gray-600'}`}
                    >
                      <Building2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <div className="text-[11px] font-black uppercase">Real Estate</div>
                        <div className="text-[9px] font-bold text-gray-400">Property Agency</div>
                      </div>
                    </button>

                    <button 
                      type="button" 
                      onClick={() => { setPortalType('MOTOR'); setFormData({...formData, category: 'Cars & Vehicles'}); }}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${portalType === 'MOTOR' ? 'border-amber-600 bg-amber-50/50 text-amber-700 shadow-sm' : 'border-gray-100 bg-white text-gray-600'}`}
                    >
                      <Car className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div>
                        <div className="text-[11px] font-black uppercase">Motors</div>
                        <div className="text-[9px] font-bold text-gray-400">Car Dealerships</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* SELLER PLAN SELECTION */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black uppercase text-gray-900 tracking-wider">Select Seller Plan & Registration</p>
                    <span className="text-[9px] font-black uppercase tracking-widest text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">Official Pricing</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SELLER_PLANS.map(p => {
                      const isSelected = formData.plan === p.id;
                      const isTarget = p.target;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSellerType(p.type as SellerType);
                            setFormData({ ...formData, plan: p.id as SellerPlan });
                          }}
                          className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                            isSelected
                              ? isTarget 
                                ? 'border-amber-500 bg-gradient-to-br from-amber-50/90 via-orange-50 to-pink-50 text-gray-900 shadow-lg ring-2 ring-amber-400/50 scale-[1.01]' 
                                : 'border-pink-600 bg-pink-50/50 text-pink-900 shadow-sm'
                              : isTarget
                                ? 'border-amber-200 bg-amber-50/30 text-gray-800 hover:border-amber-400'
                                : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                          }`}
                        >
                          {p.badge && (
                            <span className={`absolute -top-2.5 right-3 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow-sm ${
                              isTarget ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black' : 'bg-gray-800 text-white'
                            }`}>
                              {p.badge}
                            </span>
                          )}

                          <div className="space-y-1 mt-1">
                            <div className="flex items-center gap-1.5">
                              {p.type === 'INDIVIDUAL' ? <UserCheck className="w-4 h-4 text-pink-600" /> : <Store className="w-4 h-4 text-amber-600" />}
                              <div className="text-xs font-black uppercase tracking-tight text-gray-900">{p.title}</div>
                            </div>
                            <div className="text-sm font-black text-pink-600">{p.priceLabel}</div>
                            <p className="text-[10px] text-gray-600 font-medium leading-tight">{p.description}</p>
                          </div>

                          <div className="mt-2 pt-2 border-t border-black/5 text-[9px] font-bold text-gray-700">
                            ✓ {p.quota}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* DYNAMIC PORTAL INPUTS */}
                <div className="space-y-3">
                  <input 
                    required 
                    type="text" 
                    placeholder={
                      portalType === 'RENTAL' ? 'Rental Outlet / Business Name (e.g. Ghotki Rent-a-Car)' :
                      portalType === 'PROPERTY' ? 'Real Estate Agency Name (e.g. Sukkur Property Advisors)' :
                      portalType === 'MOTOR' ? 'Motor Dealership / Showroom Name (e.g. Indus Motors Showroom)' :
                      'Shop / Brand Name'
                    } 
                    className="w-full p-4 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-pink-500/10 shadow-sm" 
                    value={formData.shopName} 
                    onChange={e => setFormData({...formData, shopName: e.target.value})} 
                  />

                  <textarea 
                    required 
                    placeholder={
                      portalType === 'RENTAL' ? 'Office / Garage Address in Ghotki District' :
                      portalType === 'PROPERTY' ? 'Real Estate Agency Office Location' :
                      portalType === 'MOTOR' ? 'Vehicle Showroom Physical Location' :
                      'Shop Address (e.g. Main Bazar Ghotki, Shop #12)'
                    } 
                    className="w-full p-4 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-pink-500/10 h-20 shadow-sm" 
                    value={formData.shopAddress} 
                    onChange={e => setFormData({...formData, shopAddress: e.target.value})} 
                  />

                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="CNIC / Business Registration # (Verification)" 
                      className="w-full pl-10 pr-4 py-4 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-pink-500/10 shadow-sm" 
                      value={cnicLicense} 
                      onChange={e => setCnicLicense(e.target.value)} 
                    />
                  </div>

                  {portalType === 'MARKETPLACE' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Main Shop Category</label>
                      <select required className="w-full p-4 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        {CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* PAYMENT INSTRUCTIONS */}
                {(() => {
                  const currentPlan = SELLER_PLANS.find(p => p.id === formData.plan) || SELLER_PLANS[2];
                  return (
                    <div className="p-5 bg-gradient-to-br from-pink-50 via-purple-50 to-amber-50 rounded-2xl border border-pink-200 space-y-3 text-left shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-pink-700 font-black text-xs uppercase tracking-wider">
                          <CreditCard className="w-4 h-4" /> Payment Instructions
                        </div>
                        <span className="text-[10px] font-black bg-pink-600 text-white px-3 py-1 rounded-full uppercase tracking-wider">
                          Amount: {currentPlan.priceLabel}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 font-medium">
                        Please send <span className="font-black text-gray-900 bg-amber-100 px-2 py-0.5 rounded-md">{currentPlan.priceLabel}</span> for <strong>{currentPlan.title}</strong> to any verified admin account below:
                      </p>

                      <div className="bg-white p-4 rounded-xl border border-pink-200 text-xs space-y-2 font-mono shadow-sm">
                        <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                          <span className="font-bold text-emerald-700 flex items-center gap-1">📱 EasyPaisa:</span>
                          <span className="font-black text-gray-900 text-sm select-all">{PAYMENT_ACCOUNTS.easypaisa.accountNumber}</span>
                        </div>
                        <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                          <span className="font-bold text-red-600 flex items-center gap-1">📱 JazzCash:</span>
                          <span className="font-black text-gray-900 text-sm select-all">{PAYMENT_ACCOUNTS.jazzcash.accountNumber}</span>
                        </div>
                        <div className="text-[10px] text-gray-600 font-sans pt-1">
                          Account Title: <strong className="text-gray-900 font-bold">{PAYMENT_ACCOUNTS.easypaisa.accountName}</strong>
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
                        <input 
                          type="text" 
                          required
                          placeholder="Transaction ID / TRX ID (Required)" 
                          className="w-full p-3.5 bg-white border border-pink-200 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-pink-500/30" 
                          value={formData.trxId} 
                          onChange={e => setFormData({...formData, trxId: e.target.value})} 
                        />

                        <div className="flex items-center gap-2">
                          <label className="flex-1 bg-white border border-pink-200 text-pink-600 p-3.5 rounded-xl text-xs font-bold text-center cursor-pointer hover:bg-pink-100/50 transition-colors shadow-sm">
                            {uploadingProof ? 'Uploading Proof...' : (formData.proofUrl ? '✓ Payment Proof Screenshot Attached' : 'Attach Payment Receipt / Screenshot')}
                            <input type="file" accept="image/*" className="hidden" onChange={handleProofUpload} />
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          <button disabled={loading} className="w-full bg-pink-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-pink-200 uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 active:scale-95 transition-all">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (view === 'LOGIN' ? 'Secure Login' : 'Submit Registration')}
          </button>
          
          <button type="button" onClick={() => setView(view === 'LOGIN' ? 'SIGNUP_CHOICE' : 'LOGIN')} className="w-full text-center text-gray-400 font-black uppercase text-[10px] pt-2 tracking-[0.2em]">
            {view === 'LOGIN' ? "New to Ghotki Bazar? Register" : 'Already have an account? Login'}
          </button>
        </form>
      )}
    </div>
  );
};

export default LoginView;
