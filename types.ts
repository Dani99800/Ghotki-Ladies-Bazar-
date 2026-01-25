
export type UserRole = 'ADMIN' | 'SELLER' | 'BUYER' | 'GUEST';
export type SubscriptionTier = 'BASIC' | 'STANDARD' | 'PREMIUM' | 'NONE';

export interface User {
  id: string;
  name: string;
  mobile: string;
  role: UserRole;
  subscription_tier?: SubscriptionTier;
  address?: string;
  city?: string;
  savedProductIds?: string[];
}

export interface Shop {
  id: string;
  name: string;
  ownerName?: string;
  owner_id: string;
  bazaar: string;
  category: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  subscription_tier: SubscriptionTier;
  registration_paid?: boolean;
  logo: string;
  banner: string;
  created_at?: string;
  mobile?: string;
  whatsapp?: string;
  address?: string;
  bio?: string;
  isRegistrationPaid?: boolean;
  registrationFee?: number;
  payoutMethods?: string[];
  deliveryFee?: number;
  pickupEnabled?: boolean;
  deliveryEnabled?: boolean;
  featured?: boolean;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  videoUrl?: string; 
  tags: string[];
  createdAt?: string;
  stock?: number;
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
  deliveryType?: 'DELIVERY' | 'PICKUP';
  isDeliveryPaidAdvance?: boolean;
}
