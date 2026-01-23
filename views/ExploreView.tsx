
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingCart, Heart, Share2, Play, Volume2, VolumeX, Store, Sparkles
} from 'lucide-react';
import { Product, Order, User as UserType } from '../types';
import InstantCheckout from '../components/InstantCheckout';

interface ExploreViewProps {
  products: Product[];
  addToCart: (p: Product) => void;
  onPlaceOrder: (o: Order) => void;
  user: UserType | null;
}

const ExploreView: React.FC<ExploreViewProps> = ({ products, addToCart, onPlaceOrder, user }) => {
  const navigate = useNavigate();
  const [muted, setMuted] = useState(true);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);

  // Filter products that specifically have a video URL uploaded by the seller
  const allReels = products.filter(p => p.videoUrl && p.videoUrl.length > 5);

  return (
    <div className="fixed inset-0 bg-black z-[100] overflow-y-scroll snap-y snap-mandatory h-screen no-scrollbar">
      {/* Feed Header */}
      <div className="fixed top-0 left-0 right-0 p-6 flex items-center justify-between z-[110] bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={() => navigate('/')} className="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
           <Sparkles className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
           <h2 className="text-white font-black uppercase tracking-[0.2em] text-[10px] italic">Bazar Live</h2>
        </div>
        <button onClick={() => setMuted(!muted)} className="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white active:scale-90 transition-transform">
          {muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      </div>

      {allReels.length === 0 ? (
        <div className="h-screen w-full flex flex-col items-center justify-center text-white p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
             <Play className="w-8 h-8 text-pink-600/50" />
          </div>
          <div className="space-y-1">
             <p className="font-black uppercase tracking-widest text-xs italic">Live Feed is Empty</p>
             <p className="text-white/40 text-[10px] font-bold uppercase">Sellers haven't uploaded videos yet</p>
          </div>
          <button onClick={() => navigate('/')} className="bg-pink-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Back to Bazar</button>
        </div>
      ) : allReels.map((product) => (
        <ReelItem 
          key={product.id} 
          product={product} 
          muted={muted} 
          onBuy={() => setCheckoutProduct(product)} 
          onShop={() => navigate(`/shop/${product.shopId}`)}
        />
      ))}

      {checkoutProduct && (
        <InstantCheckout 
          product={checkoutProduct} 
          onClose={() => setCheckoutProduct(null)} 
          onPlaceOrder={onPlaceOrder}
          user={user}
        />
      )}
    </div>
  );
};

const ReelItem: React.FC<{ product: Product, muted: boolean, onBuy: () => void, onShop: () => void }> = ({ product, muted, onBuy, onShop }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
          setPlaying(true);
        } else {
          videoRef.current?.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.6 }
    );
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative h-screen w-full snap-start bg-gray-900 flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        src={product.videoUrl}
        className="h-full w-full object-cover"
        loop
        muted={muted}
        playsInline
        onClick={() => {
          if (playing) videoRef.current?.pause();
          else videoRef.current?.play();
          setPlaying(!playing);
        }}
      />

      {/* Product Information Overlay */}
      <div className="absolute bottom-32 left-0 right-0 p-6 bg-gradient-to-t from-black/95 via-black/30 to-transparent z-20">
         <div className="flex items-end justify-between gap-4">
            <div className="flex-1 space-y-2">
               <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-pink-600 text-white text-[8px] font-black rounded uppercase tracking-widest">{product.category}</span>
                  <div className="flex items-center gap-1 text-[9px] text-pink-400 font-bold uppercase animate-pulse">
                     <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span> Live Now
                  </div>
               </div>
               <h3 className="text-white font-black text-2xl leading-tight tracking-tighter italic">{product.name}</h3>
               <p className="text-pink-400 font-black text-xl italic">PKR {product.price.toLocaleString()}</p>
            </div>
            <button 
               onClick={(e) => { e.stopPropagation(); onBuy(); }}
               className="bg-white text-gray-900 font-black px-8 py-5 rounded-[2rem] flex items-center gap-3 shadow-2xl active:scale-95 transition-all text-[11px] uppercase tracking-widest"
            >
               <ShoppingCart className="w-4 h-4" /> Order
            </button>
         </div>
      </div>

      {/* Interaction Column */}
      <div className="absolute bottom-40 right-4 flex flex-col gap-6 items-center z-30">
        <button onClick={(e) => { e.stopPropagation(); setLiked(!liked); }} className={`p-4 backdrop-blur-3xl rounded-full border border-white/20 transition-all ${liked ? 'bg-pink-600 text-white border-pink-500' : 'bg-white/10 text-white'}`}>
          <Heart className={`w-5 h-5 ${liked ? 'fill-white' : ''}`} />
        </button>
        
        <button onClick={(e) => { e.stopPropagation(); onShop(); }} className="w-14 h-14 rounded-2xl border-2 border-pink-500 overflow-hidden bg-white shadow-xl flex items-center justify-center group active:scale-90 transition-all">
           <Store className="w-6 h-6 text-pink-600 group-hover:scale-110 transition-transform" />
        </button>
        
        <button className="p-4 bg-white/10 backdrop-blur-3xl rounded-full text-white border border-white/10">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ExploreView;
