import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, MapPin, Search, PlusCircle, ShieldCheck, Phone, Filter, Store, Home, Car, Calendar, CheckCircle2, ChevronRight, Tag } from 'lucide-react';
import { Product, Shop, User as UserType } from '../types';
import PortalHeaderBar from '../components/PortalHeaderBar';
import { GHOTKI_LOCATIONS } from '../constants';

interface RentalsPortalViewProps {
  products: Product[];
  shops: Shop[];
  user?: UserType | null;
  addToCart: (p: Product) => void;
}

const RentalsPortalView: React.FC<RentalsPortalViewProps> = ({ products, shops, user, addToCart }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('All');

  // Filter products for Rental Portal
  const rentalProducts = useMemo(() => {
    return products.filter(p => {
      const isRentalCat = p.category === 'Rentals & Leases' || 
                          p.portal_type === 'RENTAL' || 
                          p.name.toLowerCase().includes('rent') || 
                          p.description.toLowerCase().includes('rent') ||
                          p.subcategory?.toLowerCase().includes('rent');

      if (!isRentalCat) return false;

      const matchesSearch = !searchTerm || 
                            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSub = selectedSubCategory === 'All' || 
                         (p.subcategory || '').toLowerCase().includes(selectedSubCategory.toLowerCase());

      const pShop = shops.find(s => s.id === p.shopId);
      const locStr = `${p.location_city || ''} ${pShop?.city || ''} ${pShop?.bazaar || ''} ${pShop?.address || ''}`.toLowerCase();
      const matchesLoc = selectedLocation === 'All' || locStr.includes(selectedLocation.toLowerCase());

      const matchesPeriod = selectedPeriod === 'All' || p.rental_period === selectedPeriod;

      return matchesSearch && matchesSub && matchesLoc && matchesPeriod;
    });
  }, [products, shops, searchTerm, selectedSubCategory, selectedLocation, selectedPeriod]);

  const rentalSubcategories = [
    { name: 'All', icon: KeyRound },
    { name: 'Shops for Rent', icon: Store },
    { name: 'Houses & Flats for Rent', icon: Home },
    { name: 'Vehicles for Rent', icon: Car },
    { name: 'Event Gear for Rent', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <PortalHeaderBar activePortal="RENTAL" />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-indigo-200 text-[10px] font-black uppercase tracking-widest">
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" /> Dedicated Rental Portal
            </div>
            <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter">
              Ghotki & Sukkur Rental Hub
            </h1>
            <p className="text-xs md:text-sm text-indigo-200 max-w-xl font-medium leading-relaxed">
              Find commercial shops for rent, family houses, apartments, vehicles, and event equipment. Direct landlord contact & verified lease bookings.
            </p>
          </div>

          <button
            onClick={() => navigate(user ? '/seller' : '/login')}
            className="px-6 py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-900/50 flex items-center gap-2 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> List Property or Item for Rent
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
            placeholder="Search shops, houses, flats, cars or gear for rent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none font-bold text-sm text-gray-800 placeholder-gray-400"
          />
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
          {/* Subcategory Pills */}
          {rentalSubcategories.map((sub) => {
            const Icon = sub.icon;
            const isActive = selectedSubCategory === sub.name;
            return (
              <button
                key={sub.name}
                onClick={() => setSelectedSubCategory(sub.name)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {sub.name}
              </button>
            );
          })}
        </div>

        {/* Location & Period Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-100 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="font-black text-gray-400 uppercase text-[9px] tracking-wider flex items-center gap-1 shrink-0">
              <MapPin className="w-3 h-3 text-indigo-600" /> City:
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

          <div className="flex items-center gap-2">
            <span className="font-black text-gray-400 uppercase text-[9px] tracking-wider">
              Rental Term:
            </span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase text-gray-700 outline-none"
            >
              <option value="All">All Terms</option>
              <option value="Monthly">Monthly Rent</option>
              <option value="Daily">Daily Rent</option>
            </select>
          </div>
        </div>

        {/* Results Grid */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">
              Available Rental Listings ({rentalProducts.length})
            </h2>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Direct Landlord / Owner Contact
            </span>
          </div>

          {rentalProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 space-y-4">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                <KeyRound className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-tight text-gray-900 text-lg">No Rental Listings Found</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Try clearing your search or location filter, or list a new shop or property for rent!
                </p>
              </div>
              <button
                onClick={() => { setSearchTerm(''); setSelectedSubCategory('All'); setSelectedLocation('All'); setSelectedPeriod('All'); }}
                className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rentalProducts.map((product) => {
                const shop = shops.find(s => s.id === product.shopId);
                const whatsapp = product.whatsapp || shop?.whatsapp || '923001234567';

                return (
                  <div key={product.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <KeyRound className="w-3 h-3" /> FOR RENT
                      </div>
                      {product.rental_period && (
                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                          {product.rental_period}
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-gray-400 font-black uppercase tracking-wider">
                          <span className="flex items-center gap-1 text-indigo-600 font-bold">
                            <MapPin className="w-3 h-3" /> {product.location_city || shop?.city || 'Ghotki'}
                          </span>
                          <span>{product.subcategory || 'Rental'}</span>
                        </div>

                        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
                          {product.name}
                        </h3>

                        <p className="text-xs text-gray-500 line-clamp-2 font-medium">
                          {product.description}
                        </p>

                        {/* Rental Specs */}
                        <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-bold text-gray-600">
                          {product.area_sqft && (
                            <span className="bg-gray-100 px-2.5 py-1 rounded-lg">📐 {product.area_sqft}</span>
                          )}
                          {product.bedrooms && (
                            <span className="bg-gray-100 px-2.5 py-1 rounded-lg">🛏️ {product.bedrooms} Beds</span>
                          )}
                          {product.bathrooms && (
                            <span className="bg-gray-100 px-2.5 py-1 rounded-lg">🚿 {product.bathrooms} Baths</span>
                          )}
                          {product.security_deposit && (
                            <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg">
                              🔒 Deposit: PKR {product.security_deposit.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Rent Rate</p>
                          <p className="text-lg font-black text-indigo-600 italic">
                            PKR {product.price.toLocaleString()} <span className="text-xs font-medium text-gray-400">/{product.rental_period === 'Daily' ? 'day' : 'month'}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/${whatsapp}?text=Hi, I am interested in renting: ${encodeURIComponent(product.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-green-500 text-white rounded-2xl hover:bg-green-600 shadow-sm active:scale-90 transition-all"
                            title="Contact Landlord on WhatsApp"
                          >
                            <Phone className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => {
                              addToCart(product);
                              navigate('/cart');
                            }}
                            className="px-4 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider rounded-2xl shadow-md hover:bg-indigo-700 active:scale-95 transition-all"
                          >
                            Book Rental
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

export default RentalsPortalView;
