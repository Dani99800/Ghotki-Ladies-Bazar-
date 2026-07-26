import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Search, PlusCircle, ShieldCheck, Phone, Filter, Home, Compass, Map, CheckCircle2, ChevronRight, Tag } from 'lucide-react';
import { Product, Shop, User as UserType } from '../types';
import PortalHeaderBar from '../components/PortalHeaderBar';
import { GHOTKI_LOCATIONS } from '../constants';

interface PropertyPortalViewProps {
  products: Product[];
  shops: Shop[];
  user?: UserType | null;
  addToCart: (p: Product) => void;
}

const PropertyPortalView: React.FC<PropertyPortalViewProps> = ({ products, shops, user, addToCart }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedPropType, setSelectedPropType] = useState<string>('All');

  // Filter products for Property Portal
  const propertyProducts = useMemo(() => {
    return products.filter(p => {
      const isPropCat = p.category === 'Property & Real Estate' || 
                        p.portal_type === 'PROPERTY' || 
                        p.subcategory?.toLowerCase().includes('house') ||
                        p.subcategory?.toLowerCase().includes('plot') ||
                        p.subcategory?.toLowerCase().includes('land') ||
                        p.subcategory?.toLowerCase().includes('shop');

      if (!isPropCat) return false;

      const matchesSearch = !searchTerm || 
                            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSub = selectedSubCategory === 'All' || 
                         (p.subcategory || '').toLowerCase().includes(selectedSubCategory.toLowerCase());

      const pShop = shops.find(s => s.id === p.shopId);
      const locStr = `${p.location_city || ''} ${pShop?.city || ''} ${pShop?.bazaar || ''} ${pShop?.address || ''}`.toLowerCase();
      const matchesLoc = selectedLocation === 'All' || locStr.includes(selectedLocation.toLowerCase());

      const matchesType = selectedPropType === 'All' || p.property_type === selectedPropType;

      return matchesSearch && matchesSub && matchesLoc && matchesType;
    });
  }, [products, shops, searchTerm, selectedSubCategory, selectedLocation, selectedPropType]);

  const propertySubcategories = [
    { name: 'All', icon: Building2 },
    { name: 'Houses for Sale', icon: Home },
    { name: 'Plots', icon: Map },
    { name: 'Shops for Sale', icon: Building2 },
    { name: 'Agricultural Land', icon: Compass },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <PortalHeaderBar activePortal="PROPERTY" />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-emerald-200 text-[10px] font-black uppercase tracking-widest">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Real Estate & Property Portal
            </div>
            <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter">
              Ghotki & Sukkur Property Exchange
            </h1>
            <p className="text-xs md:text-sm text-emerald-200 max-w-xl font-medium leading-relaxed">
              Buy & Sell residential plots, houses, commercial shops, and agricultural land with clear title verification & direct owner negotiation.
            </p>
          </div>

          <button
            onClick={() => navigate(user ? '/seller' : '/login')}
            className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-950/50 flex items-center gap-2 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Post Property Advert
          </button>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Search Bar */}
        <div className="bg-white p-3 rounded-2xl shadow-xs border border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400 ml-2" />
          <input
            type="text"
            placeholder="Search houses, plots, shops or agricultural land..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none font-bold text-sm text-gray-800 placeholder-gray-400"
          />
        </div>

        {/* Subcategory Pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
          {propertySubcategories.map((sub) => {
            const Icon = sub.icon;
            const isActive = selectedSubCategory === sub.name;
            return (
              <button
                key={sub.name}
                onClick={() => setSelectedSubCategory(sub.name)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-emerald-700 border-emerald-700 text-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {sub.name}
              </button>
            );
          })}
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-2 overflow-x-auto bg-white p-3 rounded-2xl border border-gray-100 no-scrollbar">
          <span className="font-black text-gray-400 uppercase text-[9px] tracking-wider flex items-center gap-1 shrink-0">
            <MapPin className="w-3 h-3 text-emerald-600" /> City / Area:
          </span>
          {GHOTKI_LOCATIONS.map((loc) => (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border shrink-0 ${
                selectedLocation === loc
                  ? 'bg-gray-900 border-gray-900 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-500'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>

        {/* Results Grid */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">
              Featured Properties ({propertyProducts.length})
            </h2>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Verified Title & Direct Owner Deals
            </span>
          </div>

          {propertyProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-tight text-gray-900 text-lg">No Properties Found</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Try adjusting your filters or search keywords, or list a property for sale!
                </p>
              </div>
              <button
                onClick={() => { setSearchTerm(''); setSelectedSubCategory('All'); setSelectedLocation('All'); }}
                className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {propertyProducts.map((product) => {
                const shop = shops.find(s => s.id === product.shopId);
                const whatsapp = product.whatsapp || shop?.whatsapp || '923001234567';

                return (
                  <div key={product.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                    <div className="relative h-52 bg-gray-100 overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> FOR SALE
                      </div>
                      {product.area_sqft && (
                        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-xl">
                          📐 {product.area_sqft}
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-gray-400 font-black uppercase tracking-wider">
                          <span className="flex items-center gap-1 text-emerald-700 font-bold">
                            <MapPin className="w-3 h-3" /> {product.location_city || shop?.city || 'Ghotki'}
                          </span>
                          <span>{product.subcategory || 'Property'}</span>
                        </div>

                        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
                          {product.name}
                        </h3>

                        <p className="text-xs text-gray-500 line-clamp-2 font-medium">
                          {product.description}
                        </p>

                        {/* Property Specs */}
                        <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-bold text-gray-600">
                          {product.bedrooms && (
                            <span className="bg-gray-100 px-2.5 py-1 rounded-lg">🛏️ {product.bedrooms} Bedrooms</span>
                          )}
                          {product.bathrooms && (
                            <span className="bg-gray-100 px-2.5 py-1 rounded-lg">🚿 {product.bathrooms} Bathrooms</span>
                          )}
                          <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg">
                            ✔ Clear Land Title
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Total Price</p>
                          <p className="text-lg font-black text-emerald-700 italic">
                            PKR {product.price.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/${whatsapp}?text=Hi, I am interested in buying property: ${encodeURIComponent(product.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-green-500 text-white rounded-2xl hover:bg-green-600 shadow-sm active:scale-90 transition-all"
                            title="WhatsApp Owner"
                          >
                            <Phone className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => {
                              addToCart(product);
                              navigate('/cart');
                            }}
                            className="px-4 py-3 bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider rounded-2xl shadow-md hover:bg-emerald-800 active:scale-95 transition-all"
                          >
                            Reserve Token
                          </button>
                        </div>
                      </div>
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

export default PropertyPortalView;
