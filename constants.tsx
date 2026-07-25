
import { AppEvent, Category } from './types';

export const COLORS = {
  primary: 'var(--primary-event, #db2777)',
  secondary: 'var(--accent-event, #be185d)',
  accent: 'var(--accent-bg, #fdf2f8)',
  text: '#111827',
  muted: '#6b7280',
};

export const PK_EVENTS: AppEvent[] = [
  {
    id: 'NORMAL',
    name: 'Ghotki Bazar',
    urduName: 'عام دن',
    primaryColor: '#db2777',
    accentColor: '#be185d',
    emoji: '🛍️',
    bannerText: 'Ghotki District ka Local Buy & Sell Marketplace'
  },
  {
    id: 'RAMZAN',
    name: 'Ramzan Mubarak',
    urduName: 'رمضان مبارک',
    primaryColor: '#065f46',
    accentColor: '#064e3b',
    emoji: '🌙',
    bannerText: 'Ramzan Kareem: Blessed Deals in Ghotki!'
  },
  {
    id: 'EID_FITR',
    name: 'Eid-ul-Fitr Mubarak',
    urduName: 'عید الفطر مبارک',
    primaryColor: '#9333ea',
    accentColor: '#7e22ce',
    emoji: '✨',
    bannerText: 'Celebrate Eid with Local Deals'
  },
  {
    id: 'EID_ADHA',
    name: 'Eid-ul-Adha Mubarak',
    urduName: 'عید الاضحیٰ مبارک',
    primaryColor: '#b45309',
    accentColor: '#92400e',
    emoji: '🐑',
    bannerText: 'Livestock & Eid Special Marketplace'
  }
];

export const GHOTKI_LOCATIONS = [
  'Ghotki',
  'Mirpur Mathelo',
  'Daharki',
  'Ubauro',
  'Sarhad',
  'Adilpur',
  'Sukkur',
  'Pano Aqil',
  'Kashmore',
  'Rahim Yar Khan'
];

export const BAZAARS = [
  'Main Bazar Ghotki',
  'Shahi Bazar',
  'Resham Gali',
  'Station Road Ghotki',
  'Mirpur Mathelo Main Market',
  'Daharki City Center',
  'Ubauro Chowk',
  'Online / Direct Seller'
];

export const CATEGORIES: Category[] = [
  {
    id: 'cars_vehicles',
    name: 'Cars & Vehicles',
    image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600',
    icon: 'Car',
    subcategories: ['Cars', 'Motorcycles', 'Rickshaws', 'Tractors', 'Commercial Vehicles', 'Auto Parts', 'Tyres', 'Car Accessories']
  },
  {
    id: 'mobiles_electronics',
    name: 'Mobiles & Electronics',
    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600',
    icon: 'Smartphone',
    subcategories: ['New Mobile Phones', 'Used Mobile Phones', 'Laptops', 'Computers', 'TVs', 'Refrigerators', 'Washing Machines', 'Air Conditioners', 'Mobile Accessories', 'Other Electronics']
  },
  {
    id: 'fashion_clothing',
    name: 'Fashion & Clothing',
    image_url: 'https://images.unsplash.com/photo-1621112904887-419379ce6824?auto=format&fit=crop&q=80&w=600',
    icon: 'Shirt',
    subcategories: ['Ladies Clothing', 'Men Clothing', 'Kids Clothing', 'Suits', 'Abayas', 'Hijabs', 'Wedding Dresses', 'Bags']
  },
  {
    id: 'shoes_accessories',
    name: 'Shoes & Accessories',
    image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600',
    icon: 'Footprints',
    subcategories: ['Men Shoes', 'Ladies Shoes', 'Kids Shoes', 'Sandals', 'Sports Shoes', 'Bags', 'Wallets', 'Belts']
  },
  {
    id: 'jewelry_beauty',
    name: 'Jewelry & Beauty',
    image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=600',
    icon: 'Sparkles',
    subcategories: ['Gold Jewelry', 'Artificial Jewelry', 'Cosmetics', 'Perfumes', 'Makeup', 'Skincare', 'Bridal Makeup']
  },
  {
    id: 'property_realestate',
    name: 'Property & Real Estate',
    image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=600',
    icon: 'Building',
    subcategories: ['Houses for Sale', 'Houses for Rent', 'Shops for Rent', 'Plots', 'Agricultural Land', 'Commercial Property']
  },
  {
    id: 'furniture_home',
    name: 'Furniture & Home',
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600',
    icon: 'Armchair',
    subcategories: ['New Furniture', 'Used Furniture', 'Beds', 'Sofas', 'Cupboards', 'Tables', 'Home Decoration']
  },
  {
    id: 'agriculture_livestock',
    name: 'Agriculture & Livestock',
    image_url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=600',
    icon: 'Wheat',
    subcategories: ['Cows', 'Buffaloes', 'Goats', 'Sheep', 'Agricultural Machinery', 'Water Pumps', 'Solar Systems', 'Seeds', 'Farming Equipment']
  },
  {
    id: 'general_products',
    name: 'General Products',
    image_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=600',
    icon: 'ShoppingBag',
    subcategories: ['Grocery', 'Kitchen Items', 'Home Products', 'Toys', 'Gifts', 'Stationery', 'Sports Items']
  },
  {
    id: 'jobs_services',
    name: 'Jobs & Services',
    image_url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=600',
    icon: 'Briefcase',
    subcategories: ['Jobs', 'Electricians', 'Plumbers', 'Mechanics', 'Tutors', 'Tailors', 'Photographers', 'Car Rental', 'Event Services']
  }
];

export const SUBSCRIPTION_PLANS = [
  { id: 'FREE', label: 'Basic / Free' },
  { id: 'INDIVIDUAL', label: 'Individual (PKR 100)' },
  { id: 'BUSINESS', label: 'Business (PKR 500/Mo)' },
  { id: 'STANDARD', label: 'Standard Shop' },
  { id: 'PREMIUM', label: 'Premium VIP Shop' }
];

export const SELLER_PLANS = [
  {
    type: 'INDIVIDUAL',
    id: 'INDIVIDUAL_5',
    title: 'Individual Seller Plan',
    price: 100,
    priceLabel: 'PKR 100',
    quota: '1 to 5 Product Listings',
    features: [
      'List 1 to 5 items',
      'Individual seller profile',
      'Upload photos & videos',
      'Direct WhatsApp contact button',
      'Location tag (Ghotki District & nearby)',
      'Condition tag (New / Used)'
    ]
  },
  {
    type: 'BUSINESS',
    id: 'BUSINESS_MONTHLY',
    title: 'Business / Shop Seller Plan',
    price: 500,
    priceLabel: 'PKR 500 / Month',
    quota: 'Unlimited Product Listings',
    features: [
      'Unlimited product listings',
      'Custom Shop Page & Branding (Logo & Cover)',
      'Verified Seller & Top Seller ⭐ Badge eligibility',
      'Customer Requests Access (See what buyers want)',
      'Product videos & reels',
      'Featured store promotion on homepage',
      'Full Seller Dashboard & Analytics'
    ]
  }
];

export const PAYMENT_ACCOUNTS = {
  easypaisa: {
    accountName: 'Ghotki Bazar Admin',
    accountNumber: '0300-1234567'
  },
  jazzcash: {
    accountName: 'Ghotki Bazar Admin',
    accountNumber: '0301-7654321'
  },
  bank: {
    bankName: 'Meezan Bank Limited',
    accountTitle: 'Ghotki Bazar Local Services',
    iban: 'PK12MEZN0001020304050607'
  }
};

export const PLATFORM_FEE_PKR = 0;
export const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3";

