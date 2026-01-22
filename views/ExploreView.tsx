
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  MessageCircle, 
  Share2, 
  Play, 
  Volume2, 
  VolumeX,
  Instagram,
  Sparkles,
  Facebook,
  X,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  Truck,
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import { Product, Order, User as UserType } from '../types';

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

  // Transform social links into embed URLs
  const getEmbedUrl = () => {
    if (isInstagram) {
      const id = url.split('/reels/')[1]?.split('/')[0] || url.split('/p/')[1]?.split('/')[0];
      return `https://www.instagram.com/reel/${id}/embed`;
    }
    if (isTikTok) {
      const id = url.split('/video/')[1]?.split('?')[0];
      return `https://www.tiktok.com/embed/v2/${id}`;
    }
    if (isFacebook) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0`;
    }
    return '';
  };

  return (
    <div className="relative h-screen w-full snap-start bg-gray-900 flex items-center justify-center overflow-hidden">
      {isInstagram || isTikTok || isFacebook ? (
        <div className="w-full h-full pt-16">
          <iframe
            src={getEmbedUrl()}
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
                  {isTikTok && <Play className="w-3 h-3 text-cyan-400" />}
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

const InstantCheckout: React.FC<{ product: Product, onClose: () => void, onPlaceOrder: (o: Order) => void, user: UserType | null }> = ({ product, onClose, onPlaceOrder, user }) => {
  const [step, setStep] = useState<'FORM' | 'SUCCESS'>('FORM');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    address: '',
    method: 'DELIVERY' as 'DELIVERY' | 'PICKUP',
    payment: 'EasyPaisa' as 'EasyPaisa' | 'JazzCash' | 'COD'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const order: Order = {
      id: 'ord_' + Math.random().toString(36).substr(2, 9),
      buyerId: user?.id || 'guest',
      sellerId: product.shopId,
      items: [{ ...product, quantity: 1 }],
      subtotal: product.price,
      deliveryFee: formData.method === 'DELIVERY' ? 150 : 0,
      platformFee: 50,
      total: product.price + (formData.method === 'DELIVERY' ? 150 : 0),
      deliveryType: formData.method,
      status: 'PENDING',
      paymentMethod: formData.payment as any,
      isDeliveryPaidAdvance: formData.payment === 'COD', // COD assumes delivery paid advance in this app logic
      buyerName: formData.name,
      buyerMobile: formData.mobile,
      buyerAddress: formData.address,
      createdAt: new Date().toISOString()
    };

    onPlaceOrder(order);
    setStep('SUCCESS');
    setTimeout(() => onClose(), 2500);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 backdrop-blur-sm">
       <div className="bg-white w-full max-w-lg rounded-t-[3rem] p-8 space-y-6 animate-in slide-in-from-bottom-full duration-500 pb-20 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
          
          {step === 'FORM' ? (
            <>
              <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter">Instant Buy</h2>
                 <button onClick={onClose} className="p-4 bg-gray-50 rounded-full"><X className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="space-y-4">
                    <input required type="text" placeholder="Your Name" className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-none outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <input required type="tel" placeholder="Mobile Number" className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-none outline-none" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                    <textarea required placeholder="Delivery Address" className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-none outline-none h-24" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                 </div>

                 <div className="flex gap-3">
                   <button type="button" onClick={() => setFormData({...formData, method: 'DELIVERY'})} className={`flex-1 py-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest ${formData.method === 'DELIVERY' ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-gray-100 text-gray-400'}`}>Home Delivery</button>
                   <button type="button" onClick={() => setFormData({...formData, method: 'PICKUP'})} className={`flex-1 py-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest ${formData.method === 'PICKUP' ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-gray-100 text-gray-400'}`}>Store Pickup</button>
                 </div>

                 <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment Method</p>
                    <div className="grid grid-cols-3 gap-2">
                       {['EasyPaisa', 'JazzCash', 'COD'].map(m => (
                         <button key={m} type="button" onClick={() => setFormData({...formData, payment: m as any})} className={`py-4 rounded-xl border-2 font-black text-[9px] uppercase tracking-tighter ${formData.payment === m ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-gray-100 text-gray-400'}`}>{m}</button>
                       ))}
                    </div>
                 </div>

                 {formData.payment === 'COD' && (
                   <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex gap-3 items-start">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
                      <p className="text-[10px] font-bold text-yellow-800">
                         <span className="block font-black uppercase">Advance Payment Required</span>
                         For COD, you must pay the delivery fee (PKR 150) in advance via EasyPaisa to confirm your order.
                      </p>
                   </div>
                 )}

                 <div className="p-6 bg-gray-900 rounded-3xl text-white flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Total Payable</span>
                    <span className="text-xl font-black italic">PKR {(product.price + (formData.method === 'DELIVERY' ? 150 : 0)).toLocaleString()}</span>
                 </div>

                 <button type="submit" className="w-full bg-pink-600 text-white font-black py-5 rounded-[2rem] shadow-2xl uppercase tracking-widest text-[11px] active:scale-95 transition-all">
                   Place Order
                 </button>
              </form>
            </>
          ) : (
            <div className="py-20 text-center space-y-4">
               <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto border-4 border-white shadow-xl"><CheckCircle2 className="w-10 h-10" /></div>
               <h2 className="text-2xl font-black uppercase italic">Order Sent!</h2>
               <p className="text-gray-400 text-xs font-bold px-10">The seller will contact you on WhatsApp to confirm payment.</p>
            </div>
          )}
       </div>
    </div>
  );
};

export default ExploreView;
