
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, MessageCircle, MapPin, Phone, Star, Info, LayoutGrid } from 'lucide-react';
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

  if (!shop) return <div className="p-8 text-center">Shop not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img src={shop.banner} className="w-full h-full object-cover" alt={shop.name} />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Shop Info Header */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="bg-white rounded-3xl p-5 shadow-xl shadow-pink-100/50 border border-pink-50">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-white -mt-10">
              <img src={shop.logo} className="w-full h-full object-cover" alt={shop.name} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{shop.name}</h1>
              <div className="flex items-center gap-1 text-pink-600">
                <Star className="w-3 h-3 fill-pink-600" />
                <span className="text-xs font-bold">Verified Local Shop</span>
              </div>
            </div>
            <button 
              onClick={() => window.open(`https://wa.me/${shop.whatsapp || shop.mobile}`)}
              className="p-3 bg-green-50 text-green-600 rounded-2xl"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5" />
            <span>{shop.bazaar} • {shop.address}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 px-6 mt-8 border-b">
        <button 
          onClick={() => setActiveTab('Products')}
          className={`pb-3 text-sm font-bold transition-all ${activeTab === 'Products' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-400'}`}
        >
          Products
        </button>
        <button 
          onClick={() => setActiveTab('About')}
          className={`pb-3 text-sm font-bold transition-all ${activeTab === 'About' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-400'}`}
        >
          About Shop
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'Products' ? (
          <div className="grid grid-cols-2 gap-4">
            {shopProducts.map(product => (
              <div 
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer flex flex-col"
              >
                <div className="relative aspect-[3/4] overflow-hidden" onClick={() => navigate(`/product/${product.id}`)}>
                  <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  {product.tags.includes('Sale') && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded">SALE</span>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div onClick={() => navigate(`/product/${product.id}`)}>
                    <h3 className="font-bold text-sm truncate">{product.name}</h3>
                    <span className="text-pink-600 font-bold text-sm">PKR {product.price.toLocaleString()}</span>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCheckoutProduct(product);
                    }}
                    className="w-full bg-pink-600 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest mt-2 active:scale-95 transition-all"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Shop Bio</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{shop.bio || 'No description available for this shop.'}</p>
            </div>
            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-pink-500" />
                <span>{shop.mobile}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Info className="w-4 h-4 text-pink-500" />
                <span>Delivery Fee: PKR {shop.deliveryFee || 150}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {checkoutProduct && (
        <InstantCheckout 
          product={checkoutProduct} 
          shopOwnerId={shop.owner_id}
          onClose={() => setCheckoutProduct(null)} 
          onPlaceOrder={onPlaceOrder} 
          user={user} 
        />
      )}
    </div>
  );
};

export default ShopView;
