
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, KeyRound, Building2, Car } from 'lucide-react';
import { CartItem } from '../types';

interface CartViewProps {
  cart: CartItem[];
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  lang: 'EN' | 'UR';
}

const CartView: React.FC<CartViewProps> = ({ cart, removeFromCart, updateQuantity, lang }) => {
  const navigate = useNavigate();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const getPortalBadge = (item: CartItem) => {
    if (item.portal_type === 'RENTAL' || item.category === 'Rentals & Leases') {
      return (
        <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full mb-1">
          <KeyRound className="w-2.5 h-2.5" /> Rental Booking
        </span>
      );
    }
    if (item.portal_type === 'PROPERTY' || item.category === 'Property & Real Estate') {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full mb-1">
          <Building2 className="w-2.5 h-2.5" /> Real Estate Token
        </span>
      );
    }
    if (item.portal_type === 'MOTOR' || item.category === 'Cars & Vehicles') {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full mb-1">
          <Car className="w-2.5 h-2.5" /> Test Drive & Token
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-pink-100 text-pink-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full mb-1">
        <ShoppingBag className="w-2.5 h-2.5" /> Marketplace Product
      </span>
    );
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-6">
        <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center text-pink-600">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Your cart is empty</h2>
          <p className="text-gray-500 max-w-xs">Looks like you haven't added any products, rentals, or properties to your cart yet.</p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="bg-pink-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-pink-200"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-32 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Cart Items ({cart.length})</h1>

      <div className="space-y-4">
        {cart.map(item => (
          <div key={item.id} className="bg-white rounded-2xl p-3.5 shadow-xs border border-gray-100 flex gap-4 relative overflow-hidden">
            <img src={item.images[0]} className="w-24 h-24 object-cover rounded-xl shrink-0" />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                {getPortalBadge(item)}
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm leading-tight pr-4">{item.name}</h3>
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-pink-600 font-bold mt-1 text-sm">PKR {item.price.toLocaleString()}</p>

                {/* Category details */}
                {item.rental_period && (
                  <p className="text-[10px] text-indigo-600 font-bold mt-0.5">
                    Rental Term: {item.rental_period} | Deposit: PKR {item.security_deposit?.toLocaleString() || '10,000'}
                  </p>
                )}
                {item.area_sqft && (
                  <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
                    Area: {item.area_sqft} | Location: {item.location_city || 'Ghotki'}
                  </p>
                )}
                {item.vehicle_make && (
                  <p className="text-[10px] text-amber-700 font-bold mt-0.5">
                    Make: {item.vehicle_make} {item.vehicle_model} | Model: {item.vehicle_year}
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Qty</span>
                <div className="flex items-center gap-3 bg-gray-50 px-3 py-1 rounded-lg border">
                  <button onClick={() => updateQuantity(item.id, -1)} className="text-pink-600 p-1">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold min-w-[1rem] text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="text-pink-600 p-1">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="fixed bottom-20 left-0 right-0 p-4 md:relative md:bottom-0">
        <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-pink-100 border border-pink-50 space-y-4">
          <div className="flex justify-between text-gray-600 text-sm">
            <span>Subtotal</span>
            <span>PKR {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-900 font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span className="text-pink-600">PKR {subtotal.toLocaleString()}</span>
          </div>
          <button 
            onClick={() => navigate('/checkout')}
            className="w-full bg-pink-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-pink-200"
          >
            Proceed to Category Checkout <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartView;
