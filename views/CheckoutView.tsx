
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Store, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, User, Phone, MapPin, Trophy, Star, KeyRound, Building2, Car, Calendar, FileText } from 'lucide-react';
import { CartItem, User as UserType, Order, Shop, LoyaltyPlan } from '../types';
import { PLATFORM_FEE_PKR, NOTIFICATION_SOUND } from '../constants';

interface CheckoutViewProps {
  cart: CartItem[];
  clearCart: () => void;
  user: UserType | null;
  lang: 'EN' | 'UR';
  onPlaceOrder: (o: Order) => void;
  shops: Shop[];
  loyaltyPlans: LoyaltyPlan[];
}

const CheckoutView: React.FC<CheckoutViewProps> = ({ cart, clearCart, user, lang, onPlaceOrder, shops, loyaltyPlans = [] }) => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [payment, setPayment] = useState<'EasyPaisa' | 'JazzCash' | 'COD'>('EasyPaisa');
  const [orderComplete, setOrderComplete] = useState(false);

  // Portal Detection
  const hasRentals = cart.some(i => i.portal_type === 'RENTAL' || i.category === 'Rentals & Leases');
  const hasProperty = cart.some(i => i.portal_type === 'PROPERTY' || i.category === 'Property & Real Estate');
  const hasMotors = cart.some(i => i.portal_type === 'MOTOR' || i.category === 'Cars & Vehicles');

  // Category Booking Fields
  const [cnicNumber, setCnicNumber] = useState('');
  const [bookingStartDate, setBookingStartDate] = useState('');
  const [rentalDuration, setRentalDuration] = useState('6 Months');
  const [guarantorContact, setGuarantorContact] = useState('');
  const [tourInspectionDate, setTourInspectionDate] = useState('');
  const [testDriveDate, setTestDriveDate] = useState('');

  // Check Loyalty
  const activePlan = loyaltyPlans.find(p => p.id === user?.loyalty_plan_id);
  const isLoyaltyExpired = user?.loyalty_expiry ? new Date(user.loyalty_expiry) < new Date() : false;
  const effectiveLoyalty = isLoyaltyExpired ? null : activePlan;
  
  const [guestInfo, setGuestInfo] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    address: user?.address || ''
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate Loyalty Discount
  const loyaltyDiscount = effectiveLoyalty ? Math.round(subtotal * (effectiveLoyalty.discount_percentage / 100)) : 0;
  
  // Calculate Delivery Fee
  const standardDelivery = method === 'DELIVERY' ? 150 : 0;
  const deliveryFee = (method === 'DELIVERY' && effectiveLoyalty?.free_delivery) ? 0 : standardDelivery;

  const total = subtotal - loyaltyDiscount + deliveryFee;

  const playNotification = () => {
    const audio = new Audio(NOTIFICATION_SOUND);
    audio.play().catch(e => console.log("Audio play blocked", e));
  };

  const handlePlaceOrder = async () => {
    if (!guestInfo.name || !guestInfo.mobile || !guestInfo.address) {
      alert("Please fill in your contact and address details.");
      return;
    }

    if ((hasRentals || hasProperty || hasMotors) && !cnicNumber) {
      alert("Please enter your CNIC / Driving License number for verification.");
      return;
    }

    const sellersInCart: string[] = Array.from(new Set(cart.map(item => item.shopId)));
    
    try {
      for (const shopId of sellersInCart) {
        const shop = shops.find(s => s.id === shopId);
        if (!shop) continue;

        const sellerItems = cart.filter(item => item.shopId === shopId);
        const sellerSubtotal = sellerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const sellerLoyaltyDiscount = effectiveLoyalty ? Math.round(sellerSubtotal * (effectiveLoyalty.discount_percentage / 100)) : 0;
        const sellerDeliveryFee = (method === 'DELIVERY' && effectiveLoyalty?.free_delivery) ? 0 : (method === 'DELIVERY' ? 150 : 0);
        
        const primaryPortal = hasRentals ? 'RENTAL' : hasProperty ? 'PROPERTY' : hasMotors ? 'MOTOR' : 'MARKETPLACE';

        const order: Order = {
          id: 'ord_' + Math.random().toString(36).substr(2, 9),
          buyerId: user?.id || 'guest_' + Date.now(),
          sellerId: shop.id, 
          items: sellerItems,
          subtotal: sellerSubtotal,
          deliveryFee: sellerDeliveryFee,
          platformFee: PLATFORM_FEE_PKR,
          total: sellerSubtotal + sellerDeliveryFee + PLATFORM_FEE_PKR - sellerLoyaltyDiscount,
          status: 'PENDING',
          paymentMethod: payment,
          buyerName: guestInfo.name,
          buyerMobile: guestInfo.mobile,
          buyerAddress: guestInfo.address,
          createdAt: new Date().toISOString(),

          portalType: primaryPortal,
          cnicNumber: cnicNumber,
          bookingStartDate: bookingStartDate,
          rentalDuration: rentalDuration,
          guarantorContact: guarantorContact,
          tourInspectionDate: tourInspectionDate,
          testDriveDate: testDriveDate,
          tokenAmount: sellerSubtotal
        };
        await onPlaceOrder(order);
      }

      playNotification();
      setOrderComplete(true);
      setTimeout(() => {
        clearCart();
        navigate('/');
      }, 3500);
    } catch (err: any) {
      console.error("Cart checkout error:", err);
      alert(`Failed to place order: ${err.message || 'Unknown error'}`);
    }
  };

  if (orderComplete) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold uppercase italic tracking-tighter text-gray-900">
          {hasRentals ? 'Rental Agreement Submitted!' : hasProperty ? 'Property Token Confirmed!' : hasMotors ? 'Test Drive / Token Reserved!' : 'Order Confirmed!'}
        </h1>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          {hasRentals || hasProperty || hasMotors 
            ? 'Your booking request and details have been forwarded to the verified seller. They will contact you shortly on WhatsApp to confirm details.'
            : 'Your order has been sent to the sellers. They will contact you shortly to confirm the delivery.'}
        </p>
        <p className="text-pink-600 font-black animate-pulse text-xs mt-4 uppercase">Redirecting to marketplace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8 pb-32 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">
          {hasRentals ? '🔑 Rental Lease Checkout' : hasProperty ? '🏢 Property Token Checkout' : hasMotors ? '🚗 Vehicle Reservation Checkout' : 'Shopping Checkout'}
        </h1>
      </div>

      {/* CATEGORY SPECIALIZED BANNER */}
      {hasRentals && (
        <div className="bg-gradient-to-r from-indigo-900 to-purple-950 p-5 rounded-3xl text-white space-y-2 border border-indigo-700/50 shadow-lg">
          <div className="flex items-center gap-2 text-indigo-300 font-black text-xs uppercase tracking-widest">
            <KeyRound className="w-4 h-4 text-indigo-400" /> Rental Agreement & Security Token
          </div>
          <p className="text-xs text-indigo-100 font-medium leading-relaxed">
            Please fill in your CNIC and rental term details below. Your rental booking will lock this shop, home, or vehicle with the landlord.
          </p>
        </div>
      )}

      {hasProperty && (
        <div className="bg-gradient-to-r from-emerald-950 to-teal-950 p-5 rounded-3xl text-white space-y-2 border border-emerald-700/50 shadow-lg">
          <div className="flex items-center gap-2 text-emerald-300 font-black text-xs uppercase tracking-widest">
            <Building2 className="w-4 h-4 text-emerald-400" /> Real Estate Token Deposit & Site Visit
          </div>
          <p className="text-xs text-emerald-100 font-medium leading-relaxed">
            Placing this token deposit reserves this house, plot, or commercial property for you and schedules an official site tour with the owner.
          </p>
        </div>
      )}

      {hasMotors && (
        <div className="bg-gradient-to-r from-amber-950 to-orange-950 p-5 rounded-3xl text-white space-y-2 border border-amber-700/50 shadow-lg">
          <div className="flex items-center gap-2 text-amber-300 font-black text-xs uppercase tracking-widest">
            <Car className="w-4 h-4 text-amber-400" /> Test Drive Reservation & Vehicle Token
          </div>
          <p className="text-xs text-amber-100 font-medium leading-relaxed">
            Reserves a test drive and holds the vehicle for physical inspection in Ghotki/Sukkur.
          </p>
        </div>
      )}

      {/* CATEGORY SPECIFIC INPUT FORM */}
      {(hasRentals || hasProperty || hasMotors) && (
        <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
            Verification & Booking Specification
          </h2>
          <div className="space-y-3">
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                required
                placeholder="CNIC / Driving License Number (e.g. 45102-XXXXXXX-X)"
                className="w-full pl-10 pr-4 py-4 bg-gray-50 rounded-2xl font-bold text-sm text-gray-900 border border-transparent focus:border-indigo-300 outline-none transition-all"
                value={cnicNumber}
                onChange={e => setCnicNumber(e.target.value)}
              />
            </div>

            {hasRentals && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Lease Start Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl font-bold text-xs text-gray-900 outline-none border border-transparent focus:border-indigo-300"
                      value={bookingStartDate}
                      onChange={e => setBookingStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Lease Term</label>
                    <select
                      className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl font-bold text-xs text-gray-900 outline-none border border-transparent focus:border-indigo-300"
                      value={rentalDuration}
                      onChange={e => setRentalDuration(e.target.value)}
                    >
                      <option value="1 Month">1 Month</option>
                      <option value="6 Months">6 Months</option>
                      <option value="1 Year">1 Year Lease</option>
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    placeholder="Guarantor / Reference Contact Number (Optional)"
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 rounded-2xl font-bold text-sm text-gray-900 border border-transparent focus:border-indigo-300 outline-none"
                    value={guarantorContact}
                    onChange={e => setGuarantorContact(e.target.value)}
                  />
                </div>
              </>
            )}

            {hasProperty && (
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Preferred Site Inspection Tour Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl font-bold text-xs text-gray-900 outline-none border border-transparent focus:border-emerald-300"
                  value={tourInspectionDate}
                  onChange={e => setTourInspectionDate(e.target.value)}
                />
              </div>
            )}

            {hasMotors && (
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Preferred Test Drive Appointment Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl font-bold text-xs text-gray-900 outline-none border border-transparent focus:border-amber-300"
                  value={testDriveDate}
                  onChange={e => setTestDriveDate(e.target.value)}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* BASIC CONTACT & DELIVERY INFO */}
      <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
          Buyer / Contact Information
        </h2>
        <div className="space-y-3">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input required placeholder="Full Name" className="w-full pl-10 pr-4 py-4 bg-gray-50 rounded-2xl font-bold text-sm text-gray-900 border border-transparent focus:border-pink-200 outline-none transition-all" value={guestInfo.name} onChange={e => setGuestInfo({...guestInfo, name: e.target.value})} />
          </div>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input required placeholder="Mobile / WhatsApp Number" className="w-full pl-10 pr-4 py-4 bg-gray-50 rounded-2xl font-bold text-sm text-gray-900 border border-transparent focus:border-pink-200 outline-none transition-all" value={guestInfo.mobile} onChange={e => setGuestInfo({...guestInfo, mobile: e.target.value})} />
          </div>
          <div className="relative">
            <MapPin className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
            <textarea required placeholder="Full Delivery / Residential Address" className="w-full pl-10 pr-4 py-4 bg-gray-50 rounded-2xl font-bold text-sm text-gray-900 h-24 border border-transparent focus:border-pink-200 outline-none transition-all" value={guestInfo.address} onChange={e => setGuestInfo({...guestInfo, address: e.target.value})} />
          </div>
        </div>
      </section>

      {!hasRentals && !hasProperty && (
        <section className="space-y-3">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-gray-900">Fulfillment</h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setMethod('DELIVERY')} className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'DELIVERY' ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-gray-200 bg-white text-gray-400'}`}>
              <Truck className="w-6 h-6" /><span className="text-[10px] font-black uppercase">Home Delivery</span>
            </button>
            <button onClick={() => setMethod('PICKUP')} className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'PICKUP' ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-gray-200 bg-white text-gray-400'}`}>
              <Store className="w-6 h-6" /><span className="text-[10px] font-black uppercase">Store Pickup</span>
            </button>
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment / Deposit Method</h2>
        <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden divide-y divide-gray-50 shadow-sm">
          {['EasyPaisa', 'JazzCash', 'COD'].map((p) => (
            <div key={p} onClick={() => setPayment(p as any)} className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <CreditCard className={`w-5 h-5 ${payment === p ? 'text-pink-600' : 'text-gray-300'}`} />
                <span className={`font-bold text-sm ${payment === p ? 'text-gray-900' : 'text-gray-400'}`}>
                  {p === 'COD' && (hasRentals || hasProperty || hasMotors) ? 'Direct Seller Meeting / Cash on Spot' : p}
                </span>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${payment === p ? 'border-pink-600 bg-pink-600 shadow-sm' : 'border-gray-200'}`}>
                {payment === p && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-900 rounded-[3rem] p-8 text-white space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-600/10 rounded-full blur-3xl"></div>
        <div className="space-y-3 relative z-10">
          {!user || user.id.startsWith('guest_') ? (
            <div className="p-4 bg-pink-600/20 border border-pink-600/30 rounded-2xl mb-4 space-y-2 animate-pulse">
               <div className="flex items-center gap-2 text-pink-400">
                  <Star className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Login Opportunity!</span>
               </div>
               <p className="text-[10px] font-medium text-pink-100 italic leading-relaxed">
                 By logging in before placing this order, you would earn <span className="font-black text-pink-400">{Math.floor(subtotal / 1000) * 12} Points</span> worth <span className="font-black text-white">PKR {(Math.floor(subtotal / 1000) * 12 * 0.25).toLocaleString()}</span> in future credit!
               </p>
               <button 
                 onClick={() => navigate('/login')}
                 className="w-full py-2 bg-pink-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg"
               >
                 Login / Signup Now
               </button>
            </div>
          ) : null}
          <div className="flex justify-between text-white/50 text-xs font-black uppercase tracking-widest"><span>Subtotal</span><span>PKR {subtotal.toLocaleString()}</span></div>
          {loyaltyDiscount > 0 && (
            <div className="flex justify-between text-pink-400 text-xs font-black uppercase tracking-widest italic flex items-center gap-2">
               <Trophy className="w-3 h-3" />
               <span>Loyalty Discount (-{effectiveLoyalty?.discount_percentage}%)</span>
               <span className="ml-auto">-PKR {loyaltyDiscount.toLocaleString()}</span>
            </div>
          )}
          {!hasRentals && !hasProperty && (
            <div className="flex justify-between text-white/50 text-xs font-black uppercase tracking-widest">
              <span>Delivery</span>
              <span>{deliveryFee === 0 && method === 'DELIVERY' ? <span className="text-green-400 italic">FREE (LOYALTY)</span> : `PKR ${deliveryFee}`}</span>
            </div>
          )}
          <div className="flex justify-between text-2xl font-black pt-4 border-t border-white/10 italic tracking-tighter"><span>Total Due</span><span className="text-pink-500">PKR {total.toLocaleString()}</span></div>
        </div>
        
        <button onClick={handlePlaceOrder} className="w-full bg-pink-600 hover:bg-pink-500 text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all uppercase tracking-widest text-[11px] relative z-10">
          <ShieldCheck className="w-5 h-5" /> 
          {hasRentals ? 'Confirm Rental Lease Booking' : hasProperty ? 'Confirm Property Token Deposit' : hasMotors ? 'Confirm Vehicle Reservation' : 'Confirm Order'}
        </button>
      </section>
    </div>
  );
};

export default CheckoutView;
