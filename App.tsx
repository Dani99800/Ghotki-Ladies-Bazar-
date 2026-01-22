
import React, { useState, useEffect, useRef } from 'react';
import { 
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  useLocation 
} from 'react-router-dom';
import { 
  Home, 
  ShoppingBag, 
  User as UserIcon, 
  Search,
  ShoppingCart,
  ChevronLeft,
  LayoutDashboard,
  Bell,
  X,
  Volume2
} from 'lucide-react';

import { MOCK_SHOPS, MOCK_PRODUCTS } from './data';
import { User as UserType, Shop, Product, CartItem, Order } from './types';
import BuyerHome from './views/BuyerHome';
import ShopView from './views/ShopView';
import ProductView from './views/ProductView';
import CartView from './views/CartView';
import CheckoutView from './views/CheckoutView';
import AdminDashboard from './views/AdminDashboard';
import SellerDashboard from './views/SellerDashboard';
import LoginView from './views/LoginView';
import ExploreView from './views/ExploreView';
import ShopsListView from './views/ShopsListView';
import ProfileView from './views/ProfileView';

const App: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [shops, setShops] = useState<Shop[]>(MOCK_SHOPS);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeToast, setActiveToast] = useState<any>(null);
  const [lang, setLang] = useState<'EN' | 'UR'>('EN');
  
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    notificationSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    notificationSound.current.load();
    
    // Robust parsing for localStorage to avoid white screen
    const loadSafely = (key: string, setter: (val: any) => void) => {
      try {
        const saved = localStorage.getItem(key);
        if (saved && saved !== "undefined" && saved !== "null") {
          setter(JSON.parse(saved));
        }
      } catch (e) {
        console.error(`Error loading ${key}:`, e);
      }
    };

    loadSafely('glb_user', setUser);
    loadSafely('glb_cart', setCart);
    loadSafely('glb_orders', setOrders);
    loadSafely('glb_notifications', setNotifications);

    const savedProducts = localStorage.getItem('glb_products');
    try {
      if (savedProducts && savedProducts !== "undefined") {
        setProducts(JSON.parse(savedProducts));
      } else {
        setProducts(MOCK_PRODUCTS);
      }
    } catch (e) {
      setProducts(MOCK_PRODUCTS);
    }

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    try {
      if (products.length > 0) {
        localStorage.setItem('glb_products', JSON.stringify(products));
      }
    } catch (e) { console.warn("Quota exceeded"); }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('glb_cart', JSON.stringify(cart));
      localStorage.setItem('glb_orders', JSON.stringify(orders));
      localStorage.setItem('glb_notifications', JSON.stringify(notifications));
    } catch (e) { console.warn("Order/Cart save failed"); }
  }, [cart, orders, notifications]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('glb_user');
    navigate('/login');
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const addProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const placeOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    const notif = {
      id: 'notif_' + Date.now(),
      title: 'New Order Received!',
      message: `Order #${newOrder.id.slice(-4).toUpperCase()} for PKR ${newOrder.total.toLocaleString()}`,
      type: 'ORDER',
      read: false,
      sellerId: newOrder.sellerId,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);
    const isOwner = user && (user.id === newOrder.sellerId || (user.id === 's1' && newOrder.sellerId === 's1'));
    if (isOwner) {
      if (notificationSound.current) {
        notificationSound.current.currentTime = 0;
        notificationSound.current.play().catch(e => {});
      }
      setActiveToast(notif);
      setTimeout(() => setActiveToast(null), 8000);
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(notif.title, { body: notif.message });
      }
    }
  };

  const registerShop = (newShopData: Partial<Shop>) => {
    const shop: Shop = {
      id: 's_' + Math.random().toString(36).substr(2, 9),
      name: newShopData.name || 'New Shop',
      ownerName: newShopData.ownerName || 'Owner',
      mobile: newShopData.mobile || '',
      whatsapp: newShopData.whatsapp || '',
      bazaar: newShopData.bazaar || 'Main Bazar',
      address: newShopData.address || '',
      category: newShopData.category || 'Women',
      logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=200',
      banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800',
      bio: 'Ready to sell on GLB Bazar.',
      status: 'APPROVED',
      isRegistrationPaid: true,
      registrationFee: 2500,
      payoutMethods: ['EasyPaisa'],
      deliveryFee: 150,
      pickupEnabled: true,
      deliveryEnabled: true,
    };
    setShops(prev => [...prev, shop]);
    return shop;
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-gray-50 text-gray-900 overflow-x-hidden">
      {activeToast && (
        <div onClick={() => { setActiveToast(null); navigate('/seller'); }} className="fixed top-4 left-1/2 -translate-x-1/2 w-[94%] max-w-sm z-[2000] animate-in slide-in-from-top-full duration-700 cursor-pointer">
           <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 p-4 flex items-center gap-4 ring-1 ring-black/5">
                <div className="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-pink-200">
                   <Bell className="w-6 h-6 animate-bounce" />
                </div>
                <div className="flex-1 overflow-hidden">
                   <p className="font-black text-[11px] text-pink-600 uppercase tracking-widest mb-1">Store Alert</p>
                   <p className="font-black text-sm text-gray-900 leading-tight truncate">{activeToast.title}</p>
                   <p className="text-[10px] text-gray-500 truncate font-medium">{activeToast.message}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setActiveToast(null); }} className="p-2 text-gray-300 hover:text-gray-400"><X className="w-5 h-5" /></button>
             </div>
        </div>
      )}

      <Navbar user={user} cartCount={cart.length} lang={lang} setLang={(l) => setLang(l)} />
      
      <Routes>
        <Route path="/" element={<BuyerHome shops={shops} products={products} addToCart={addToCart} lang={lang} user={user} onPlaceOrder={placeOrder} />} />
        <Route path="/explore" element={<ExploreView products={products} addToCart={addToCart} onPlaceOrder={placeOrder} user={user} />} />
        <Route path="/shops" element={<ShopsListView shops={shops} lang={lang} />} />
        <Route path="/shop/:id" element={<ShopView shops={shops} products={products} addToCart={addToCart} lang={lang} />} />
        <Route path="/product/:id" element={<ProductView products={products} addToCart={addToCart} lang={lang} />} />
        <Route path="/cart" element={<CartView cart={cart} removeFromCart={(id) => setCart(prev => prev.filter(i => i.id !== id))} updateQuantity={(id, d) => setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i))} lang={lang} />} />
        <Route path="/checkout" element={<CheckoutView cart={cart} clearCart={() => setCart([])} user={user} lang={lang} onPlaceOrder={placeOrder} />} />
        <Route path="/login" element={<LoginView setUser={setUser} registerShop={registerShop} lang={lang} />} />
        <Route path="/profile" element={user ? <ProfileView user={user} onLogout={handleLogout} lang={lang} /> : <Navigate to="/login" />} />
        <Route path="/admin/*" element={user?.role === 'ADMIN' ? <AdminDashboard shops={shops} setShops={setShops} orders={orders} /> : <Navigate to="/login" />} />
        <Route path="/seller/*" element={user ? <SellerDashboard products={products} user={user} addProduct={addProduct} orders={orders} notifications={notifications} markRead={markNotificationRead} shops={shops} /> : <Navigate to="/login" />} />
      </Routes>

      <BottomNav user={user} cartCount={cart.length} notifications={notifications} />
    </div>
  );
};

