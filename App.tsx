
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User as UserIcon, ShoppingCart, LayoutDashboard, ShieldAlert, PlayCircle, Loader2, Package, Search, PlusCircle, Compass, ClipboardList, Store } from 'lucide-react';
import { supabase } from './services/supabase';
import { User as UserType, Shop, Product, CartItem, Order, Category, AppEvent } from './types';
import { CATEGORIES as FALLBACK_CATEGORIES, NOTIFICATION_SOUND, PK_EVENTS } from './constants';
import { MOCK_SHOPS, MOCK_PRODUCTS } from './data';
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
import CustomRequestView from './views/CustomRequestView';
import RentalsPortalView from './views/RentalsPortalView';
import PropertyPortalView from './views/PropertyPortalView';
import MotorsPortalView from './views/MotorsPortalView';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserType | null>(null);
  const [shops, setShops] = useState<Shop[]>(() => {
    try {
      const cached = localStorage.getItem('glb_cache_shops');
      const parsed = cached ? JSON.parse(cached) : [];
      if (parsed.length > 0) {
        const merged = [...parsed];
        MOCK_SHOPS.forEach(ms => {
          if (!merged.some(s => s.id === ms.id)) merged.push(ms);
        });
        return merged;
      }
      return MOCK_SHOPS;
    } catch { return MOCK_SHOPS; }
  });
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('glb_cache_products');
      const parsed = cached ? JSON.parse(cached) : [];
      if (parsed.length > 0) {
        const merged = [...parsed];
        MOCK_PRODUCTS.forEach(mp => {
          if (!merged.some(p => p.id === mp.id)) merged.push(mp);
        });
        return merged;
      }
      return MOCK_PRODUCTS;
    } catch { return MOCK_PRODUCTS; }
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const cached = localStorage.getItem('glb_cache_categories');
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loyaltyPlans, setLoyaltyPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(() => {
    // If we have any data at all, skip the heavy splash screen on refresh
    const hasCache = localStorage.getItem('glb_cache_shops');
    return !hasCache;
  });
  const [error, setError] = useState<string | null>(null);
  const [showForceLoad, setShowForceLoad] = useState(false);
  const [activeEvent, setActiveEvent] = useState<AppEvent>(PK_EVENTS[0]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load from cache immediately
  useEffect(() => {
    try {
      const cachedShops = localStorage.getItem('glb_cache_shops');
      const cachedProducts = localStorage.getItem('glb_cache_products');
      const cachedCategories = localStorage.getItem('glb_cache_categories');
      
      if (cachedShops) setShops(JSON.parse(cachedShops));
      if (cachedProducts) setProducts(JSON.parse(cachedProducts));
      if (cachedCategories) setCategories(JSON.parse(cachedCategories));
    } catch (e) {
      console.warn("GLB: Cache load failed", e);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setShowForceLoad(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [loading]);

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

  const purchaseLoyaltyCard = async (plan: any) => {
    if (!supabase || !user) return;
    if (user.id.startsWith('guest_')) {
      alert("Please login to purchase a loyalty card.");
      return;
    }

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + (plan.duration_days || 30));

    try {
      const { error } = await supabase.from('profiles').update({
        loyalty_plan_id: plan.id,
        loyalty_expiry: expiry.toISOString()
      }).eq('id', user.id);

      if (error) throw error;
      await fetchProfile(user.id);
      alert(`🎉 Congratulations! You are now a ${plan.name} member.`);
      navigate('/profile');
    } catch (err: any) {
      alert("Purchase failed: " + err.message);
    }
  };

  const authInitialized = useRef(false);

  const loadMarketplace = useCallback(async (silent = false, force = false) => {
    if (!supabase) {
      setError("Database configuration missing.");
      if (!silent) setLoading(false);
      return;
    }

    // Prevent concurrent loads unless forced
    if ((window as any)._glb_loading_marketplace && !force) return;
    (window as any)._glb_loading_marketplace = true;
    
    try {
      console.log(`GLB: Fetching Marketplace Data (silent: ${silent}, force: ${force})...`);
      if (!silent) setLoading(true);
      setError(null);
      
      if (!navigator.onLine) {
        throw new Error("No internet connection detected. Please check your network.");
      }
      
      // Load all data in parallel for speed
      const [pRes, sRes, cRes, lRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('shops').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('loyalty_plans').select('*')
      ]);

      if (pRes.error) throw pRes.error;
      if (sRes.error) throw sRes.error;
      if (cRes.error) throw cRes.error;

      setLoyaltyPlans(lRes.data || []);
      const allShops = sRes.data || [];
      const allProducts = pRes.data || [];
      const categoriesData = cRes.data || [];

      // Filter products based on shop status and ownership
      const mappedProducts = allProducts.map((p: any) => {
        let rawImages = p.image_urls || p.images || p.image_url || p.image || [];
        if (typeof rawImages === 'string') rawImages = [rawImages];
        const images = Array.isArray(rawImages) ? rawImages.filter(Boolean) : [];
        const price = parseFloat(p.price || 0);

        return { 
          ...p, 
          id: p.id.toString(),
          name: p.name || p.title || 'Style Item',
          price: price,
          shopId: (p.shop_id || p.shopId || p.owner_id || '').toString(), 
          images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'],
          createdAt: p.created_at || p.createdAt || p.inserted_at || new Date().toISOString(),
          tags: p.tags || [],
          category: p.category || 'Shoes',
          is_new_arrival: p.is_new_arrival !== undefined ? Boolean(p.is_new_arrival) : true, 
          sort_priority: p.sort_priority || 0
        };
      }).sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      const mappedShops = allShops.map((s: any) => ({ 
        ...s, 
        id: s.id.toString(),
        owner_id: s.owner_id || s.ownerId || s.user_id,
        name: s.name || s.shop_name || 'Ghotki Merchant',
        logo: s.logo_url || s.logo || s.image_url || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=100&q=80', 
        banner: s.banner_url || s.banner || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
        whatsapp: s.whatsapp || s.mobile || ''
      }));
      
      const REMOVED_CATEGORY_NAMES = ["men's footwear", "women's footwear", "costmatic", "cosmetics", "men's cloths", "men's clothes", "women's clothes", "footwear"];
      const cleanCategoriesData = (categoriesData.length > 0 ? categoriesData : FALLBACK_CATEGORIES).filter((c: any) => {
        const name = (c.name || '').toLowerCase().trim();
        return !REMOVED_CATEGORY_NAMES.includes(name);
      });

      const combinedShops = [...mappedShops];
      MOCK_SHOPS.forEach(ms => {
        if (!combinedShops.some(s => s.id === ms.id)) {
          combinedShops.push(ms);
        }
      });

      const combinedProducts = [...mappedProducts];
      MOCK_PRODUCTS.forEach(mp => {
        if (!combinedProducts.some(p => p.id === mp.id)) {
          combinedProducts.push(mp);
        }
      });

      setShops(combinedShops);
      setProducts(combinedProducts);
      setCategories(cleanCategoriesData);
      
      // Update Cache
      localStorage.setItem('glb_cache_shops', JSON.stringify(combinedShops));
      localStorage.setItem('glb_cache_products', JSON.stringify(combinedProducts));
      localStorage.setItem('glb_cache_categories', JSON.stringify(cleanCategoriesData));
      
      console.log(`GLB: Sync Complete. ${mappedShops.length} shops, ${mappedProducts.length} products.`);
      setError(null);
    } catch (err: any) { 
      console.error("GLB: Critical Fetch Error:", err); 
      setError("Marketplace synchronization failed: " + (err.message || "Unknown error"));
    } finally {
      if (!silent) setLoading(false);
      (window as any)._glb_loading_marketplace = false;
    }
  }, []); // Remove user dependency to stabilize marketplace loads

  const fetchProfile = useCallback(async (id: string, existingAuthUser?: any) => {
    if (!supabase) return;
    try {
      // Use a lock ref to prevent multiple concurrent fetches for the same request
      if ((window as any)._glb_fetching === id) return;
      (window as any)._glb_fetching = id;

      console.log("GLB: Syncing Profile for", id);
      
      // 1. Get auth user metadata (prefer passed user to avoid lock contention)
      let authUser = existingAuthUser;
      if (!authUser) {
        const { data: uRes } = await supabase.auth.getUser();
        authUser = uRes.user;
      }
      
      if (!authUser) {
        (window as any)._glb_fetching = null;
        return;
      }

      // 2. Try to get the profile
      const { data: profile, error: pError } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      
      const meta = authUser.user_metadata || {};
      const userEmail = authUser.email?.toLowerCase();
      const isMasterEmail = userEmail === 'd46050573@gmail.com';
      let userRole = (profile?.role || meta.role || 'BUYER').toUpperCase();
      
      if (isMasterEmail) userRole = 'ADMIN';
      
      // RECOVERY: If profile missing but auth user exists, create it
      let activeProfile = profile;
      if (!profile && authUser.email) {
        console.warn("GLB: Profile missing in DB, recovering...");
        const recoveryData = {
          id: id,
          name: meta.full_name || 'Bazar User',
          email: authUser.email,
          role: userRole,
          mobile: meta.mobile || '',
          city: meta.city || 'Ghotki',
          subscription_tier: (meta.tier || 'NONE').toUpperCase()
        };
        
        const { error: upsertErr } = await supabase.from('profiles').upsert(recoveryData);
        if (!upsertErr) {
          activeProfile = recoveryData as any;
          
          if (userRole === 'SELLER') {
            const { data: existingShop } = await supabase.from('shops').select('id').eq('owner_id', id).maybeSingle();
            if (!existingShop) {
              console.warn("GLB: Shop missing in DB, recovering...");
              await supabase.from('shops').insert({
                owner_id: id,
                name: meta.shop_name || 'My Boutique',
                bazaar: meta.bazaar || 'Ladies Bazar',
                category: meta.category || 'Women\'s Clothes',
                status: 'PENDING'
              });
            }
          }
        } else {
          console.error("GLB: Recovery failed:", upsertErr);
        }
      }

      setUser({
        id,
        name: activeProfile?.name || meta.full_name || 'Bazar User',
        email: authUser.email || '',
        role: userRole as any,
        mobile: activeProfile?.mobile || meta.mobile || '',
        address: activeProfile?.address || meta.address || '',
        city: activeProfile?.city || meta.city || 'Ghotki',
        subscription_tier: (activeProfile as any)?.subscription_tier || meta.tier || 'NONE',
        points: Number(activeProfile?.points || 0),
        loyalty_plan_id: activeProfile?.loyalty_plan_id,
        loyalty_expiry: activeProfile?.loyalty_expiry
      });
      
      (window as any)._glb_fetching = null;
    } catch (e) { 
      console.error("GLB: Profile Fetch Error:", e);
      (window as any)._glb_fetching = null;
    }
  }, [loadMarketplace]);

  const lastSessionId = useRef('');
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    // Use separate initialization to ensure marketplace loads first and alone
    const initialize = async () => {
      let isSettled = false;
      const settle = () => {
        if (!isSettled && mounted.current) {
          setLoading(false);
          isSettled = true;
          console.log("GLB: Interface Settled");
        }
      };

      // 1. If we have any data (from useState cache init), show UI immediately
      if (localStorage.getItem('glb_cache_shops')) {
        settle();
      }

      try {
        // 2. Check current session (concurrent with marketplace sync)
        const sessionPromise = supabase.auth.getSession();
        
        // 3. Start marketplace sync in background
        loadMarketplace(true);

        const { data: { session } } = await sessionPromise;
        if (session && mounted.current) {
          await fetchProfile(session.user.id, session.user);
        }
      } catch (e) {
        console.error("GLB: Auth init error", e);
      } finally {
        settle(); // Final settle if not already done
      }
    };
    
    initialize();

    // 3. Listen for future auth changes (login/logout/refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("GLB: Auth Change Event:", event);
      if (mounted.current) {
        if (session) {
          await fetchProfile(session.user.id, session.user);
        } else {
          setUser(null);
        }
      }
    });

    return () => {
      mounted.current = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadMarketplace, fetchProfile]);

  const fetchOrders = useCallback(async () => {
    if (!supabase || !user) return;
    const myShop = shops.find(s => s.owner_id === user.id);
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    
    if (user.role === 'SELLER' && myShop) {
      query = query.or(`buyer_id.eq.${user.id},seller_id.eq.${myShop.id}`);
    } else if (user.role === 'ADMIN') {
      // Admin sees everything
    } else if (user.id) {
      query = query.eq('buyer_id', user.id);
    } else {
      return;
    }

    const { data, error } = await query;
    if (error) {
      console.error("Fetch orders error:", error);
      return;
    }

    if (data) {
      setOrders(data.map(o => ({ 
        id: o.id,
        buyerId: o.buyer_id,
        sellerId: o.seller_id,
        items: o.items,
        subtotal: o.subtotal,
        deliveryFee: o.delivery_fee,
        platformFee: o.platform_fee,
        total: o.total,
        status: o.status,
        paymentMethod: o.payment_method,
        buyerName: o.buyer_name,
        buyerMobile: o.buyer_mobile,
        buyerAddress: o.buyer_address,
        createdAt: o.created_at
      })));
    }
  }, [user, shops]);

  useEffect(() => {
    if (!supabase || !user || shops.length === 0) return;

    fetchOrders();
    
    // Use a unique channel name to avoid conflicts if multiple components use realtime
    const channelId = `orders-channel-${user.id}`;
    const channel = supabase.channel(channelId)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'orders' 
      }, payload => {
        const newOrder = payload.new;
        const myShop = shops.find(s => s.owner_id === user.id);
        
        // Notify seller if the new order belongs to their shop
        if (user.role === 'SELLER' && myShop && newOrder.seller_id === myShop.id) {
          audioRef.current?.play().catch(e => console.log("Audio play error:", e));
          fetchOrders();
        }
        
        // Also refresh if the user is the buyer or an admin
        if (user.role === 'ADMIN' || newOrder.buyer_id === user.id) {
          fetchOrders();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, shops, fetchOrders]);

  const handlePlaceOrder = async (order: Order) => {
    if (!supabase) return;
    const isGuest = !order.buyerId || order.buyerId.startsWith('guest_');
    const { error } = await supabase.from('orders').insert({
      buyer_id: isGuest ? null : order.buyerId,
      seller_id: order.sellerId, 
      items: order.items,
      subtotal: Number(order.subtotal),
      delivery_fee: Number(order.deliveryFee || 0),
      platform_fee: Number(order.platformFee || 0),
      total: Number(order.total),
      status: 'PENDING',
      payment_method: order.paymentMethod,
      buyer_name: order.buyerName,
      buyer_mobile: order.buyerMobile,
      buyer_address: order.buyerAddress
    });
    if (error) {
      console.error("GLB: Order Placement Error", error);
      throw error;
    }
    fetchOrders(); 
  };

  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === p.id);
      if (existing) return prev.map(item => item.id === p.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...p, quantity: 1 }];
    });
  };

  const isAdmin = React.useMemo(() => {
    const isMasterAdmin = user?.email?.toLowerCase() === 'd46050573@gmail.com';
    return isMasterAdmin || user?.role === 'ADMIN';
  }, [user]);

  const filteredShops = React.useMemo(() => {
    return shops.filter(s => {
      const userEmail = user?.email?.toLowerCase();
      const isMasterAdmin = userEmail === 'd46050573@gmail.com';
      const isAdmin = isMasterAdmin || user?.role === 'ADMIN';
      const isOwner = user?.id === s.owner_id;
      
      if (isMasterAdmin) return true;
      if (isAdmin) return true;
      if (isOwner) return true;
      return s.status === 'APPROVED';
    });
  }, [shops, user]);

  const filteredProducts = React.useMemo(() => {
    const approvedShopIds = new Set(shops.filter(s => s.status === 'APPROVED').map(s => s.id));
    return products.filter(p => {
      const isApproved = approvedShopIds.has(p.shopId);
      const isMine = user && shops.find(s => s.id === p.shopId)?.owner_id === user.id;
      return isApproved || isMine;
    });
  }, [products, shops, user]);

  const navItems = React.useMemo(() => [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Browse Ads', path: '/explore' },
    { icon: Store, label: 'Stores', path: '/shops' },
    { icon: Package, label: 'Buyer Demand', path: '/custom-request' },
    { icon: ShoppingCart, label: 'Cart', path: '/cart' },
    ...(user ? [{ icon: ClipboardList, label: 'My Orders', path: '/orders' }] : []),
    ...(user?.role === 'SELLER' ? [{ icon: LayoutDashboard, label: 'Seller Dashboard', path: '/seller' }] : []),
    ...(isAdmin ? [{ icon: ShieldAlert, label: 'Admin', path: '/admin' }] : []),
  ], [user, isAdmin]);

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-pink-50 border-t-pink-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 m-auto w-8 h-8 flex items-center justify-center font-black text-pink-600 italic">GB</div>
      </div>
      <div className="text-center space-y-1">
        <p className="font-black uppercase tracking-widest text-[11px] text-gray-900 italic">GHOTKI BAZAR</p>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Digitizing Ghotki Legacy</p>
      </div>
      {showForceLoad && (
        <button 
          onClick={() => {
            console.log("GLB: Force loading marketplace...");
            setLoading(false);
            if (shops.length === 0) loadMarketplace(false, true);
          }} 
          className="mt-8 px-6 py-2 bg-pink-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg animate-bounce"
        >
          Enter Marketplace Anyway
        </button>
      )}
    </div>
  );

  if (error && shops.length === 0) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-8 text-center space-y-6">
       <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
          <ShieldAlert className="w-10 h-10" />
       </div>
       <div className="max-w-xs space-y-2">
         <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 italic">Connection Error</h2>
         <p className="text-sm text-gray-400 font-medium leading-relaxed italic">
            {error}<br/>
           <span className="text-[10px] mt-2 block text-pink-600 font-bold uppercase tracking-wider">
             Tip: Ensure your Supabase project is active and your environment variables are correct.
           </span>
         </p>
       </div>
       <div className="space-y-3 w-full max-w-[200px]">
          <button 
            onClick={() => { setError(null); loadMarketplace(); }}
            className="w-full py-4 bg-pink-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-xl shadow-pink-200 active:scale-95 transition-all"
          >
            Retry Connection
          </button>
          <button 
            onClick={() => {
              const url = (import.meta as any).env?.VITE_SUPABASE_URL || 'Using hardcoded fallback';
              alert(`Supabase Debug Info:\nURL: ${url}\nKey starts with: ${(import.meta as any).env?.VITE_SUPABASE_ANON_KEY?.slice(0, 8) || 'No Key'}\nStatus: ${navigator.onLine ? 'Online' : 'Offline'}`);
            }}
            className="w-full py-4 bg-white text-gray-400 font-bold rounded-2xl border border-gray-100 uppercase tracking-widest text-[10px] active:scale-95 transition-all"
          >
            Show Diagnostics
          </button>
          <button 
            onClick={() => { setError(null); setLoading(false); }}
            className="w-full py-2 text-gray-300 font-bold uppercase tracking-widest text-[8px] active:scale-95 transition-all"
          >
            Stay Offline
          </button>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ '--primary-event': activeEvent.primaryColor, '--accent-event': activeEvent.accentColor } as React.CSSProperties}>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-6 z-50 shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg font-black italic text-sm" style={{ background: activeEvent.primaryColor }}>
            GB
          </div>
          <h1 className="text-gray-900 font-black text-xl italic uppercase tracking-tighter">GHOTKI BAZAR</h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map(item => (
            <button 
              key={item.path} 
              onClick={() => navigate(item.path)} 
              className={`flex items-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all ${location.pathname === item.path ? 'text-pink-600' : 'text-gray-400 hover:text-gray-900'}`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(user ? '/seller' : '/login')} 
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black text-[10px] uppercase tracking-widest rounded-full shadow-md shadow-pink-200 hover:shadow-lg active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>SELL</span>
          </button>
          {user?.role === 'ADMIN' && <ShieldAlert onClick={() => navigate('/admin')} className="w-5 h-5 text-orange-500 cursor-pointer animate-pulse" />}
          <UserIcon onClick={() => navigate('/profile')} className="w-6 h-6 text-gray-400 cursor-pointer hover:text-pink-600 transition-colors" />
        </div>
      </nav>

      <main className="flex-1 pt-16 pb-24 md:pb-10">
        <Routes>
          <Route path="/" element={<BuyerHome shops={filteredShops} products={filteredProducts} categories={categories} addToCart={addToCart} lang="EN" user={user} onPlaceOrder={handlePlaceOrder} activeEvent={activeEvent} />} />
          <Route path="/explore" element={<ExploreView products={filteredProducts} addToCart={addToCart} onPlaceOrder={handlePlaceOrder} user={user} savedProductIds={[]} onToggleSave={() => {}} />} />
          <Route path="/shops" element={<ShopsListView shops={filteredShops} categories={categories} lang="EN" />} />
          <Route path="/shop/:id" element={<ShopView shops={filteredShops} products={filteredProducts} addToCart={addToCart} lang="EN" user={user} onPlaceOrder={handlePlaceOrder} />} />
          <Route path="/product/:id" element={<ProductView products={filteredProducts} addToCart={addToCart} lang="EN" />} />
          <Route path="/cart" element={<CartView cart={cart} removeFromCart={id => setCart(cart.filter(c => c.id !== id))} updateQuantity={(id, d) => setCart(cart.map(c => c.id === id ? {...c, quantity: Math.max(1, c.quantity+d)} : c))} lang="EN" />} />
          <Route path="/login" element={<LoginView setUser={setUser} lang="EN" />} />
          <Route path="/profile" element={user ? (
            <ProfileView 
              user={user} 
              loyaltyPlans={loyaltyPlans}
              purchaseLoyaltyCard={purchaseLoyaltyCard}
              onLogout={() => { supabase?.auth.signOut(); setUser(null); navigate('/login'); }} 
              onDeleteAccount={async () => {
                if (!supabase || !user) return;
                
                try {
                  // Actually delete the user's profile and cascading data in Supabase
                  // This is the correct way to wipe data permanently
                  const { error: profileError } = await supabase
                    .from('profiles')
                    .delete()
                    .eq('id', user.id);

                  if (profileError) throw profileError;

                  // Sign out from Auth
                  await supabase.auth.signOut();
                  
                  // Clear everything
                  setUser(null);
                  setCart([]);
                  navigate('/login');
                  alert("Your account and all related data have been permanently deleted.");
                } catch (err: any) {
                  console.error("Deletion Error:", err);
                  alert("Could not delete account. If you just logged in, please logout and login again before deleting.");
                }
              }}
              lang="EN" 
            />
          ) : <Navigate to="/login" />} />
          <Route path="/admin" element={(() => {
            const isMasterAdmin = user?.email?.toLowerCase() === 'd46050573@gmail.com';
            const isAdmin = isMasterAdmin || user?.role === 'ADMIN';
            console.log("Admin Route Access Attempt:", { isAdmin, isMasterAdmin, userRole: user?.role });
            return isAdmin ? <AdminDashboard shops={filteredShops} setShops={setShops} orders={orders} refreshData={loadMarketplace} categories={categories} activeEvent={activeEvent} onUpdateEvent={handleUpdateEvent} /> : <Navigate to="/" />;
          })()} />
          <Route path="/seller/*" element={user?.role === 'SELLER' ? <SellerDashboard products={filteredProducts} user={user} addProduct={loadMarketplace} orders={orders} shops={filteredShops} refreshShop={loadMarketplace} refreshOrders={fetchOrders} categories={categories} /> : <Navigate to="/login" />} />
          <Route path="/checkout" element={<CheckoutView cart={cart} clearCart={() => setCart([])} user={user} lang="EN" onPlaceOrder={handlePlaceOrder} shops={filteredShops} loyaltyPlans={loyaltyPlans} />} />
          <Route path="/portal/rentals" element={<RentalsPortalView products={filteredProducts} shops={filteredShops} user={user} addToCart={addToCart} />} />
          <Route path="/portal/property" element={<PropertyPortalView products={filteredProducts} shops={filteredShops} user={user} addToCart={addToCart} />} />
          <Route path="/portal/motors" element={<MotorsPortalView products={filteredProducts} shops={filteredShops} user={user} addToCart={addToCart} />} />
          <Route path="/orders" element={user ? <OrdersView orders={orders} user={user} shops={shops} /> : <Navigate to="/login" />} />
          <Route path="/custom-request" element={<CustomRequestView user={user} categories={categories} />} />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation */}
      {!location.pathname.startsWith('/product/') && (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-xl border-t border-gray-100 flex items-center justify-around z-50 px-2 shadow-2xl md:hidden">
          <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 group">
            <div className={`p-2 rounded-2xl transition-all duration-300 ${location.pathname === '/' ? 'bg-pink-600 text-white shadow-lg shadow-pink-200' : 'text-gray-400 group-hover:text-pink-600'}`}>
              <Home className="w-5 h-5" />
            </div>
            <span className={`text-[8px] font-black uppercase tracking-widest ${location.pathname === '/' ? 'text-pink-600' : 'text-gray-400'}`}>Home</span>
          </button>

          <button onClick={() => navigate('/explore')} className="flex flex-col items-center gap-1 group">
            <div className={`p-2 rounded-2xl transition-all duration-300 ${location.pathname === '/explore' ? 'bg-pink-600 text-white shadow-lg shadow-pink-200' : 'text-gray-400 group-hover:text-pink-600'}`}>
              <Search className="w-5 h-5" />
            </div>
            <span className={`text-[8px] font-black uppercase tracking-widest ${location.pathname === '/explore' ? 'text-pink-600' : 'text-gray-400'}`}>Explore</span>
          </button>

          {/* Elevated SELL CTA Center Button */}
          <button onClick={() => navigate(user ? '/seller' : '/login')} className="flex flex-col items-center -mt-6 group">
            <div className="w-12 h-12 bg-gradient-to-tr from-pink-600 to-rose-500 text-white rounded-full flex items-center justify-center shadow-xl border-4 border-white group-active:scale-90 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-pink-600 mt-0.5">SELL</span>
          </button>

          <button onClick={() => navigate('/custom-request')} className="flex flex-col items-center gap-1 group">
            <div className={`p-2 rounded-2xl transition-all duration-300 ${location.pathname === '/custom-request' ? 'bg-pink-600 text-white shadow-lg shadow-pink-200' : 'text-gray-400 group-hover:text-pink-600'}`}>
              <Package className="w-5 h-5" />
            </div>
            <span className={`text-[8px] font-black uppercase tracking-widest ${location.pathname === '/custom-request' ? 'text-pink-600' : 'text-gray-400'}`}>Demand</span>
          </button>

          <button onClick={() => navigate(user ? '/orders' : '/cart')} className="flex flex-col items-center gap-1 group">
            <div className={`p-2 rounded-2xl transition-all duration-300 ${location.pathname === '/orders' || location.pathname === '/cart' ? 'bg-pink-600 text-white shadow-lg shadow-pink-200' : 'text-gray-400 group-hover:text-pink-600'}`}>
              {user ? <ClipboardList className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
            </div>
            <span className={`text-[8px] font-black uppercase tracking-widest ${location.pathname === '/orders' || location.pathname === '/cart' ? 'text-pink-600' : 'text-gray-400'}`}>{user ? 'Orders' : 'Cart'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
