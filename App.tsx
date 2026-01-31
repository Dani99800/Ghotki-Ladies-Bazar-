
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User as UserIcon, ShoppingCart, LayoutDashboard, ShieldAlert, PlayCircle, Loader2 } from 'lucide-react';
import { supabase } from './services/supabase';
import { User as UserType, Shop, Product, CartItem, Order, Category, AppEvent } from './types';
import { CATEGORIES as FALLBACK_CATEGORIES, NOTIFICATION_SOUND, PK_EVENTS } from './constants';
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
  const location = useLocation();
  const [user, setUser] = useState<UserType | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState<AppEvent>(PK_EVENTS[0]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedEventId = localStorage.getItem('glb_active_event');
    if (savedEventId) {
      const found = PK_EVENTS.find(e => e.id === savedEventId);
      if (found) setActiveEvent(found);
    }
    audioRef.current = new Audio(NOTIFICATION_SOUND);
  }, []);

  const handleUpdateEvent = (event: AppEvent) => {
    setActiveEvent(event);
    localStorage.setItem('glb_active_event', event.id);
  };

  const loadMarketplace = useCallback(async () => {
    if (!supabase) return;
    try {
      console.log("Fetching Marketplace Data from Supabase...");
      const [pRes, sRes, cRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('shops').select('*'),
        supabase.from('categories').select('*')
      ]);
      
      if (sRes.error) console.error("Shops Fetch Error:", sRes.error);
      if (pRes.error) console.error("Products Fetch Error:", pRes.error);

      const mappedShops = (sRes.data || []).map((s: any) => ({ 
        ...s, 
        logo: s.logo_url || s.logo || 'https://via.placeholder.com/150', 
        banner: s.banner_url || s.banner || 'https://via.placeholder.com/800x400' 
      }));
      setShops(mappedShops);
      
      const mappedProducts = (pRes.data || []).map((p: any) => ({ 
        ...p, 
        shopId: p.shop_id || p.shopId, 
        // Handle both image_url (string) and image_urls (array)
        images: Array.isArray(p.image_urls) ? p.image_urls : (p.image_url ? [p.image_url] : (p.images || [])),
        videoUrl: p.video_url || p.videoUrl,
        createdAt: p.created_at || p.createdAt,
        tags: p.tags || []
      })).sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      
      setProducts(mappedProducts);
      setCategories(cRes.data && cRes.data.length > 0 ? cRes.data : FALLBACK_CATEGORIES);
      
      console.log(`Sync Complete: ${mappedShops.length} shops, ${mappedProducts.length} products found.`);
    } catch (err) { 
      console.error("Critical Marketplace Fetch Error:", err); 
    }
  }, []);

  const fetchProfile = useCallback(async (id: string) => {
    if (!supabase) return;
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const meta = authUser.user_metadata || {};
        const finalRole = profile?.role || meta?.role || 'BUYER';
        
        setUser({
          id,
          name: profile?.name || meta.full_name || 'Bazar User',
          role: finalRole as any,
          mobile: profile?.mobile || meta.mobile || '',
          address: profile?.address || meta.address || '',
          city: profile?.city || meta.city || 'Ghotki',
          subscription_tier: profile?.subscription_tier || meta.tier || 'NONE'
        });
      }
    } catch (e) { 
      console.error("Profile Fetch Error:", e); 
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        if (!supabase) {
          setLoading(false);
          return;
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetchProfile(session.user.id);
        }
        
        await loadMarketplace();
      } catch (e) {
        console.error("App Initialization Failed:", e);
      } finally {
        setLoading(false);
      }
    };
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchProfile(session.user.id);
      else { setUser(null); }
    });
    return () => authListener.subscription.unsubscribe();
  }, [loadMarketplace, fetchProfile]);

  const fetchOrders = useCallback(async () => {
    if (!supabase || !user) return;
    const myShop = shops.find(s => s.owner_id === user.id);
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    
    if (user.role === 'SELLER' && myShop) {
      query = query.or(`buyer_id.eq.${user.id},seller_id.eq.${myShop.id}`);
    } else if (user.role === 'ADMIN') {
      // Admin sees everything
    } else {
      query = query.eq('buyer_id', user.id);
    }

    const { data } = await query;
    if (data) {
      setOrders(data.map(o => ({ 
        ...o, 
        buyerId: o.buyer_id, 
        sellerId: o.seller_id, 
        createdAt: o.created_at,
        buyerName: o.buyer_name, 
        buyerMobile: o.buyer_mobile, 
        buyerAddress: o.buyer_address
      })));
    }
  }, [user, shops]);

  useEffect(() => {
    if (user && shops.length > 0) {
      fetchOrders();
    }
  }, [user, shops, fetchOrders]);

  const handlePlaceOrder = async (order: Order) => {
    if (!supabase) return;
    const isGuest = order.buyerId.startsWith('guest_');
    const { error } = await supabase.from('orders').insert({
      buyer_id: isGuest ? null : order.buyerId,
      seller_id: order.sellerId, 
      items: order.items,
      subtotal: order.subtotal,
      delivery_fee: order.deliveryFee,
      platform_fee: order.platformFee || 1000,
      total: order.total,
      status: 'PENDING',
      payment_method: order.paymentMethod,
      buyer_name: order.buyerName,
      buyer_mobile: order.buyerMobile,
      buyer_address: order.buyerAddress
    });
    if (error) throw error;
    fetchOrders(); 
  };

  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === p.id);
      if (existing) return prev.map(item => item.id === p.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...p, quantity: 1 }];
    });
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: PlayCircle, label: 'Live', path: '/explore' },
    { icon: ShoppingBag, label: 'Shops', path: '/shops' },
    { icon: user?.role === 'SELLER' ? LayoutDashboard : ShoppingCart, label: user?.role === 'SELLER' ? 'Dashboard' : 'Cart', path: user?.role === 'SELLER' ? '/seller' : '/cart' },
  ];

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-pink-50 border-t-pink-600 rounded-full animate-spin"></div>
        <ShoppingBag className="absolute inset-0 m-auto w-6 h-6 text-pink-600" />
      </div>
      <div className="text-center space-y-1">
        <p className="font-black uppercase tracking-widest text-[11px] text-gray-900 italic">GLB BAZAR</p>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Digitizing Ghotki Legacy</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ '--primary-event': activeEvent.primaryColor, '--accent-event': activeEvent.accentColor } as React.CSSProperties}>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-6 z-50 shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-lg" style={{ background: activeEvent.primaryColor }}>
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h1 className="text-gray-900 font-black text-xl italic uppercase tracking-tighter">GLB BAZAR</h1>
        </div>
        <div className="flex items-center gap-4">
          {user?.role === 'ADMIN' && <ShieldAlert onClick={() => navigate('/admin')} className="w-5 h-5 text-orange-500 cursor-pointer animate-pulse" />}
          <UserIcon onClick={() => navigate('/profile')} className="w-6 h-6 text-gray-400 cursor-pointer hover:text-pink-600 transition-colors" />
        </div>
      </nav>

      <main className="flex-1 pt-16 pb-24 md:pb-0">
        <Routes>
          <Route path="/" element={<BuyerHome shops={shops} products={products} categories={categories} addToCart={addToCart} lang="EN" user={user} onPlaceOrder={handlePlaceOrder} activeEvent={activeEvent} />} />
          <Route path="/explore" element={<ExploreView products={products} addToCart={addToCart} onPlaceOrder={handlePlaceOrder} user={user} savedProductIds={[]} onToggleSave={() => {}} />} />
          <Route path="/shops" element={<ShopsListView shops={shops} lang="EN" />} />
          <Route path="/shop/:id" element={<ShopView shops={shops} products={products} addToCart={addToCart} lang="EN" user={user} onPlaceOrder={handlePlaceOrder} />} />
          <Route path="/product/:id" element={<ProductView products={products} addToCart={addToCart} lang="EN" />} />
          <Route path="/cart" element={<CartView cart={cart} removeFromCart={id => setCart(cart.filter(c => c.id !== id))} updateQuantity={(id, d) => setCart(cart.map(c => c.id === id ? {...c, quantity: Math.max(1, c.quantity+d)} : c))} lang="EN" />} />
          <Route path="/login" element={<LoginView setUser={setUser} lang="EN" />} />
          <Route path="/profile" element={user ? <ProfileView user={user} onLogout={() => { supabase?.auth.signOut(); setUser(null); navigate('/login'); }} lang="EN" /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.role === 'ADMIN' ? <AdminDashboard shops={shops} setShops={setShops} orders={orders} refreshData={loadMarketplace} categories={categories} activeEvent={activeEvent} onUpdateEvent={handleUpdateEvent} /> : <Navigate to="/" />} />
          <Route path="/seller/*" element={user?.role === 'SELLER' ? <SellerDashboard products={products} user={user} addProduct={loadMarketplace} orders={orders} shops={shops} refreshShop={loadMarketplace} /> : <Navigate to="/login" />} />
          <Route path="/checkout" element={<CheckoutView cart={cart} clearCart={() => setCart([])} user={user} lang="EN" onPlaceOrder={handlePlaceOrder} shops={shops} />} />
          <Route path="/orders" element={user ? <OrdersView orders={orders} user={user} shops={shops} /> : <Navigate to="/login" />} />
        </Routes>
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t flex items-center justify-around z-50 px-2 shadow-2xl md:hidden">
        {navItems.map(item => (
          <button key={item.path} onClick={() => navigate(item.path)} className="flex flex-col items-center gap-1 group">
            <div className={`p-2 rounded-2xl transition-all duration-300 ${location.pathname === item.path ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-400 group-hover:text-pink-600'}`}>
              <item.icon className="w-6 h-6" />
            </div>
            <span className={`text-[8px] font-black uppercase tracking-widest ${location.pathname === item.path ? 'text-pink-600' : 'text-gray-400'}`}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
