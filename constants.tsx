
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
    subcategories: ['Gold Jewelry', 'Artificial Jewelry', 'Perfumes', 'Makeup', 'Skincare', 'Bridal Makeup']
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
  { id: 'INDIVIDUAL_100', label: 'Individual Trader (PKR 100)' },
  { id: 'SHOP_500', label: 'Local Shop Limited (PKR 500/Mo)' },
  { id: 'BUSINESS_1000', label: 'Standard Business Shop (PKR 1,000/Mo) 🔥 Target' },
  { id: 'PROPERTY_2500', label: 'Property Agency (PKR 2,500/Mo)' }
];

export const SELLER_PLANS = [
  {
    type: 'INDIVIDUAL',
    id: 'INDIVIDUAL_100',
    title: 'Individual Trader',
    price: 100,
    priceLabel: 'PKR 100',
    quota: '1 to 5 Product Listings',
    badge: 'Starter Trial',
    popular: false,
    target: false,
    description: 'For individuals selling personal items or 1 to 5 used products.',
    features: [
      'List 1 to 5 items',
      'Individual seller profile',
      'Direct WhatsApp contact button',
      'Location tag (Ghotki District)',
      'Condition tag (New / Used)'
    ]
  },
  {
    type: 'BUSINESS',
    id: 'SHOP_500',
    title: 'Local Shop (Limited Access)',
    price: 500,
    priceLabel: 'PKR 500 / Month',
    quota: 'Up to 15 Product Listings',
    badge: 'Limited Access',
    popular: false,
    target: false,
    description: 'Basic online presence for small local shops with limited listings.',
    features: [
      'Up to 15 Product Listings',
      'Standard shop profile & logo',
      'Basic WhatsApp inquiry button',
      'Standard search visibility'
    ]
  },
  {
    type: 'BUSINESS',
    id: 'BUSINESS_1000',
    title: 'Standard Business Shop',
    price: 1000,
    priceLabel: 'PKR 1,000 / Month',
    quota: 'UNLIMITED Product Listings',
    badge: '🔥 MOST POPULAR - BEST VALUE (RECOMMENDED)',
    popular: true,
    target: true,
    description: 'Target plan for Cars, Bikes, Mobiles, Laptops, ACs, Electronics & General Retail Shops! Unlimited sales and max visibility.',
    features: [
      'UNLIMITED Product Listings (Cars, Bikes, Mobiles, ACs, Electronics & Retail)',
      'Verified Seller ⭐ & Top Store Badge',
      'Featured Shop Promotion on Homepage & Category Banners',
      'Customer Demand Access (See what buyers request)',
      'HD Video Reels & Photo Showcases',
      'Priority Search Ranking & Top Store Boost',
      'Direct WhatsApp Leads & Buyer Inquiries'
    ]
  },
  {
    type: 'BUSINESS',
    id: 'PROPERTY_2500',
    title: 'Property & Real Estate Agency Plan',
    price: 2500,
    priceLabel: 'PKR 2,500 / Month',
    quota: 'UNLIMITED Property Listings',
    badge: 'Real Estate Special',
    popular: false,
    target: false,
    description: 'Dedicated plan for Real Estate Agencies, Plot Brokers, Houses & Commercial Property dealers.',
    features: [
      'UNLIMITED Property, House, Plot & Shop Listings',
      'Verified Real Estate Agency Badge 🛡️',
      'High-Ticket Buyer Inquiry Delivery to WhatsApp',
      'Featured Banner Showcase in Real Estate Portal',
      'Direct Client Property Tour & Booking Inquiries'
    ]
  }
];

export const PAYMENT_ACCOUNTS = {
  easypaisa: {
    accountName: 'Ghotki Online Directory / Admin',
    accountNumber: '03462904137'
  },
  jazzcash: {
    accountName: 'Ghotki Online Directory / Admin',
    accountNumber: '03462904137'
  },
  bank: {
    bankName: 'Meezan Bank Limited',
    accountTitle: 'Ghotki Online Directory / Admin',
    iban: 'PK12MEZN0001020304050607'
  }
};

export const PLATFORM_FEE_PKR = 0;
export const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3";

