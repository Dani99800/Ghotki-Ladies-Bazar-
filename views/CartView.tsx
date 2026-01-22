
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
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

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-6">
        <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center text-pink-600">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Your cart is empty</h2>
          <p className="text-gray-500 max-w-xs">Look like you haven't added anything to your cart yet.</p>
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
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({cart.length})</h1>

      <div className="space-y-4">
        {cart.map(item => (
          <div key={item.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex gap-4">
            <img src={item.images[0]} className="w-24 h-24 object-cover rounded-xl" />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm leading-tight pr-4">{item.name}</h3>
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-pink-600 font-bold mt-1">PKR {item.price}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-4 bg-gray-50 px-3 py-1 rounded-lg border">
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
            Checkout <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartView;
