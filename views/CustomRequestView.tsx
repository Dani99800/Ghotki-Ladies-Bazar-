import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Send, X, Clock, MapPin, User as UserIcon, Package, Phone, DollarSign, FileText, CheckCircle2, Sparkles, Store } from 'lucide-react';
import { supabase, uploadFile } from '../services/supabase';
import { User, CustomRequest } from '../types';
import { CATEGORIES } from '../constants';

interface CustomRequestViewProps {
  user?: User | null;
  categories?: any[];
}

const autoDetectCategory = (pName: string, pDesc: string) => {
  const combined = (pName + ' ' + pDesc).toLowerCase();
  if (combined.match(/shoes|joggers|chappal|heels|sandal|boot|peshawari|footwear|sneaker/i)) return 'Footwear';
  if (combined.match(/dress|suit|cloth|kurta|shirt|pant|lawn|frock|dupatta|abaya|hijab|unstitched|fashion/i)) return 'Clothings & Fashion';
  if (combined.match(/mobile|phone|laptop|charger|gadget|airpod|headphone|watch|electronics|tv|camera/i)) return 'Electronics';
  if (combined.match(/ajrak|ralli|embroidery|handicraft|traditional|sindhi/i)) return 'Handicrafts & Ajrak';
  if (combined.match(/almond|kaju|pistachio|dates|khajoor|walnut|dry fruit|pista/i)) return 'Dry Fruits';
  if (combined.match(/mithai|halwa|cake|bakery|sweet|peda|sohan/i)) return 'Sweets & Bakeries';
  if (combined.match(/ring|chain|necklace|earring|makeup|lipstick|cosmetics|jewelry|jewel/i)) return 'Jewelry & Cosmetics';
  return 'General Bazaar';
};

