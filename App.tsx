
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User as UserIcon, Search, ShoppingCart, LayoutDashboard, ShieldAlert, PlayCircle, Bookmark } from 'lucide-react';
import { supabase } from './services/supabase';
import { User as UserType, Shop, Product, CartItem, Order, Category, AppEvent } from './types';
import { PK_EVENTS } from './constants';
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
  const [savedProductIds, setSavedProductIds] = useState<string[]>([]);
  const [lang, setLang] = useState<'EN' | 'UR'>('EN');
  const [loading, setLoading] = useState(true);
  
  // Default to stored event or Normal
  const [activeEvent, setActiveEvent] = useState<AppEvent>(() => {
    const saved = localStorage.getItem('glb_active_event_id');
    return PK_EVENTS.find(e => e.id === saved) || PK_EVENTS[0];
  });

  useEffect(() => {
    const saved = localStorage.getItem('glb_saved_products');
    if (saved) {
      try { setSavedProductIds(JSON.parse(saved)); } catch(e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('glb_saved_products', JSON.stringify(savedProductIds));
  }, [savedProductIds]);

  useEffect(() => {
    if (!supabase) return;
    
    // Auth Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setOrders([]);
        setLoading(false);
      }
    });

    loadMarketplace();
    fetchActiveEvent();

    // REAL-TIME THEME LISTENER
    const settingsChannel = supabase
      .channel('app_settings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings' },
        (payload) => {
          if (payload.new && (payload.new as any).key === 'active_event_id') {
            const newEventId = (payload.new as any).value;
            const found = PK_EVENTS.find(e => e.id === newEventId);
            if (found) {
              setActiveEvent(found);
              localStorage.setItem('glb_active_event_id', found.id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeChannel(settingsChannel);
    };
  }, []);

  useEffect(() => {
    if (user && shops.length > 0) {
      fetchOrders();
    }
  }, [user, shops]);

  const fetchActiveEvent = async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.from('app_settings').select('value').eq('key', 'active_event_id').maybeSingle();
      if (data?.value) {
        const found = PK_EVENTS.find(e => e.id === data.value);
        if (found) {
          setActiveEvent(found);
          localStorage.setItem('glb_active_event_id', found.id);
        }
      }
    } catch (e) {
      console.warn("Event fetch failed.");
    }
  };

  const fetchProfile = async (id: string) => {
    if (!supabase) return;
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const meta = authUser.user_metadata || {};
        const userData = {
          id,
          name: profile?.name || meta.full_name || 'Bazar User',
          role: profile?.role || meta.role || 'BUYER',
          subscription_tier: profile?.subscription_tier || meta.tier || 'NONE',
          mobile: profile?.mobile || meta.mobile || '',
          address: profile?.address || meta.address || ''
        };
        setUser(userData as UserType);
      }
    } catch (e) { 
      console.error("Profile Fetch Error:", e); 
    } finally {
      setLoading(false);
    }
  };

  const loadMarketplace = async () => {
    if (!supabase) return;
    try {
      const [pRes, sRes, cRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('shops').select('*'),
        supabase.from('categories').select('*')
      ]);
      
      if (sRes.data) {
        setShops(sRes.data.map((s: any) => ({ 
          ...s, 
          logo: s.logo_url || 'https://via.placeholder.com/150', 
          banner: s.banner_url || 'https://via.placeholder.com/800x400' 
        })).sort((a, b) => (b.sort_priority || 0) - (a.sort_priority || 0)));
      }
      
      if (pRes.data) {
        setProducts(pRes.data.map((p: any) => ({ 
          ...p, 
          images: p.image_urls || [], 
          shopId: p.shop_id, 
          videoUrl: p.video_url 
        })));
      }

      if (cRes.data) {
        setCategories(cRes.data);
      }
    } catch (err) { 
      console.error("Marketplace Load Error:", err); 
    }
  };

  const fetchOrders = async () => {
    if (!supabase || !user) return;
    const myShop = shops.find(s => s.owner_id === user.id);
    let query = supabase.from('orders').select('*');
    if (myShop) {
      query = query.or(`buyer_id.eq.${user.id},seller_id.eq.${myShop.id}`);
    } else {
      query = query.eq('buyer_id', user.id);
    }
    const { data } = await query.order('created_at', { ascending: false });
    if (data) {
      setOrders(data.map(o => ({ 
        ...o, 
        buyerId: o.buyer_id || `guest_${o.id}`, 
        sellerId: o.seller_id, 
        createdAt: o.created_at,
        buyerName: o.buyer_name,
        buyerMobile: o.buyer_mobile,
        buyerAddress: o.buyer_address
      })));
    }
  };

  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === p.id);
      if (existing) return prev.map(item => item.id === p.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...p, quantity: 1 }];
    });
  };

  const toggleSaveProduct = (productId: string) => {
    setSavedProductIds(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handlePlaceOrder = async (order: Order) => {
    if (!supabase) return;
    const isGuest = !order.buyerId || order.buyerId.toString().includes('guest_');
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

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: PlayCircle, label: 'Live', path: '/explore' },
    { icon: ShoppingBag, label: 'Shops', path: '/shops' },
    ...(user && user.role === 'BUYER' ? [{ icon: Bookmark, label: 'Saved', path: '/saved' }] : []),
    { icon: user?.role === 'SELLER' ? LayoutDashboard : ShoppingCart, label: user?.role === 'SELLER' ? 'Dashboard' : 'Cart', path: user?.role === 'SELLER' ? '/seller' : '/cart' },
  ];

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
        <div className="w-12 h-12 border-4 border-pink-100 border-t-pink-600 rounded-full animate-spin"></div>
        <p className="font-black uppercase tracking-widest text-[10px] text-gray-400">Ghotki Bazar Loading...</p>
      </div>
    );
  }

  // FORCE THEME CSS INJECTION
  const primary = activeEvent.primaryColor;
  const secondary = activeEvent.accentColor;
  
  const themeStyles = `
    :root {
      --primary-event: ${primary};
      --accent-event: ${secondary};
      --accent-bg: ${primary}15;
    }
    
    /* GLOBAL OVERRIDE OF ALL PINK TAILWIND CLASSES */
    .text-pink-600, .text-pink-500, .text-event-primary { color: var(--primary-event) !important; }
    .bg-pink-600, .bg-pink-500, .bg-event-primary { background-color: var(--primary-event) !important; }
    .border-pink-600, .border-pink-500, .border-event-primary { border-color: var(--primary-event) !important; }
    .fill-pink-600, .fill-pink-500 { fill: var(--primary-event) !important; }
    
    .bg-pink-50, .bg-pink-100, .bg-pink-200 { background-color: var(--accent-bg) !important; }
    .text-pink-100, .text-pink-200 { color: var(--accent-event) !important; }
    .border-pink-100, .border-pink-200 { border-color: ${primary}30 !important; }
    
    .text-pink-900 { color: var(--primary-event) !important; filter: brightness(0.6); }
    .hover\\:bg-pink-700:hover, .hover\\:bg-pink-600:hover { background-color: var(--primary-event) !important; filter: brightness(0.9); }
    .focus\\:ring-pink-500:focus, .focus\\:ring-pink-600:focus { --tw-ring-color: var(--primary-event) !important; }
    
    /* Additional high-priority overrides for specific UI elements */
    .shadow-pink-100, .shadow-pink-200 { --tw-shadow-color: ${primary}30 !important; }
    h1[style*="color"] { color: var(--primary-event) !important; }
  `;

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col event-mode-${activeEvent.id}`}>
      <style>{themeStyles}</style>
      
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b flex items-center justify-between px-6 z-50 shadow-sm">
        <h1 onClick={() => navigate('/')} className="font-black text-xl italic uppercase cursor-pointer tracking-tighter" style={{ color: activeEvent.primaryColor }}>
          GLB BAZAR {activeEvent.emoji}
        </h1>
        <div className="hidden md:flex items-center gap-8">
          {navItems.map(item => (
            <button key={item.path} onClick={() => navigate(item.path)} className={`text-xs font-black uppercase tracking-widest transition-colors ${location.pathname === item.path ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'}`}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {user?.role === 'ADMIN' && <ShieldAlert onClick={() => navigate('/admin')} className="w-5 h-5 text-orange-500 cursor-pointer animate-pulse" />}
          <UserIcon onClick={() => navigate('/profile')} className="w-6 h-6 text-gray-400 cursor-pointer hover:text-pink-600 transition-colors" />
        </div>
      </nav>

      <main className="flex-1 pt-16 pb-24 md:pb-0">
        <Routes>
          <Route path="/" element={<BuyerHome shops={shops} products={products} categories={categories} addToCart={addToCart} lang={lang} user={user} onPlaceOrder={handlePlaceOrder} activeEvent={activeEvent} />} />
          <Route path="/explore" element={<ExploreView products={products} addToCart={addToCart} onPlaceOrder={handlePlaceOrder} user={user} savedProductIds={savedProductIds} onToggleSave={toggleSaveProduct} />} />
          <Route path="/saved" element={<ExploreView products={products} addToCart={addToCart} onPlaceOrder={handlePlaceOrder} user={user} savedProductIds={savedProductIds} onToggleSave={toggleSaveProduct} isSavedOnly />} />
          <Route path="/shops" element={<ShopsListView shops={shops} lang={lang} />} />
          <Route path="/shop/:id" element={<ShopView shops={shops} products={products} addToCart={addToCart} lang={lang} user={user} onPlaceOrder={handlePlaceOrder} />} />
          <Route path="/product/:id" element={<ProductView products={products} addToCart={addToCart} lang={lang} />} />
          <Route path="/cart" element={<CartView cart={cart} removeFromCart={id => setCart(cart.filter(c => c.id !== id))} updateQuantity={(id, d) => setCart(cart.map(c => c.id === id ? {...c, quantity: Math.max(1, c.quantity+d)} : c))} lang={lang} />} />
          <Route path="/login" element={<LoginView setUser={setUser} lang={lang} />} />
          <Route path="/profile" element={user ? <ProfileView user={user} onLogout={() => { supabase?.auth.signOut(); setUser(null); navigate('/login'); }} lang={lang} /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.role === 'ADMIN' ? <AdminDashboard shops={shops} setShops={setShops} orders={orders} categories={categories} refreshData={() => { loadMarketplace(); fetchActiveEvent(); return Promise.resolve(); }} activeEvent={activeEvent} /> : <Navigate to="/" />} />
          <Route path="/seller/*" element={user?.role === 'SELLER' ? <SellerDashboard products={products} user={user} addProduct={loadMarketplace} orders={orders} shops={shops} refreshShop={loadMarketplace} /> : <Navigate to="/login" />} />
          <Route path="/checkout" element={<CheckoutView cart={cart} clearCart={() => setCart([])} user={user} lang={lang} onPlaceOrder={handlePlaceOrder} shops={shops} />} />
          <Route path="/orders" element={user ? <OrdersView orders={orders} user={user} shops={shops} /> : <Navigate to="/login" />} />
        </Routes>
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t flex items-center justify-around z-50 px-2 shadow-2xl md:hidden">
        {navItems.map(item => (
          <button key={item.path} onClick={() => navigate(item.path)} className="flex flex-col items-center gap-1 group">
            <div className={`p-2 rounded-2xl transition-all ${location.pathname === item.path ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-400 group-hover:text-pink-600'}`}>
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
