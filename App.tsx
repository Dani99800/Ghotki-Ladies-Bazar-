
import React, { useState, useEffect } from 'react';
import { 
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  useLocation 
} from 'react-router-dom';
import { 
  Home, ShoppingBag, User as UserIcon, Search, ShoppingCart, 
  LayoutDashboard, AlertCircle, Database, Settings
} from 'lucide-react';

import { supabase } from './services/supabase';
import { User as UserType, Shop, Product, CartItem, Order } from './types';
import BuyerHome from './views/BuyerHome';
import ShopView from './views/ShopView';
import ProductView from './views/ProductView';
import CartView from './views/CartView';
import LoginView from './views/LoginView';
import ExploreView from './views/ExploreView';
import ShopsListView from './views/ShopsListView';
import ProfileView from './views/ProfileView';
// Fix: Import missing SellerDashboard component
import SellerDashboard from './views/SellerDashboard';

const App: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lang, setLang] = useState<'EN' | 'UR'>('EN');

  useEffect(() => {
    if (!supabase) return;

    // Monitor Auth Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session.user.id);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchProfile(session.user.id);
      else setUser(null);
    });

    loadMarketplace();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (id: string) => {
    if (!supabase) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (data) setUser({ ...data });
  };

  const loadMarketplace = async () => {
    if (!supabase) return;
    try {
      const [pRes, sRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('shops').select('*').eq('status', 'APPROVED')
      ]);
      
      if (pRes.data) setProducts(pRes.data.map((p: any) => ({
        ...p,
        images: p.image_urls || [],
        shopId: p.shop_id
      })));
      
      if (sRes.data) setShops(sRes.data);
    } catch (e) {
      console.error("Supabase Load Error", e);
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  };

  // Graceful degradation: If Supabase is not connected, show an setup screen
  if (!supabase) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-pink-100 rounded-3xl flex items-center justify-center text-pink-600 mb-6 animate-pulse">
          <Database className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Connect Supabase</h1>
        <p className="text-gray-500 text-sm max-w-xs mb-8">
          To enable Ghotki Bazar database features, please add your Supabase credentials to your environment variables.
        </p>
        <div className="w-full max-w-sm bg-white p-6 rounded-[2rem] shadow-xl border border-gray-100 text-left space-y-4">
          <div className="flex items-start gap-3">
             <div className="w-6 h-6 bg-pink-50 rounded-full flex items-center justify-center text-pink-600 text-[10px] font-bold shrink-0">1</div>
             <p className="text-xs text-gray-600">Go to <b>Project Settings > API</b> in Supabase.</p>
          </div>
          <div className="flex items-start gap-3">
             <div className="w-6 h-6 bg-pink-50 rounded-full flex items-center justify-center text-pink-600 text-[10px] font-bold shrink-0">2</div>
             <p className="text-xs text-gray-600">Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your Environment Variables.</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest mt-4"
          >
            Refresh App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-gray-50 text-gray-900 overflow-x-hidden">
      <Navbar user={user} lang={lang} setLang={setLang} />
      
      <Routes>
        <Route path="/" element={<BuyerHome shops={shops} products={products} addToCart={p => setCart([...cart, {...p, quantity: 1}])} lang={lang} user={user} />} />
        <Route path="/explore" element={<ExploreView products={products} addToCart={() => {}} onPlaceOrder={() => {}} user={user} />} />
        <Route path="/shops" element={<ShopsListView shops={shops} lang={lang} />} />
        <Route path="/shop/:id" element={<ShopView shops={shops} products={products} addToCart={() => {}} lang={lang} />} />
        <Route path="/product/:id" element={<ProductView products={products} addToCart={() => {}} lang={lang} />} />
        <Route path="/login" element={<LoginView setUser={setUser} lang={lang} />} />
        <Route path="/profile" element={user ? <ProfileView user={user} onLogout={handleLogout} lang={lang} /> : <Navigate to="/login" />} />
        <Route path="/seller/*" element={user ? <SellerDashboard products={products} user={user} addProduct={(p) => setProducts([p, ...products])} orders={orders} notifications={[]} markRead={() => {}} shops={shops} /> : <Navigate to="/login" />} />
      </Routes>

      <BottomNav user={user} cartCount={cart.length} />
    </div>
  );
};

const Navbar: React.FC<{ user: UserType | null, lang: 'EN' | 'UR', setLang: (l: 'EN' | 'UR') => void }> = ({ user, lang, setLang }) => {
  const navigate = useNavigate();
  const location = useLocation();
  if (location.pathname === '/explore') return null;

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-50 shadow-sm">
      <div className="flex items-center gap-2">
        <h1 onClick={() => navigate('/')} className="text-pink-600 font-bold text-xl cursor-pointer tracking-tight">GLB <span className="text-gray-400 font-normal">Bazar</span></h1>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setLang(lang === 'EN' ? 'UR' : 'EN')} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border-2 border-pink-50 rounded-xl text-pink-600">{lang === 'EN' ? 'اردو' : 'English'}</button>
        {user ? <div onClick={() => navigate('/profile')} className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-black text-sm cursor-pointer uppercase">{user.name?.[0] || 'U'}</div> : <button onClick={() => navigate('/login')} className="text-pink-600 font-black uppercase text-[10px]">Login</button>}
      </div>
    </nav>
  );
};

const BottomNav: React.FC<{ user: UserType | null, cartCount: number }> = ({ user, cartCount }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSeller = user?.role === 'SELLER';
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: ShoppingBag, label: 'Shops', path: '/shops' },
    ...(isSeller ? [{ icon: LayoutDashboard, label: 'Store', path: '/seller' }] : [{ icon: ShoppingCart, label: 'Cart', path: '/cart', badge: cartCount > 0 ? cartCount : undefined }]),
    { icon: UserIcon, label: 'Account', path: user ? '/profile' : '/login' },
  ];
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-50 shadow-sm">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path === '/seller' && location.pathname.startsWith('/seller'));
        return (
          <button key={item.label} onClick={() => navigate(item.path)} className={`flex flex-col items-center justify-center gap-1 flex-1 ${isActive ? 'text-pink-600' : 'text-gray-400'}`}>
            <item.icon className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default App;
