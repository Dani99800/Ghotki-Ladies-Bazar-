
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, MessageCircle, ShieldCheck, Truck, Store, ArrowLeft, Heart, Share2, Check, Tag, Sparkles
} from 'lucide-react';
import { Product } from '../types';

interface ProductViewProps {
  products: Product[];
  addToCart: (p: Product) => void;
  lang: 'EN' | 'UR';
}

const ProductView: React.FC<ProductViewProps> = ({ products, addToCart, lang }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);
  const [added, setAdded] = useState(false);

  if (!product) return <div className="p-20 text-center font-black uppercase text-gray-300">Style not found</div>;

  const hasOff = product.discount_percentage && product.discount_percentage > 0;

  return (
    <div className="bg-white min-h-screen pb-20 animate-in fade-in duration-500">
      {added && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] bg-gray-900/90 text-white px-5 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-2">
          <Check className="w-3 h-3" /> <span className="font-black uppercase text-[8px] tracking-widest">Added!</span>
        </div>
      )}

      {/* Compact image area for mobile */}
      <div className="relative h-[35vh] md:h-[60vh] md:max-h-[700px] w-full bg-gray-100 overflow-hidden">
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 z-10 p-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-lg active:scale-90 transition-all"><ArrowLeft className="w-5 h-5 text-gray-900" /></button>
        <img src={product.images[0]} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={product.name} />
        
        {/* Compact Event Badge */}
        {product.event_name && (
          <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 bg-pink-600 text-white px-4 py-1.5 md:px-8 md:py-3.5 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 animate-bounce border-2 border-white/30">
            <Sparkles className="w-4 md:w-5 h-4 md:h-5" /> {product.event_name}
          </div>
        )}
      </div>

      <div className="px-5 md:px-6 py-4 md:py-10 max-w-2xl mx-auto space-y-4">
        {/* Combined Header for better density */}
        <div className="flex justify-between items-start gap-4 border-b border-gray-100 pb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {hasOff && <span className="text-red-600 text-[10px] font-black uppercase tracking-tight bg-red-50 px-2 py-0.5 rounded">{product.discount_percentage}% OFF</span>}
              <span className="text-gray-400 text-[10px] font-black uppercase tracking-tight">{product.category}</span>
            </div>
            <h1 className="text-xl md:text-3xl font-black text-gray-900 leading-tight italic uppercase tracking-tighter">{product.name}</h1>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl md:text-4xl text-pink-600 font-black italic tracking-tighter leading-none">PKR {product.price.toLocaleString()}</p>
            {hasOff && <p className="text-sm md:text-xl text-gray-300 font-black line-through italic tracking-tighter leading-none mt-1">PKR {product.original_price?.toLocaleString()}</p>}
          </div>
        </div>

        {/* Style Notes */}
        <div className="space-y-2">
          <h3 className="font-black text-[9px] uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
            <Tag className="w-3 h-3" /> Style Notes
          </h3>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed italic font-medium">
             {product.description || "Premium handcrafted traditional style from the heart of Ghotki's finest boutiques."}
          </p>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="flex items-center gap-3 p-3 bg-pink-50/50 rounded-xl border border-pink-100/50">
             <Truck className="w-4 h-4 text-pink-600" />
             <div>
               <p className="font-black text-[10px] text-gray-900 uppercase">Express</p>
               <p className="text-[8px] text-pink-600 font-black uppercase">24h Ship</p>
             </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50/50 rounded-xl border border-green-100/50">
             <ShieldCheck className="w-4 h-4 text-green-600" />
             <div>
               <p className="font-black text-[10px] text-gray-900 uppercase">Original</p>
               <p className="text-[8px] text-green-600 font-black uppercase">Verified</p>
             </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white/95 backdrop-blur-xl border-t border-gray-100 flex items-center gap-3 z-50 shadow-2xl">
        <button 
          onClick={() => window.open(`https://wa.me/923000000000?text=Hi, I am interested in buying: ${product.name}`)} 
          className="p-4 bg-green-50 text-green-600 rounded-xl active:scale-95 transition-all border border-green-100"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
        <button 
          onClick={() => { addToCart(product); setAdded(true); setTimeout(() => setAdded(false), 3000); }} 
          className="flex-1 bg-pink-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2.5 active:scale-95 transition-all uppercase tracking-widest text-[10px] md:text-xs"
        >
          <ShoppingCart className="w-5 h-5" /> Buy Item
        </button>
      </div>
    </div>
  );
};

export default ProductView;
