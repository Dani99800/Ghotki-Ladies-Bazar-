
export type UserRole = 'ADMIN' | 'SELLER' | 'BUYER' | 'GUEST';

export interface User {
  id: string;
  name: string;
  mobile: string;
  role: UserRole;
  city?: string;
  address?: string;
}

export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  owner_id?: string; // Link to user profile ID
  cnic?: string;
  mobile: string;
  whatsapp: string;
  bazaar: string;
  address: string;
  latLng?: { lat: number; lng: number };
  category: string;
  logo: string;
  banner: string;
  bio: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  isRegistrationPaid: boolean;
  registrationFee: number;
  payoutMethods: string[];
  deliveryFee: number;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
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
  tags: ('New' | 'Trending' | 'Best Seller' | 'Sale')[];
  stock: number;
  createdAt?: string;
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
  platformFee: number; // 50 PKR per sale
  total: number;
  deliveryType: 'PICKUP' | 'DELIVERY';
  status: 'PENDING' | 'PAYMENT_RECEIVED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: 'EasyPaisa' | 'JazzCash' | 'Bank Transfer' | 'COD';
  isDeliveryPaidAdvance: boolean;
  buyerName?: string;
  buyerMobile?: string;
  buyerAddress?: string;
  createdAt: string;
}