const Navbar: React.FC<{ user: UserType | null, cartCount: number, lang: 'EN' | 'UR', setLang: (l: 'EN' | 'UR') => void }> = ({ user, cartCount, lang, setLang }) => {
  const navigate = useNavigate();
  const location = useLocation();
  if (location.pathname === '/explore') return null;

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-50 shadow-sm">
      <div className="flex items-center gap-2">
        {location.pathname !== '/' && (
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft className="w-6 h-6" /></button>
        )}
        <h1 onClick={() => navigate('/')} className="text-pink-600 font-bold text-xl cursor-pointer tracking-tight">GLB <span className="text-gray-400 font-normal">Bazar</span></h1>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setLang(lang === 'EN' ? 'UR' : 'EN')} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border-2 border-pink-50 rounded-xl text-pink-600">{lang === 'EN' ? 'اردو' : 'English'}</button>
        <button onClick={() => navigate('/cart')} className="relative p-2">
          <ShoppingCart className="w-6 h-6 text-gray-700" />
          {cartCount > 0 && <span className="absolute top-0 right-0 bg-pink-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white">{cartCount}</span>}
        </button>
        {user ? <div onClick={() => navigate('/profile')} className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-black text-sm cursor-pointer uppercase">{user.name[0]}</div> : <button onClick={() => navigate('/login')} className="text-pink-600 font-black uppercase text-[10px]">Login</button>}
      </div>
    </nav>
  );
};

const BottomNav: React.FC<{ user: UserType | null, cartCount: number, notifications: any[] }> = ({ user, cartCount, notifications }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSeller = user?.role === 'SELLER';
  const unreadNotifs = notifications.filter(n => n.sellerId === user?.id && !n.read).length;
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: ShoppingBag, label: 'Shops', path: '/shops' },
    ...(isSeller ? [{ icon: LayoutDashboard, label: 'Store', path: '/seller', badge: unreadNotifs > 0 ? unreadNotifs : undefined }] : [{ icon: ShoppingCart, label: 'Cart', path: '/cart', badge: cartCount > 0 ? cartCount : undefined }]),
    { icon: UserIcon, label: 'Account', path: user ? '/profile' : '/login' },
  ];
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-50 shadow-sm">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path === '/seller' && location.pathname.startsWith('/seller'));
        return (
          <button key={item.label} onClick={() => navigate(item.path)} className={`flex flex-col items-center justify-center gap-1 flex-1 ${isActive ? 'text-pink-600' : 'text-gray-400'}`}>
            <div className="relative">
              <item.icon className="w-6 h-6" />
              {item.badge && item.badge > 0 && <span className="absolute -top-1.5 -right-1.5 bg-pink-600 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-black border-2 border-white">{item.badge}</span>}
            </div>
            <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default App;
