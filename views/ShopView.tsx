
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, MessageCircle, MapPin, Phone, Star, Info, LayoutGrid, ArrowLeft } from 'lucide-react';
import { Shop, Product, Order, User as UserType } from '../types';
import InstantCheckout from '../components/InstantCheckout';

interface ShopViewProps {
  shops: Shop[];
  products: Product[];
  addToCart: (p: Product) => void;
  lang: 'EN' | 'UR';
  user: UserType | null;
  onPlaceOrder: (o: Order) => void;
}

const ShopView: React.FC<ShopViewProps> = ({ shops, products, addToCart, lang, user, onPlaceOrder }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const shop = shops.find(s => s.id === id);
  const shopProducts = products.filter(p => p.shopId === id);
  const [activeTab, setActiveTab] = useState<'Products' | 'About'>('Products');
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);

  if (!shop) return <div className="h-screen flex items-center justify-center font-black uppercase text-gray-400">Shop not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-in fade-in duration-500">
      {/* Banner */}
      <div className="relative h-56 md:h-72 overflow-hidden">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-4 left-4 z-20 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg active:scale-90"
        >
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </button>
        <img src={shop.banner} className="w-full h-full object-cover" alt={shop.name} />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Shop Info Header */}
      <div className="px-4 -mt-16 relative z-10 max-w-2xl mx-auto">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl shadow-pink-100/50 border border-white">
          <div className="flex items-start gap-5">
            <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-white -mt-12 flex-shrink-0">
              <img src={shop.logo} className="w-full h-full object-cover" alt={shop.name} />
            </div>
            <div className="flex-1 space-y-1">
              <h1 className="text-2xl font-black italic uppercase tracking-tighter text-gray-900">{shop.name}</h1>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-pink-500 fill-pink-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-600">Verified Ghotki Partner</span>
              </div>
              <div className="flex items-center gap-2 pt-2 text-gray-400 font-bold text-[10px] uppercase">
                <MapPin className="w-3.5 h-3.5" />
                <span>{shop.bazaar} • {shop.address}</span>
              </div>
            </div>
            <button 
              onClick={() => window.open(`https://wa.me/${shop.whatsapp || shop.mobile}`)}
              className="p-4 bg-green-50 text-green-600 rounded-2xl shadow-lg shadow-green-100 active:scale-90 transition-all"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-10 px-6 mt-10 border-b border-gray-100 justify-center">
        {['Products', 'About'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-pink-600' : 'text-gray-400'}`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-pink-600 rounded-t-full shadow-lg" />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 max-w-4xl mx-auto">
        {activeTab === 'Products' ? (
          <div className="grid grid-cols-2 gap-4">
            {shopProducts.map(product => (
              <div 
                key={product.id}
                className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 group flex flex-col"
              >
                <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                  <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  {product.tags.includes('Sale') && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded shadow-lg">SALE</span>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div onClick={() => navigate(`/product/${product.id}`)}>
                    <h3 className="font-bold text-sm text-gray-900 truncate mb-1">{product.name}</h3>
                    <span className="text-pink-600 font-black text-base italic">PKR {product.price.toLocaleString()}</span>
                  </div>
                  
                  {/* FIXED: High contrast Buy Now button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCheckoutProduct(product);
                    }}
                    className="w-full bg-pink-600 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all shadow-pink-100"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
            {shopProducts.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-300 font-black uppercase text-xs border-4 border-dashed border-gray-100 rounded-[3rem]">
                No items listed yet
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-6 animate-in slide-in-from-bottom-4">
            <div className="space-y-3">
              <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest flex items-center gap-2">
                <Info className="w-4 h-4 text-pink-500" /> About the Merchant
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">{shop.bio || 'This shop has not provided a biography yet.'}</p>
            </div>
            <div className="pt-6 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <Phone className="w-5 h-5 text-pink-500" />
                <span className="font-bold text-gray-700">{shop.mobile}</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <MapPin className="w-5 h-5 text-pink-500" />
                <span className="font-bold text-gray-700">{shop.bazaar}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {checkoutProduct && (
        <InstantCheckout 
          product={checkoutProduct} 
          shopId={shop.id}
          onClose={() => setCheckoutProduct(null)} 
          onPlaceOrder={onPlaceOrder} 
          user={user} 
        />
      )}
    </div>
  );
};

export default ShopView;
