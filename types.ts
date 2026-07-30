
export type UserRole = 'ADMIN' | 'SELLER' | 'BUYER' | 'GUEST';
export type SubscriptionTier = 'BASIC' | 'STANDARD' | 'PREMIUM' | 'NONE';
export type SellerType = 'INDIVIDUAL' | 'BUSINESS';
export type SellerPlan = 'INDIVIDUAL_100' | 'INDIVIDUAL_5' | 'SHOP_500' | 'BUSINESS_1000' | 'PROPERTY_2500' | 'BUSINESS_MONTHLY' | 'NONE';
export type PaymentStatus = 'UNPAID' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type ProductCondition = 'New' | 'Used';

export interface User {
  id: string;
  name: string;
  email?: string;
  mobile: string;
  role: UserRole;
  subscription_tier?: SubscriptionTier;
  seller_type?: SellerType;
  seller_plan?: SellerPlan;
  payment_status?: PaymentStatus;
  payment_proof_url?: string;
  payment_trx_id?: string;
  payment_method?: string;
  address?: string;
  city?: string;
  savedProductIds?: string[];
  points?: number;
  loyalty_plan_id?: string;
  loyalty_expiry?: string;
}

export interface LoyaltyPlan {
  id: string;
  name: string;
  price: number;
  discount_percentage: number;
  free_delivery: boolean;
  gift_info: string;
  free_item_info: string;
  custom_benefits: string[]; // e.g. ["Enter Umra Draw", "Lucky Draw Access"]
  duration_days: number;
  color?: string;
}

export interface SubCategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  image_url: string;
  subcategories?: string[];
  icon?: string;
}

export interface AppEvent {
  id: string;
  name: string;
  urduName: string;
  primaryColor: string;
  accentColor: string;
  emoji: string;
  bannerText: string;
}

export interface Shop {
  id: string;
  name: string;
  ownerName?: string;
  owner_id: string;
  bazaar: string;
  category: string;
  seller_type?: SellerType;
  seller_plan?: SellerPlan;
  payment_status?: PaymentStatus;
  payment_proof_url?: string;
  payment_trx_id?: string;
  payment_method?: string;
  payment_submitted_at?: string;
  plan_expires_at?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  subscription_tier: SubscriptionTier;
  registration_paid?: boolean;
  logo: string;
  banner: string;
  created_at?: string;
  mobile?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  bio?: string;
  easypaisa_number?: string;
  jazzcash_number?: string;
  bank_details?: string;
  featured?: boolean;
  sort_priority?: number; 
  is_top_seller?: boolean;
  is_verified?: boolean;
  ad_wallet_balance?: number;
  portal_type?: 'MARKETPLACE' | 'SHOPPING' | 'PROPERTY' | 'RENTAL' | 'MOTOR';
  cnic_license?: string;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  event_name?: string;
  category: string;
  subcategory?: string;
  condition?: ProductCondition;
  negotiable?: boolean;
  location_city?: string;
  images: string[];
  videoUrl?: string;
  tags: string[];
  createdAt?: string;
  stock?: number;
  is_new_arrival?: boolean;
  sort_priority?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
  report_count?: number;
  whatsapp?: string;
  contact_number?: string;
  seller_type?: SellerType;
  shop_name?: string;
  is_top_seller?: boolean;
  is_ad_active?: boolean;
  ad_status?: 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'INSUFFICIENT_FUNDS';
  ad_started_at?: string;
  ad_days_paid?: number;

  // Portal Specifications
  portal_type?: 'MARKETPLACE' | 'SHOPPING' | 'PROPERTY' | 'RENTAL' | 'MOTOR';
  property_type?: 'House' | 'Plot' | 'Shop' | 'Commercial' | 'Agricultural' | 'Apartment';
  area_sqft?: string;
  bedrooms?: number;
  bathrooms?: number;
  rental_period?: 'Monthly' | 'Daily' | 'Yearly' | 'Hourly';
  security_deposit?: number;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  mileage_km?: number;
  fuel_type?: 'Petrol' | 'Diesel' | 'EV' | 'CNG' | 'Hybrid';
  transmission?: 'Automatic' | 'Manual';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  total: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: string;
  buyerName: string;
  buyerMobile: string;
  buyerAddress: string;
  createdAt: string;

  // Category-Specific Booking Details
  portalType?: 'MARKETPLACE' | 'SHOPPING' | 'PROPERTY' | 'RENTAL' | 'MOTOR';
  cnicNumber?: string;
  bookingStartDate?: string;
  rentalDuration?: string;
  guarantorContact?: string;
  tourInspectionDate?: string;
  testDriveDate?: string;
  tokenAmount?: number;
}

export interface CustomRequest {
  id: string;
  user_id?: string | null;
  product_name: string;
  description?: string;
  budget?: number;
  category?: string;
  location_city?: string;
  delivery_days: number;
  image_urls: string[];
  customer_name: string;
  customer_mobile: string;
  customer_address: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  created_at: string;
}

export interface PaymentProof {
  id: string;
  seller_id: string;
  seller_name: string;
  seller_type: SellerType;
  plan_name: string;
  amount: number;
  payment_method: string;
  trx_id: string;
  proof_url: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export interface AdDeposit {
  id: string;
  shop_id: string;
  shop_name: string;
  seller_id: string;
  seller_name: string;
  amount: number;
  payment_method: string;
  trx_id: string;
  proof_url?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}
