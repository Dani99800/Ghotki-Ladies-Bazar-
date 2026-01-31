
import { Shop, Product } from './types';

export const MOCK_SHOPS: Shop[] = [
  {
    id: 's1',
    // Added owner_id and subscription_tier to fix missing property errors
    owner_id: 'u_owner_zubeda',
    subscription_tier: 'STANDARD',
    name: 'Zubeda Boutique',
    ownerName: 'Zubeda Khan',
    mobile: '03001234567',
    whatsapp: '923001234567',
    bazaar: 'Ghotki Ladies Bazar',
    address: 'Shop 42, Ghotki Ladies Bazar',
    category: 'Women',
    logo: 'https://images.unsplash.com/photo-1621112904887-419379ce6824?auto=format&fit=crop&q=80&w=200',
    banner: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=800',
    bio: 'Premium traditional wear for the modern woman of Ghotki.',
    status: 'APPROVED',
    // Fix: renamed isRegistrationPaid to registration_paid as per Shop type
    registration_paid: true,
    featured: true,
  },
  {
    id: 's_j',
    // Added owner_id and subscription_tier to fix missing property errors
    owner_id: 'u_owner_j',
    subscription_tier: 'BASIC',
    name: 'J. Boutique',
    ownerName: 'Junaid Jamshed',
    mobile: '03112223334',
    whatsapp: '923112223334',
    bazaar: 'Main Bazar Ghotki',
    address: 'Plaza 5, Main Bazar',
    category: 'Women',
    logo: 'https://images.unsplash.com/photo-1594465911325-1e42f9d37536?auto=format&fit=crop&q=80&w=200',
    banner: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?auto=format&fit=crop&q=80&w=800',
    bio: 'Soully East - Premium unstitched and ready-to-wear collections.',
    status: 'PENDING',
    // Fix: renamed isRegistrationPaid to registration_paid as per Shop type
    registration_paid: true,
    featured: false,
  },
  {
    id: 's_kapeel',
    // Added owner_id and subscription_tier to fix missing property errors
    owner_id: 'u_owner_kapeel',
    subscription_tier: 'PREMIUM',
    name: 'Kapeel Dass Footwear',
    ownerName: 'Kapeel Dass',
    mobile: '03019876543',
    whatsapp: '923019876543',
    bazaar: 'Resham Gali',
    address: 'Main Gate, Resham Gali, Ghotki',
    category: 'Footwear',
    logo: 'https://images.unsplash.com/photo-1594465911325-1e42f9d37536?auto=format&fit=crop&q=80&w=200',
    banner: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
    bio: 'Authentic handcrafted Sindhi sandals and mojris.',
    status: 'APPROVED',
    // Fix: renamed isRegistrationPaid to registration_paid as per Shop type
    registration_paid: true,
    featured: true,
  }
];

export const MOCK_PRODUCTS: Product[] = [
  { 
    id: 'p1', 
    shopId: 's1', 
    name: 'Pure Silk Shalwar Kameez', 
    description: 'Elegant hand-embroidered pure silk suit.', 
    price: 4500, 
    category: 'Women', 
    images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=600'], 
    tags: ['New'], 
    stock: 10,
    videoUrl: 'https://cdn.pixabay.com/vimeo/857701389/cloth-177301.mp4'
  },
  { 
    id: 'p_j1', 
    shopId: 's_j', 
    name: 'J. Floral Lawn 24', 
    description: 'Premium summer lawn collection with digital prints.', 
    price: 6800, 
    category: 'Women', 
    images: ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600'], 
    tags: ['Trending'], 
    stock: 40,
    videoUrl: 'https://instagram.com/reels/example'
  },
  { 
    id: 'ps1', 
    shopId: 's_kapeel', 
    name: 'Ghotki Mirror Sandals', 
    description: 'Classic handcrafted sandals with authentic mirror work.', 
    price: 2200, 
    category: 'Footwear', 
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600'], 
    tags: ['Best Seller'], 
    stock: 25,
    videoUrl: 'https://tiktok.com/@example/video/123'
  }
];
