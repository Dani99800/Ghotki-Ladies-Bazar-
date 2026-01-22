
import React, { useState, useEffect } from 'react';
import { 
  HashRouter as Router, 
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
  Play
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
import ReelsView from './views/ReelsView';

const App: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [shops, setShops] = useState<Shop[]>(MOCK_SHOPS);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lang, setLang] = useState<'EN' | 'UR'>('EN');

  useEffect(() => {
    const savedUser = localStorage.getItem('glb_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    const savedCart = localStorage.getItem('glb_cart');
    if (savedCart) setCart(JSON.parse(savedCart));

    const savedProducts = localStorage.getItem('glb_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(MOCK_PRODUCTS);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('glb_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('glb_products', JSON.stringify(products));
    }
  }, [products]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('glb_user');
    window.location.href = '#/'; 
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
      bio: 'New store awaiting approval.',
      status: 'PENDING',
      isRegistrationPaid: true,
      registrationFee: 2500,
      payoutMethods: ['EasyPaisa'],
      deliveryFee: 150,
      pickupEnabled: true,
      deliveryEnabled: true,
    };
    setShops(prev => [...prev, shop]);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('glb_cart');
  };

  return (
    <Router>
      <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-gray-50 text-gray-900 overflow-x-hidden">
        <Navbar user={user} cartCount={cart.length} lang={lang} setLang={setLang} />
        
        <Routes>
          <Route path="/" element={<BuyerHome shops={shops} products={products} addToCart={addToCart} lang={lang} />} />
          <Route path="/explore" element={<ExploreView products={products} shops={shops} addToCart={addToCart} lang={lang} />} />
          <Route path="/reels" element={<ReelsView products={products} addToCart={addToCart} />} />
          <Route path="/shops" element={<ShopsListView shops={shops} lang={lang} />} />
          <Route path="/shop/:id" element={<ShopView shops={shops} products={products} addToCart={addToCart} lang={lang} />} />
          <Route path="/product/:id" element={<ProductView products={products} addToCart={addToCart} lang={lang} />} />
          <Route path="/cart" element={<CartView cart={cart} removeFromCart={removeFromCart} updateQuantity={updateCartQuantity} lang={lang} />} />
          <Route path="/checkout" element={<CheckoutView cart={cart} clearCart={clearCart} user={user} lang={lang} />} />
          <Route path="/login" element={<LoginView setUser={setUser} registerShop={registerShop} lang={lang} />} />
          <Route path="/profile" element={user ? <ProfileView user={user} onLogout={handleLogout} lang={lang} /> : <Navigate to="/login" />} />
          <Route path="/admin/*" element={user?.role === 'ADMIN' ? <AdminDashboard shops={shops} setShops={setShops} orders={orders} /> : <Navigate to="/login" />} />
          <Route path="/seller/*" element={user ? <SellerDashboard products={products} user={user} addProduct={addProduct} orders={orders} /> : <Navigate to="/login" />} />
        </Routes>

        <BottomNav user={user} cartCount={cart.length} />
      </div>
    </Router>
  );
};

const Navbar: React.FC<{ user: UserType | null, cartCount: number, lang: 'EN' | 'UR', setLang: (l: 'EN' | 'UR') => void }> = ({ user, cartCount, lang, setLang }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-50 shadow-sm">
      <div className="flex items-center gap-2">
        {!isHome && (
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <h1 
          onClick={() => navigate('/')} 
          className="text-pink-600 font-bold text-xl cursor-pointer tracking-tight"
        >
          GLB <span className="text-gray-400 font-normal">Bazar</span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => setLang(lang === 'EN' ? 'UR' : 'EN')}
          className="text-xs font-semibold px-2 py-1 border rounded hover:bg-gray-50"
        >
          {lang === 'EN' ? 'اردو' : 'English'}
        </button>
        
        <button onClick={() => navigate('/cart')} className="relative p-2">
          <ShoppingCart className="w-6 h-6 text-gray-700" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-pink-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </button>

        {user ? (
          <div 
            onClick={() => navigate('/profile')}
            className="w-8 h-8 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center text-pink-600 font-bold text-sm cursor-pointer overflow-hidden"
          >
            {user.name[0]}
          </div>
        ) : (
          <button 
            onClick={() => navigate('/login')}
            className="text-pink-600 font-semibold text-sm"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

const BottomNav: React.FC<{ user: UserType | null, cartCount: number }> = ({ user, cartCount }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: ShoppingBag, label: 'Shops', path: '/shops' },
    { icon: ShoppingCart, label: 'Cart', path: '/cart', badge: cartCount },
    { icon: UserIcon, label: 'Account', path: user ? '/profile' : '/login' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-50">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button 
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${isActive ? 'text-pink-600' : 'text-gray-400'}`}
          >
            <div className="relative">
              <item.icon className={`w-6 h-6 ${isActive ? 'fill-pink-50' : ''}`} />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default App;
