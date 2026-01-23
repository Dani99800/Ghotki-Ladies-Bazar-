
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
  LayoutDashboard, Database, ShieldAlert
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
import SellerDashboard from './views/SellerDashboard';
import AdminDashboard from './views/AdminDashboard';
import OrdersView from './views/OrdersView';

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

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session.user.id);
    });

    // Listen for Auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchProfile(session.user.id);
      else setUser(null);
    });

    loadMarketplace();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchProfile = async (id: string) => {
    if (!supabase) return;
    try {
      // 1. Get auth user metadata as backup
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) return;

      // 2. Try to fetch DB record
      const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      
      const meta = authUser.user_metadata || {};
      const fallbackRole = meta?.role || 'BUYER';
      const fallbackName = meta?.full_name || 'User';

      if (!profile) {
        console.warn("Profile missing in DB. Attempting auto-heal.");
        
        const newProfile = {
          id: id,
          name: fallbackName,
          mobile: meta?.mobile || '',
          role: fallbackRole,
          address: ''
        };

        // Re-syncing database row
        await supabase.from('profiles').upsert(newProfile);
        
        if (fallbackRole === 'SELLER' && meta?.shop_name) {
          await supabase.from('shops').upsert({
            owner_id: id,
            name: meta.shop_name,
            bazaar: meta.bazaar || 'General',
            category: meta.category || 'Women',
            status: 'PENDING'
          });
        }
        setUser(newProfile as UserType);
      } else {
        setUser({ ...profile } as UserType);
      }
    } catch (e) {
      console.error("Profile Fetch Exception:", e);
    }
  };

  const fetchOrders = async () => {
    if (!supabase || !user) return;
    const { data } = await supabase
      .from('orders')
      .select('*')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('created_at', { ascending: false });
    
    if (data) {
      setOrders(data.map(o => ({
        ...o,
        buyerId: o.buyer_id,
        sellerId: o.seller_id,
        items: o.items || [],
        createdAt: o.created_at,
        isDeliveryPaidAdvance: o.is_delivery_paid_advance
      })));
    }
  };

  const loadMarketplace = async () => {
    if (!supabase) return;
    try {
      const [pRes, sRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('shops').select('*')
      ]);
      
      if (pRes.data) setProducts(pRes.data.map((p: any) => ({
        ...p,
        images: p.image_urls || [],
        shopId: p.shop_id
      })));
      
      if (sRes.data) setShops(sRes.data.map((s: any) => ({
        ...s,
        ownerName: s.owner_name || 'Owner',
        logo: s.logo_url || s.logo || 'https://via.placeholder.com/150',
        banner: s.banner_url || s.banner || 'https://via.placeholder.com/800x400',
        owner_id: s.owner_id
      })));
    } catch (e) {
      console.error("Supabase Load Error", e);
    }
  };

  const handlePlaceOrder = async (order: Order) => {
    if (!supabase) return;
    const { error } = await supabase.from('orders').insert({
      buyer_id: order.buyerId,
      seller_id: order.sellerId,
      items: order.items,
      subtotal: order.subtotal,
      delivery_fee: order.deliveryFee,
      platform_fee: order.platformFee,
      total: order.total,
      delivery_type: order.deliveryType,
      status: order.status,
      payment_method: order.paymentMethod,
      is_delivery_paid_advance: order.isDeliveryPaidAdvance,
      buyer_name: order.buyerName,
      buyer_mobile: order.buyerMobile,
      buyer_address: order.buyerAddress
    });

    if (!error) {
      fetchOrders();
    } else {
      console.error("Order Error:", error);
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  };

  if (!supabase) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-pink-100 rounded-3xl flex items-center justify-center text-pink-600 mb-6 animate-pulse">
          <Database className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Connect Supabase</h1>
        <p className="text-gray-500 text-sm max-w-xs mb-8">Add credentials to environment variables to enable the Ghotki database.</p>
        <button onClick={() => window.location.reload()} className="bg-gray-900 text-white font-black py-4 px-10 rounded-2xl text-[10px] uppercase tracking-widest mt-4">Refresh App</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-gray-50 text-gray-900 overflow-x-hidden">
      <Navbar user={user} lang={lang} setLang={setLang} />
      
      <Routes>
        <Route path="/" element={<BuyerHome shops={shops} products={products} addToCart={p => setCart([...cart, {...p, quantity: 1}])} lang={lang} user={user} onPlaceOrder={handlePlaceOrder} />} />
        <Route path="/explore" element={<ExploreView products={products} addToCart={() => {}} onPlaceOrder={handlePlaceOrder} user={user} />} />
        <Route path="/shops" element={<ShopsListView shops={shops} lang={lang} />} />
        <Route path="/shop/:id" element={<ShopView shops={shops} products={products} addToCart={() => {}} lang={lang} />} />
        <Route path="/product/:id" element={<ProductView products={products} addToCart={() => {}} lang={lang} />} />
        <Route path="/login" element={<LoginView setUser={setUser} lang={lang} />} />
        <Route path="/profile" element={user ? <ProfileView user={user} onLogout={handleLogout} lang={lang} /> : <Navigate to="/login" />} />
        <Route path="/orders" element={user ? <OrdersView orders={orders} user={user} shops={shops} /> : <Navigate to="/login" />} />
        <Route path="/admin" element={user?.role === 'ADMIN' ? <AdminDashboard shops={shops} setShops={setShops} orders={orders} /> : <Navigate to="/" />} />
        <Route path="/seller/*" element={user?.role === 'SELLER' ? <SellerDashboard products={products} user={user} addProduct={(p) => setProducts([p, ...products])} orders={orders} notifications={[]} markRead={() => {}} shops={shops} /> : <Navigate to="/login" />} />
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
        <h1 onClick={() => navigate('/')} className="text-pink-600 font-bold text-xl cursor-pointer tracking-tight italic uppercase">GLB <span className="text-gray-400 font-normal">Bazar</span></h1>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setLang(lang === 'EN' ? 'UR' : 'EN')} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border-2 border-pink-50 rounded-xl text-pink-600">{lang === 'EN' ? 'اردو' : 'English'}</button>
        {user ? (
          <div className="flex items-center gap-2">
            {user.role === 'ADMIN' && <ShieldAlert onClick={() => navigate('/admin')} className="w-5 h-5 text-orange-500 cursor-pointer" />}
            <div onClick={() => navigate('/profile')} className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-black text-sm cursor-pointer uppercase">{user.name?.[0] || 'U'}</div>
          </div>
        ) : <button onClick={() => navigate('/login')} className="text-pink-600 font-black uppercase text-[10px]">Login</button>}
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
            <item.icon className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default App;