const CustomRequestView: React.FC<CustomRequestViewProps> = ({ user, categories = CATEGORIES }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Form States
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerMobile, setCustomerMobile] = useState(user?.mobile || '');
  const [customerAddress, setCustomerAddress] = useState(user?.address || 'Ghotki District');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deliveryDays, setDeliveryDays] = useState(3);
  const [selectedCategory, setSelectedCategory] = useState('Auto');

  // Images State
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (images.length + newFiles.length > 3) {
        alert('You can upload up to 3 pictures.');
        return;
      }
      
      const newImages = [...images, ...newFiles].slice(0, 3);
      setImages(newImages);
      const newPreviews = newImages.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      alert('Please enter your full name.');
      return;
    }
    if (!customerMobile.trim()) {
      alert('Please enter your mobile/WhatsApp phone number so sellers can contact you.');
      return;
    }
    if (!productName.trim()) {
      alert('Please specify the product name you are looking for.');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload Images to Supabase Storage or convert
      const imageUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        try {
          const file = images[i];
          const path = `custom-requests/${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
          const url = await uploadFile('marketplace', path, file);
          if (url) imageUrls.push(url);
        } catch (e) {
          console.warn('Image upload fallback notice:', e);
        }
      }

      // Detect Category automatically or use selected
      const finalCategory = selectedCategory === 'Auto' || !selectedCategory 
        ? autoDetectCategory(productName, productDescription)
        : selectedCategory;

      const payload: Omit<CustomRequest, 'id'> = {
        user_id: user?.id || null,
        product_name: productName.trim(),
        description: productDescription.trim() || undefined,
        budget: budget ? parseFloat(budget) : undefined,
        category: finalCategory,
        delivery_days: Number(deliveryDays) || 3,
        image_urls: imageUrls,
        customer_name: customerName.trim(),
        customer_mobile: customerMobile.trim(),
        customer_address: customerAddress.trim() || 'Ghotki District',
        status: 'PENDING',
        created_at: new Date().toISOString()
      };

      // Insert to Supabase DB if available
      if (supabase) {
        const { error } = await supabase.from('custom_requests').insert([payload]);
        if (error) console.warn('Supabase custom_request insert notice:', error.message);
      }

      // Save locally as well to ensure immediate display in Admin Panel & Seller Panel
      const saved = localStorage.getItem('glb_custom_requests') || '[]';
      const parsed = JSON.parse(saved);
      const newObj = { ...payload, id: 'req_' + Date.now() };
      parsed.unshift(newObj);
      localStorage.setItem('glb_custom_requests', JSON.stringify(parsed));

      setSubmittedSuccess(true);
    } catch (error: any) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (submittedSuccess) {
    return (
      <div className="max-w-xl mx-auto p-6 my-8 space-y-6 animate-in zoom-in-95 duration-500 text-center">
        <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-gray-100 shadow-2xl space-y-6">
           <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
             <CheckCircle2 className="w-10 h-10" />
           </div>

           <div className="space-y-2">
             <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">Request Sent to All Shops!</h2>
             <p className="text-xs text-gray-500 font-medium max-w-md mx-auto leading-relaxed">
               Your product demand for <strong className="text-pink-600">{productName}</strong> has been sent to the <strong className="text-gray-900">Marketplace Admin & matching merchant stores in Ghotki District</strong>.
             </p>
           </div>

           <div className="bg-pink-50 p-6 rounded-[2.5rem] text-left space-y-2 text-xs border border-pink-100">
             <p className="font-black text-pink-900 uppercase tracking-wider flex items-center gap-1.5">
               <Store className="w-4 h-4 text-pink-600" /> What Happens Next?
             </p>
             <ul className="text-gray-700 space-y-1.5 list-disc list-inside font-medium">
               <li>Sellers in <strong className="text-pink-700">{autoDetectCategory(productName, productDescription)}</strong> will review your item requirements.</li>
               <li>Merchants with matching stock or price will contact you directly at <strong className="text-gray-900">{customerMobile}</strong> via WhatsApp or Phone.</li>
               <li>You can negotiate and receive delivery within {deliveryDays} days!</li>
             </ul>
           </div>

           <div className="flex flex-col sm:flex-row gap-3 pt-4">
             <button 
               onClick={() => {
                 setSubmittedSuccess(false);
                 setProductName('');
                 setProductDescription('');
                 setBudget('');
                 setImages([]);
                 setPreviews([]);
               }}
               className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all"
             >
                Submit Another Demand
             </button>
             <button 
               onClick={() => navigate('/')}
               className="flex-1 py-4 bg-pink-600 hover:bg-pink-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-pink-200 active:scale-95 transition-all"
             >
                Back to Home
             </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6 pb-32 animate-in fade-in duration-500">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-br from-pink-600 via-rose-600 to-gray-900 p-8 rounded-[3rem] text-white text-center space-y-3 shadow-xl relative overflow-hidden">
        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto shadow-inner text-white">
          <Package className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white">Send Product Demand Request</h1>
          <p className="text-[10px] font-black text-pink-200 uppercase tracking-widest">
            Can't find a product in Ghotki? Submit details & all local shops will check stock for you!
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-8 rounded-[3rem] shadow-xl border border-gray-100">
        
        {/* Section 1: Customer Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-pink-600 border-b border-gray-100 pb-2">
            <UserIcon className="w-4 h-4" /> 1. Customer Contact Details
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-gray-400 ml-3 flex items-center gap-1.5">
                <UserIcon className="w-3 h-3 text-pink-500" /> Full Name *
              </label>
              <input 
                type="text"
                required
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-pink-500/20"
                placeholder="e.g. Ali Ahmed"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-gray-400 ml-3 flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-green-500" /> WhatsApp / Mobile Number *
              </label>
              <input 
                type="tel"
                required
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-pink-500/20"
                placeholder="e.g. 0300-1234567"
                value={customerMobile}
                onChange={e => setCustomerMobile(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-3 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-pink-500" /> Delivery Address / Location *
            </label>
            <input 
              type="text"
              required
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-pink-500/20"
              placeholder="e.g. Near Shahi Bazaar, Mirpur Mathelo / Ghotki"
              value={customerAddress}
              onChange={e => setCustomerAddress(e.target.value)}
            />
          </div>
        </div>

        {/* Section 2: Product Request Details */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-pink-600 border-b border-gray-100 pb-2">
            <Package className="w-4 h-4" /> 2. Product Information & Specs
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-3 flex items-center gap-1.5">
              <Package className="w-3 h-3 text-pink-500" /> Product Name / Item Title *
            </label>
            <input 
              type="text"
              required
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-pink-500/20"
              placeholder="e.g. Nike Air Joggers, Ajrak Suit, Samsung Charger"
              value={productName}
              onChange={e => setProductName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-3 flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-pink-500" /> Product Description & Color/Size
            </label>
            <textarea 
              rows={3}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-medium text-xs outline-none focus:ring-2 focus:ring-pink-500/20 resize-none"
              placeholder="Specify size (e.g., Medium/42), preferred color, brand, or specific requirements..."
              value={productDescription}
              onChange={e => setProductDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-gray-400 ml-3 flex items-center gap-1.5">
                <DollarSign className="w-3 h-3 text-emerald-500" /> Target Budget / Expected Price (PKR)
              </label>
              <input 
                type="number"
                placeholder="e.g. 1500"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-pink-500/20"
                value={budget}
                onChange={e => setBudget(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-gray-400 ml-3 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-amber-500" /> How many days can you wait? *
              </label>
              <select 
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-xs outline-none cursor-pointer"
                value={deliveryDays}
                onChange={e => setDeliveryDays(Number(e.target.value))}
              >
                <option value={1}>1 Day (Urgent)</option>
                <option value={2}>2 Days</option>
                <option value={3}>3 Days (Recommended)</option>
                <option value={5}>5 Days</option>
                <option value={7}>7 Days (1 Week)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-3 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-pink-500" /> Category (Auto-Detected or Choose)
            </label>
            <select 
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-xs outline-none cursor-pointer"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="Auto">Auto-Detect: {autoDetectCategory(productName, productDescription)}</option>
              {categories.map((c: any) => (
                <option key={c.id || c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 3: Product Picture */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <label className="text-[9px] font-black uppercase text-gray-400 ml-3 flex items-center gap-1.5">
            <Camera className="w-3 h-3 text-pink-500" /> Upload Product Picture or Sample Photo (Max 3)
          </label>
          
          <div className="grid grid-cols-3 gap-3">
            {previews.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 group">
                <img src={url} className="w-full h-full object-cover" alt="Preview" />
                <button 
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow-lg"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {images.length < 3 && (
              <label className="aspect-square rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50/30 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-pink-50 transition-all group p-2 text-center">
                <Upload className="w-5 h-5 text-pink-500 group-hover:scale-110 transition-transform" />
                <span className="text-[8px] font-black uppercase tracking-wider text-pink-600">Add Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-pink-600 hover:bg-pink-700 text-white font-black rounded-2xl uppercase tracking-[0.2em] text-xs shadow-xl shadow-pink-200 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Send className="w-4 h-4" /> Send Request to All Shops
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CustomRequestView;
