
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Share2, Volume2, VolumeX, Store, Sparkles, PlayCircle, Bookmark, Loader2
} from 'lucide-react';
import { Product, Order, User as UserType } from '../types';
import InstantCheckout from '../components/InstantCheckout';

interface ExploreViewProps {
  products: Product[];
  addToCart: (p: Product) => void;
  onPlaceOrder: (o: Order) => void;
  user: UserType | null;
  savedProductIds: string[];
  onToggleSave: (id: string) => void;
  isSavedOnly?: boolean;
}

const ExploreView: React.FC<ExploreViewProps> = ({ 
  products, 
  addToCart, 
  onPlaceOrder, 
  user, 
  savedProductIds = [], 
  onToggleSave,
  isSavedOnly = false
}) => {
  const navigate = useNavigate();
  const [muted, setMuted] = useState(true);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);

  // Filter products that have a valid video URL
  let allReels = products.filter(p => {
    const url = p.videoUrl || (p as any).video_url;
    return url && typeof url === 'string' && url.length > 5;
  });

  if (isSavedOnly && savedProductIds) {
    allReels = allReels.filter(p => savedProductIds.includes(p.id));
  }

  const handleToggleSave = (productId: string) => {
    if (!user) {
      alert("Please sign up to save your favorite reels to your profile!");
      navigate('/login');
      return;
    }
    onToggleSave(productId);
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] overflow-y-scroll snap-y snap-mandatory h-screen no-scrollbar">
      {/* Header Overlay */}
      <div className="fixed top-0 left-0 right-0 p-4 flex items-center justify-between z-[110] bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white active:scale-90 transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
           <Sparkles className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
           <h2 className="text-white font-black uppercase tracking-[0.2em] text-[10px] italic">
             {isSavedOnly ? 'My Saved Reels' : 'Bazar Live'}
           </h2>
        </div>
        <button onClick={() => setMuted(!muted)} className="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white">
          {muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      </div>

      {allReels.length === 0 ? (
        <div className="h-screen w-full flex flex-col items-center justify-center text-white p-10 text-center space-y-6 bg-gray-900">
          <PlayCircle className="w-20 h-20 text-pink-600/10" />
          <div className="space-y-1">
             <p className="font-black uppercase tracking-widest text-xs italic">
               {isSavedOnly ? 'No saved videos yet' : 'Live Feed is Empty'}
             </p>
             <p className="text-white/30 text-[10px] font-bold uppercase">
               {isSavedOnly ? 'Save videos you like while browsing' : 'Sellers are preparing their live collection'}
             </p>
          </div>
          <button onClick={() => navigate('/')} className="bg-pink-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Return Home</button>
        </div>
      ) : allReels.map((product) => (
        <ReelItem 
          key={product.id} 
          product={product} 
          muted={muted} 
          onBuy={() => setCheckoutProduct(product)} 
          onShop={() => navigate(`/shop/${product.shopId}`)}
          isSaved={savedProductIds ? savedProductIds.includes(product.id) : false}
          onSave={() => handleToggleSave(product.id)}
        />
      ))}

      {checkoutProduct && (
        <InstantCheckout 
          product={checkoutProduct} 
          onClose={() => setCheckoutProduct(null)} 
          onPlaceOrder={onPlaceOrder}
          user={user}
          shopId={checkoutProduct.shopId}
        />
      )}
    </div>
  );
};

const ReelItem: React.FC<{ 
  product: Product, 
  muted: boolean, 
  onBuy: () => void, 
  onShop: () => void,
  isSaved: boolean,
  onSave: () => void
}> = ({ product, muted, onBuy, onShop, isSaved, onSave }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const videoUrl = product.videoUrl || (product as any).video_url;

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
      { threshold: 0.7 }
    );
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative h-screen w-full snap-start bg-black flex items-center justify-center overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
           <Loader2 className="w-10 h-10 animate-spin text-pink-600" />
        </div>
      )}
      <video
        ref={videoRef}
        src={videoUrl}
        className="h-full w-full object-contain"
        loop
        muted={muted}
        playsInline
        onLoadStart={() => setLoading(true)}
        onLoadedData={() => setLoading(false)}
        onClick={() => {
          if (playing) videoRef.current?.pause();
          else videoRef.current?.play();
          setPlaying(!playing);
        }}
      />

      {/* Bottom Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 pb-6 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-20 pointer-events-none">
         <div className="flex items-end justify-between gap-4 pointer-events-auto">
            <div className="flex-1 space-y-1.5 drop-shadow-xl">
               <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-pink-600 text-white text-[8px] font-black rounded uppercase tracking-widest">{product.category}</span>
                  <div className="flex items-center gap-1 text-[9px] text-pink-400 font-bold uppercase">
                     <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping"></span> Live
                  </div>
               </div>
               <h3 className="text-white font-black text-lg leading-tight tracking-tighter italic truncate max-w-[180px]">{product.name}</h3>
               <p className="text-pink-400 font-black text-base italic">PKR {product.price.toLocaleString()}</p>
            </div>
            
            <button 
               onClick={(e) => { e.stopPropagation(); onBuy(); }}
               className="bg-white text-gray-900 font-black px-6 py-4 rounded-2xl flex items-center gap-2 shadow-2xl active:scale-95 transition-all text-[10px] uppercase tracking-widest border border-gray-100 mb-2"
            >
               Buy Now
            </button>
         </div>
      </div>

      {/* Side Actions */}
      <div className="absolute bottom-28 right-4 flex flex-col gap-5 items-center z-30 pointer-events-auto">
        <button onClick={(e) => { e.stopPropagation(); setLiked(!liked); }} className={`p-4 backdrop-blur-xl rounded-full border transition-all ${liked ? 'bg-pink-600 text-white border-pink-500 shadow-pink-500/50 shadow-lg scale-110' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}>
          <Heart className={`w-5 h-5 ${liked ? 'fill-white' : ''}`} />
        </button>
        
        <button onClick={(e) => { e.stopPropagation(); onSave(); }} className={`p-4 backdrop-blur-xl rounded-full border transition-all ${isSaved ? 'bg-pink-600 text-white border-pink-500 shadow-lg scale-110' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}>
          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
        </button>

        <button onClick={(e) => { e.stopPropagation(); onShop(); }} className="w-14 h-14 rounded-2xl border-2 border-pink-500 overflow-hidden bg-white shadow-xl flex items-center justify-center group active:scale-90 transition-all">
           <Store className="w-6 h-6 text-pink-600 group-hover:scale-110 transition-transform" />
        </button>
        
        <button className="p-4 bg-white/10 backdrop-blur-xl rounded-full text-white border border-white/10 hover:bg-white/20">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ExploreView;
