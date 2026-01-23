

export type UserRole = 'ADMIN' | 'SELLER' | 'BUYER' | 'GUEST';
export type SubscriptionTier = 'BASIC' | 'STANDARD' | 'PREMIUM' | 'NONE';

export interface User {
  id: string;
  name: string;
  mobile: string;
  role: UserRole;
  subscription_tier?: SubscriptionTier;
  address?: string;
  // Added city as it is accessed in ProfileView
  city?: string;
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
  // registration_paid is optional to accommodate mock data inconsistencies
  registration_paid?: boolean;
  logo: string;
  banner: string;
  created_at?: string;
  // Added missing properties used in data.ts to fix "known properties" errors
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
  // Added stock property used in data.ts
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
  platformFee: number; // Updated to 1000 PKR
  total: number;
  // Added CANCELLED to the possible status values as used in OrdersView
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: string;
  buyerName: string;
  buyerMobile: string;
  buyerAddress: string;
  createdAt: string;
  // Added missing properties used in App.tsx and CheckoutView.tsx
  deliveryType?: 'DELIVERY' | 'PICKUP';
  isDeliveryPaidAdvance?: boolean;
}
