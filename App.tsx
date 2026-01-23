
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User as UserIcon, Search, ShoppingCart, LayoutDashboard, Database, ShieldAlert } from 'lucide-react';
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
import CheckoutView from './views/CheckoutView';

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
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session.user.id);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) fetchProfile(session.user.id);
      else setUser(null);
    });

    loadMarketplace();
    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchProfile = async (id: string) => {
    if (!supabase) return;
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const meta = authUser.user_metadata || {};
        const finalRole = profile?.role || meta.role || 'BUYER';
        
        const userData = {
          id,
          name: profile?.name || meta.full_name || 'Bazar User',
          role: finalRole,
          subscription_tier: profile?.subscription_tier || meta.tier || 'NONE',
          mobile: profile?.mobile || meta.mobile || ''
        };

        if (!profile) {
          await supabase.from('profiles').upsert(userData);
        }
        
        setUser(userData as UserType);
      }
    } catch (e) {
      console.error("Profile Error:", e);
    }
  };

  const loadMarketplace = async () => {
    if (!supabase) return;
    try {
      const [pRes, sRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('shops').select('*')
      ]);
      if (pRes.data) setProducts(pRes.data.map((p: any) => ({ ...p, images: p.image_urls || [], shopId: p.shop_id, videoUrl: p.video_url })));
      if (sRes.data) setShops(sRes.data.map((s: any) => ({ ...s, logo: s.logo_url || 'https://via.placeholder.com/150', banner: s.banner_url || 'https://via.placeholder.com/800x400' })));
    } catch (err) {
      console.error("Data Load Error:", err);
    }
  };

  const fetchOrders = async () => {
    if (!supabase || !user) return;
    const { data } = await supabase.from('orders').select('*').or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
    if (data) setOrders(data.map(o => ({ ...o, buyerId: o.buyer_id, sellerId: o.seller_id, createdAt: o.created_at })));
  };

  const handlePlaceOrder = async (order: Order) => {
    if (!supabase) return;
    const { error } = await supabase.from('orders').insert({
      buyer_id: order.buyerId,
      seller_id: order.sellerId,
      items: order.items,
      subtotal: order.subtotal,
      delivery_fee: order.deliveryFee,
      platform_fee: 1000,
      total: order.total,
      status: 'PENDING',
      payment_method: order.paymentMethod,
      buyer_name: order.buyerName,
      buyer_mobile: order.buyerMobile,
      buyer_address: order.buyerAddress
    });
    if (!error) fetchOrders();
  };

  if (!supabase) return <div className="p-20 text-center uppercase font-black">Database Connection Missing</div>;

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b flex items-center justify-between px-4 z-50">
        <h1 onClick={() => navigate('/')} className="text-pink-600 font-black text-xl italic uppercase cursor-pointer">GLB BAZAR</h1>
        <div className="flex items-center gap-3">
          {user?.role === 'ADMIN' && <ShieldAlert onClick={() => navigate('/admin')} className="w-5 h-5 text-orange-500 cursor-pointer" />}
          <UserIcon onClick={() => navigate('/profile')} className="w-6 h-6 text-gray-400 cursor-pointer" />
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<BuyerHome shops={shops} products={products} addToCart={() => {}} lang={lang} user={user} onPlaceOrder={handlePlaceOrder} />} />
        <Route path="/explore" element={<ExploreView products={products} addToCart={() => {}} onPlaceOrder={handlePlaceOrder} user={user} />} />
        <Route path="/shops" element={<ShopsListView shops={shops} lang={lang} />} />
        <Route path="/shop/:id" element={<ShopView shops={shops} products={products} addToCart={() => {}} lang={lang} />} />
        <Route path="/product/:id" element={<ProductView products={products} addToCart={() => {}} lang={lang} />} />
        <Route path="/login" element={<LoginView setUser={setUser} lang={lang} />} />
        <Route path="/profile" element={user ? <ProfileView user={user} onLogout={() => { supabase.auth.signOut(); setUser(null); navigate('/login'); }} lang={lang} /> : <Navigate to="/login" />} />
        <Route path="/admin" element={user?.role === 'ADMIN' ? <AdminDashboard shops={shops} setShops={setShops} orders={orders} /> : <Navigate to="/" />} />
        <Route path="/seller/*" element={user?.role === 'SELLER' ? <SellerDashboard products={products} user={user} addProduct={p => setProducts([p, ...products])} orders={orders} shops={shops} /> : <Navigate to="/login" />} />
      </Routes>

      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around z-50">
        <Home onClick={() => navigate('/')} className="w-6 h-6 text-gray-400" />
        <Search onClick={() => navigate('/explore')} className="w-6 h-6 text-gray-400" />
        <ShoppingBag onClick={() => navigate('/shops')} className="w-6 h-6 text-gray-400" />
        {user?.role === 'SELLER' ? <LayoutDashboard onClick={() => navigate('/seller')} className="w-6 h-6 text-pink-600" /> : <ShoppingCart onClick={() => navigate('/cart')} className="w-6 h-6 text-gray-400" />}
      </div>
    </div>
  );
};

export default App;
