
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
    <div className="bg-white min-h-screen pb-32 animate-in fade-in duration-500">
      {added && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-pink-600 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 border-2 border-white">
          <Check className="w-5 h-5" /> <span className="font-black uppercase text-xs tracking-widest">Added to Wardrobe!</span>
        </div>
      )}

      <div className="relative aspect-[3/4] md:max-h-[750px] w-full bg-gray-100 overflow-hidden">
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-10 p-4 bg-white/80 backdrop-blur-md rounded-full shadow-2xl active:scale-90 transition-all"><ArrowLeft className="w-6 h-6 text-gray-900" /></button>
        <img src={product.images[0]} className="w-full h-full object-cover" alt={product.name} />
        
        {/* Restored and Prominent Event Badge */}
        {product.event_name && (
          <div className="absolute bottom-8 left-8 bg-pink-600 text-white px-8 py-3.5 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3 animate-bounce border-4 border-white/50">
            <Sparkles className="w-5 h-5 animate-pulse" /> {product.event_name}
          </div>
        )}
      </div>

      <div className="px-6 py-12 space-y-10 max-w-2xl mx-auto">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            {hasOff && <span className="px-4 py-1.5 bg-red-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-xl border-2 border-red-500">{product.discount_percentage}% OFF BAZAR</span>}
            <span className="px-4 py-1.5 bg-gray-100 text-gray-400 text-[10px] font-black rounded-xl uppercase tracking-widest">{product.category}</span>
          </div>
          
          <h1 className="text-4xl font-black text-gray-900 leading-[1.1] italic uppercase tracking-tighter">{product.name}</h1>
          
          <div className="flex items-baseline gap-5">
            <p className="text-5xl text-pink-600 font-black italic tracking-tighter">PKR {product.price.toLocaleString()}</p>
            {hasOff && <p className="text-2xl text-gray-300 font-black line-through italic tracking-tighter">PKR {product.original_price?.toLocaleString()}</p>}
          </div>
        </div>

        <div className="p-8 bg-gray-50 rounded-[3.5rem] border border-gray-100 space-y-4">
          <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
            <Tag className="w-3.5 h-3.5" /> Style Notes
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed italic font-medium">{product.description || "Premium handcrafted traditional style from the heart of Ghotki's finest boutiques."}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-5 p-7 bg-pink-50 rounded-[2.5rem] border border-pink-100">
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-pink-600 shadow-sm"><Truck className="w-7 h-7" /></div>
             <div>
               <p className="font-black text-[11px] text-gray-900 uppercase italic leading-none">Ghotki Express</p>
               <p className="text-[9px] text-pink-600 font-black uppercase tracking-widest mt-1">24 Hour Dispatch</p>
             </div>
          </div>
          <div className="flex items-center gap-5 p-7 bg-green-50 rounded-[2.5rem] border border-green-100">
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm"><ShieldCheck className="w-7 h-7" /></div>
             <div>
               <p className="font-black text-[11px] text-green-900 uppercase italic leading-none">Verified Style</p>
               <p className="text-[9px] text-green-600 font-black uppercase tracking-widest mt-1">100% Boutique Original</p>
             </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-2xl border-t border-gray-100 flex items-center gap-5 z-50 shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
        <button onClick={() => window.open(`https://wa.me/923000000000?text=Hi, I am interested in buying: ${product.name}`)} className="p-6 bg-green-50 text-green-600 rounded-[2rem] active:scale-90 transition-all border border-green-100 shadow-xl shadow-green-100/50"><MessageCircle className="w-7 h-7" /></button>
        <button onClick={() => { addToCart(product); setAdded(true); setTimeout(() => setAdded(false), 3000); }} className="flex-1 bg-pink-600 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-pink-200 flex items-center justify-center gap-4 active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-xs border-b-4 border-pink-800">
          <ShoppingCart className="w-6 h-6" /> Add to Closet
        </button>
      </div>
    </div>
  );
};

export default ProductView;
