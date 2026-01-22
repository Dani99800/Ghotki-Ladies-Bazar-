
import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  MessageCircle, 
  Share2, 
  Play, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { Product } from '../types';

interface ReelsViewProps {
  products: Product[];
  addToCart: (p: Product) => void;
}

const ReelsView: React.FC<ReelsViewProps> = ({ products, addToCart }) => {
  const navigate = useNavigate();
  const videoProducts = products.filter(p => p.videoUrl);
  const [muted, setMuted] = React.useState(true);

  // If no video products, show some mock ones
  const displayProducts = videoProducts.length > 0 ? videoProducts : [
    {
      id: 'm1',
      name: 'Luxury Embroidered Silk',
      price: 12500,
      videoUrl: 'https://cdn.pixabay.com/vimeo/857701389/cloth-177301.mp4?width=1280&hash=d3782782e3c09199329437145866164f9f78322c',
      shopId: 's1',
      tags: ['Trending'],
      images: []
    } as any,
    {
      id: 'm2',
      name: 'Ghotki Wedding Collection',
      price: 8500,
      videoUrl: 'https://cdn.pixabay.com/vimeo/912807963/shopping-199659.mp4?width=1280&hash=0b55589a1945821c6049215866164f9f78322c',
      shopId: 's1',
      tags: ['New'],
      images: []
    } as any
  ];

  return (
    <div className="fixed inset-0 bg-black z-[100] overflow-y-scroll snap-y snap-mandatory h-screen no-scrollbar">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 p-6 flex items-center justify-between z-[110] bg-gradient-to-b from-black/40 to-transparent">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/20 backdrop-blur-xl rounded-full text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-white font-black uppercase tracking-widest text-sm italic">Shop Reels</h2>
        <button onClick={() => setMuted(!muted)} className="p-2 bg-white/20 backdrop-blur-xl rounded-full text-white">
          {muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      </div>

      {displayProducts.map((product) => (
        <ReelItem 
          key={product.id} 
          product={product} 
          muted={muted} 
          onBuy={() => {
            addToCart(product);
            navigate('/cart');
          }} 
        />
      ))}
    </div>
  );
};

const ReelItem: React.FC<{ product: Product, muted: boolean, onBuy: () => void }> = ({ product, muted, onBuy }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = React.useState(false);

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
      { threshold: 0.5 }
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
      />
      
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
           <Play className="w-16 h-16 text-white/50 fill-white/20" />
        </div>
      )}

      {/* Side Actions */}
      <div className="absolute bottom-32 right-6 flex flex-col gap-6 items-center">
        <div className="flex flex-col items-center gap-1">
          <button className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 active:scale-90 transition-transform">
            <Heart className="w-6 h-6" />
          </button>
          <span className="text-white text-[10px] font-bold">4.2k</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <button className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20">
            <MessageCircle className="w-6 h-6" />
          </button>
          <span className="text-white text-[10px] font-bold">124</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <button className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20">
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Product Card Over Reel */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="flex items-end justify-between gap-4 animate-in slide-in-from-bottom-8 duration-700">
          <div className="space-y-3 flex-1">
             <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-pink-600 text-white text-[9px] font-black rounded-full uppercase tracking-widest">
                  {product.tags[0] || 'Exclusive'}
                </span>
                <span className="text-white/60 text-[10px] font-bold">@Shop_{product.shopId}</span>
             </div>
             <h3 className="text-xl font-black text-white leading-tight">{product.name}</h3>
             <p className="text-pink-400 font-black text-lg">PKR {product.price.toLocaleString()}</p>
          </div>
          <button 
            onClick={onBuy}
            className="mb-2 bg-white text-gray-900 font-black px-6 py-4 rounded-2xl flex items-center gap-2 shadow-xl active:scale-95 transition-all uppercase tracking-widest text-[10px]"
          >
            <ShoppingCart className="w-4 h-4" /> Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReelsView;
