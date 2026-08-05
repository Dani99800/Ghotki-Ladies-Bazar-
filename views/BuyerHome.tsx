
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, Sparkles, LayoutGrid, Flame, Clock, Star, Trophy, Map, Box, ChevronLeft, ChevronRight, MessageCircle, PlusCircle, Car, Smartphone, Shirt, Footprints, Building, Armchair, Wheat, ShoppingBag, Briefcase, Tag, CheckCircle
} from 'lucide-react';
import { Shop, Product, Order, User as UserType, Category, AppEvent } from '../types';
import { BAZAARS, GHOTKI_LOCATIONS, CATEGORIES as DEFAULT_CATEGORIES } from '../constants';
import PortalHeaderBar from '../components/PortalHeaderBar';

interface BuyerHomeProps {
  shops: Shop[];
  products: Product[];
  categories: Category[];
  addToCart: (p: Product) => void;
  lang: 'EN' | 'UR';
  user?: UserType | null;
  onPlaceOrder?: (o: Order) => void;
  activeEvent: AppEvent;
  hiddenCategories?: string[];
}

const BuyerHome: React.FC<BuyerHomeProps> = ({ shops, products, categories = [], addToCart, lang, user, onPlaceOrder, activeEvent, hiddenCategories = [] }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');

  const isShopActive = (shopId: string) => {
    const shop = shops.find(s => s.id === shopId);
    if (!shop) return false;
    if (user && shop.owner_id === user.id) return true;
    return shop.status === 'APPROVED';
  };

  const topSellers = useMemo(() => {
    return shops
      .filter(s => {
        const isApproved = s.status === 'APPROVED';
        const isMine = user && s.owner_id === user.id;
        return (isApproved || isMine) && (s.is_top_seller || s.featured);
      })
      .sort((a, b) => (Number(b.sort_priority) || 0) - (Number(a.sort_priority) || 0));
  }, [shops, user]);

  const normalize = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();

  const REMOVED_CATEGORY_NAMES = [
    "men's footwear", "women's footwear", "costmatic", "cosmetics", 
    "men's cloths", "men's clothes", "women's clothes", "footwear"
  ];

  const activeCategories = useMemo(() => {
    const hiddenSet = new Set(hiddenCategories.map(c => c.toLowerCase().trim()));
    const source = categories.length > 0 ? categories : DEFAULT_CATEGORIES;
    return source.filter(c => {
      const norm = (c.name || '').toLowerCase().trim();
      if (REMOVED_CATEGORY_NAMES.includes(norm)) return false;
      if (hiddenSet.has(norm)) return false;
      for (const hc of hiddenCategories) {
        const normHc = hc.toLowerCase().trim();
        if (normHc && (norm.includes(normHc) || normHc.includes(norm))) return false;
      }
      return true;
    });
  }, [categories, hiddenCategories]);

  const activeCatObj = useMemo(() => {
    return activeCategories.find(c => c.id === selectedCategory || c.name === selectedCategory);
  }, [activeCategories, selectedCategory]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (!isShopActive(p.shopId)) return false;
      if (p.status && p.status !== 'APPROVED') return false;

      // Handle category mapping for legacy products
      let pCat = p.category || '';
      const pCatLower = pCat.toLowerCase();
      if (pCatLower.includes("cloth") || pCatLower.includes("fashion") || pCatLower.includes("wear") || pCatLower.includes("suit") || pCatLower.includes("shoe") || pCatLower.includes("footwear") || pCatLower.includes("cosmetic") || pCatLower.includes("makeup") || pCatLower.includes("beauty") || pCatLower.includes("jewelry") || pCatLower.includes("accessories") || pCatLower.includes("abaya")) {
        pCat = "Shopping (Clothes, Shoes & Cosmetics)";
      }

      const pCatNorm = normalize(pCat);
      const selectedCatNorm = normalize(selectedCategory);
      const selectedCatNameNorm = activeCatObj ? normalize(activeCatObj.name) : '';

      const categoryMatch = selectedCategory === 'All' || 
                            pCatNorm === selectedCatNorm ||
                            (selectedCatNameNorm && pCatNorm === selectedCatNameNorm);

      const subCategoryMatch = selectedSubCategory === 'All' || 
                               normalize(p.subcategory || '') === normalize(selectedSubCategory);

      const pShop = shops.find(s => s.id === p.shopId);
      const shopLoc = pShop ? (pShop.city || pShop.address || pShop.bazaar || '') : '';
      const locationMatch = selectedLocation === 'All' || 
                            normalize(p.location_city || '') === normalize(selectedLocation) ||
                            normalize(shopLoc).includes(normalize(selectedLocation));

      const searchMatch = searchTerm === '' || 
                          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

      return categoryMatch && subCategoryMatch && locationMatch && searchMatch;
    });
  }, [products, shops, user, selectedCategory, selectedSubCategory, selectedLocation, searchTerm, activeCatObj]);

  // Check if customer is from Mirpur or Mirpur Mathelo
  const isMirpurCustomer = useMemo(() => {
    if (selectedLocation && selectedLocation.toLowerCase().includes('mirpur')) return true;
    if (user && user.city && user.city.toLowerCase().includes('mirpur')) return true;
    if (user && user.address && user.address.toLowerCase().includes('mirpur')) return true;
    return false;
  }, [user, selectedLocation]);

  // Priority sorting: Show Mirpur Mathelo products FIRST if customer is from Mirpur or location filter is All/Mirpur Mathelo
  const sortedDisplayProducts = useMemo(() => {
    const list = [...filteredProducts];
    const isMirpurPriority = isMirpurCustomer || selectedLocation === 'All' || selectedLocation === 'Mirpur Mathelo';

    if (isMirpurPriority && (selectedLocation === 'All' || selectedLocation === 'Mirpur Mathelo')) {
      return list.sort((a, b) => {
        const aShop = shops.find(s => s.id === a.shopId);
        const bShop = shops.find(s => s.id === b.shopId);

        const aCity = (a.location_city || aShop?.city || '').toLowerCase();
        const bCity = (b.location_city || bShop?.city || '').toLowerCase();

        const aIsMirpur = aCity.includes('mirpur');
        const bIsMirpur = bCity.includes('mirpur');

        if (aIsMirpur && !bIsMirpur) return -1;
        if (!aIsMirpur && bIsMirpur) return 1;

        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    }

    return list;
  }, [filteredProducts, isMirpurCustomer, selectedLocation, shops]);

  // Group products by active categories when on "All" view without active search
  const categoryGroups = useMemo(() => {
    if (selectedCategory !== 'All' || searchTerm) return [];

    return activeCategories.map(cat => {
      const catNameNorm = normalize(cat.name);
      const catProducts = sortedDisplayProducts.filter(p => {
        let pCat = p.category || '';
        const pCatLower = pCat.toLowerCase();
        if (pCatLower.includes("cloth") || pCatLower.includes("fashion") || pCatLower.includes("wear") || pCatLower.includes("suit") || pCatLower.includes("shoe") || pCatLower.includes("footwear") || pCatLower.includes("cosmetic") || pCatLower.includes("makeup") || pCatLower.includes("beauty") || pCatLower.includes("jewelry") || pCatLower.includes("accessories") || pCatLower.includes("abaya")) {
          pCat = "Shopping (Clothes, Shoes & Cosmetics)";
        }
        return normalize(pCat) === catNameNorm || pCatLower.includes(catNameNorm);
      });

      return {
        category: cat,
        products: catProducts
      };
    }).filter(group => group.products.length > 0);
  }, [activeCategories, sortedDisplayProducts, selectedCategory, searchTerm]);

  // Reusable Product Image Scroller
  const ProductCardImage = ({ product }: { product: Product }) => {
    const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.images as any];
    const [idx, setIdx] = useState(0);

    return (
      <div className="relative w-full h-full group/img bg-gray-100">
        <div 
          className="flex transition-transform duration-300 ease-out h-full"
          style={{ transform: `translateX(-${idx * 100}%)` }}
        >
          {images.map((img, i) => (
            <div key={i} className="min-w-full h-full flex-shrink-0">
              <img 
                src={img || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=600'} 
                referrerPolicy="no-referrer" 
                className="w-full h-full object-cover" 
                alt={`${product.name} - ${i + 1}`}
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <div className="absolute inset-y-0 left-0 flex items-center pl-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); setIdx(prev => prev > 0 ? prev - 1 : images.length - 1); }}
                className="p-1.5 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-gray-900 active:scale-90"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); setIdx(prev => prev < images.length - 1 ? prev + 1 : 0); }}
                className="p-1.5 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-gray-900 active:scale-90"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-300 ${i === idx ? 'w-4 bg-pink-600' : 'w-1 bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const openWhatsApp = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const shop = shops.find(s => s.id === product.shopId);
    const phone = product.whatsapp || shop?.whatsapp || shop?.mobile || '923001234567';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Assalam-o-Alaikum! I am interested in buying "${product.name}" listed for PKR ${product.price.toLocaleString()} on Ghotki Bazar.`);
    window.open(`https://wa.me/${cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone.replace(/^0/, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700">
      <PortalHeaderBar activePortal="MARKETPLACE" />
      <div className="max-w-4xl mx-auto px-4 space-y-8">
      
      {/* HERO SECTION */}
      <div className="bg-gradient-to-br from-pink-600 via-pink-700 to-purple-900 rounded-[2.5rem] p-6 md:p-10 text-white shadow-2xl relative overflow-hidden space-y-4">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="space-y-2 relative z-10">
          <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest border border-white/20 inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-yellow-300" /> Ghotki District Local Marketplace
          </span>
          <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tight leading-tight">
            GHOTKI BAZAR
          </h1>
          <p className="text-sm md:text-lg font-black tracking-tight text-pink-100">
            “Ghotki mein jo chahiye, GhotkiBazar.com par dhoondo.”
          </p>
          <p className="text-xs md:text-sm font-bold font-urdu text-yellow-200">
            گهوٽڪي ۾ جيڪو کپي، گهوٽڪي بازار تي ڳوليو.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2 relative z-10">
          <button 
            onClick={() => {
              const el = document.getElementById('marketplace-grid');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-white text-gray-900 font-black px-5 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-lg hover:bg-gray-100 transition-all active:scale-95"
          >
            Browse Products
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="bg-gray-900 text-white font-black px-5 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-lg hover:bg-black transition-all active:scale-95 flex items-center gap-2 border border-pink-400/30"
          >
            <PlusCircle className="w-4 h-4 text-pink-400" /> Sell Your Product
          </button>
        </div>
      </div>

      {/* SEARCH BAR & LOCATION SELECTOR */}
      <div className="space-y-3">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-pink-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Aap kya dhoond rahe hain? (e.g. iPhone 13, Honda 125, Sofa, Plot, Cow...)" 
            className="w-full pl-14 pr-6 py-4 md:py-5 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm outline-none font-bold text-sm md:text-base text-gray-800 focus:ring-4 focus:ring-pink-600/10 transition-all" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        {/* Location selector */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1 flex-shrink-0 pl-1">
            <MapPin className="w-3.5 h-3.5 text-pink-600" /> Location:
          </span>
          <button 
            onClick={() => setSelectedLocation('All')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase transition-all flex-shrink-0 ${selectedLocation === 'All' ? 'bg-pink-600 text-white shadow-md' : 'bg-white border border-gray-100 text-gray-600'}`}
          >
            All Areas
          </button>
          {GHOTKI_LOCATIONS.map(loc => (
            <button 
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase transition-all flex-shrink-0 ${selectedLocation === loc ? 'bg-pink-600 text-white shadow-md' : 'bg-white border border-gray-100 text-gray-600'}`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CATEGORIES GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h2 className="font-black text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2">
             <LayoutGrid className="w-3.5 h-3.5 text-pink-600" /> Categories
           </h2>
           {selectedCategory !== 'All' && (
             <button 
               onClick={() => { setSelectedCategory('All'); setSelectedSubCategory('All'); }}
               className="text-[10px] font-black uppercase text-pink-600"
             >
               Clear Filter
             </button>
           )}
        </div>

        <div className="grid grid-cols-5 gap-2 md:gap-3">
          <div 
            onClick={() => { setSelectedCategory('All'); setSelectedSubCategory('All'); }}
            className={`p-3 md:p-4 rounded-2xl md:rounded-3xl border-2 transition-all cursor-pointer text-center flex flex-col items-center gap-2 ${selectedCategory === 'All' ? 'border-pink-600 bg-pink-50 text-pink-700 shadow-md' : 'border-gray-100 bg-white text-gray-700'}`}
          >
            <div className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tight line-clamp-1">All</span>
          </div>

          {activeCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id || selectedCategory === cat.name;
            return (
              <div 
                key={cat.id} 
                onClick={() => { setSelectedCategory(cat.name); setSelectedSubCategory('All'); }}
                className={`p-2 md:p-3 rounded-2xl md:rounded-3xl border-2 transition-all cursor-pointer text-center flex flex-col items-center gap-1.5 ${isSelected ? 'border-pink-600 bg-pink-50 text-pink-700 shadow-md' : 'border-gray-100 bg-white text-gray-700 hover:border-pink-200'}`}
              >
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex-shrink-0">
                  <img src={cat.image_url || undefined} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={cat.name} />
                </div>
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tight leading-tight line-clamp-2">{cat.name}</span>
              </div>
            );
          })}
        </div>

        {/* SUBCATEGORIES SCROLLER */}
        {activeCatObj && activeCatObj.subcategories && activeCatObj.subcategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1 bg-pink-50/50 rounded-2xl border border-pink-100">
            <span className="text-[9px] font-black uppercase text-pink-700 flex-shrink-0 pl-2">Subcategory:</span>
            <button 
              onClick={() => setSelectedSubCategory('All')}
              className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase transition-all flex-shrink-0 ${selectedSubCategory === 'All' ? 'bg-pink-600 text-white' : 'bg-white text-gray-700 border border-pink-100'}`}
            >
              All {activeCatObj.name}
            </button>
            {activeCatObj.subcategories.map(sub => (
              <button 
                key={sub}
                onClick={() => setSelectedSubCategory(sub)}
                className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase transition-all flex-shrink-0 ${selectedSubCategory === sub ? 'bg-pink-600 text-white' : 'bg-white text-gray-700 border border-pink-100'}`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* TOP SELLERS SHOWCASE */}
      {topSellers.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
             <h2 className="font-black text-lg text-gray-900 uppercase italic tracking-tight flex items-center gap-2">
               <Trophy className="w-5 h-5 text-yellow-500" /> ⭐ Top Sellers & Shops
             </h2>
             <button onClick={() => navigate('/shops')} className="text-[10px] font-black uppercase text-pink-600 tracking-widest">View All</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1 snap-x">
            {topSellers.map((shop) => (
              <div key={shop.id} onClick={() => navigate(`/shop/${shop.id}`)} className="flex-shrink-0 w-36 space-y-2 group cursor-pointer text-center snap-start bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-pink-100 bg-white">
                  <img src={shop.logo || 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&q=80&w=300'} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  <div className="absolute top-1.5 right-1.5">
                    <div className="bg-yellow-400 text-gray-900 p-1 rounded-full shadow-lg border border-white">
                      <Star className="w-3 h-3 fill-gray-900" />
                    </div>
                  </div>
                </div>
                <div>
                   <p className="text-[11px] font-black uppercase text-gray-900 truncate leading-tight">{shop.name}</p>
                   <p className="text-[8px] font-bold uppercase text-pink-600 tracking-wider flex items-center justify-center gap-1 mt-0.5">
                     <MapPin className="w-2.5 h-2.5" /> {shop.city || 'Ghotki'}
                   </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PRODUCT REQUEST CALLOUT */}
      <div className="p-6 bg-gradient-to-r from-gray-900 to-pink-950 text-white rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl border border-pink-500/20">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="font-black text-lg italic uppercase text-pink-400">Jo cheez nahi mil rahi? Request bhejo!</h3>
          <p className="text-xs text-gray-300">Upload a photo or description of what you need and local Ghotki sellers will respond.</p>
        </div>
        <button 
          onClick={() => navigate('/custom-request')}
          className="bg-pink-600 hover:bg-pink-500 text-white font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-lg flex-shrink-0 active:scale-95 transition-all"
        >
          Send Product Request
        </button>
      </div>

      {/* MAIN MARKETPLACE LISTINGS GRID */}
      <section id="marketplace-grid" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 border-b border-gray-100 pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-black text-2xl text-gray-900 uppercase italic tracking-tighter">Local Marketplace</h2>
              {(isMirpurCustomer || selectedLocation === 'Mirpur Mathelo') && (
                <span className="bg-pink-100 text-pink-700 border border-pink-200 text-[9px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <MapPin className="w-3 h-3 text-pink-600" /> Mirpur Mathelo Items First
                </span>
              )}
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {selectedCategory !== 'All' ? selectedCategory : 'All Products Grouped by Categories'} {selectedLocation !== 'All' ? `in ${selectedLocation}` : ''}
            </p>
          </div>
          <span className="text-[10px] font-black text-gray-500 uppercase bg-gray-100 px-3 py-1.5 rounded-full self-start sm:self-auto">{sortedDisplayProducts.length} Total Listings</span>
        </div>

        {/* CATEGORY BY CATEGORY VIEW ON HOMEPAGE */}
        {selectedCategory === 'All' && !searchTerm && categoryGroups.length > 0 ? (
          <div className="space-y-10">
            {categoryGroups.map(group => (
              <div key={group.category.id} className="space-y-4">
                {/* Category Group Header */}
                <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-pink-100 bg-pink-50 flex-shrink-0">
                      <img src={group.category.image_url || undefined} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={group.category.name} />
                    </div>
                    <div>
                      <h3 className="font-black text-sm md:text-base text-gray-900 uppercase italic tracking-tight flex items-center gap-2">
                        {group.category.name}
                      </h3>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        {group.products.length} Products Available
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedCategory(group.category.name); setSelectedSubCategory('All'); }}
                    className="text-[10px] font-black uppercase text-pink-600 bg-pink-50 px-3.5 py-2 rounded-xl hover:bg-pink-600 hover:text-white transition-all flex items-center gap-1"
                  >
                    View All {group.category.name.split(' ')[0]} &rarr;
                  </button>
                </div>

                {/* Category Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                  {group.products.map(product => {
                    const shop = shops.find(s => s.id === product.shopId);
                    return (
                      <div key={product.id} className="bg-white rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xs border border-gray-100 flex flex-col group transition-all hover:shadow-xl">
                        <div className="relative aspect-[4/5] overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                          <ProductCardImage product={product} />
                          
                          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                            {product.condition && (
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase shadow-md ${product.condition === 'New' ? 'bg-green-600 text-white' : 'bg-orange-500 text-white'}`}>
                                {product.condition}
                              </span>
                            )}
                          </div>

                          <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                            {shop?.is_top_seller && (
                              <div className="bg-yellow-400 text-gray-900 text-[8px] font-black px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-gray-900" /> Top Seller
                              </div>
                            )}
                          </div>

                          <div className="absolute bottom-2 left-2 z-10">
                            <span className="bg-black/60 backdrop-blur-md text-white text-[8px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 text-pink-400" /> {product.location_city || shop?.city || 'Ghotki'}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 md:p-4 flex-1 space-y-2 flex flex-col justify-between bg-white">
                          <div onClick={() => navigate(`/product/${product.id}`)} className="cursor-pointer space-y-1">
                            <h3 className="font-bold text-xs md:text-sm text-gray-900 truncate uppercase tracking-tight hover:text-pink-600 transition-colors">
                              {product.name}
                            </h3>
                            <div className="flex items-baseline justify-between gap-1">
                              <p className="text-pink-600 font-black text-sm md:text-lg italic leading-none">
                                PKR {product.price.toLocaleString()}
                              </p>
                              {product.negotiable !== false && (
                                <span className="text-[7px] md:text-[8px] font-bold text-gray-400 uppercase">Negotiable</span>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-50 flex items-center justify-between gap-2">
                            <span className="text-[9px] font-bold text-gray-500 truncate">
                              {shop?.name || product.shop_name || 'Local Seller'}
                            </span>
                            
                            <button 
                              onClick={(e) => openWhatsApp(e, product)}
                              className="bg-emerald-600 text-white p-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md hover:bg-emerald-700 flex items-center gap-1 active:scale-95 transition-all"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span className="hidden md:inline">WhatsApp</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : sortedDisplayProducts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 space-y-4 shadow-sm">
            <Box className="w-12 h-12 text-gray-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-black uppercase text-gray-700">No products found</h3>
              <p className="text-xs text-gray-400 font-medium max-w-sm mx-auto">Can't find the product you're looking for in Ghotki District shops?</p>
            </div>
            <button 
              onClick={() => navigate('/custom-request')}
              className="px-8 py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-pink-200 active:scale-95 transition-all"
            >
              Send Request to All Shops
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            {sortedDisplayProducts.map(product => {
              const shop = shops.find(s => s.id === product.shopId);
              return (
                <div key={product.id} className="bg-white rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col group transition-all hover:shadow-xl">
                  <div className="relative aspect-[4/5] overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                    <ProductCardImage product={product} />
                    
                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                      {product.condition && (
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase shadow-md ${product.condition === 'New' ? 'bg-green-600 text-white' : 'bg-orange-500 text-white'}`}>
                          {product.condition}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                      {shop?.is_top_seller && (
                        <div className="bg-yellow-400 text-gray-900 text-[8px] font-black px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-gray-900" /> Top Seller
                        </div>
                      )}
                    </div>

                    <div className="absolute bottom-2 left-2 z-10">
                      <span className="bg-black/60 backdrop-blur-md text-white text-[8px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-pink-400" /> {product.location_city || shop?.city || 'Ghotki'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 md:p-5 flex-1 space-y-2 flex flex-col justify-between bg-white">
                    <div onClick={() => navigate(`/product/${product.id}`)} className="cursor-pointer space-y-1">
                      <h3 className="font-bold text-xs md:text-base text-gray-900 truncate uppercase tracking-tight hover:text-pink-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-baseline justify-between gap-1">
                        <p className="text-pink-600 font-black text-sm md:text-xl italic leading-none">
                          PKR {product.price.toLocaleString()}
                        </p>
                        {product.negotiable !== false && (
                          <span className="text-[7px] md:text-[9px] font-bold text-gray-400 uppercase">Negotiable</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-50 flex items-center justify-between gap-2">
                      <span className="text-[9px] font-bold text-gray-500 truncate">
                        {shop?.name || product.shop_name || 'Local Seller'}
                      </span>
                      
                      <button 
                        onClick={(e) => openWhatsApp(e, product)}
                        className="bg-emerald-600 text-white p-2 md:px-3 md:py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md hover:bg-emerald-700 flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      </div>
    </div>
  );
};

export default BuyerHome;

