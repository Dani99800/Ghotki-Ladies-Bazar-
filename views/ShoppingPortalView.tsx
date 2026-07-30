import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shirt, MapPin, Search, PlusCircle, MessageCircle, ShoppingBag, Sparkles, Footprints, Tag, Heart } from 'lucide-react';
import { Product, Shop, User as UserType } from '../types';
import PortalHeaderBar from '../components/PortalHeaderBar';
import { GHOTKI_LOCATIONS } from '../constants';

interface ShoppingPortalViewProps {
  products: Product[];
  shops: Shop[];
  user?: UserType | null;
  addToCart: (p: Product) => void;
}

const ShoppingPortalView: React.FC<ShoppingPortalViewProps> = ({ products, shops, user, addToCart }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');

  // Filter products for Shopping Portal (Clothes, Shoes, Cosmetics & Fashion)
  const shoppingProducts = useMemo(() => {
    return products.filter(p => {
      const pCat = (p.category || '').toLowerCase();
      const pSub = (p.subcategory || '').toLowerCase();

      const isShoppingCat = p.portal_type === 'SHOPPING' ||
        pCat.includes('shopping') ||
        pCat.includes('fashion') ||
        pCat.includes('cloth') ||
        pCat.includes('shoe') ||
        pCat.includes('cosmetic') ||
        pCat.includes('jewelry') ||
        pCat.includes('beauty') ||
        pSub.includes('dress') ||
        pSub.includes('suit') ||
        pSub.includes('wear') ||
        pSub.includes('sandal') ||
        pSub.includes('makeup') ||
        pSub.includes('abaya');

      if (!isShoppingCat) return false;

      const matchesSearch = !searchTerm || 
                            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSub = selectedSubCategory === 'All' || 
                         pSub.includes(selectedSubCategory.toLowerCase()) ||
                         pCat.includes(selectedSubCategory.toLowerCase());

      const pShop = shops.find(s => s.id === p.shopId);
      const locStr = `${p.location_city || ''} ${pShop?.city || ''} ${pShop?.bazaar || ''} ${pShop?.address || ''}`.toLowerCase();
      const matchesLoc = selectedLocation === 'All' || locStr.includes(selectedLocation.toLowerCase());

      return matchesSearch && matchesSub && matchesLoc;
    });
  }, [products, shops, searchTerm, selectedSubCategory, selectedLocation]);

  const subcategoryPills = [
    'All',
    'Ladies Clothing',
    'Men Clothing',
    'Kids Wear',
    'Shoes & Sandals',
    'Cosmetics & Makeup',
    'Jewelry & Perfumes',
    'Abayas & Hijabs',
    'Bags & Handbags',
    'Bridal & Party Wear'
  ];

  const openWhatsApp = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const shop = shops.find(s => s.id === product.shopId);
    const phone = product.whatsapp || shop?.whatsapp || shop?.mobile || '923001234567';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Assalam-o-Alaikum! I am interested in buying "${product.name}" for PKR ${product.price.toLocaleString()} from Ghotki Shopping Portal.`);
    window.open(`https://wa.me/${cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone.replace(/^0/, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <PortalHeaderBar activePortal="SHOPPING" />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-purple-200 text-[10px] font-black uppercase tracking-widest">
              <Shirt className="w-3.5 h-3.5 text-purple-300" /> Fashion, Clothes, Shoes & Cosmetics
            </div>
            <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter">
              Ghotki Shopping Portal
            </h1>
            <p className="text-xs md:text-sm text-purple-200 max-w-xl font-medium leading-relaxed">
              Explore clothes, gents & ladies fashion, shoes, cosmetics, makeup, bridal wear, and accessories from Ghotki, Mirpur Mathelo & Sukkur boutiques!
            </p>
          </div>

          <button
            onClick={() => navigate(user ? '/seller' : '/login')}
            className="px-6 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-purple-950/50 flex items-center gap-2 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Add Fashion & Clothing Shop
          </button>
        </div>
      </div>

      {/* Main Filter & Products Section */}
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Search Bar */}
        <div className="bg-white p-3 rounded-2xl shadow-xs border border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400 ml-2" />
          <input
            type="text"
            placeholder="Search ladies dresses, lawn suits, shoes, cosmetics, lipstick, abayas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm font-bold bg-transparent outline-none text-gray-900"
          />
        </div>

        {/* Subcategories Filter Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {subcategoryPills.map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubCategory(sub)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-all ${
                selectedSubCategory === sub
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Location Filter */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1 flex-shrink-0">
            <MapPin className="w-3.5 h-3.5 text-purple-600" /> Location:
          </span>
          <button
            onClick={() => setSelectedLocation('All')}
            className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
              selectedLocation === 'All' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-100'
            }`}
          >
            All Areas
          </button>
          {GHOTKI_LOCATIONS.map(loc => (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                selectedLocation === loc ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-100'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black uppercase italic tracking-tight text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-600" /> Shopping & Fashion Listings ({shoppingProducts.length})
            </h2>
          </div>

          {shoppingProducts.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center space-y-3 border border-gray-100">
              <Shirt className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-base font-black uppercase text-gray-700">No fashion or clothing items found</h3>
              <p className="text-xs text-gray-400">Try changing your search term or location filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6">
              {shoppingProducts.map(product => {
                const shop = shops.find(s => s.id === product.shopId);
                const firstImg = Array.isArray(product.images) && product.images.length > 0 
                  ? product.images[0] 
                  : (product.images as any) || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=600';

                return (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                        <img
                          src={firstImg}
                          referrerPolicy="no-referrer"
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md shadow-md">
                          Shopping
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[8px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-purple-300" /> {product.location_city || shop?.city || 'Ghotki'}
                        </div>
                      </div>

                      <div className="p-3 space-y-1">
                        <h3 className="font-bold text-xs md:text-sm text-gray-900 truncate uppercase tracking-tight group-hover:text-purple-600">
                          {product.name}
                        </h3>
                        <p className="text-purple-600 font-black text-sm md:text-lg">
                          PKR {product.price.toLocaleString()}
                        </p>
                        <p className="text-[9px] font-bold text-gray-400 truncate">
                          {shop?.name || 'Local Fashion Shop'}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 pt-0 flex gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="flex-1 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                      >
                        Buy Now
                      </button>
                      <button
                        onClick={(e) => openWhatsApp(e, product)}
                        className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 transition-all"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingPortalView;
