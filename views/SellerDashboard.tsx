
import React, { useState, useEffect, useRef } from 'react';
import { 
  PlusCircle, X, Loader2, Settings, Trash2, 
  Check, MessageCircle, Sparkles, Camera, Save, UploadCloud, Store, Trophy, CreditCard, Smartphone, Building2, Edit2, MapPin, Box, Package, History, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { Product, Order, User as UserType, Shop, Category, ProductCondition } from '../types';
import { CATEGORIES, BAZAARS, GHOTKI_LOCATIONS } from '../constants';
import { supabase, uploadFile } from '../services/supabase';

interface SellerDashboardProps {
  products: Product[];
  user: UserType;
  addProduct: (silent?: boolean, force?: boolean) => void;
  orders: Order[];
  shops: Shop[];
  refreshShop: (silent?: boolean, force?: boolean) => void;
  refreshOrders?: () => void;
  categories: Category[];
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ products, user, addProduct, orders, shops, refreshShop, refreshOrders, categories = [] }) => {
  const [activeTab, setActiveTab] = useState<'Inventory' | 'Orders' | 'Settings'>('Inventory');
  const [orderSubTab, setOrderSubTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [uploadingType, setUploadingType] = useState<'LOGO' | 'BANNER' | null>(null);

  const imgInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const myShop = shops.find(s => s.owner_id === user.id);
  const isIndividual = myShop?.seller_type === 'INDIVIDUAL' || myShop?.seller_plan === 'INDIVIDUAL_5';
  const myProductsCount = products.filter(p => p.shopId === myShop?.id).length;
  const isQuotaReached = isIndividual && myProductsCount >= 5;

  const activeCategoryList = categories.length > 0 ? categories : CATEGORIES;

  const [productForm, setProductForm] = useState({
    name: '',
    originalPrice: '',
    discountPercentage: '0',
    price: '', 
    category: activeCategoryList[0]?.name || 'General',
    subcategory: '',
    condition: 'New' as ProductCondition,
    locationCity: myShop?.city || 'Ghotki',
    negotiable: true,
    description: '',
    eventName: '',
    images: [] as string[],
    stock: '1'
  });

  const selectedCategoryObj = activeCategoryList.find(c => c.name === productForm.category || c.id === productForm.category);

  const [settingsForm, setSettingsForm] = useState({
    name: myShop?.name || '',
    whatsapp: myShop?.whatsapp || '',
    logo: myShop?.logo || '',
    banner: myShop?.banner || '',
    bio: myShop?.bio || '',
    address: myShop?.address || '',
    bazaar: myShop?.bazaar || BAZAARS[0],
    category: myShop?.category || '',
    city: myShop?.city || 'Ghotki',
    easypaisa: myShop?.easypaisa_number || '',
    jazzcash: myShop?.jazzcash_number || '',
    bank: myShop?.bank_details || ''
  });

  useEffect(() => {
    if (myShop && !loading) {
      setSettingsForm({
        name: myShop.name,
        whatsapp: myShop.whatsapp || '',
        logo: myShop.logo || '',
        banner: myShop.banner || '',
        bio: myShop.bio || '',
        address: myShop.address || '',
        bazaar: myShop.bazaar || BAZAARS[0],
        category: myShop.category || '',
        city: myShop.city || 'Ghotki',
        easypaisa: myShop.easypaisa_number || '',
        jazzcash: myShop.jazzcash_number || '',
        bank: myShop.bank_details || ''
      });
    }
  }, [myShop]);

  useEffect(() => {
    if (editingProduct) {
      setProductForm({
        name: editingProduct.name,
        originalPrice: (editingProduct.original_price || editingProduct.price).toString(),
        discountPercentage: (editingProduct.discount_percentage || '0').toString(),
        price: editingProduct.price.toString(),
        category: editingProduct.category,
        subcategory: editingProduct.subcategory || '',
        condition: (editingProduct.condition as ProductCondition) || 'New',
        locationCity: editingProduct.location_city || myShop?.city || 'Ghotki',
        negotiable: editingProduct.negotiable !== false,
        description: editingProduct.description || '',
        eventName: editingProduct.event_name || '',
        images: Array.isArray(editingProduct.images) ? editingProduct.images : [editingProduct.images as any],
        stock: (editingProduct.stock || 1).toString()
      });
    } else {
      setProductForm({ 
        name: '', 
        originalPrice: '', 
        discountPercentage: '0', 
        price: '', 
        category: activeCategoryList[0]?.name || 'General', 
        subcategory: '', 
        condition: 'New', 
        locationCity: myShop?.city || 'Ghotki', 
        negotiable: true, 
        description: '', 
        eventName: '', 
        images: [], 
        stock: '1' 
      });
    }
  }, [editingProduct, showModal]);

  // Handle Automatic Discount Calculation
  useEffect(() => {
    const orig = parseFloat(productForm.originalPrice);
    const perc = parseFloat(productForm.discountPercentage);
    if (!isNaN(orig) && !isNaN(perc) && perc > 0) {
      const discounted = orig - (orig * (perc / 100));
      setProductForm(prev => ({ ...prev, price: Math.round(discounted).toString() }));
    } else if (!isNaN(orig)) {
      setProductForm(prev => ({ ...prev, price: orig.toString() }));
    }
  }, [productForm.originalPrice, productForm.discountPercentage]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'IMAGE' | 'LOGO' | 'BANNER', replaceIndex?: number) => {
    if (!supabase || !e.target.files?.[0] || !myShop) return;
    const file = e.target.files[0];
    const bucket = 'marketplace';
    
    setLoading(true);
    if (type === 'IMAGE' && replaceIndex !== undefined) setUploadingIdx(replaceIndex);
    if (type === 'LOGO' || type === 'BANNER') setUploadingType(type);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      const finalUrl = await uploadFile(bucket, filePath, file);
      
      if (type === 'IMAGE') {
        if (replaceIndex !== undefined) {
           setProductForm(p => {
             const newImages = [...p.images];
             while (newImages.length <= replaceIndex) newImages.push('');
             newImages[replaceIndex] = finalUrl;
             return { ...p, images: newImages.filter(Boolean) };
           });
        } else {
          setProductForm(p => ({ ...p, images: [...p.images, finalUrl].filter(Boolean) }));
        }
      } else if (type === 'LOGO' || type === 'BANNER') {
        const field = type === 'LOGO' ? 'logo' : 'banner';
        const { error: updateError } = await supabase.from('shops').update({ [field]: finalUrl }).eq('id', myShop.id);
        if (updateError) throw updateError;
        setSettingsForm(prev => ({ ...prev, [type.toLowerCase()]: finalUrl }));
        await refreshShop(true);
      }
    } catch (err: any) {
      console.error("Upload Error:", err);
      alert(`Upload Failed: ${err.message}`);
    } finally {
      setLoading(false);
      setUploadingIdx(null);
      setUploadingType(null);
      if (e.target) e.target.value = '';
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    
    if (!myShop) {
      alert("Error: Your seller profile was not found. Please ensure your shop is registered and approved.");
      return;
    }

    if (!editingProduct && isQuotaReached) {
      alert("Individual Seller Quota Reached: You have published 5 products (PKR 100 plan). Please upgrade to Business Seller (PKR 500/month) for unlimited listings.");
      return;
    }

    if (!productForm.name || !productForm.price || productForm.images.length === 0) {
      alert("Please provide a name, price, and upload at least one image.");
      return;
    }

    setLoading(true);
    try {
      const images = productForm.images.filter(Boolean);
      const payload = {
        shop_id: myShop.id,
        name: productForm.name,
        price: parseFloat(productForm.price),
        original_price: parseFloat(productForm.originalPrice) || parseFloat(productForm.price),
        discount_percentage: parseFloat(productForm.discountPercentage) || 0,
        event_name: productForm.eventName,
        category: productForm.category,
        subcategory: productForm.subcategory || null,
        condition: productForm.condition,
        location_city: productForm.locationCity,
        negotiable: productForm.negotiable,
        description: productForm.description,
        images: images,
        image_urls: images,
        stock: parseInt(productForm.stock) || 1,
        status: 'APPROVED',
        tags: productForm.discountPercentage !== '0' ? [`${productForm.discountPercentage}% OFF`] : [productForm.condition]
      };

      const { error } = editingProduct 
        ? await supabase.from('products').update(payload).eq('id', editingProduct.id)
        : await supabase.from('products').insert(payload);

      if (error) throw error;
      
      await addProduct(true, true);
      setShowModal(false);
      setEditingProduct(null);
      alert(editingProduct ? "Product Updated Successfully!" : "Product Listed Successfully on Ghotki Bazar!");
    } catch (err: any) {
      console.error("Product Submission Error:", err);
      alert("Action failed: " + (err.message || "Unknown error occurred"));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myShop || !supabase) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('shops').update({
        name: settingsForm.name,
        whatsapp: settingsForm.whatsapp,
        bio: settingsForm.bio,
        address: settingsForm.address,
        bazaar: settingsForm.bazaar,
        category: settingsForm.category
      }).eq('id', myShop.id);

      if (error) throw error;
      
      await refreshShop(true, true);
      alert("Basic Information Updated Successfully!");
    } catch (err: any) {
      alert("Update Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myShop || !supabase) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('shops').update({
        easypaisa_number: settingsForm.easypaisa,
        jazzcash_number: settingsForm.jazzcash,
        bank_details: settingsForm.bank
      }).eq('id', myShop.id);

      if (error) throw error;
      
      await refreshShop(true, true);
      alert("Payment Information Updated Successfully!");
    } catch (err: any) {
      alert("Update Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!supabase) return;
    setLoading(true);
    try {
      console.log(`Updating order ${orderId} to ${newStatus}`);
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      
      // AWARD POINTS ON COMPLETION
      if (newStatus === 'COMPLETED') {
        const order = orders.find(o => o.id === orderId);
        if (order && order.buyerId && !order.buyerId.startsWith('guest_')) {
          const pointsAwarded = Math.floor(Number(order.subtotal) / 1000) * 12;
          if (pointsAwarded > 0) {
            console.log(`Awarding ${pointsAwarded} points to buyer ${order.buyerId}`);
            await supabase.rpc('award_order_points', { 
              user_id: order.buyerId, 
              points_to_add: pointsAwarded 
            });
          }
        }
      }

      alert(`Order updated to ${newStatus} successfully!`);
      if (refreshOrders) await refreshOrders();
    } catch (err: any) {
      console.error("Status Update Error:", err);
      alert("Status Update Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const myOrders = orders.filter(o => String(o.sellerId) === String(myShop?.id));
  const activeOrders = myOrders.filter(o => {
    const s = (o.status || '').toUpperCase();
    return s !== 'COMPLETED' && s !== 'CANCELLED';
  });
  const historyOrders = myOrders.filter(o => {
    const s = (o.status || '').toUpperCase();
    return s === 'COMPLETED' || s === 'CANCELLED';
  });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-32">
      {/* Dynamic Merchant Banner */}
      <div className="relative h-56 rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white bg-gray-900 group">
         <img src={settingsForm.banner || undefined} referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-80" alt="Banner" />
         <div onClick={() => bannerInputRef.current?.click()} className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-black/50 backdrop-blur-sm z-10">
           <UploadCloud className="w-10 h-10 text-white" />
           <span className="text-[10px] font-black uppercase text-white tracking-widest mt-2">Update Cover</span>
         </div>
         <input type="file" hidden ref={bannerInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, 'BANNER')} />

         <div className="absolute bottom-6 left-8 flex items-end gap-6 z-20">
            <div className="relative group/logo">
              <div className="w-24 h-24 rounded-[2.5rem] border-4 border-white bg-white overflow-hidden shadow-2xl relative">
                <img src={settingsForm.logo || undefined} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Logo" />
                <div onClick={(e) => { e.stopPropagation(); logoInputRef.current?.click(); }} className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                   <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <input type="file" hidden ref={logoInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, 'LOGO')} />
            </div>
            <div className="text-white drop-shadow-lg mb-2">
               <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{myShop?.name}</h2>
               <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/20 ${myShop?.status === 'APPROVED' ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
                    {myShop?.status || 'PENDING'}
                  </span>
                  <span className="text-[9px] font-black uppercase text-pink-400 tracking-[0.2em]">{myShop?.subscription_tier} PLAN</span>
               </div>
            </div>
         </div>
      </div>

      {/* Primary Navigation Tabs */}
      {!myShop && (
        <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-[2rem] flex items-center gap-4 animate-pulse">
          <AlertTriangle className="w-8 h-8 text-orange-500" />
          <div>
            <p className="font-black text-orange-900 uppercase text-xs">Shop Profile Missing</p>
            <p className="text-[10px] text-orange-700 font-bold">We couldn't find your shop profile. Please contact support or check your registration status.</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-[2.5rem] shadow-inner">
        {[
          { id: 'Inventory', icon: Box, label: 'Products' },
          { id: 'Orders', icon: Package, label: 'Orders' },
          { id: 'Settings', icon: Settings, label: 'Shop Settings' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-white text-pink-600 shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Inventory Tab Content */}
      {activeTab === 'Inventory' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex justify-between items-center px-2">
             <h3 className="font-black uppercase text-[11px] tracking-widest text-gray-400">Merchant Inventory</h3>
             <button onClick={() => { setEditingProduct(null); setShowModal(true); }} className="bg-pink-600 text-white px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95 transition-all">
                <PlusCircle className="w-4 h-4" /> New Style
             </button>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {products.filter(p => p.shopId === myShop?.id).map(p => (
              <div key={p.id} className="bg-white p-5 rounded-[2.5rem] border border-gray-100 flex flex-col gap-4 shadow-sm group hover:shadow-xl transition-all relative">
                <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-gray-50 shadow-inner">
                  <img src={(Array.isArray(p.images) ? p.images[0] : (p as any).image_url) || undefined} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => { setEditingProduct(p); setShowModal(true); }} className="p-3 bg-white text-pink-600 rounded-xl shadow-lg"><Edit2 className="w-4 h-4" /></button>
                     <button onClick={() => { if(window.confirm("Delete style?")) supabase?.from('products').delete().eq('id', p.id).then(() => addProduct(true)); }} className="p-3 bg-white text-red-600 rounded-xl shadow-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  {p.discount_percentage && p.discount_percentage > 0 && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[7px] font-black px-2 py-1 rounded-lg uppercase shadow-lg">-{p.discount_percentage}% OFF</div>
                  )}
                  {p.stock !== undefined && (
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
                      <p className="text-[8px] font-black text-white uppercase tracking-widest">Qty: {p.stock}</p>
                    </div>
                  )}
                </div>
                <div className="px-1">
                  <h4 className="font-black text-xs uppercase truncate text-gray-900 italic leading-none mb-1">{p.name}</h4>
                  <p className="text-pink-600 font-black text-sm italic">PKR {p.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Tab Content */}
      {activeTab === 'Orders' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           <div className="flex gap-2 p-1.5 bg-white border border-gray-100 rounded-full shadow-sm">
             <button onClick={() => setOrderSubTab('ACTIVE')} className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${orderSubTab === 'ACTIVE' ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-400'}`}>Active ({activeOrders.length})</button>
             <button onClick={() => setOrderSubTab('HISTORY')} className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${orderSubTab === 'HISTORY' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400'}`}>History ({historyOrders.length})</button>
           </div>

           <div className="space-y-4">
              {(orderSubTab === 'ACTIVE' ? activeOrders : historyOrders).map(order => (
                <div key={order.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
                   <div className="flex justify-between items-start">
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID: #{String(order.id).slice(-6).toUpperCase()}</p>
                         <h4 className="font-black text-gray-900 uppercase italic text-sm">{order.buyerName}</h4>
                         <p className="text-[10px] text-gray-400 font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-pink-50 text-pink-600'}`}>{order.status}</span>
                   </div>

                   <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                           <span className="font-bold text-gray-700">{item.name} x {item.quantity}</span>
                           <span className="font-black text-pink-600 italic">PKR {item.price.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                         <span className="text-[9px] font-black uppercase text-gray-400">Total Revenue</span>
                         <span className="font-black text-gray-900 text-sm italic">PKR {order.total.toLocaleString()}</span>
                      </div>
                   </div>

                   <div className="flex gap-2">
                      <button onClick={() => window.open(`https://wa.me/${order.buyerMobile}`)} className="flex-1 bg-green-50 text-green-600 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border border-green-100"><MessageCircle className="w-4 h-4" /> WhatsApp</button>
                      {order.status === 'PENDING' && (
                        <button disabled={loading} onClick={() => updateOrderStatus(order.id, 'COMPLETED')} className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg disabled:opacity-50">{loading ? '...' : 'Confirm Payment'}</button>
                      )}
                      {order.status === 'PAID' && (
                        <button disabled={loading} onClick={() => updateOrderStatus(order.id, 'COMPLETED')} className="flex-1 bg-pink-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg disabled:opacity-50">{loading ? '...' : 'Complete Order'}</button>
                      )}
                      {order.status === 'SHIPPED' && (
                        <button disabled={loading} onClick={() => updateOrderStatus(order.id, 'COMPLETED')} className="flex-1 bg-green-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg disabled:opacity-50">{loading ? '...' : 'Order Delivered'}</button>
                      )}
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Settings Tab Content */}
      {activeTab === 'Settings' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           <form onSubmit={handleUpdateBasicInfo} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-black uppercase text-[11px] tracking-widest text-pink-600 flex items-center gap-2"><Store className="w-4 h-4" /> Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-gray-400 ml-4">Shop Display Name</p>
                    <input required className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-pink-500/20" value={settingsForm.name} onChange={e => setSettingsForm({...settingsForm, name: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-gray-400 ml-4">WhatsApp Support #</p>
                    <input required className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-pink-500/20" value={settingsForm.whatsapp} onChange={e => setSettingsForm({...settingsForm, whatsapp: e.target.value})} />
                 </div>
              </div>

              <div className="space-y-1">
                 <p className="text-[9px] font-black uppercase text-gray-400 ml-4">Shop Bio / Slogan</p>
                 <textarea className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none h-24 focus:ring-2 focus:ring-pink-500/20" value={settingsForm.bio} onChange={e => setSettingsForm({...settingsForm, bio: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-gray-400 ml-4">Ghotki Bazaar</p>
                    <select className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none cursor-pointer" value={settingsForm.bazaar} onChange={e => setSettingsForm({...settingsForm, bazaar: e.target.value})}>
                       {BAZAARS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-gray-400 ml-4">Shop Category</p>
                    <select className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none cursor-pointer" value={settingsForm.category} onChange={e => setSettingsForm({...settingsForm, category: e.target.value})}>
                       {(categories.length > 0 ? categories : CATEGORIES).map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-gray-400 ml-4">Specific Address</p>
                    <input className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-pink-500/20" value={settingsForm.address} onChange={e => setSettingsForm({...settingsForm, address: e.target.value})} />
                 </div>
              </div>
              <button disabled={loading} className="w-full py-4 bg-pink-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all">
                {loading ? <Loader2 className="animate-spin" /> : <><Save className="w-5 h-5" /> Save Basic Info</>}
              </button>
           </form>

           <form onSubmit={handleUpdatePaymentInfo} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-black uppercase text-[11px] tracking-widest text-green-600 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment Collection (Accounts)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-gray-400 ml-4 flex items-center gap-2"><Smartphone className="w-3 h-3" /> EasyPaisa Number</p>
                    <input placeholder="03xx..." className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none" value={settingsForm.easypaisa} onChange={e => setSettingsForm({...settingsForm, easypaisa: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-gray-400 ml-4 flex items-center gap-2"><Smartphone className="w-3 h-3" /> JazzCash Number</p>
                    <input placeholder="03xx..." className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none" value={settingsForm.jazzcash} onChange={e => setSettingsForm({...settingsForm, jazzcash: e.target.value})} />
                 </div>
              </div>

              <div className="space-y-1">
                 <p className="text-[9px] font-black uppercase text-gray-400 ml-4 flex items-center gap-2"><Building2 className="w-3 h-3" /> Bank Details (IBAN/Account)</p>
                 <textarea placeholder="Bank Name, Account Title, IBAN..." className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none h-24" value={settingsForm.bank} onChange={e => setSettingsForm({...settingsForm, bank: e.target.value})} />
              </div>
              <button disabled={loading} className="w-full py-4 bg-green-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all">
                {loading ? <Loader2 className="animate-spin" /> : <><Save className="w-5 h-5" /> Save Payment Info</>}
              </button>
           </form>
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-white w-full max-w-lg rounded-t-[4rem] p-10 space-y-8 animate-in slide-in-from-bottom-full duration-500 max-h-[95vh] overflow-y-auto no-scrollbar border-t-8 border-pink-600">
              <div className="flex items-center justify-between">
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">{editingProduct ? 'Refine Style' : 'New Creation'}</h2>
                 <button onClick={() => setShowModal(false)} className="p-4 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-6 pb-12">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase text-gray-400 ml-4">Product Images (Max 3)</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[0, 1, 2].map((idx) => (
                        <div 
                          key={idx}
                          onClick={() => {
                            if (!productForm.images[idx] && !loading) {
                              (imgInputRef.current as any)._glb_target_idx = idx;
                              imgInputRef.current?.click();
                            }
                          }} 
                          className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer overflow-hidden group relative"
                        >
                          {uploadingIdx === idx ? (
                             <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-6 h-6 text-pink-600 animate-spin" />
                                <span className="text-[7px] font-black uppercase text-pink-600">Uploading...</span>
                             </div>
                          ) : productForm.images[idx] ? (
                            <>
                              <img src={productForm.images[idx]} className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProductForm(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));
                                }} 
                                className="absolute top-1 right-1 bg-white/80 p-1 rounded-lg text-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <div 
                                onClick={(e) => {
                                   e.stopPropagation();
                                   if (loading) return;
                                   (imgInputRef.current as any)._glb_target_idx = idx;
                                   imgInputRef.current?.click();
                                }}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                              >
                                 <Camera className="w-6 h-6 text-white" />
                              </div>
                            </>
                          ) : (
                            <>
                              <Camera className="w-6 h-6 text-gray-300" />
                              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-center px-1">
                                {idx === 0 ? 'Main Photo' : `Angle ${idx + 1}`}
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    <input type="file" hidden ref={imgInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, 'IMAGE', (e.target as any)._glb_target_idx)} />
                  </div>

                 {/* Basic Details */}
                 <div className="space-y-4">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-gray-400 ml-4">Item Title</p>
                      <input required placeholder="e.g. Honda CD 70 2022, iPhone 13 128GB, Silk Suit..." className="w-full p-5 bg-gray-50 rounded-[2rem] font-black text-sm outline-none focus:ring-2 focus:ring-pink-500/10" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-gray-400 ml-4">Category</p>
                        <select className="w-full p-5 bg-gray-50 border border-transparent rounded-[2rem] font-black text-xs outline-none cursor-pointer" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value, subcategory: ''})}>
                          {activeCategoryList.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
                        </select>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-gray-400 ml-4">Condition</p>
                        <select className="w-full p-5 bg-gray-50 border border-transparent rounded-[2rem] font-black text-xs outline-none cursor-pointer" value={productForm.condition} onChange={e => setProductForm({...productForm, condition: e.target.value as any})}>
                          <option value="New">New</option>
                          <option value="Used">Used</option>
                          <option value="Refurbished">Refurbished</option>
                        </select>
                     </div>
                   </div>

                   {selectedCategoryObj?.subcategories && selectedCategoryObj.subcategories.length > 0 && (
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-gray-400 ml-4">Subcategory</p>
                        <select className="w-full p-5 bg-gray-50 border border-transparent rounded-[2rem] font-black text-xs outline-none cursor-pointer" value={productForm.subcategory} onChange={e => setProductForm({...productForm, subcategory: e.target.value})}>
                          <option value="">Select Subcategory (Optional)</option>
                          {selectedCategoryObj.subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                     </div>
                   )}
                 </div>
                 
                 {/* Pricing, Location and Description */}
                 <div className="bg-gray-50/50 p-6 rounded-[3rem] border border-gray-100 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase text-gray-400 ml-4">Price (PKR)</p>
                          <input required type="number" placeholder="Price in PKR" className="w-full p-4 bg-white border border-gray-100 rounded-2xl font-black text-xs outline-none" value={productForm.originalPrice} onChange={e => setProductForm({...productForm, originalPrice: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase text-gray-400 ml-4">Location City</p>
                          <select className="w-full p-4 bg-white border border-gray-100 rounded-2xl font-black text-xs outline-none cursor-pointer" value={productForm.locationCity} onChange={e => setProductForm({...productForm, locationCity: e.target.value})}>
                            {GHOTKI_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                          </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-2">
                       <input type="checkbox" id="neg_chk" checked={productForm.negotiable} onChange={e => setProductForm({...productForm, negotiable: e.target.checked})} className="w-4 h-4 accent-pink-600 rounded cursor-pointer" />
                       <label htmlFor="neg_chk" className="text-xs font-bold text-gray-700 cursor-pointer">Price is Negotiable (Gunjaysh Hai)</label>
                    </div>

                    <div className="space-y-1">
                       <p className="text-[9px] font-black uppercase text-gray-400 ml-4">Item Description</p>
                       <textarea placeholder="Describe condition, specifications, warranty, reason for selling..." className="w-full p-4 bg-white border border-gray-100 rounded-2xl font-bold text-xs h-24 outline-none" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                    </div>
                 </div>

                 <button type="submit" disabled={loading} className="w-full py-6 bg-gray-900 hover:bg-black text-white font-black rounded-full uppercase tracking-widest text-xs shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                   {loading ? <Loader2 className="animate-spin" /> : <><Check className="w-6 h-6" /> {editingProduct ? 'Save Updates' : 'Publish Listing Now'}</>}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
