
import { Shop, Product } from './types';

export const MOCK_SHOPS: Shop[] = [
  // --- WOMEN CATEGORY ---
  {
    id: 's1',
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
    isRegistrationPaid: true,
    registrationFee: 2500,
    payoutMethods: ['EasyPaisa'],
    deliveryFee: 150,
    pickupEnabled: true,
    deliveryEnabled: true,
    featured: true,
  },
  {
    id: 's_kapeel',
    name: 'Kapeel Dass Clothes',
    ownerName: 'Kapeel Dass',
    mobile: '03019876543',
    whatsapp: '923019876543',
    bazaar: 'Resham Gali',
    address: 'Main Gate, Resham Gali, Ghotki',
    category: 'Women',
    logo: 'https://images.unsplash.com/photo-1594465911325-1e42f9d37536?auto=format&fit=crop&q=80&w=200',
    banner: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
    bio: 'Authentic handcrafted traditional ladies wear and bridal collections.',
    status: 'APPROVED',
    isRegistrationPaid: true,
    registrationFee: 2500,
    payoutMethods: ['Bank Transfer'],
    deliveryFee: 100,
    pickupEnabled: true,
    deliveryEnabled: true,
    featured: true,
  },

  // --- MEN CATEGORY ---
  {
    id: 's_men1',
    name: 'Ghotki Royal Men',
    ownerName: 'Zaid Khan',
    mobile: '03101112223',
    whatsapp: '923101112223',
    bazaar: 'Sahee Bazar',
    address: 'Plot 5, Sahee Bazar',
    category: 'Men',
    logo: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?auto=format&fit=crop&q=80&w=200',
    banner: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=800',
    bio: 'Premium Sherwanis and Kurta Pajama for weddings and occasions.',
    status: 'APPROVED',
    isRegistrationPaid: true,
    registrationFee: 2500,
    payoutMethods: ['JazzCash'],
    deliveryFee: 150,
    pickupEnabled: true,
    deliveryEnabled: true,
    featured: true,
  },

  // --- COSMETICS CATEGORY ---
  {
    id: 's_cos1',
    name: 'Skin Care Experts',
    ownerName: 'Mehek Ali',
    mobile: '03301112223',
    whatsapp: '923301112223',
    bazaar: 'Resham Gali',
    address: 'Shop 1, Resham Gali',
    category: 'Cosmetics & Accessories',
    logo: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=200',
    banner: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800',
    bio: 'Specialized face care products and premium serums.',
    status: 'APPROVED',
    isRegistrationPaid: true,
    registrationFee: 2500,
    payoutMethods: ['EasyPaisa'],
    deliveryFee: 100,
    pickupEnabled: true,
    deliveryEnabled: true,
  }
];

export const MOCK_PRODUCTS: Product[] = [
  // --- WOMEN DRESSES ---
  { 
    id: 'p1', 
    shopId: 's1', 
    name: 'Embroidered Silk Dress', 
    description: 'Beautifully stitched silk dress with traditional embroidery.', 
    price: 3500, 
    category: 'Women', 
    images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=600'], 
    tags: ['New'], 
    stock: 10 
  },
  { 
    id: 'p2', 
    shopId: 's_kapeel', 
    name: 'Designer Kurti', 
    description: 'Modern cut designer kurti with ethnic patterns.', 
    price: 2500, 
    category: 'Women', 
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600'], 
    tags: ['Best Seller'], 
    stock: 15 
  },

  // --- MEN DRESSES ---
  { 
    id: 'pm1', 
    shopId: 's_men1', 
    name: 'Cotton Kurta Pajama', 
    description: 'High quality cotton kurta pajama for everyday elegance.', 
    price: 2800, 
    category: 'Men', 
    images: ['https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=600'], 
    tags: ['New'], 
    stock: 20 
  },

  // --- FACE CARE ---
  { 
    id: 'pc1', 
    shopId: 's_cos1', 
    name: 'Glow Facial Serum', 
    description: 'Premium vitamin C serum for bright and healthy skin.', 
    price: 1500, 
    category: 'Cosmetics & Accessories', 
    images: ['https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=600'], 
    tags: ['Trending'], 
    stock: 25 
  },
  { 
    id: 'pc2', 
    shopId: 's_cos1', 
    name: 'Hydrating Day Cream', 
    description: 'All-day hydration for soft and supple face skin.', 
    price: 1200, 
    category: 'Cosmetics & Accessories', 
    images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=600'], 
    tags: ['Sale'], 
    stock: 30 
  }
];
