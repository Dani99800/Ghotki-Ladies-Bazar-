
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  MessageCircle, 
  ShieldCheck, 
  Truck, 
  Store, 
  ArrowLeft, 
  Sparkles,
  Heart,
  Share2,
  Check
} from 'lucide-react';
import { Product } from '../types';
import { geminiService } from '../services/gemini';

interface ProductViewProps {
  products: Product[];
  addToCart: (p: Product) => void;
  lang: 'EN' | 'UR';
}

const ProductView: React.FC<ProductViewProps> = ({ products, addToCart, lang }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);
  const [aiDesc, setAiDesc] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setLoadingAi(true);
      geminiService.generateProductDescription(product.name, product.category)
        .then(async (desc) => {
          if (lang === 'UR') {
            const urdu = await geminiService.translateToUrdu(desc);
            setAiDesc(urdu);
          } else {
            setAiDesc(desc);
          }
        })
        .finally(() => setLoadingAi(false));
    }
  }, [product, lang]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product) return <div className="p-8 text-center">Product not found</div>;

  return (
    <div className="bg-white min-h-screen pb-32 animate-in fade-in duration-500">
      {added && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-pink-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4">
          <Check className="w-4 h-4" /> Added to Cart!
        </div>
      )}

      <div className="relative aspect-[3/4] md:max-h-[600px] w-full bg-gray-100 overflow-hidden">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg active:scale-90 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </button>
        
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg">
            <Heart className="w-5 h-5 text-pink-500" />
          </button>
          <button className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg">
            <Share2 className="w-5 h-5 text-gray-800" />
          </button>
        </div>

        <img src={product.images[0]} className="w-full h-full object-cover" alt={product.name} />
        
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
          {product.images.map((_, idx) => (
            <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === 0 ? 'bg-pink-600 w-8' : 'bg-white/50 w-2'}`} />
          ))}
        </div>
      </div>

      <div className="px-6 py-8 space-y-8 max-w-2xl mx-auto">
        <div>
          <div className="flex items-center gap-2 mb-3">
            {product.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-pink-50 text-pink-600 text-[10px] font-black rounded-lg uppercase tracking-widest border border-pink-100">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight mb-2">{product.name}</h1>
          <p className="text-3xl text-pink-600 font-black">PKR {product.price.toLocaleString()}</p>
        </div>

        {/* AI Insight Section */}
        <div className="bg-gradient-to-br from-pink-50 to-pink-100/30 rounded-[2rem] p-6 border border-pink-100 relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-pink-200/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
          <h3 className="text-xs font-black text-pink-600 mb-3 flex items-center gap-2 uppercase tracking-widest">
            <Sparkles className="w-4 h-4 fill-pink-600" /> Style Advisor
          </h3>
          {loadingAi ? (
            <div className="space-y-2">
              <div className="h-4 bg-pink-200/50 animate-pulse rounded-full w-full" />
              <div className="h-4 bg-pink-200/50 animate-pulse rounded-full w-4/5" />
            </div>
          ) : (
            <p className="text-gray-800 text-sm leading-relaxed italic font-medium">
              "{aiDesc}"
            </p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-black text-gray-900 border-b border-gray-100 pb-2">Product Details</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100">
             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
               <Truck className="w-5 h-5 text-gray-400" />
             </div>
             <div>
               <p className="font-black text-[10px] text-gray-900 uppercase">Home Delivery</p>
               <p className="text-[10px] text-gray-400 font-bold">Within 24-48h</p>
             </div>
          </div>
          <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100">
             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
               <Store className="w-5 h-5 text-gray-400" />
             </div>
             <div>
               <p className="font-black text-[10px] text-gray-900 uppercase">Store Pickup</p>
               <p className="text-[10px] text-gray-400 font-bold">Instant</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 bg-green-50 rounded-[2rem] border border-green-100 shadow-sm">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="text-xs">
            <p className="font-black text-green-800 text-sm uppercase tracking-tight">Verified Seller Payment</p>
            <p className="text-green-600 font-medium">Secure local payment protection</p>
          </div>
        </div>
      </div>

      {/* Buy Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex items-center gap-4 z-50">
        <button 
          onClick={() => window.open(`https://wa.me/923000000000?text=Hi, I am interested in ${product.name}`)}
          className="p-4 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-all active:scale-90"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
        <button 
          onClick={handleAddToCart}
          className="flex-1 bg-pink-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-pink-200 flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:bg-pink-700"
        >
          <ShoppingCart className="w-5 h-5" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductView;
