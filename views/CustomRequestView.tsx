
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Send, X, Clock, MapPin, User as UserIcon, Package } from 'lucide-react';
import { supabase } from '../services/supabase';
import { User } from '../types';

interface CustomRequestViewProps {
  user: User;
}

const CustomRequestView: React.FC<CustomRequestViewProps> = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState('');
  const [deliveryDays, setDeliveryDays] = useState(7);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState(user.name || '');
  const [customerAddress, setCustomerAddress] = useState(user.address || '');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (images.length + newFiles.length > 2) {
        alert('You can only upload up to 2 pictures.');
        return;
      }
      
      const newImages = [...images, ...newFiles].slice(0, 2);
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
    if (images.length === 0) {
      alert('Please upload at least one picture of the product.');
      return;
    }

    setLoading(true);
    try {
      const imageUrls: string[] = [];

      for (const file of images) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `custom-requests/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('custom-requests')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('custom-requests')
          .getPublicUrl(filePath);

        imageUrls.push(publicUrl);
      }

      const { error } = await supabase
        .from('custom_requests')
        .insert({
          user_id: user.id,
          product_name: productName,
          delivery_days: deliveryDays,
          image_urls: imageUrls,
          customer_name: customerName,
          customer_address: customerAddress,
          status: 'PENDING'
        });

      if (error) throw error;

      alert('Your request has been submitted successfully!');
      navigate('/');
    } catch (error: any) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 pb-32 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-pink-600" />
        </div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">Custom Request</h1>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Request a specific product you want</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-4 flex items-center gap-2">
              <Package className="w-3 h-3" /> Product Name
            </label>
            <input 
              required
              className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-pink-500/10 transition-all border-transparent focus:border-pink-200"
              placeholder="What are you looking for?"
              value={productName}
              onChange={e => setProductName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-4 flex items-center gap-2">
              <Clock className="w-3 h-3" /> Delivery Days
            </label>
            <input 
              type="number"
              required
              min="1"
              className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-pink-500/10 transition-all border-transparent focus:border-pink-200"
              placeholder="In how many days do you want to receive it?"
              value={deliveryDays}
              onChange={e => setDeliveryDays(parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-4 flex items-center gap-2">
              <UserIcon className="w-3 h-3" /> Your Name
            </label>
            <input 
              required
              className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-pink-500/10 transition-all border-transparent focus:border-pink-200"
              placeholder="Your full name"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-4 flex items-center gap-2">
              <MapPin className="w-3 h-3" /> Delivery Address
            </label>
            <textarea 
              required
              rows={3}
              className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-pink-500/10 transition-all border-transparent focus:border-pink-200 resize-none"
              placeholder="Where should we deliver?"
              value={customerAddress}
              onChange={e => setCustomerAddress(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-4 flex items-center gap-2">
              <Camera className="w-3 h-3" /> Product Pictures (Max 2)
            </label>
            
            <div className="grid grid-cols-2 gap-4">
              {previews.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 group">
                  <img src={url} className="w-full h-full object-cover" alt="Preview" />
                  <button 
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {images.length < 2 && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-all group">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                    <Upload className="w-5 h-5 text-gray-400 group-hover:text-pink-600" />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Upload Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-pink-600 text-white font-black rounded-2xl uppercase tracking-[0.2em] text-xs shadow-xl shadow-pink-600/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Send className="w-4 h-4" /> Submit Request
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CustomRequestView;
