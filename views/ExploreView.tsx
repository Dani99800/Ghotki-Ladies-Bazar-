
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Play, 
  Volume2, 
  VolumeX,
  Instagram
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

  const videoProducts = products.filter(p => p.videoUrl);
  const allReels = [...videoProducts];

  return (
    <div className="fixed inset-0 bg-black z-[100] overflow-y-scroll snap-y snap-mandatory h-screen no-scrollbar">
      <div className="fixed top-0 left-0 right-0 p-6 flex items-center justify-between z-[110] bg-gradient-to-b from-black/70 to-transparent">
        <button onClick={() => navigate('/')} className="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
           <Play className="w-4 h-4 text-pink-500 fill-pink-500" />
           <h2 className="text-white font-black uppercase tracking-[0.2em] text-[10px] italic">Bazar Live</h2>
        </div>
        <button onClick={() => setMuted(!muted)} className="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white active:scale-90 transition-transform">
          {muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      </div>

      {allReels.map((product) => (
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

  const url = product.videoUrl || '';
  const isInstagram = url.includes('instagram.com');
  const isTikTok = url.includes('tiktok.com');
  const isFacebook = url.includes('facebook.com') || url.includes('fb.watch');

  useEffect(() => {
    if (!isInstagram && !isTikTok && !isFacebook) {
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
    }
  }, [isInstagram, isTikTok, isFacebook]);

  const getEmbedUrl = () => {
    try {
      if (isInstagram) {
        const id = url.split('/reels/')[1]?.split('/')[0] || url.split('/p/')[1]?.split('/')[0] || '';
        return id ? `https://www.instagram.com/reel/${id}/embed` : '';
      }
      if (isTikTok) {
        const id = url.split('/video/')[1]?.split('?')[0] || '';
        return id ? `https://www.tiktok.com/embed/v2/${id}` : '';
      }
      if (isFacebook) {
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0`;
      }
    } catch (e) {
      return '';
    }
    return '';
  };

  const embedUrl = getEmbedUrl();

  return (
    <div className="relative h-screen w-full snap-start bg-gray-900 flex items-center justify-center overflow-hidden">
      {(isInstagram || isTikTok || isFacebook) && embedUrl ? (
        <div className="w-full h-full pt-16">
          <iframe
            src={embedUrl}
            className="w-full h-full border-none"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
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
      )}

      {/* Social Overlay Elements */}
      <div className="absolute bottom-32 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-20">
         <div className="flex items-end justify-between gap-4">
            <div className="flex-1 space-y-2">
               <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-pink-600 text-white text-[8px] font-black rounded uppercase tracking-widest">{product.category}</span>
                  {isInstagram && <Instagram className="w-3 h-3 text-pink-400" />}
                  {!isInstagram && !isTikTok && !isFacebook && <Play className="w-3 h-3 text-cyan-400" />}
               </div>
               <h3 className="text-white font-black text-xl leading-tight">{product.name}</h3>
               <p className="text-pink-400 font-black text-lg">PKR {product.price.toLocaleString()}</p>
            </div>
            <button onClick={onBuy} className="bg-white text-gray-900 font-black px-6 py-4 rounded-2xl flex items-center gap-2 shadow-2xl active:scale-95 transition-all text-[10px] uppercase tracking-widest">
               <ShoppingCart className="w-4 h-4" /> Order Now
            </button>
         </div>
      </div>

      <div className="absolute bottom-40 right-4 flex flex-col gap-6 items-center z-30">
        <button onClick={() => setLiked(!liked)} className={`p-4 backdrop-blur-xl rounded-full border border-white/20 transition-all ${liked ? 'bg-pink-600 text-white' : 'bg-white/10 text-white'}`}>
          <Heart className={`w-5 h-5 ${liked ? 'fill-white' : ''}`} />
        </button>
        <button onClick={onShop} className="w-12 h-12 rounded-full border-2 border-pink-500 overflow-hidden bg-white">
          <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${product.shopId}`} className="w-full h-full object-cover" />
        </button>
        <button className="p-4 bg-white/10 backdrop-blur-xl rounded-full text-white">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ExploreView;
